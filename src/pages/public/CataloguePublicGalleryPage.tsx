import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import LandingHeader from "@/components/landing/LandingHeader";
import { PATHS } from "@/config/paths";
import { useInfiniteCatalogueList } from "@/hooks/data/useCatalogueHooks";
import type { Catalogue, CatalogueDetail } from "@/types/Catalogue";

const PAGE_SIZE = 20;

function getCover(details: CatalogueDetail[]) {
  return details.reduce<CatalogueDetail | null>((cover, detail) => {
    if (!cover || detail.sortOrder < cover.sortOrder) return detail;
    return cover;
  }, null);
}

function formatPublishedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

function CatalogueCard({
  catalogue,
  priority,
}: {
  catalogue: Catalogue;
  priority: boolean;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const cover = getCover(catalogue.details);
  const publishedDate = formatPublishedDate(catalogue.createdAt);
  const previewPath = PATHS.CATALOGUE.PUBLIC_PREVIEW.replace(
    ":catalogueId",
    catalogue.catalogueId,
  );

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.985 }}
      transition={{
        type: "spring",
        stiffness: 90,
        damping: 18,
        mass: 1,
      }}
    >
      <Link
        to={previewPath}
        className="group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0ede6]"
        aria-label={`Xem catalogue ${catalogue.catalogueName}`}
      >
        <article className="flex flex-col">
          {/* MINIMALIST LUXURY CATALOGUE COVER */}
          <div className="relative aspect-[210/297] w-full overflow-hidden rounded-xl border border-white/12 bg-[#121212] shadow-[0_16px_36px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-white/35 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.7)]">
            {cover && !hasImageError ? (
              <img
                src={cover.imageUrl}
                alt=""
                width={630}
                height={891}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                onError={() => setHasImageError(true)}
                className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <span className="text-6xl font-normal tracking-[-0.05em] text-white/14">
                  {catalogue.catalogueName.trim().charAt(0).toUpperCase() ||
                    "C"}
                </span>
              </div>
            )}

            {/* Subtle Spine Highlight for Editorial Feel */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-white/12 to-transparent opacity-60" />

            {/* SLEEK GLOWING BOTTOM LINE INDICATOR ON HOVER (MATCHING SEARCH BAR STYLE) */}
            <div className="pointer-events-none absolute right-0 -bottom-px left-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-white via-indigo-200 to-white opacity-0 shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:opacity-100" />
          </div>

          {/* ITEM TITLE & METADATA */}
          <div className="flex flex-col items-center pt-5 text-center">
            <h2 className="max-w-[22ch] pb-1 text-[1.4375rem] leading-snug font-normal tracking-[-0.03em] text-[#f0ede6] transition-colors duration-500 group-hover:text-white">
              {catalogue.catalogueName}
            </h2>
            {publishedDate ? (
              <p className="mt-1 text-[0.6875rem] font-normal tracking-[0.08em] text-white/36 uppercase transition-colors duration-500 group-hover:text-white/56">
                Xuất bản {publishedDate}
              </p>
            ) : null}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-14">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[210/297] animate-pulse bg-white/[0.04]" />
          <div className="mx-auto mt-7 h-6 w-3/4 animate-pulse bg-white/[0.05]" />
          <div className="mx-auto mt-3 h-3 w-1/3 animate-pulse bg-white/[0.035]" />
        </div>
      ))}
    </div>
  );
}

