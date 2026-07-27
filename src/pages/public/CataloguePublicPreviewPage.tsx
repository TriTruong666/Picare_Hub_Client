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

import logo from "@/assets/images/logo.png";
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
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[15px] transition-[color,background-color,border-color,opacity] duration-200 ease-out active:scale-95 disabled:pointer-events-none disabled:opacity-20 ${
          active
            ? "border-black/18 bg-black text-[#f6f1e8] dark:border-white/18 dark:bg-white dark:text-[#111111]"
            : "border-transparent text-black/52 hover:border-black/10 hover:bg-black/[0.04] hover:text-black dark:text-white/52 dark:hover:border-white/10 dark:hover:bg-white/[0.06] dark:hover:text-white"
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [page?.imageUrl]);

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
      whileHover={{ scale: 1.012 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-[#f8f7f3] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white"
      aria-label={`Phóng to trang ${pageNumber}`}
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f0eee6] dark:bg-[#121212]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/15 border-t-black/60 dark:border-white/15 dark:border-t-white/60" />
        </div>
      )}

      <img
        src={page.imageUrl}
        alt={`Trang ${pageNumber}`}
        draggable={false}
        loading="eager"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-contain select-none transition-opacity duration-300 ${
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
      transition={{
        type: "spring",
        stiffness: 450,
        damping: 25,
      }}
      className={`relative shrink-0 transition-[opacity,transform] duration-200 ${
        active ? "translate-y-[-3px] opacity-100" : "opacity-48 hover:opacity-100"
      }`}
      aria-label={`Đi đến trang ${index + 1}`}
    >
      <div className="relative h-20 sm:h-24 overflow-hidden rounded">
        {!isLoaded && (
          <div className="absolute inset-0 bg-black/10 dark:bg-white/10 animate-pulse rounded" />
        )}
        <img
          src={page.imageUrl}
          alt={`Trang ${index + 1}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`h-20 w-auto border bg-white object-contain sm:h-24 rounded transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${
            active
              ? "border-black/80 ring-2 ring-black/50 dark:border-white/90 dark:ring-white/60"
              : "border-black/10 dark:border-white/10"
          }`}
        />
      </div>
      <span className="mt-1.5 block text-center text-[9px] font-semibold text-black/42 tabular-nums dark:text-white/42">
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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#050505]/96 p-4 backdrop-blur-md select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem trang catalogue phóng to"
    >
      {/* Top Floating Action Controls Bar */}
      <div
        className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-neutral-900/90 px-3.5 py-1.5 shadow-2xl backdrop-blur-md"
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
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-white/80 tabular-nums transition hover:bg-white/10"
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

      {/* Helper Badge when zoomed */}
      {scale > 1 && (
        <div className="pointer-events-none absolute top-4 left-4 z-40 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md">
          💡 Kéo chuột để di chuyển xem từng chi tiết • Cuộn chuột để tăng/giảm zoom
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
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={`max-h-[88vh] max-w-[90vw] origin-center rounded-md object-contain shadow-[0_30px_90px_rgba(0,0,0,0.8)] select-none transition-opacity duration-200 ${
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
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-black/55 dark:text-white/55">
            Đang tải catalogue...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !catalogue || totalPages === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="max-w-md text-center">
          <p className="text-[11px] font-medium text-black/35 uppercase dark:text-white/35">
            Catalogue Preview
          </p>
          <h1 className="mt-3 text-2xl font-medium">
            Không tìm thấy catalogue
          </h1>
          <p className="mt-3 text-sm leading-7 text-black/58 dark:text-white/58">
            Liên kết có thể đã hết hiệu lực hoặc catalogue không còn tồn tại.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex h-11 items-center justify-center border border-black px-5 text-sm font-medium text-black transition hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
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
      className="relative flex h-[100dvh] min-h-[520px] w-full flex-col overflow-hidden bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white"
    >
      {/* HEADER */}
      <header className="relative z-40 mx-auto flex h-16 w-full max-w-[1400px] shrink-0 items-center justify-between border-b border-black/10 px-4 sm:px-6 lg:px-10 xl:px-12 dark:border-white/10">
        <Link
          to={PATHS.HOME}
          className="flex min-w-0 items-center gap-2"
          aria-label="Về trang chủ"
        >
          <img
            src={logo}
            alt=""
            className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
          />
          <span className="font-bricolage hidden text-base font-medium sm:inline sm:text-lg">
            Picare Hub
          </span>
        </Link>

        <div className="pointer-events-none absolute inset-x-24 top-1/2 hidden -translate-y-1/2 text-center md:block">
          <p className="truncate text-sm font-medium">
            {catalogue.catalogueName}
          </p>
          <p className="mt-0.5 text-[10px] text-black/38 tabular-nums dark:text-white/38">
            {totalPages} trang
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
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
          <ThemeToggle className="shadow-none" />
        </div>
      </header>

      {/* MAIN STAGE */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-5 sm:px-16 sm:py-6 lg:px-24">
        {/* Previous Side Nav Arrow */}
        <Tooltip content="Trang trước" position="right">
          <motion.button
            type="button"
            onClick={goPrevious}
            disabled={!canGoPrevious || Boolean(flip)}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.94 }}
            className={`absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border text-base sm:text-lg shadow-md transition-all duration-200 ${
              canGoPrevious && !flip
                ? "border-black/15 bg-white/90 text-black hover:bg-black hover:text-white dark:border-white/20 dark:bg-neutral-900/90 dark:text-white dark:hover:bg-white dark:hover:text-black"
                : "border-black/5 bg-black/5 text-black/25 dark:border-white/5 dark:bg-white/5 dark:text-white/25 cursor-not-allowed opacity-30"
            }`}
            aria-label="Trang trước"
          >
            <FiChevronLeft />
          </motion.button>
        </Tooltip>

        {/* Next Side Nav Arrow */}
        <Tooltip content="Trang tiếp theo" position="left">
          <motion.button
            type="button"
            onClick={goNext}
            disabled={!canGoNext || Boolean(flip)}
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.94 }}
            className={`absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border text-base sm:text-lg shadow-md transition-all duration-200 ${
              canGoNext && !flip
                ? "border-black/15 bg-white/90 text-black hover:bg-black hover:text-white dark:border-white/20 dark:bg-neutral-900/90 dark:text-white dark:hover:bg-white dark:hover:text-black"
                : "border-black/5 bg-black/5 text-black/25 dark:border-white/5 dark:bg-white/5 dark:text-white/25 cursor-not-allowed opacity-30"
            }`}
            aria-label="Trang tiếp theo"
          >
            <FiChevronRight />
          </motion.button>
        </Tooltip>

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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            width:
              viewMode === "double"
                ? "min(90vw, calc((100dvh - 11rem) * 1.414))"
                : "min(86vw, calc((100dvh - 11rem) * 0.707))",
            aspectRatio: viewMode === "double" ? "1.414 / 1" : "0.707 / 1",
            perspective: "2400px",
          }}
        >
          <div className="absolute -inset-x-3 -bottom-4 h-8 rounded-[50%] bg-black/18 blur-xl dark:bg-black/70" />

          <div className="relative flex h-full w-full overflow-visible bg-black/[0.035] shadow-xl ring-1 ring-black/8 dark:bg-white/[0.025] dark:ring-white/8">
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
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-black/18 dark:bg-black/70" />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-8 -translate-x-1/2 bg-linear-to-r from-black/10 via-transparent to-black/10 opacity-70" />

                {/* 3D BOOK LEAF FLIP LAYER FOR DOUBLE SPREAD */}
                {flip && turningFrontPage ? (
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{
                      rotateY: flip.direction === "next" ? -180 : 180,
                    }}
                    transition={{
                      duration: 0.48,
                      ease: [0.76, 0, 0.24, 1],
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
                      willChange: "transform",
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
                        animate={{ opacity: [0.04, 0.34, 0.12] }}
                        transition={{ duration: 0.48, times: [0, 0.58, 1] }}
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
                          animate={{ opacity: [0.3, 0.2, 0.04] }}
                          transition={{ duration: 0.48, times: [0, 0.55, 1] }}
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
                      duration: 0.36,
                      ease: [0.25, 1, 0.5, 1],
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

      {/* FOOTER */}
      <footer className="relative z-40 mx-auto flex h-16 w-full max-w-[1400px] shrink-0 items-center justify-between border-t border-black/10 px-4 sm:px-6 lg:px-10 xl:px-12 dark:border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
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
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">
          <span className="text-[11px] text-black/42 tabular-nums dark:text-white/42">
            <strong className="font-medium text-black/78 dark:text-white/78">
              {currentPage + 1}
            </strong>
            <span className="px-1.5">/</span>
            {totalPages}
          </span>
        </div>

        <IconButton
          label="Danh sách trang"
          active={showThumbnails}
          onClick={() => setShowThumbnails((value) => !value)}
          position="top"
        >
          <FiGrid />
        </IconButton>
      </footer>

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
              className="absolute inset-0 z-30 bg-black/8 dark:bg-black/35"
              onClick={() => setShowThumbnails(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-16 z-50 border-y border-black/10 bg-[#f6f1e8]/96 px-3 py-4 shadow-2xl backdrop-blur-xl sm:px-8 dark:border-white/10 dark:bg-[#090909]/96"
            >
              <div className="relative mx-auto flex max-w-[1300px] items-center">
                {/* Scroll Left Button */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("left")}
                  className="absolute left-0 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-md transition hover:scale-105 active:scale-95 dark:border-white/15 dark:bg-neutral-800 dark:text-white"
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
                  className="flex w-full scrollbar-thin scrollbar-thumb-black/20 items-end gap-3 overflow-x-auto px-10 py-1.5 dark:scrollbar-thumb-white/20"
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
                  className="absolute right-0 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-md transition hover:scale-105 active:scale-95 dark:border-white/15 dark:bg-neutral-800 dark:text-white"
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
