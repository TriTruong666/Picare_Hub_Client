import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiGrid,
  FiLayers,
  FiMaximize2,
  FiMinimize2,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSmartphone,
  FiX,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

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
};

type Spread = {
  leftIndex: number;
  rightIndex: number;
  leftPage: CatalogueDetail | null;
  rightPage: CatalogueDetail | null;
};

function getSpread(
  pages: CatalogueDetail[],
  anchor: number,
  viewMode: ViewMode,
): Spread {
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

function normalizePageForMode(page: number, viewMode: ViewMode) {
  if (viewMode === "single" || page === 0) return page;
  return page % 2 === 0 ? page - 1 : page;
}

function getNextPage(
  currentPage: number,
  totalPages: number,
  viewMode: ViewMode,
) {
  if (viewMode === "single") {
    return Math.min(currentPage + 1, totalPages - 1);
  }

  return currentPage === 0
    ? Math.min(1, totalPages - 1)
    : Math.min(currentPage + 2, totalPages - 1);
}

function getPreviousPage(currentPage: number, viewMode: ViewMode) {
  if (viewMode === "single") return Math.max(currentPage - 1, 0);
  return currentPage <= 2 ? 0 : currentPage - 2;
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
            ? "border-[#f0ede6] text-[#f0ede6]"
            : "border-transparent text-white/42 hover:border-white/18 hover:text-[#f0ede6]"
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
  onOpen,
}: {
  page: CatalogueDetail | null;
  pageNumber?: number;
  side: "left" | "right" | "single";
  onOpen?: () => void;
}) {
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const isLoaded = loadedImageUrl === page?.imageUrl;

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
      onClick={onOpen}
      whileHover={{ scale: 1.004 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-[#f8f7f3] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      aria-label={`Phóng to trang ${pageNumber}`}
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

function ZoomViewer({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => setScale((s) => Math.min(3.5, s + 0.4));
  const handleZoomOut = () =>
    setScale((s) => {
      const next = Math.max(1, s - 0.4);
      if (next === 1) setResetKey((k) => k + 1);
      return next;
    });

  const handleReset = () => {
    setScale(1);
    setResetKey((k) => k + 1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#050505]/98 p-4 select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem trang catalogue phóng to"
    >
      {/* Top action controls */}
      <div
        className="absolute top-5 right-5 z-50 flex items-center gap-1 border-b border-white/10 bg-[#050505]/88 px-1"
        onClick={(event) => event.stopPropagation()}
      >
        <IconButton
          label="Thu nhỏ (-)"
          disabled={scale <= 1}
          onClick={handleZoomOut}
          position="bottom"
        >
          <FiZoomOut />
        </IconButton>

        <button
          type="button"
          onClick={handleReset}
          className="h-10 px-2.5 text-[0.6875rem] font-normal tracking-[0.08em] text-white/62 tabular-nums transition-colors hover:text-white"
          title="Đặt lại mức zoom và vị trí (100%)"
        >
          {Math.round(scale * 100)}%
        </button>

        <IconButton
          label="Phóng to (+)"
          disabled={scale >= 3.5}
          onClick={handleZoomIn}
          position="bottom"
        >
          <FiZoomIn />
        </IconButton>

        {scale > 1 && (
          <IconButton
            label="Đặt lại 100% & Vị trí ban đầu"
            onClick={handleReset}
            position="bottom"
          >
            <FiRotateCcw />
          </IconButton>
        )}

        <div className="mx-1 h-4 w-px bg-white/20" />

        <IconButton label="Đóng (Esc)" onClick={onClose} position="bottom">
          <FiX />
        </IconButton>
      </div>

      {/* Zoom guidance */}
      {scale > 1 && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2 text-center text-[0.625rem] font-normal tracking-[0.08em] text-white/42 uppercase">
          Kéo để di chuyển · Cuộn để thu phóng
        </div>
      )}

      {/* Draggable High-Res Image Canvas */}
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden p-6"
        onWheel={handleWheel}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={() => (scale > 1 ? handleReset() : setScale(2))}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        )}
        <motion.img
          key={resetKey}
          src={imageUrl}
          alt="Trang catalogue phóng to sắc nét"
          draggable={false}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          animate={{ scale, x: 0, y: 0 }}
          drag={scale > 1}
          dragConstraints={{
            left: -800 * (scale - 1),
            right: 800 * (scale - 1),
            top: -600 * (scale - 1),
            bottom: 600 * (scale - 1),
          }}
          dragElastic={0.05}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className={`max-h-[88vh] max-w-[90vw] origin-center object-contain shadow-[0_30px_90px_rgba(0,0,0,0.8)] transition-opacity duration-300 select-none ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${
            scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
          }`}
        />
      </div>
    </motion.div>
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
  const [viewMode, setViewMode] = useState<ViewMode>("double");
  const [isMobile, setIsMobile] = useState(false);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const preloadedUrlsRef = useRef<Set<string>>(new Set());

  // Performance Optimization: Smart Preloader for adjacent pages
  useEffect(() => {
    if (!pages || pages.length === 0) return;

    // Preload window: 2 pages back, 5 pages ahead
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(pages.length - 1, currentPage + 5);

    for (let i = start; i <= end; i++) {
      const url = pages[i]?.imageUrl;
      if (url && !preloadedUrlsRef.current.has(url)) {
        preloadedUrlsRef.current.add(url);
        const img = new Image();
        img.decoding = "async";
        img.src = url;
      }
    }
  }, [pages, currentPage]);

  const totalPages = pages.length;
  const currentSpread = getSpread(pages, currentPage, viewMode);
  const targetSpread = flip
    ? getSpread(pages, flip.targetPage, viewMode)
    : currentSpread;

  const canGoPrevious = currentPage > 0;
  const canGoNext =
    viewMode === "single"
      ? currentPage < totalPages - 1
      : Math.max(currentSpread.leftIndex, currentSpread.rightIndex) <
        totalPages - 1;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const handleChange = () => {
      setIsMobile(media.matches);
      if (media.matches) {
        setViewMode("single");
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

      if (viewMode === "single") {
        setFlip({ direction, targetPage });
        setCurrentPage(targetPage);
      } else {
        setFlip({ direction, targetPage });
      }
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
      if (zoomImage) return;

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
  }, [goNext, goPrevious, jumpToPage, totalPages, zoomImage]);

  const handleViewModeChange = () => {
    const nextMode: ViewMode = viewMode === "double" ? "single" : "double";
    setViewMode(nextMode);
    setCurrentPage((page) => normalizePageForMode(page, nextMode));
    setFlip(null);
  };

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

  const turningFrontPage =
    flip?.direction === "next"
      ? (currentSpread.rightPage ?? currentSpread.leftPage)
      : (currentSpread.leftPage ?? currentSpread.rightPage);
  const turningBackPage =
    flip?.direction === "next"
      ? (targetSpread.leftPage ?? targetSpread.rightPage)
      : (targetSpread.rightPage ?? targetSpread.leftPage);

  const activePageIndexes = new Set([
    currentSpread.leftIndex,
    currentSpread.rightIndex,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[100dvh] min-h-[520px] w-full flex-col overflow-hidden bg-[#050505] font-normal text-[#f0ede6] antialiased selection:bg-[#f0ede6] selection:text-[#050505]"
      style={{
        fontFamily: '"OverusedGrotesk", "Helvetica Neue", sans-serif',
      }}
    >
      {/* READER HEADER WITH SPRING ENTRANCE */}
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
        className="relative z-40 mx-auto flex h-16 w-[min(calc(100%_-_2rem),87.5rem)] shrink-0 items-center justify-between border-b border-white/8"
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
            className="group flex min-w-0 items-center gap-1.5 text-[0.6875rem] font-normal tracking-[0.08em] text-white/42 uppercase transition-colors hover:text-white"
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
          className="pointer-events-none absolute inset-x-28 top-1/2 -translate-y-1/2 text-center"
        >
          <p className="truncate text-[0.8125rem] font-normal tracking-[-0.01em] text-white/78">
            {catalogue.catalogueName}
          </p>
          <p className="mt-0.5 hidden text-[0.5625rem] font-normal tracking-[0.1em] text-white/30 uppercase tabular-nums sm:block">
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
          <ThemeToggle className="!rounded-none !border-0 !border-b !border-transparent !bg-transparent !shadow-none !backdrop-blur-none hover:!border-white/18 hover:!bg-transparent dark:!bg-transparent [&_svg]:!text-white/42 hover:[&_svg]:!text-white dark:[&>span:first-child]:hidden" />
        </motion.div>
      </motion.header>

      {/* MAIN STAGE */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center px-11 py-3 sm:px-16 lg:px-24">
        {/* STAGE CONTAINER WITH TOUCH SWIPE & MOUSE DRAG */}
        <motion.div
          drag={!flip && !zoomImage ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_event, info) => {
            if (flip || zoomImage) return;

            const swipeThreshold = 40; // minimum drag distance 40px
            const velocityThreshold = 180; // fast flick velocity

            if (
              info.offset.x < -swipeThreshold ||
              info.velocity.x < -velocityThreshold
            ) {
              // Swiped Left -> Go Next Page
              if (canGoNext) goNext();
            } else if (
              info.offset.x > swipeThreshold ||
              info.velocity.x > velocityThreshold
            ) {
              // Swiped Right -> Go Previous Page
              if (canGoPrevious) goPrevious();
            }
          }}
          initial={{ opacity: 0, y: 36, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 75,
            damping: 20,
            mass: 1,
            delay: 0.25,
          }}
          className="relative cursor-grab touch-pan-y active:cursor-grabbing"
          style={{
            width:
              viewMode === "double"
                ? "min(88vw, calc((100dvh - 13.5rem) * 1.414))"
                : "min(82vw, calc((100dvh - 13.5rem) * 0.707))",
            aspectRatio: viewMode === "double" ? "1.414 / 1" : "0.707 / 1",
            perspective: "2800px",
          }}
        >
          <div className="absolute inset-x-[5%] -bottom-6 h-12 rounded-[50%] bg-black/90 opacity-80 blur-2xl" />
          <div className="absolute top-2 -right-2 bottom-2 w-2 bg-[#292826] opacity-80" />
          <div className="absolute right-2 -bottom-2 left-2 h-2 bg-[#1c1b1a] opacity-90" />

          <div className="relative flex h-full w-full overflow-visible bg-white/[0.025] shadow-[0_24px_70px_rgba(0,0,0,0.62)] ring-1 ring-white/8">
            {viewMode === "double" ? (
              /* DOUBLE-PAGE SPREAD MODE WITH 3D FLIP LEAF */
              <>
                <div className="relative h-full w-1/2 overflow-hidden">
                  <CataloguePage
                    page={displayLeftPage}
                    pageNumber={
                      displayLeftIndex >= 0 ? displayLeftIndex + 1 : undefined
                    }
                    side="left"
                    onOpen={() =>
                      displayLeftPage && setZoomImage(displayLeftPage.imageUrl)
                    }
                  />
                </div>
                <div className="relative h-full w-1/2 overflow-hidden">
                  <CataloguePage
                    page={displayRightPage}
                    pageNumber={
                      displayRightIndex >= 0 ? displayRightIndex + 1 : undefined
                    }
                    side="right"
                    onOpen={() =>
                      displayRightPage &&
                      setZoomImage(displayRightPage.imageUrl)
                    }
                  />
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-black/70" />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-10 -translate-x-1/2 bg-linear-to-r from-black/16 via-transparent to-black/16 opacity-80" />

                {/* 3D BOOK LEAF FLIP LAYER FOR DOUBLE SPREAD */}
                {flip && turningFrontPage ? (
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{
                      rotateY:
                        flip.direction === "next"
                          ? [0, -94, -180]
                          : [0, 94, 180],
                      scaleX: [1, 0.94, 1],
                    }}
                    transition={{
                      duration: 0.62,
                      times: [0, 0.52, 1],
                      ease: [0.65, 0, 0.35, 1],
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
                    <div
                      className="absolute inset-0 overflow-hidden bg-[#f8f7f3]"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <img
                        src={turningFrontPage.imageUrl}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="h-full w-full object-contain select-none"
                      />
                      <motion.div
                        initial={{ opacity: 0.04 }}
                        animate={{ opacity: [0.02, 0.42, 0.08] }}
                        transition={{ duration: 0.62, times: [0, 0.52, 1] }}
                        className={`pointer-events-none absolute inset-0 ${
                          flip.direction === "next"
                            ? "bg-linear-to-l from-black/36 via-black/8 to-transparent"
                            : "bg-linear-to-r from-black/36 via-black/8 to-transparent"
                        }`}
                      />
                    </div>

                    {turningBackPage ? (
                      <div
                        className="absolute inset-0 overflow-hidden bg-[#f8f7f3]"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg) translateZ(0.1px)",
                        }}
                      >
                        <img
                          src={turningBackPage.imageUrl}
                          alt=""
                          draggable={false}
                          decoding="async"
                          className="h-full w-full object-contain select-none"
                        />
                        <motion.div
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: [0.4, 0.16, 0.02] }}
                          transition={{ duration: 0.62, times: [0, 0.48, 1] }}
                          className={`pointer-events-none absolute inset-0 ${
                            flip.direction === "next"
                              ? "bg-linear-to-r from-black/28 to-transparent"
                              : "bg-linear-to-l from-black/28 to-transparent"
                          }`}
                        />
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}
              </>
            ) : (
              /* SINGLE-PAGE MODE WITH SLEEK SLIDE / DISSOLVE TRANSITION */
              <div className="relative h-full w-full overflow-hidden">
                <AnimatePresence
                  mode="popLayout"
                  onExitComplete={() => {
                    if (flip) setFlip(null);
                  }}
                >
                  <motion.div
                    key={currentPage}
                    initial={{
                      x: flip?.direction === "prev" ? "-100%" : "100%",
                      opacity: 0.4,
                      scale: 0.98,
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      x: flip?.direction === "prev" ? "100%" : "-100%",
                      opacity: 0.2,
                      scale: 0.98,
                    }}
                    transition={{
                      duration: 0.42,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 h-full w-full overflow-hidden"
                  >
                    <CataloguePage
                      page={currentSpread.leftPage}
                      pageNumber={currentSpread.leftIndex + 1}
                      side="single"
                      onOpen={() => {
                        if (currentSpread.leftPage)
                          setZoomImage(currentSpread.leftPage.imageUrl);
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* FOOTER WITH STAGGERED SPRING ENTRANCE */}
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
        className="relative z-40 mx-auto flex h-14 w-[min(calc(100%_-_2rem),87.5rem)] shrink-0 items-center justify-between border-t border-white/8"
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

          <div className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />

          <IconButton
            label={isPlaying ? "Dừng tự động lật" : "Tự động lật"}
            active={isPlaying}
            onClick={() => setIsPlaying((value) => !value)}
            position="top"
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </IconButton>

          {!isMobile ? (
            <IconButton
              label={viewMode === "double" ? "Xem từng trang" : "Xem hai trang"}
              active={viewMode === "single"}
              disabled={Boolean(flip)}
              onClick={handleViewModeChange}
              position="top"
            >
              {viewMode === "double" ? <FiSmartphone /> : <FiLayers />}
            </IconButton>
          ) : null}
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
          <span className="text-[0.625rem] font-normal tracking-[0.08em] text-white/32 tabular-nums">
            <strong className="font-normal text-white/78">
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
              className="absolute inset-0 z-30 bg-black/58"
              onClick={() => setShowThumbnails(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-14 z-50 border-y border-white/10 bg-[#080808]/97 px-3 py-5 shadow-[0_-28px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:px-8"
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

      <AnimatePresence>
        {zoomImage ? (
          <ZoomViewer imageUrl={zoomImage} onClose={() => setZoomImage(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
