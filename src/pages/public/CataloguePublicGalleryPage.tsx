import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";
import { useInfiniteCatalogueList } from "@/hooks/data/useCatalogueHooks";
import { MOCK_CATALOGUES } from "@/mock/catalogueMockData";
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
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
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
  const cover = getCover(catalogue.details || []);
  const publishedDate = formatPublishedDate(catalogue.createdAt);
  const previewPath = PATHS.CATALOGUE.PUBLIC_PREVIEW.replace(
    ":catalogueId",
    catalogue.catalogueId,
  );
  const totalPages = catalogue.details?.length || 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.985 }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 18,
        mass: 0.9,
      }}
    >
      <Link
        to={previewPath}
        className="group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFA336]"
        aria-label={`Xem catalogue ${catalogue.catalogueName}`}
      >
        <article className="flex flex-col">
          {/* MINIMALIST LUXURY CATALOGUE COVER */}
          <div className="relative aspect-[210/297] w-full overflow-hidden rounded-xl border border-white/10 bg-[#16121D] shadow-[0_16px_40px_rgba(0,0,0,0.55)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[#FFA336]/40 group-hover:shadow-[0_24px_50px_rgba(255,163,54,0.14)]">
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

            {/* Page Count Tag */}
            {totalPages > 0 && (
              <div className="absolute top-3.5 right-3.5 z-10 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md transition-colors group-hover:border-[#FFA336]/40 group-hover:text-[#FFA336]">
                {totalPages} trang
              </div>
            )}

            {/* SLEEK GLOWING BOTTOM AMBER LINE ON HOVER */}
            <div className="pointer-events-none absolute right-0 -bottom-px left-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#FFA336] via-[#F86D2B] to-[#FFA336] opacity-0 shadow-[0_0_12px_rgba(255,163,54,0.7)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:opacity-100" />
          </div>

          {/* ITEM TITLE & METADATA */}
          <div className="flex flex-col items-center pt-5 text-center">
            <h2 className="max-w-[24ch] pb-1 text-[1.25rem] leading-snug font-medium tracking-[-0.02em] text-[#f0ede6] transition-colors duration-500 group-hover:text-[#FFA336]">
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
    <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-14">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[210/297] animate-pulse rounded-xl border border-white/5 bg-white/[0.03]" />
          <div className="mx-auto mt-6 h-5 w-3/4 animate-pulse rounded bg-white/[0.05]" />
          <div className="mx-auto mt-2.5 h-3 w-1/3 animate-pulse rounded bg-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}

export default function CataloguePublicGalleryPage() {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
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
  const serverCatalogues = Array.from(catalogueMap.values());

  // Use server catalogues if available; otherwise, provide rich mock fallback for dev/demo
  const catalogues = useMemo(() => {
    if (serverCatalogues.length > 0) {
      return serverCatalogues;
    }
    // Filter mock data based on search input
    if (!search) return MOCK_CATALOGUES;
    const query = search.toLowerCase();
    return MOCK_CATALOGUES.filter(
      (c) =>
        c.catalogueName.toLowerCase().includes(query) ||
        (c.note && c.note.toLowerCase().includes(query)),
    );
  }, [serverCatalogues, search]);

  const isUsingMock = serverCatalogues.length === 0;

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

  const handleBackToHome = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(PATHS.HOME, { state: { fromCatalogue: true } });
    }, 280);
  };

  return (
    <main className="font-haffer relative min-h-screen w-full bg-[#120F17] font-normal text-[#f0ede6] antialiased selection:bg-[#FFA336] selection:text-black">
      <PublicLandingNavbar onLogoClick={handleBackToHome} />

      {/* Ambient background glow effects matching Landing Page */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#FFA336]/[0.045] blur-[150px]" />
        <div className="absolute top-[40%] -left-[10%] h-[500px] w-[700px] rounded-full bg-[#F86D2B]/[0.035] blur-[160px]" />
        <div className="absolute -bottom-[10%] right-[5%] h-[450px] w-[600px] rounded-full bg-[#FFA336]/[0.03] blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          y: isExiting ? -16 : 0,
          filter: isExiting ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-[min(calc(100%_-_3rem),82.5rem)] pb-24"
      >
        {/* HERO TITLE & SEARCH SECTION WITH ENTRANCE ANIMATION */}
        <section className="flex flex-col items-center pt-[clamp(8rem,14vw,11.5rem)] pb-[clamp(4rem,7vw,6rem)] text-center">
          <motion.h1
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[26ch] text-[clamp(2.5rem,4.5vw,4.125rem)] leading-[1.12] font-semibold tracking-[-0.04em]"
          >
            <span className="bg-gradient-to-r from-[#FFA336] via-[#FFB766] to-[#F86D2B] bg-clip-text text-transparent">
              Picare Catalogues
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed font-normal text-white/48"
          >
            Khám phá trọn bộ tài liệu hướng dẫn giải pháp, hồ sơ công nghệ và
            quy chuẩn vận hành hệ sinh thái Picare.
          </motion.p>

          {/* SEARCH INPUT BAR WITH LEFT-TO-RIGHT GLOWING AMBER LINE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-10 flex h-12 w-full max-w-[34rem] items-center gap-3 rounded-t-lg border-b border-white/16 bg-white/[0.015] px-3 transition-colors duration-500"
          >
            <FiSearch
              className={`shrink-0 text-base transition-colors duration-500 ${
                isSearchFocused ? "text-[#FFA336]" : "text-white/38"
              }`}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Tìm kiếm catalogue..."
              aria-label="Tìm kiếm catalogue"
              className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] font-normal text-white outline-none placeholder:text-white/28 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/36 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Xóa nội dung tìm kiếm"
              >
                <FiX />
              </button>
            ) : null}

            {/* ANIMATED FOCUS GLOW LINE FROM LEFT TO RIGHT */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isSearchFocused ? 1 : 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 -bottom-px left-0 h-[2px] origin-left bg-gradient-to-r from-[#FFA336] via-[#F86D2B] to-[#FFA336] shadow-[0_0_12px_rgba(255,163,54,0.65)]"
            />
          </motion.div>

          {isUsingMock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FFA336]/20 bg-[#FFA336]/[0.05] px-3 py-1 text-[11px] text-[#FFA336]/80"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFA336]" />
              Chế độ xem trước với dữ liệu mô phỏng trực quan
            </motion.div>
          )}
        </section>

        {isLoading && serverCatalogues.length === 0 ? (
          <GallerySkeleton />
        ) : null}

        {!isLoading && catalogues.length === 0 ? (
          <section className="flex min-h-[35vh] flex-col items-center justify-center text-center">
            <h2 className="text-[1.5rem] leading-none font-medium tracking-[-0.03em] text-white/90">
              {search ? "Không tìm thấy catalogue" : "Thư viện đang cập nhật"}
            </h2>
            <p className="mt-3 text-[0.875rem] text-white/44">
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
            className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-14"
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
          className="flex min-h-32 items-center justify-center"
          aria-live="polite"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center gap-3 text-[0.8125rem] text-white/44">
              <Spinner size="sm" color="primary" />
              <span>Đang tải thêm catalogue…</span>
            </div>
          ) : null}

          {!hasNextPage && catalogues.length > 0 ? (
            <p className="text-[0.625rem] font-medium tracking-[0.14em] text-white/28 uppercase">
              Đã hiển thị tất cả catalogue
            </p>
          ) : null}
        </div>
      </motion.div>
    </main>
  );
}
