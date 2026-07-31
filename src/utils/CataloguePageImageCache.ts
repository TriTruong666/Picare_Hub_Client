const decodedImageCache = new Map<string, Promise<HTMLImageElement>>();
const decodedImageUrls = new Set<string>();
const displayImageUrlCache = new Map<string, string>();
const preloadQueue: Array<{ url: string; start: () => void }> = [];
let activePreloads = 0;
const MAX_CONCURRENT_PRELOADS = 4;
const FORCE_NETWORK_RELOAD_KEY = "picare.catalogue.force-network-reload";
let forceNetworkReload = false;

try {
  forceNetworkReload = sessionStorage.getItem(FORCE_NETWORK_RELOAD_KEY) === "1";
  sessionStorage.removeItem(FORCE_NETWORK_RELOAD_KEY);
} catch {
  // Storage can be unavailable in private browsing contexts.
}

function imageCrossOrigin(img: HTMLImageElement) {
  try {
    img.crossOrigin = "anonymous";
  } catch {
    // ignore
  }
}

async function loadImage(url: string, displayCacheKey: string): Promise<HTMLImageElement> {
  if (!url) throw new Error("Invalid image URL");

  try {
    const response = await fetch(url, {
      mode: "cors",
      // A reader refresh must bypass a possibly opaque/stale HTTP cache entry.
      cache: forceNetworkReload ? "reload" : "force-cache",
    });
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        imageCrossOrigin(img);
        img.onload = () => {
          void img.decode().catch(() => undefined).finally(() => {
            // Retain the Blob URL for DOM <img> and thumbnails. This avoids a
            // second S3 request after the WebGL texture has already decoded.
            displayImageUrlCache.set(url, objectUrl);
            displayImageUrlCache.set(displayCacheKey, objectUrl);
            resolve(img);
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          displayImageUrlCache.delete(url);
          displayImageUrlCache.delete(displayCacheKey);
          reject(new Error("Blob image load failed"));
        };
        img.src = objectUrl;
      });
    }
  } catch {
    // Fall back to the browser image loader.
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    imageCrossOrigin(img);
    img.decoding = "async";
    img.onload = () => {
      void img.decode().catch(() => undefined).finally(() => resolve(img));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function drainPreloadQueue() {
  while (activePreloads < MAX_CONCURRENT_PRELOADS && preloadQueue.length > 0) {
    activePreloads += 1;
    preloadQueue.shift()?.start();
  }
}

export function getDecodedCataloguePageImage(
  url: string,
  priority = false,
  eager = false,
): Promise<HTMLImageElement> {
  const cached = decodedImageCache.get(url);
  if (cached) {
    // A reader can reach a page before background warming gets to it. Move that
    // pending decode to the front instead of showing a white WebGL placeholder.
    if (priority) {
      const queuedIndex = preloadQueue.findIndex((job) => job.url === url);
      if (queuedIndex > 0) {
        const [queuedJob] = preloadQueue.splice(queuedIndex, 1);
        if (queuedJob) preloadQueue.unshift(queuedJob);
      }
    }
    return cached;
  }

  let resolveRequest!: (image: HTMLImageElement) => void;
  let rejectRequest!: (reason?: unknown) => void;
  const request = new Promise<HTMLImageElement>((resolve, reject) => {
    resolveRequest = resolve;
    rejectRequest = reject;
  });
  decodedImageCache.set(url, request);

  const start = (countsTowardsQueue: boolean) => {
    void loadImage(url, url)
      .then((image) => {
        decodedImageUrls.add(url);
        resolveRequest(image);
      }, (error) => {
        decodedImageCache.delete(url);
        rejectRequest(error);
      })
      .finally(() => {
        if (countsTowardsQueue) {
          activePreloads -= 1;
          drainPreloadQueue();
        }
      });
  };

  if (eager) {
    // Catalogue reader intentionally favours ready-to-flip artwork over
    // network conservation: decode the entire initial catalogue at once.
    start(false);
  } else {
    const job = { url, start: () => start(true) };
    if (priority) preloadQueue.unshift(job);
    else preloadQueue.push(job);
    drainPreloadQueue();
  }
  return request;
}

export function isCataloguePageImageDecoded(url?: string) {
  return Boolean(url && decodedImageUrls.has(url));
}

export function getCachedCataloguePageDisplayUrl(url: string) {
  return displayImageUrlCache.get(url) ?? url;
}

/**
 * Drop reader-owned decoded/Blob images and make the next reader load re-fetch
 * the images from S3 instead of accepting a stale browser-cache response.
 */
export function clearCataloguePageImageCache() {
  decodedImageCache.clear();
  decodedImageUrls.clear();
  preloadQueue.splice(0, preloadQueue.length);
  activePreloads = 0;
  for (const objectUrl of new Set(displayImageUrlCache.values())) {
    if (objectUrl.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
  }
  displayImageUrlCache.clear();
  forceNetworkReload = true;

  try {
    sessionStorage.setItem(FORCE_NETWORK_RELOAD_KEY, "1");
  } catch {
    // The in-memory flag still covers the current page.
  }
}

/** Preload and decode every catalogue page in parallel before reading begins. */
export function preloadCataloguePageImages(urls: Iterable<string>) {
  for (const url of urls) {
    if (url) void getDecodedCataloguePageImage(url, false, true).catch(() => undefined);
  }
}
