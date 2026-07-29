import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { flushSync } from "react-dom";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiGrid,
  FiMaximize2,
  FiMinimize2,
  FiPause,
  FiPlay,
  FiX,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

import { CataloguePageTurnCanvas } from "@/components/custom_ui/CataloguePageTurnCanvas";
import {
  isCataloguePageImageDecoded,
  preloadCataloguePageImages,
} from "./CataloguePageImageCache";
import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { PATHS } from "@/config/paths";
import { useCatalogueDetail } from "@/hooks/data/useCatalogueHooks";
import type { CatalogueDetail } from "@/types/Catalogue";

type ViewMode = "double" | "single";
type FlipDirection = "next" | "prev";

type FlipState = {
  direction: FlipDirection;
  targetPage: number;
  interaction: "auto" | "drag";
  settleTo: 0 | 1 | null;
  frontImageUrl: string;
  backImageUrl?: string;
};

type Spread = {
  leftIndex: number;
  rightIndex: number;
  leftPage: CatalogueDetail | null;
  rightPage: CatalogueDetail | null;
};

const PAGE_TURN_DURATION = 1;

function getSpread(
  pages: CatalogueDetail[],
  anchor: number,
  viewMode: ViewMode,
  focusCurrentPage = false,
): Spread {
  if (focusCurrentPage) {
    const leftIndex = anchor > 0 ? anchor - 1 : -1;

    return {
      leftIndex,
      rightIndex: anchor,
      leftPage: leftIndex >= 0 ? (pages[leftIndex] ?? null) : null,
      rightPage: pages[anchor] ?? null,
    };
  }

  if (viewMode === "single") {
    return {
      leftIndex: anchor,
      rightIndex: -1,
      leftPage: pages[anchor] ?? null,
      rightPage: null,
    };
  }

  if (anchor === 0) {
    return {
      leftIndex: -1,
      rightIndex: 0,
      leftPage: null,
      rightPage: pages[0] ?? null,
    };
  }

  const leftIndex = anchor % 2 === 1 ? anchor : anchor - 1;
  const rightIndex = leftIndex + 1;

  return {
    leftIndex,
    rightIndex,
    leftPage: pages[leftIndex] ?? null,
    rightPage: pages[rightIndex] ?? null,
  };
}

function normalizePageForMode(
  page: number,
  viewMode: ViewMode,
  focusCurrentPage = false,
) {
  if (focusCurrentPage || viewMode === "single" || page === 0) return page;
  return page % 2 === 0 ? page - 1 : page;
}

function getNextPage(
  currentPage: number,
  totalPages: number,
  viewMode: ViewMode,
  focusCurrentPage = false,
) {
  if (focusCurrentPage || viewMode === "single") {
    return Math.min(currentPage + 1, totalPages - 1);
  }

  return currentPage === 0
    ? Math.min(1, totalPages - 1)
    : Math.min(currentPage + 2, totalPages - 1);
}

function getPreviousPage(
  currentPage: number,
  viewMode: ViewMode,
  focusCurrentPage = false,
) {
  if (focusCurrentPage || viewMode === "single") {
    return Math.max(currentPage - 1, 0);
  }
  return currentPage <= 2 ? 0 : currentPage - 2;
}

function getFlipImageUrls(
  pages: CatalogueDetail[],
  currentPage: number,
  targetPage: number,
  viewMode: ViewMode,
  direction: FlipDirection,
) {
  const source = getSpread(pages, currentPage, viewMode);
  const destination = getSpread(pages, targetPage, viewMode);
  const front =
    direction === "next"
      ? (source.rightPage ?? source.leftPage)
      : (source.leftPage ?? source.rightPage);
  const back =
    direction === "next"
      ? (destination.leftPage ?? destination.rightPage)
      : (destination.rightPage ?? destination.leftPage);

  return {
    frontImageUrl: front?.imageUrl ?? "",
    backImageUrl: back?.imageUrl,
  };
}

