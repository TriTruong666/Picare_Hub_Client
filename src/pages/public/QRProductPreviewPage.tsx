import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiGlobe, FiMoon, FiSun } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

import picareLogoDark from "@/assets/images/picare_logo_dark.png";
import picareLogoLight from "@/assets/images/picare_logo_light.png";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { useProductQRDetail } from "@/hooks/data/useProductQRHooks";
import type { ProductQR } from "@/types/QRProduct";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

function normalizeValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function splitContent(value?: string | null) {
  const normalized = normalizeValue(value);
  if (!normalized) return [];

  return normalized
    .split(/\r?\n|•| - |;|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ProductSection({
  eyebrow,
  title,
  content,
  dense = false,
}: {
  eyebrow: string;
  title: string;
  content?: string | null;
  dense?: boolean;
}) {
  const items = splitContent(content);
  const normalized = normalizeValue(content);

  if (!normalized) return null;

  return (
    <section className="border-t border-black/10 py-6 sm:py-8 dark:border-white/10">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="text-[11px] font-medium text-black/35 uppercase dark:text-white/35">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-lg font-medium text-[#111111] sm:text-xl dark:text-white">
            {title}
          </h2>
        </div>

        {items.length > 1 ? (
          <ul
            className={`${dense ? "space-y-2" : "space-y-3"} text-sm leading-7 text-black/72 sm:text-[15px] dark:text-white/68`}
          >
            {items.map((item) => (
              <li
                key={item}
                className="border-b border-black/6 pb-3 last:border-b-0 dark:border-white/6"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-[72ch] text-sm leading-7 text-black/72 sm:text-[15px] dark:text-white/68">
            {normalized}
          </p>
        )}
      </div>
    </section>
  );
}

function ProductFactsSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: Array<{ label: string; value: string }>;
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-black/10 py-6 sm:py-8 dark:border-white/10">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="text-[11px] font-medium text-black/35 uppercase dark:text-white/35">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-lg font-medium text-[#111111] sm:text-xl dark:text-white">
            {title}
          </h2>
        </div>

        <div className="divide-y divide-black/6 dark:divide-white/6">
          {items.map((item) => (
            <div
              key={item.label}
              className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(180px,220px)_minmax(0,1fr)] sm:gap-6"
            >
              <p className="text-[11px] font-medium text-black/35 uppercase dark:text-white/35">
                {item.label}
              </p>
              <p className="text-sm leading-7 text-black/72 sm:text-[15px] dark:text-white/68">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreviewThemeToggle() {
  const [dark, setDark] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
      return;
    }

    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    setDark(true);
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const doc = document as ViewTransitionDocument;
    const isDark = root.classList.contains("dark");
    const nextDark = !isDark;

    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? Math.round(rect.left + rect.width / 2) : event.clientX;
    const y = rect ? Math.round(rect.top + rect.height / 2) : event.clientY;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const applyTheme = () => {
      root.classList.toggle("dark", nextDark);
      localStorage.setItem("theme", nextDark ? "dark" : "light");
      setDark(nextDark);
    };

    if (!doc.startViewTransition) {
      applyTheme();
      return;
    }

    const transition = doc.startViewTransition(() => {
      applyTheme();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-gray-700 shadow-sm backdrop-blur-md transition-all hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
      aria-label="Toggle theme"
      type="button"
    >
      <AnimatePresence>
        {dark ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full bg-indigo-500/30 blur-md"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {dark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <FiMoon className="text-lg text-indigo-400" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <FiSun className="text-lg text-amber-400" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function ProductPreviewContent({ product }: { product: ProductQR }) {
  const info = product.jsonContent;
  const productName = normalizeValue(info.productName) || "Sản phẩm";
  const heroImage = product.imageUrl || null;
  const website = normalizeValue(info.website);
  const manufacturer = normalizeValue(info.manufacturer);
  const marketResponsible = normalizeValue(info.marketResponsible);
  const volume = normalizeValue(info.netVolume);
  const shelfLife = normalizeValue(info.shelfLife);
  const batchNumber = normalizeValue(info.batchNumber);
  const manufacturingDate = normalizeValue(info.manufacturingDate);
  const expirationDate = normalizeValue(info.expirationDate);
  const notificationNumber = normalizeValue(info.notificationNumber);
  const origin = normalizeValue(info.origin);
  const storage = normalizeValue(info.storage);
  const extraContent = normalizeValue(info.unmappedContent);

  const highlights = [
    { label: "Dung tích", value: volume },
    { label: "Hạn dùng", value: shelfLife },
    { label: "Số lô", value: batchNumber },
    { label: "Số công bố", value: notificationNumber },
  ].filter((item) => item.value);

  const facts = [
    { label: "Nhà sản xuất", value: manufacturer },
    { label: "Đơn vị chịu trách nhiệm", value: marketResponsible },
    { label: "Xuất xứ", value: origin },
    { label: "Ngày sản xuất", value: manufacturingDate },
    { label: "Hạn sử dụng", value: expirationDate },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value),
  );

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
      <div className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-10 xl:px-12">
        <header className="relative flex items-center justify-between border-b border-black/10 py-4 sm:py-5 dark:border-white/10">
          <Link
            to={PATHS.HOME}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black/55 transition hover:border-black/20 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:text-white"
            aria-label="Quay về trang chủ"
          >
            <FiArrowLeft />
          </Link>

          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src={picareLogoLight}
              alt="Picare"
              className="h-auto w-[8.5rem] dark:hidden sm:w-[9.5rem]"
            />
            <img
              src={picareLogoDark}
              alt="Picare"
              className="hidden h-auto w-[8.5rem] dark:block sm:w-[9.5rem]"
            />
          </div>

          <div className="flex items-center gap-2">
            <ProductPreviewThemeToggle />
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 text-xs font-medium text-black/70 transition hover:border-black/20 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white"
              >
                <FiGlobe />
                Website
              </a>
            ) : null}
          </div>
        </header>

        <section className="py-6 sm:py-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-14 xl:grid-cols-[minmax(420px,0.78fr)_minmax(0,1.22fr)] xl:gap-[4.5rem]">
            <div className="order-1">
              <div className="overflow-hidden border border-black/10 bg-[#fbf8f2] dark:border-white/10 dark:bg-[#0d0d0d]">
                <div className="aspect-[4/4.8] w-full">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={productName}
                      className="h-full w-full object-contain p-6 sm:p-10"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                      <p className="text-base font-medium text-black/45 dark:text-white/45">
                        Chưa có hình ảnh sản phẩm
                      </p>
                      <p className="mt-3 max-w-[24rem] text-sm leading-6 text-black/35 dark:text-white/32">
                        Nội dung chi tiết vẫn được hiển thị đầy đủ bên dưới để
                        khách hàng tra cứu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-2 pt-1 lg:pt-4">
              <p className="text-sm font-medium text-[#58654b] dark:text-[#9db08f]">
                Thông tin sản phẩm
              </p>
              <h1 className="mt-3 max-w-[18ch] text-[1.85rem] leading-[1.08] font-semibold text-[#111111] sm:max-w-[20ch] sm:text-[2.2rem] lg:max-w-[19ch] lg:text-[2.85rem] xl:max-w-[22ch] xl:text-[3rem] dark:text-white">
                {productName}
              </h1>

              <div className="mt-5 max-w-[68ch] space-y-3 text-sm leading-7 text-black/68 sm:text-[15px] dark:text-white/62">
                {normalizeValue(info.uses) ? (
                  <p className="max-w-[62ch] text-black/62 dark:text-white/56">
                    {info.uses}
                  </p>
                ) : null}
              </div>

              {highlights.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-black/10 py-5 sm:grid-cols-4 dark:border-white/10">
                  {highlights.map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] font-medium text-black/35 uppercase dark:text-white/35">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#111111] sm:text-[15px] dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <ProductFactsSection
          eyebrow="Chi tiết"
          title="Thông tin sản xuất"
          items={facts}
        />

        <ProductSection
          eyebrow="Công dụng"
          title="Sản phẩm hỗ trợ gì?"
          content={info.uses}
        />
        <ProductSection
          eyebrow="Hướng dẫn"
          title="Cách sử dụng"
          content={info.usageInstructions}
        />
        <ProductSection
          eyebrow="Thành phần"
          title="Bảng thành phần"
          content={info.ingredients}
          dense
        />
        <ProductSection
          eyebrow="Bảo quản"
          title="Điều kiện bảo quản"
          content={storage}
        />
        <ProductSection
          eyebrow="Cảnh báo"
          title="Lưu ý khi dùng"
          content={info.warnings}
        />
        <ProductSection
          eyebrow="Bổ sung"
          title="Thông tin thêm"
          content={extraContent}
        />
      </div>
    </main>
  );
}

export default function QRProductPreviewPage() {
  const { productId = "" } = useParams();
  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useProductQRDetail(productId);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-black/55 dark:text-white/55">
            Đang tải thông tin sản phẩm...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="max-w-md text-center">
          <p className="text-[11px] font-medium text-black/35 uppercase dark:text-white/35">
            Product Preview
          </p>
          <h1 className="mt-3 text-2xl font-medium">Không tìm thấy sản phẩm</h1>
          <p className="mt-3 text-sm leading-7 text-black/58 dark:text-white/58">
            Link preview này có thể đã hết hiệu lực hoặc mã sản phẩm không còn
            tồn tại.
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

  return <ProductPreviewContent product={product} />;
}
