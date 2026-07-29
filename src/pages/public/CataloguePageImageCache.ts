const decodedImageCache = new Map<string, Promise<HTMLImageElement>>();
const decodedImageUrls = new Set<string>();
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

async function loadImage(url: string): Promise<HTMLImageElement> {
  if (!url) throw new Error("Invalid image URL");

  try {
    const response = await fetch(url, { mode: "cors" });
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          void img.decode().catch(() => undefined).finally(() => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
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
    if (!url.startsWith("data:") && !url.startsWith("blob:")) {
      imageCrossOrigin(img);
    }
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

  const start = () => {
    void loadImage(url)
      .then((image) => {
        decodedImageUrls.add(url);
        resolveRequest(image);
      }, (error) => {
        decodedImageCache.delete(url);
        rejectRequest(error);
      })
      .finally(() => {
        activePreloads -= 1;
        drainPreloadQueue();
      });
  };

  const job = { url, start };
  if (priority) preloadQueue.unshift(job);
  else preloadQueue.push(job);
  drainPreloadQueue();
  return request;
}

export function isCataloguePageImageDecoded(url?: string) {
  return Boolean(url && decodedImageUrls.has(url));
}

/** Preload all catalogue pages, throttled to avoid saturating the network. */
export function preloadCataloguePageImages(urls: Iterable<string>) {
  for (const url of urls) {
    if (url) void getDecodedCataloguePageImage(url).catch(() => undefined);
  }
}