function IconButton({
  label,
  children,
  active = false,
  disabled = false,
  onClick,
  position = "bottom",
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  position?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip content={label} position={position}>
      <motion.button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        whileHover={{ y: -2, scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className={`inline-flex size-10 shrink-0 items-center justify-center border-b text-[15px] transition-[color,background-color,border-color,opacity] duration-300 disabled:pointer-events-none disabled:opacity-20 ${
          active
            ? "border-black text-black dark:border-[#f0ede6] dark:text-[#f0ede6]"
            : "border-transparent text-black/50 hover:border-black/20 hover:text-black dark:text-white/42 dark:hover:border-white/18 dark:hover:text-[#f0ede6]"
        }`}
      >
        {children}
      </motion.button>
    </Tooltip>
  );
}

/**
 * Optimized Catalogue Page component with skeleton shimmer loading
 * and async image decoding for ultra-smooth rendering.
 */
function CataloguePage({
  page,
  pageNumber,
  side,
  onClick,
  isZoomed = false,
}: {
  page: CatalogueDetail | null;
  pageNumber?: number;
  side: "left" | "right" | "single";
  onClick?: () => void;
  isZoomed?: boolean;
}) {
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const isLoaded =
    loadedImageUrl === page?.imageUrl ||
    isCataloguePageImageDecoded(page?.imageUrl);

  if (!page) {
    return (
      <div
        className="h-full w-full bg-black/[0.025] dark:bg-white/[0.018]"
        aria-hidden="true"
      />
    );
  }

  const numberPosition =
    side === "left" ? "left-3" : side === "right" ? "right-3" : "right-3";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: isZoomed ? 1 : 1.004 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative block h-full w-full overflow-hidden bg-[#f8f7f3] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
        isZoomed ? "cursor-pointer" : "cursor-zoom-in"
      }`}
      aria-label={
        isZoomed
          ? side === "left"
            ? `Trang ${pageNumber} (Trang trước)`
            : side === "right"
              ? `Trang ${pageNumber} (Trang tiếp theo)`
              : `Trang ${pageNumber}`
          : `Phóng to cuốn sách (Trang ${pageNumber})`
      }
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111111]">
          <div className="size-6 animate-spin rounded-full border-2 border-white/12 border-t-white/60" />
        </div>
      )}

      <img
        src={page.imageUrl}
        alt={`Trang ${pageNumber}`}
        draggable={false}
        loading="eager"
        decoding="async"
        onLoad={() => setLoadedImageUrl(page.imageUrl)}
        className={`h-full w-full object-contain transition-opacity duration-300 select-none ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Page Turn Hint in Zoomed Mode */}
      {isZoomed && (
        <div
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
            side === "left" ? "left-3" : "right-3"
          } flex size-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:scale-110 group-hover:opacity-75`}
        >
          {side === "left" ? (
            <FiChevronLeft className="size-5" />
          ) : (
            <FiChevronRight className="size-5" />
          )}
        </div>
      )}

      <span
        className={`pointer-events-none absolute bottom-2.5 ${numberPosition} text-[10px] font-medium text-black/38 tabular-nums opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
      >
        {pageNumber}
      </span>
    </motion.button>
  );
}

/**
 * Thumbnail item with lazy loading & skeleton for high performance drawer
 */
function ThumbnailItem({
  page,
  index,
  active,
  onClick,
}: {
  page: CatalogueDetail;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.button
      data-active={active}
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative shrink-0 transition-[opacity,transform] duration-200 ${
        active
          ? "translate-y-[-3px] opacity-100"
          : "opacity-48 hover:opacity-100"
      }`}
      aria-label={`Đi đến trang ${index + 1}`}
    >
      <div className="relative h-20 overflow-hidden sm:h-24">
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-white/8" />
        )}
        <img
          src={page.imageUrl}
          alt={`Trang ${index + 1}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`h-20 w-auto border bg-white object-contain transition-opacity duration-300 sm:h-24 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${
            active ? "border-white/80 ring-1 ring-white/55" : "border-white/10"
          }`}
        />
      </div>
      <span className="mt-1.5 block text-center text-[9px] font-normal text-white/38 tabular-nums">
        {index + 1}
      </span>
    </motion.button>
  );
}

