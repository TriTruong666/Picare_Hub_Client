const decodedImageCache = new Map<string, Promise<HTMLImageElement>>();
const decodedImageUrls = new Set<string>();
const displayImageUrlCache = new Map<string, string>();
const preloadQueue: Array<{ url: string; start: () => void }> = [];
let activePreloads = 0;
const MAX_CONCURRENT_PRELOADS = 4;

function imageCrossOrigin(img: HTMLImageElement) {
  try {
    img.crossOrigin = "anonymous";
  } catch {
    // ignore
  }
}

/**
 * Keep the request used by WebGL separate from a prior plain <img> request.
 * Browsers may otherwise reuse an opaque image-cache entry, which taints the
 * canvas even if the later request asks for CORS.
 */
export function getCatalogueWebglImageUrl(imageUrl: string) {
  if (!imageUrl || imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
    return imageUrl;
  }

  try {
    const url = new URL(imageUrl, window.location.href);
    url.searchParams.set("cors", "true");
    return url.toString();
  } catch {
    // Preserve malformed/relative values so the caller reports the real load
    // failure instead of hiding it behind URL parsing.
    return imageUrl;
  }
}

async function loadImage(url: string, displayCacheKey: string): Promise<HTMLImageElement> {
  if (!url) throw new Error("Invalid image URL");

  try {
    const response = await fetch(url, { mode: "cors", cache: "force-cache" });
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
  const requestUrl = getCatalogueWebglImageUrl(url);
  const cached = decodedImageCache.get(requestUrl);
  if (cached) {
    // A reader can reach a page before background warming gets to it. Move that
    // pending decode to the front instead of showing a white WebGL placeholder.
    if (priority) {
      const queuedIndex = preloadQueue.findIndex((job) => job.url === requestUrl);
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
  decodedImageCache.set(requestUrl, request);

  const start = (countsTowardsQueue: boolean) => {
    void loadImage(requestUrl, url)
      .then((image) => {
        decodedImageUrls.add(url);
        decodedImageUrls.add(requestUrl);
        resolveRequest(image);
      }, (error) => {
        decodedImageCache.delete(requestUrl);
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
    const job = { url: requestUrl, start: () => start(true) };
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

/** Preload and decode every catalogue page in parallel before reading begins. */
export function preloadCataloguePageImages(urls: Iterable<string>) {
  for (const url of urls) {
    if (url) void getDecodedCataloguePageImage(url, false, true).catch(() => undefined);
  }
}