export default function CataloguePublicGalleryPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteCatalogueList({
    limit: PAGE_SIZE,
    status: "ACTIVE",
    search: search || undefined,
  });

  const catalogueMap = new Map<string, Catalogue>();
  data?.pages.forEach((page) => {
    page.data?.forEach((catalogue) => {
      catalogueMap.set(catalogue.catalogueId, catalogue);
    });
  });
  const catalogues = Array.from(catalogueMap.values());

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main
      className="min-h-screen bg-[#050505] font-normal text-[#f0ede6] antialiased selection:bg-[#f0ede6] selection:text-[#050505]"
      style={{
        fontFamily: '"OverusedGrotesk", "Helvetica Neue", sans-serif',
      }}
    >
      <LandingHeader initialActiveTab="Catalogues" />

      <div className="mx-auto w-[min(calc(100%_-_3rem),82.5rem)] pb-24">
        {/* HERO TITLE & SEARCH SECTION WITH ENTRANCE ANIMATION */}
        <section className="flex flex-col items-center pt-[clamp(9rem,15vw,13rem)] pb-[clamp(5rem,8vw,7rem)] text-center">
          <motion.h1
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[25ch] text-[clamp(2.75rem,5vw,4.375rem)] leading-[1.08] font-normal tracking-[-0.05em]"
          >
            <span className="font-semibold text-[#77e1de]">
              Picare Catalogues
            </span>
            . Những điều tuyệt vời cho cuộc sống của bạn.
          </motion.h1>

          {/* SEARCH INPUT BAR WITH LEFT-TO-RIGHT GLOWING ANIMATED LINE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-12 flex h-12 w-full max-w-[34rem] items-center gap-3 border-b border-white/18 transition-colors duration-500"
          >
            <FiSearch
              className={`shrink-0 text-base transition-colors duration-500 ${
                isSearchFocused ? "text-white" : "text-white/38"
              }`}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Tìm catalogue"
              aria-label="Tìm catalogue"
              className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] font-normal text-white outline-none placeholder:text-white/28 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/36 transition-colors hover:bg-white/6 hover:text-white"
                aria-label="Xóa nội dung tìm kiếm"
              >
                <FiX />
              </button>
            ) : null}

            {/* ANIMATED FOCUS GLOW LINE FROM LEFT TO RIGHT */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isSearchFocused ? 1 : 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 -bottom-px left-0 h-[2px] origin-left bg-gradient-to-r from-white via-indigo-200 to-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            />
          </motion.div>
        </section>

        {isLoading ? <GallerySkeleton /> : null}

        {isError ? (
          <section className="flex min-h-[45vh] flex-col items-center justify-center text-center">
            <h2 className="text-[1.75rem] leading-none font-normal tracking-[-0.035em]">
              Không tải được catalogue
            </h2>
            <p className="mt-4 max-w-md text-[0.875rem] leading-6 text-white/48">
              {error instanceof Error
                ? error.message
                : "Đã xảy ra lỗi khi tải thư viện catalogue."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-7 border border-white/35 px-5 py-2.5 text-[0.8125rem] font-normal transition-colors hover:bg-[#f0ede6] hover:text-[#050505]"
            >
              Tải lại
            </button>
          </section>
        ) : null}

        {!isLoading && !isError && catalogues.length === 0 ? (
          <section className="flex min-h-[35vh] flex-col items-center justify-center text-center">
            <h2 className="text-[1.75rem] leading-none font-normal tracking-[-0.035em]">
              {search ? "Không tìm thấy catalogue" : "Thư viện đang cập nhật"}
            </h2>
            <p className="mt-4 text-[0.875rem] text-white/44">
              {search
                ? `Không có kết quả phù hợp với “${search}”.`
                : "Các catalogue mới sẽ sớm xuất hiện tại đây."}
            </p>
          </section>
        ) : null}

        {/* STAGGERED ENTRANCE GRID FOR CATALOGUE ITEMS */}
        {catalogues.length > 0 ? (
          <motion.section
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-14"
            aria-label="Danh sách catalogue"
            aria-busy={isFetchingNextPage}
          >
            {catalogues.map((catalogue, index) => (
              <CatalogueCard
                key={catalogue.catalogueId}
                catalogue={catalogue}
                priority={index < 6}
              />
            ))}
          </motion.section>
        ) : null}

        <div
          ref={loadMoreRef}
          className="flex min-h-36 items-center justify-center"
          aria-live="polite"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center gap-3 text-[0.8125rem] text-white/44">
              <Spinner size="sm" color="primary" />
              <span>Đang tải thêm catalogue…</span>
            </div>
          ) : null}

          {!hasNextPage && catalogues.length > 0 ? (
            <p className="text-[0.625rem] font-normal tracking-[0.14em] text-white/32 uppercase">
              Đã hiển thị tất cả catalogue
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