export default function CataloguePublicPreviewPage() {
  const { catalogueId = "" } = useParams<{ catalogueId: string }>();
  const {
    data: catalogue,
    isLoading,
    isError,
    refetch,
  } = useCatalogueDetail(catalogueId);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const pages = useMemo(() => {
    if (!catalogue?.details) return [];
    return [...catalogue.details].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [catalogue]);

  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode] = useState<ViewMode>("double");
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );
  const [flip, setFlip] = useState<FlipState | null>(null);
  const flipProgressRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    lastX: number;
    startedAt: number;
    direction?: FlipDirection;
  } | null>(null);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookZoomed, setIsBookZoomed] = useState(false);
  const [renderLegacyZoomFlip] = useState(false);

  // Image fidelity is more important than conserving memory in this reader:
  // warm every catalogue image after data arrives so the WebGL leaf never has
  // to expose a placeholder while it is being held or turned.
  useEffect(() => {
    preloadCataloguePageImages(pages.map((page) => page.imageUrl));
  }, [pages]);

  const totalPages = pages.length;
  const currentSpread = getSpread(pages, currentPage, viewMode);
  const targetSpread = flip
    ? getSpread(pages, flip.targetPage, viewMode)
    : currentSpread;

  const canGoPrevious = currentPage > 0;
  const canGoNext =
    Math.max(currentSpread.leftIndex, currentSpread.rightIndex) < totalPages - 1;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const handleChange = () => {
      setIsMobile(media.matches);
      if (media.matches) {
        setCurrentPage((page) => Math.max(page, 0));
        setFlip(null);
      }
    };

    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-scroll active thumbnail into view when drawer opens or page changes
  useEffect(() => {
    if (showThumbnails && thumbnailScrollRef.current) {
      const activeEl = thumbnailScrollRef.current.querySelector(
        "[data-active='true']",
      );
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [showThumbnails, currentPage]);

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      thumbnailScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const startFlip = useCallback(
    (direction: FlipDirection, targetPage: number) => {
      if (flip || targetPage === currentPage) return;

      const destination = getSpread(pages, targetPage, viewMode);
      if (
        Math.max(destination.leftIndex, destination.rightIndex) >=
        totalPages - 1
      ) {
        setIsPlaying(false);
      }

      setFlip({
        direction,
        targetPage,
        interaction: "auto",
        settleTo: null,
        ...getFlipImageUrls(pages, currentPage, targetPage, viewMode, direction),
      });
    },
    [currentPage, flip, pages, totalPages, viewMode],
  );

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    startFlip("next", getNextPage(currentPage, totalPages, viewMode));
  }, [canGoNext, currentPage, startFlip, totalPages, viewMode]);

  const goPrevious = useCallback(() => {
    if (!canGoPrevious) return;
    startFlip("prev", getPreviousPage(currentPage, viewMode));
  }, [canGoPrevious, currentPage, startFlip, viewMode]);

  const handlePagePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (flip || (event.pointerType === "mouse" && event.button !== 0)) return;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        lastX: event.clientX,
        startedAt: performance.now(),
      };
      // Capture immediately on touch. A large mobile spread extends beyond
      // its visible stage, so waiting until the first move lets the browser
      // cancel the gesture before the reader's drag handler receives it.
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [flip],
  );

  const handlePagePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      drag.lastX = event.clientX;
      if (!drag.direction && Math.abs(deltaX) < 10) return;

      const direction: FlipDirection =
        drag.direction ?? (deltaX < 0 ? "next" : "prev");
      if (!drag.direction) {
        const canTurn = direction === "next" ? canGoNext : canGoPrevious;
        if (!canTurn) {
          dragRef.current = null;
          return;
        }

        drag.direction = direction;
        flipProgressRef.current = Math.min(
          0.98,
          Math.abs(deltaX) / Math.max(1, event.currentTarget.clientWidth / 2),
        );
        const targetPage =
          direction === "next"
            ? getNextPage(currentPage, totalPages, viewMode)
            : getPreviousPage(currentPage, viewMode);
        setFlip({
          direction,
          targetPage,
          interaction: "drag",
          settleTo: null,
          ...getFlipImageUrls(pages, currentPage, targetPage, viewMode, direction),
        });
        event.currentTarget.setPointerCapture(event.pointerId);
      } else {
        flipProgressRef.current = Math.min(
          0.98,
          Math.abs(deltaX) / Math.max(1, event.currentTarget.clientWidth / 2),
        );
      }

      event.preventDefault();
    },
    [canGoNext, canGoPrevious, currentPage, pages, totalPages, viewMode],
  );

  const releasePagePointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      if (!drag.direction) return;

      const elapsed = Math.max(1, performance.now() - drag.startedAt);
      const velocity = (drag.lastX - drag.startX) / elapsed;
      const progress = flipProgressRef.current;
      const commit =
        progress > 0.42 ||
        (drag.direction === "next" ? velocity < -0.55 : velocity > 0.55);
      setFlip((active) =>
        active?.interaction === "drag"
          ? { ...active, settleTo: commit ? 1 : 0 }
          : active,
      );
    },
    [],
  );

  const cancelInteractiveFlip = useCallback(() => {
    dragRef.current = null;
    setFlip(null);
  }, []);

  const completeFlip = useCallback(() => {
    if (!flip) return;

    // The WebGL leaf is the last visible frame of the old spread. Commit the
    // destination DOM synchronously, then leave the final canvas frame in
    // place for one compositor frame. This prevents the old spread flashing
    // between the leaf and its destination spread.
    flushSync(() => {
      setCurrentPage(flip.targetPage);
    });
    // Mobile GPU compositing can lag React's commit by more than one frame.
    // The canvas is already frozen on the destination page here, so retaining
    // it briefly gives the DOM image a seamless handoff instead of a flash.
    window.setTimeout(() => setFlip(null), 100);
  }, [flip]);

  const jumpToPage = useCallback(
    (page: number) => {
      const clampedPage = Math.max(0, Math.min(page, totalPages - 1));
      const targetPage = normalizePageForMode(clampedPage, viewMode);
      if (targetPage === currentPage) {
        setShowThumbnails(false);
        return;
      }

      startFlip(targetPage > currentPage ? "next" : "prev", targetPage);
      setShowThumbnails(false);
    },
    [currentPage, startFlip, totalPages, viewMode],
  );

  useEffect(() => {
    if (!isPlaying || flip || !canGoNext) return;

    const timer = window.setTimeout(goNext, 3200);
    return () => window.clearTimeout(timer);
  }, [canGoNext, flip, goNext, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isBookZoomed) {
          setIsBookZoomed(false);
          return;
        }
      }

      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === "Home") {
        event.preventDefault();
        jumpToPage(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        jumpToPage(totalPages - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrevious, isBookZoomed, jumpToPage, totalPages]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    await containerRef.current?.requestFullscreen?.();
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-[#f0ede6]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-sm font-normal text-white/48">
            Đang tải catalogue…
          </p>
        </div>
      </main>
    );
  }

  if (isError || !catalogue || totalPages === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-[#f0ede6]">
        <div className="max-w-md text-center">
          <p className="text-[0.625rem] font-normal tracking-[0.14em] text-white/32 uppercase">
            Catalogue Preview
          </p>
          <h1 className="mt-4 text-[2rem] leading-none font-normal tracking-[-0.04em]">
            Không tìm thấy catalogue
          </h1>
          <p className="mt-4 text-sm leading-7 font-normal text-white/48">
            Liên kết có thể đã hết hiệu lực hoặc catalogue không còn tồn tại.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-7 inline-flex h-11 items-center justify-center border-b border-white/28 px-2 text-sm font-normal text-white/68 transition-colors hover:border-white hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  const displayLeftPage =
    flip?.direction === "prev" ? targetSpread.leftPage : currentSpread.leftPage;
  const displayRightPage =
    flip?.direction === "next"
      ? targetSpread.rightPage
      : currentSpread.rightPage;
  const displayLeftIndex =
    flip?.direction === "prev"
      ? targetSpread.leftIndex
      : currentSpread.leftIndex;
  const displayRightIndex =
    flip?.direction === "next"
      ? targetSpread.rightIndex
      : currentSpread.rightIndex;

  const activePageIndexes = new Set([
    currentSpread.leftIndex,
    currentSpread.rightIndex,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[100dvh] min-h-[520px] w-full flex-col overflow-hidden bg-[#f5f4f0] font-normal text-[#111111] antialiased transition-colors duration-500 selection:bg-[#111111] selection:text-[#f5f4f0] dark:bg-[#050505] dark:text-[#f0ede6] dark:selection:bg-[#f0ede6] dark:selection:text-[#050505]"
      style={{
        fontFamily: '"OverusedGrotesk", "Helvetica Neue", sans-serif',
      }}
    >
      {/* READER HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 20,
          mass: 0.9,
          delay: 0.1,
        }}
        className="relative z-40 mx-auto flex h-16 w-[min(calc(100%_-_2rem),87.5rem)] shrink-0 items-center justify-between border-b border-black/8 transition-colors duration-500 dark:border-white/8"
      >
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2,
          }}
        >
          <Link
            to={PATHS.CATALOGUE.PUBLIC_GALLERY}
            className="group flex min-w-0 items-center gap-1.5 text-[0.6875rem] font-normal tracking-[0.08em] text-black/50 uppercase transition-colors hover:text-black dark:text-white/42 dark:hover:text-white"
            aria-label="Về thư viện catalogue"
          >
            <FiChevronLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Thư viện</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.25,
          }}
          className="pointer-events-none absolute inset-x-28 top-1/2 hidden -translate-y-1/2 text-center sm:block"
        >
          <p className="truncate text-[0.8125rem] font-normal tracking-[-0.01em] text-black/80 dark:text-white/78">
            {catalogue.catalogueName}
          </p>
          <p className="mt-0.5 hidden text-[0.5625rem] font-normal tracking-[0.1em] text-black/40 uppercase tabular-nums sm:block dark:text-white/30">
            {totalPages} trang
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2,
          }}
          className="flex items-center gap-1"
        >
          <IconButton
            label={isBookZoomed ? "Thu nhỏ cuốn sách" : "Phóng to cuốn sách"}
            active={isBookZoomed}
            onClick={() => setIsBookZoomed((val) => !val)}
            position="bottom"
          >
            {isBookZoomed ? <FiZoomOut /> : <FiZoomIn />}
          </IconButton>
          <IconButton
            label={copied ? "Đã sao chép liên kết" : "Sao chép liên kết"}
            active={copied}
            onClick={handleCopyLink}
            position="bottom"
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </IconButton>
          <IconButton
            label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            onClick={toggleFullscreen}
            position="bottom"
          >
            {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
          </IconButton>
          <ThemeToggle className="!h-10 !w-10 !rounded-none !border-0 !border-b !border-transparent !bg-transparent !shadow-none !backdrop-blur-none hover:!border-black/20 hover:!bg-transparent dark:!bg-transparent dark:hover:!border-white/18" />
        </motion.div>
      </motion.header>

      {/* MAIN STAGE */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center px-11 py-3 sm:px-16 lg:px-24">
        {/* STAGE CONTAINER WITH TOUCH SWIPE & MOUSE DRAG */}
        <motion.div
          onPointerDown={handlePagePointerDown}
          onPointerMove={handlePagePointerMove}
          onPointerUp={releasePagePointer}
          onPointerCancel={releasePagePointer}
          initial={{
            opacity: 0,
            // Keep the reading page centred; the previous page may overflow
            // off-screen on phones, like a real open book held close.
            x: isMobile ? "-25%" : "0%",
            y: 36,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            x: isMobile ? "-25%" : "0%",
            y: 0,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 75,
            damping: 20,
            mass: 1,
            delay: 0.25,
          }}
          className="relative shrink-0 cursor-grab touch-none active:cursor-grabbing sm:touch-pan-y"
          style={{
            width: isMobile
              ? "calc(70dvh * 1.414)"
              : "min(88vw, calc((100dvh - 13.5rem) * 1.414))",
            aspectRatio: "1.414 / 1",
            perspective: "2800px",
          }}
        >
          {/* 3D Floor Shadow */}
          <div className="absolute inset-x-[5%] -bottom-6 h-12 rounded-[50%] bg-black/90 opacity-80 blur-2xl" />
          <div className="absolute top-2 -right-2 bottom-2 w-2 bg-[#292826] opacity-80" />
          <div className="absolute right-2 -bottom-2 left-2 h-2 bg-[#1c1b1a] opacity-90" />

          <div className="relative flex h-full w-full overflow-visible bg-white/[0.025] shadow-[0_24px_70px_rgba(0,0,0,0.62)] ring-1 ring-white/8">
            {viewMode === "double" ? (
              /* DOUBLE-PAGE SPREAD MODE WITH 3D CURVED FLIP LEAF */
              <>
                <div className="relative h-full w-1/2 overflow-hidden">
                  <CataloguePage
                    page={displayLeftPage}
                    pageNumber={
                      displayLeftIndex >= 0 ? displayLeftIndex + 1 : undefined
                    }
                    side="left"
                    onClick={() => setIsBookZoomed(true)}
                  />
                </div>
                <div className="relative h-full w-1/2 overflow-hidden">
                  <CataloguePage
                    page={displayRightPage}
                    pageNumber={
                      displayRightIndex >= 0 ? displayRightIndex + 1 : undefined
                    }
                    side="right"
                    onClick={() => setIsBookZoomed(true)}
                  />
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-black/70" />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-10 -translate-x-1/2 bg-linear-to-r from-black/16 via-transparent to-black/16 opacity-80" />

                {/* Underside Paper Shadow during Flip */}
                {flip ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.45, 0] }}
                    transition={{
                      duration: PAGE_TURN_DURATION,
                      times: [0, 0.5, 1],
                    }}
                    className={`pointer-events-none absolute inset-y-0 z-20 ${
                      flip.direction === "next"
                        ? "left-0 w-1/2"
                        : "right-0 w-1/2"
                    } ${
                      flip.direction === "next"
                        ? "bg-linear-to-l from-black/50 to-transparent"
                        : "bg-linear-to-r from-black/50 to-transparent"
                    }`}
                  />
                ) : null}

                {/* 3D BOOK LEAF FLIP LAYER WITH OGL WEBGL CANVAS */}
                {flip?.frontImageUrl ? (
                  <div className="absolute inset-0 z-30">
                    <CataloguePageTurnCanvas
                      frontImageUrl={flip.frontImageUrl}
                      backImageUrl={flip.backImageUrl}
                      direction={flip.direction}
                      durationMs={PAGE_TURN_DURATION * 1000}
                      progressRef={
                        flip.interaction === "drag"
                          ? flipProgressRef
                          : undefined
                      }
                      settleTo={flip.settleTo}
                      onComplete={completeFlip}
                      onCancel={cancelInteractiveFlip}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              /* SINGLE-PAGE MODE WITH 3D CURVED PAPER FLIP */
              <div className="relative h-full w-full overflow-hidden">
                <CataloguePage
                  page={displayLeftPage}
                  pageNumber={
                    displayLeftIndex >= 0 ? displayLeftIndex + 1 : undefined
                  }
                  side="single"
                  onClick={() => setIsBookZoomed(true)}
                />

                {/* Underside Paper Shadow during Flip */}
                {flip ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.45, 0] }}
                    transition={{
                      duration: PAGE_TURN_DURATION,
                      times: [0, 0.5, 1],
                    }}
                    className="pointer-events-none absolute inset-0 z-20 bg-linear-to-r from-black/50 via-transparent to-black/50"
                  />
                ) : null}

                {/* 3D SINGLE-PAGE FLIP LEAF LAYER WITH OGL WEBGL CANVAS */}
                {flip?.frontImageUrl ? (
                  <div className="absolute inset-0 z-30 h-full w-full">
                    <CataloguePageTurnCanvas
                      frontImageUrl={flip.frontImageUrl}
                      backImageUrl={flip.backImageUrl}
                      direction={flip.direction}
                      durationMs={PAGE_TURN_DURATION * 1000}
                      onComplete={completeFlip}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 20,
          mass: 0.9,
          delay: 0.38,
        }}
        className="relative z-40 mx-auto hidden h-14 w-[min(calc(100%_-_2rem),87.5rem)] shrink-0 items-center justify-between border-t border-black/8 transition-colors duration-500 md:flex dark:border-white/8"
      >
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.45,
          }}
          className="flex items-center gap-1"
        >
          <IconButton
            label={canGoPrevious ? "Trang trước" : "Đang ở trang đầu"}
            disabled={!canGoPrevious || Boolean(flip)}
            onClick={goPrevious}
            position="top"
          >
            <FiChevronLeft />
          </IconButton>

          <IconButton
            label={canGoNext ? "Trang tiếp theo" : "Đang ở trang cuối"}
            disabled={!canGoNext || Boolean(flip)}
            onClick={goNext}
            position="top"
          >
            <FiChevronRight />
          </IconButton>

          <div className="mx-1 hidden h-4 w-px bg-black/10 sm:block dark:bg-white/10" />

          <IconButton
            label={isPlaying ? "Dừng tự động lật" : "Tự động lật"}
            active={isPlaying}
            onClick={() => setIsPlaying((value) => !value)}
            position="top"
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </IconButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 18,
            delay: 0.52,
          }}
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3"
        >
          <span className="text-[0.625rem] font-normal tracking-[0.08em] text-black/40 tabular-nums dark:text-white/32">
            <strong className="font-normal text-black/80 dark:text-white/78">
              {currentPage + 1}
            </strong>
            <span className="px-1.5">/</span>
            {totalPages}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.45,
          }}
        >
          <IconButton
            label="Danh sách trang"
            active={showThumbnails}
            onClick={() => setShowThumbnails((value) => !value)}
            position="top"
          >
            <FiGrid />
          </IconButton>
        </motion.div>
      </motion.footer>

      {/* THUMBNAIL DRAWER */}
      <AnimatePresence>
        {showThumbnails ? (
          <>
            <motion.button
              type="button"
              aria-label="Đóng danh sách trang"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 z-[60] bg-black/58"
              onClick={() => setShowThumbnails(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 z-[70] border-y border-white/10 bg-[#080808]/97 px-3 py-5 shadow-[0_-28px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:px-8 md:bottom-14"
            >
              <div className="relative mx-auto flex max-w-[1300px] items-center">
                {/* Scroll Left Button */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("left")}
                  className="absolute left-0 z-10 flex size-9 shrink-0 items-center justify-center border-l border-white/16 text-white/48 transition-[color,transform] duration-300 hover:-translate-x-1 hover:border-white/44 hover:text-white active:scale-90"
                  title="Cuộn trái"
                >
                  <FiChevronLeft />
                </button>

                {/* Horizontal Scrollable Thumbnails Container */}
                <div
                  ref={thumbnailScrollRef}
                  onWheel={(e) => {
                    e.stopPropagation();
                    if (thumbnailScrollRef.current) {
                      thumbnailScrollRef.current.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex w-full scrollbar-thin scrollbar-thumb-white/20 items-end gap-4 overflow-x-auto px-10 py-1.5"
                >
                  {pages.map((page, index) => {
                    const active = activePageIndexes.has(index);
                    return (
                      <ThumbnailItem
                        key={page.catalogueDetailId}
                        page={page}
                        index={index}
                        active={active}
                        onClick={() => jumpToPage(index)}
                      />
                    );
                  })}
                </div>

                {/* Scroll Right Button */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("right")}
                  className="absolute right-0 z-10 flex size-9 shrink-0 items-center justify-center border-r border-white/16 text-white/48 transition-[color,transform] duration-300 hover:translate-x-1 hover:border-white/44 hover:text-white active:scale-90"
                  title="Cuộn phải"
                >
                  <FiChevronRight />
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {/* FULL-SCREEN ZOOMED BOOK VIEW OVERLAY - CLEAN ONLY BOOK AND CLOSE BUTTON */}
      <AnimatePresence>
        {isBookZoomed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050505]/96 p-4 backdrop-blur-2xl select-none sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Xem cuốn sách phóng to toàn màn hình"
            onClick={() => setIsBookZoomed(false)}
          >
            {/* Single Close Button at Top Right */}
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsBookZoomed(false);
              }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed top-5 right-5 z-50 flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 shadow-2xl backdrop-blur-md transition-colors hover:border-white/50 hover:bg-black/80 hover:text-white"
              aria-label="Đóng phóng to (Esc)"
              title="Đóng (Esc)"
            >
              <FiX className="size-6" />
            </motion.button>

            {/* Zoomed Book Stage Container */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={handlePagePointerDown}
              onPointerMove={handlePagePointerMove}
              onPointerUp={releasePagePointer}
              onPointerCancel={releasePagePointer}
              initial={{
                x: isMobile ? "-25%" : "0%",
                scale: 0.94,
                opacity: 0,
              }}
              animate={{
                x: isMobile ? "-25%" : "0%",
                scale: 1,
                opacity: 1,
              }}
              exit={{
                x: isMobile ? "-25%" : "0%",
                scale: 0.94,
                opacity: 0,
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative shrink-0 cursor-grab touch-none active:cursor-grabbing sm:touch-pan-y"
              style={{
                width: isMobile
                  ? "calc(80dvh * 1.414)"
                  : "min(96vw, calc((100dvh - 3rem) * 1.414))",
                aspectRatio: "1.414 / 1",
                perspective: "3000px",
              }}
            >
              {/* 3D Book Floor Shadow */}
              <div className="absolute inset-x-[5%] -bottom-7 h-14 rounded-[50%] bg-black/95 opacity-90 blur-2xl" />
              <div className="absolute top-2 -right-2 bottom-2 w-2 bg-[#292826] opacity-80" />
              <div className="absolute right-2 -bottom-2 left-2 h-2 bg-[#1c1b1a] opacity-90" />

              <div className="relative flex h-full w-full overflow-visible bg-white/[0.025] shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-white/12">
                {viewMode === "double" ? (
                  /* DOUBLE-PAGE SPREAD IN ZOOMED VIEW */
                  <>
                    <div className="relative h-full w-1/2 overflow-hidden">
                      <CataloguePage
                        page={displayLeftPage}
                        pageNumber={
                          displayLeftIndex >= 0
                            ? displayLeftIndex + 1
                            : undefined
                        }
                        side="left"
                        isZoomed
                        onClick={() => {
                          if (canGoPrevious && !flip) goPrevious();
                        }}
                      />
                    </div>
                    <div className="relative h-full w-1/2 overflow-hidden">
                      <CataloguePage
                        page={displayRightPage}
                        pageNumber={
                          displayRightIndex >= 0
                            ? displayRightIndex + 1
                            : undefined
                        }
                        side="right"
                        isZoomed
                        onClick={() => {
                          if (canGoNext && !flip) goNext();
                        }}
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-black/80" />
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-12 -translate-x-1/2 bg-linear-to-r from-black/24 via-transparent to-black/24 opacity-90" />

                    {/* Underside Paper Shadow during Flip */}
                    {flip ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.45, 0] }}
                        transition={{
                          duration: PAGE_TURN_DURATION,
                          times: [0, 0.5, 1],
                        }}
                        className={`pointer-events-none absolute inset-y-0 z-20 ${
                          flip.direction === "next"
                            ? "left-0 w-1/2"
                            : "right-0 w-1/2"
                        } ${
                          flip.direction === "next"
                            ? "bg-linear-to-l from-black/50 to-transparent"
                            : "bg-linear-to-r from-black/50 to-transparent"
                        }`}
                      />
                    ) : null}

                    {/* Replaced by the interactive OGL leaf below. Kept disabled while preserving the old markup. */}
                    {renderLegacyZoomFlip && flip?.frontImageUrl ? (
                      <motion.div
                        initial={{
                          rotateY: 0,
                          skewY: 0,
                          rotateZ: 0,
                          scaleY: 1,
                        }}
                        animate={{
                          rotateY:
                            flip.direction === "next"
                              ? [0, -90, -180]
                              : [0, 90, 180],
                          skewY:
                            flip.direction === "next"
                              ? [0, -9.5, 0]
                              : [0, 9.5, 0],
                          rotateZ:
                            flip.direction === "next"
                              ? [0, -3.5, 0]
                              : [0, 3.5, 0],
                          scaleY: [1, 0.93, 1],
                        }}
                        transition={{
                          duration: PAGE_TURN_DURATION,
                          times: [0, 0.5, 1],
                          ease: [0.64, 0, 0.35, 1],
                        }}
                        onAnimationComplete={() => {
                          setCurrentPage(flip.targetPage);
                          setFlip(null);
                        }}
                        className="absolute inset-y-0 z-30"
                        style={{
                          left: flip.direction === "next" ? "50%" : "0%",
                          width: "50%",
                          transformOrigin:
                            flip.direction === "next"
                              ? "left center"
                              : "right center",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {/* FRONT SIDE OF TURNING LEAF WITH 3D CURVED EDGES */}
                        <motion.div
                          initial={{
                            borderTopRightRadius: "0px",
                            borderBottomRightRadius: "0px",
                            borderTopLeftRadius: "0px",
                            borderBottomLeftRadius: "0px",
                          }}
                          animate={{
                            borderTopRightRadius:
                              flip.direction === "next"
                                ? ["0px", "110px", "0px"]
                                : "0px",
                            borderBottomRightRadius:
                              flip.direction === "next"
                                ? ["0px", "85px", "0px"]
                                : "0px",
                            borderTopLeftRadius:
                              flip.direction === "prev"
                                ? ["0px", "110px", "0px"]
                                : "0px",
                            borderBottomLeftRadius:
                              flip.direction === "prev"
                                ? ["0px", "85px", "0px"]
                                : "0px",
                          }}
                          transition={{
                            duration: PAGE_TURN_DURATION,
                            times: [0, 0.5, 1],
                            ease: [0.64, 0, 0.35, 1],
                          }}
                          className="absolute inset-0 overflow-hidden bg-[#f8f7f3] shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                          }}
                        >
                          <img
                            src={flip.frontImageUrl}
                            alt=""
                            draggable={false}
                            decoding="async"
                            className="h-full w-full object-contain select-none"
                          />

                          {/* Cylindrical Specular Roll Highlight Sweep */}
                          <motion.div
                            initial={{ opacity: 0, x: "-30%" }}
                            animate={{
                              opacity: [0, 0.85, 0],
                              x:
                                flip.direction === "next"
                                  ? ["-30%", "30%", "90%"]
                                  : ["30%", "-30%", "-90%"],
                            }}
                            transition={{
                              duration: PAGE_TURN_DURATION,
                              times: [0, 0.5, 1],
                            }}
                            className={`pointer-events-none absolute inset-0 ${
                              flip.direction === "next"
                                ? "bg-linear-to-r from-transparent via-white/55 to-black/50"
                                : "bg-linear-to-l from-transparent via-white/55 to-black/50"
                            }`}
                          />

                          {/* Moving Edge Paper Curl Shadow */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.95, 0] }}
                            transition={{
                              duration: PAGE_TURN_DURATION,
                              times: [0, 0.5, 1],
                            }}
                            className={`pointer-events-none absolute inset-y-0 ${
                              flip.direction === "next"
                                ? "right-0 w-16"
                                : "left-0 w-16"
                            } ${
                              flip.direction === "next"
                                ? "bg-linear-to-l from-black/80 via-black/30 to-transparent"
                                : "bg-linear-to-r from-black/80 via-black/30 to-transparent"
                            } blur-[6px]`}
                          />
                        </motion.div>

                        {/* BACK SIDE OF TURNING LEAF */}
                        {flip.backImageUrl ? (
                          <motion.div
                            initial={{
                              borderTopRightRadius: "0px",
                              borderBottomRightRadius: "0px",
                              borderTopLeftRadius: "0px",
                              borderBottomLeftRadius: "0px",
                            }}
                            animate={{
                              borderTopLeftRadius:
                                flip.direction === "next"
                                  ? ["0px", "110px", "0px"]
                                  : "0px",
                              borderBottomLeftRadius:
                                flip.direction === "next"
                                  ? ["0px", "85px", "0px"]
                                  : "0px",
                              borderTopRightRadius:
                                flip.direction === "prev"
                                  ? ["0px", "110px", "0px"]
                                  : "0px",
                              borderBottomRightRadius:
                                flip.direction === "prev"
                                  ? ["0px", "85px", "0px"]
                                  : "0px",
                            }}
                            transition={{
                              duration: PAGE_TURN_DURATION,
                              times: [0, 0.5, 1],
                              ease: [0.64, 0, 0.35, 1],
                            }}
                            className="absolute inset-0 overflow-hidden bg-[#f8f7f3] shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(180deg) translateZ(0.1px)",
                            }}
                          >
                            <img
                              src={flip.backImageUrl}
                              alt=""
                              draggable={false}
                              decoding="async"
                              className="h-full w-full object-contain select-none"
                            />
                            <motion.div
                              initial={{ opacity: 0.5 }}
                              animate={{ opacity: [0.75, 0.25, 0] }}
                              transition={{
                                duration: PAGE_TURN_DURATION,
                                times: [0, 0.5, 1],
                              }}
                              className={`pointer-events-none absolute inset-0 ${
                                flip.direction === "next"
                                  ? "bg-linear-to-r from-black/50 via-white/30 to-transparent"
                                  : "bg-linear-to-l from-black/50 via-white/30 to-transparent"
                              }`}
                            />
                          </motion.div>
                        ) : null}
                      </motion.div>
                    ) : null}
                    {flip?.frontImageUrl ? (
                      <div className="absolute inset-0 z-30">
                        <CataloguePageTurnCanvas
                          frontImageUrl={flip.frontImageUrl}
                          backImageUrl={flip.backImageUrl}
                          direction={flip.direction}
                          durationMs={PAGE_TURN_DURATION * 1000}
                          progressRef={
                            flip.interaction === "drag"
                              ? flipProgressRef
                              : undefined
                          }
                          settleTo={flip.settleTo}
                          onComplete={completeFlip}
                          onCancel={cancelInteractiveFlip}
                        />
                      </div>
                    ) : null}
                  </>
                ) : (
                  /* SINGLE PAGE SPREAD IN ZOOMED VIEW WITH 3D FLIP */
                  <div className="relative h-full w-full overflow-hidden">
                    <CataloguePage
                      page={displayLeftPage}
                      pageNumber={
                        displayLeftIndex >= 0 ? displayLeftIndex + 1 : undefined
                      }
                      side="single"
                      isZoomed
                      onClick={() => {
                        if (canGoNext && !flip) goNext();
                      }}
                    />

                    {/* Underside Paper Shadow during Flip */}
                    {flip ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.45, 0] }}
                        transition={{
                          duration: PAGE_TURN_DURATION,
                          times: [0, 0.5, 1],
                        }}
                        className="pointer-events-none absolute inset-0 z-20 bg-linear-to-r from-black/50 via-transparent to-black/50"
                      />
                    ) : null}

                    {/* 3D SINGLE-PAGE FLIP LEAF LAYER WITH OGL WEBGL CANVAS */}
                    {flip?.frontImageUrl ? (
                      <div className="absolute inset-0 z-30 h-full w-full">
                        <CataloguePageTurnCanvas
                          frontImageUrl={flip.frontImageUrl}
                          backImageUrl={flip.backImageUrl}
                          direction={flip.direction}
                          durationMs={PAGE_TURN_DURATION * 1000}
                          onComplete={completeFlip}
                        />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
