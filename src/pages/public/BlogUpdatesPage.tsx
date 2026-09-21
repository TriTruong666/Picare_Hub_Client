import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiSearch, FiArrowUpRight } from "react-icons/fi";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import { BLOG_REGISTRY, type BlogItemConfig } from "@/config/blogRegistry";

const CATEGORIES = [
  { key: "all", label: "Tất cả cập nhật" },
  { key: "security", label: "Bảo mật & Picare Office" },
  { key: "feature", label: "Tính năng mới" },
  { key: "performance", label: "Hiệu năng & Tối ưu" },
  { key: "infra", label: "Hạ tầng Cloud" },
];

export default function BlogUpdatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = useMemo(() => {
    return BLOG_REGISTRY.filter((post: BlogItemConfig) => {
      const matchCategory =
        selectedCategory === "all" ||
        post.category.toLowerCase().includes(selectedCategory) ||
        (selectedCategory === "security" && post.category.includes("Bảo mật")) ||
        (selectedCategory === "feature" && post.category.includes("Tính năng")) ||
        (selectedCategory === "performance" && post.category.includes("Hiệu năng")) ||
        (selectedCategory === "infra" && post.category.includes("Hạ tầng"));

      const matchSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.version.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="font-haffer relative min-h-screen bg-[#09090b] text-zinc-100 selection:bg-[#F86D2B] selection:text-white">
      {/* 1. Header Navigation */}
      <PublicLandingNavbar isDarkBg={true} showNoticeBanner={false} />

      {/* Background Decorative Ambient Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[800px] rounded-full bg-gradient-to-b from-[#F86D2B]/15 via-[#FFA336]/8 to-transparent blur-3xl" />
        <div className="absolute top-[600px] -left-32 h-[420px] w-[420px] rounded-full bg-[#F86D2B]/8 blur-3xl" />
        <div className="absolute bottom-20 -right-24 h-[460px] w-[460px] rounded-full bg-[#FFA336]/6 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-10 text-left sm:mb-12">
          {/* Title nhỏ gọn, thanh thoát */}
          <h1 className="font-haffer text-2xl sm:text-3xl md:text-[32px] font-semibold text-white leading-snug">
            Nhật ký Cập nhật & Bản tin Kỹ thuật
          </h1>

          {/* Subtitle nhỏ gọn */}
          <p className="font-haffer text-xs sm:text-sm text-zinc-400 max-w-2xl mt-2 leading-relaxed font-normal">
            Theo dõi chi tiết các cột mốc cải tiến hạ tầng, kiến trúc bảo mật doanh nghiệp và những năng lực mới được cập nhật trên hệ sinh thái Picare Hub cùng phân hệ Picare Office.
          </p>
        </section>

        {/* Filter and Search Navigation Bar - Flat & Minimalist (No badge pill, font Haffer đồng bộ) */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 border-b border-zinc-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-5 overflow-x-auto text-xs sm:text-sm">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`cursor-pointer whitespace-nowrap pb-1.5 text-xs font-haffer transition-colors duration-200 ${
                      isActive
                        ? "border-b-2 border-[#F86D2B] font-semibold text-white"
                        : "border-b-2 border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input box */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Tìm nội dung cập nhật..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 pl-8 text-xs font-haffer text-zinc-200 placeholder-zinc-500 transition-colors focus:border-[#F86D2B] focus:outline-none"
              />
              <FiSearch
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>
          </div>
        </section>

        {/* Updates Feed List: Đồng bộ font Haffer, không hiện chi tiết trong item, không item tiêu điểm */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-haffer text-zinc-400 pb-1">
            <span>DANH SÁCH BẢN PHÁT HÀNH & NÂNG CẤP</span>
            <span>Hiển thị {filteredPosts.length} bản ghi</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="border border-zinc-800 bg-[#121215] p-10 text-center">
              <p className="font-haffer text-xs sm:text-sm text-zinc-400">
                Không tìm thấy bản cập nhật nào phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              return (
                <article
                  key={post.id}
                  className="group border border-zinc-800/90 bg-[#101014] p-5 sm:p-6 transition-colors duration-200 hover:border-zinc-700"
                >
                  {/* Header Row: Version, Category, Date (Typography phẳng, không badge pill) */}
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-haffer text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#FFA336]">{post.version}</span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-300">{post.category}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5">
                        <FiCalendar size={12} className="text-zinc-500" />
                        {post.date}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <FiClock size={12} className="text-zinc-500" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Post Title: Nếu có path thì link tới route đó */}
                  <h2 className="font-haffer text-base sm:text-lg font-semibold text-white leading-snug">
                    {post.path ? (
                      <Link
                        to={post.path}
                        className="group/link inline-flex items-center gap-1.5 transition-colors hover:text-[#FFA336]"
                      >
                        <span>{post.title}</span>
                        <FiArrowUpRight
                          size={14}
                          className="shrink-0 text-zinc-500 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-[#FFA336]"
                        />
                      </Link>
                    ) : (
                      <span>{post.title}</span>
                    )}
                  </h2>

                  {/* Summary: Gọn gàng, không mở rộng chi tiết */}
                  <p className="font-haffer mt-2 text-xs sm:text-sm font-normal text-zinc-400 leading-relaxed">
                    {post.summary}
                  </p>

                  {/* Footer nhỏ của item */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-zinc-800/60 pt-2.5 text-xs font-haffer text-zinc-400">
                    <span>
                      Tác giả: <span className="text-zinc-300">{post.author || "Picare Engineering"}</span>
                    </span>

                    {post.path ? (
                      <Link
                        to={post.path}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#FFA336] transition-opacity hover:opacity-80"
                      >
                        <span>Xem chi tiết</span>
                        <FiArrowUpRight size={12} />
                      </Link>
                    ) : (
                      <span className="text-zinc-400">{post.authorRole}</span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* 3. Footer */}
      <PublicLandingFooter />
    </div>
  );
}
