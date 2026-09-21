/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiShoppingCart } from "react-icons/fi";
import { useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
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

function ProductImageCarousel({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = images.length;

  useEffect(() => {
    if (!total) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex > total - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, total]);

  if (total === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="text-base font-medium text-black/45 dark:text-white/45">
          Chưa có hình ảnh sản phẩm
        </p>
        <p className="mt-3 max-w-[24rem] text-sm leading-6 text-black/35 dark:text-white/32">
          Nội dung chi tiết vẫn được hiển thị đầy đủ bên dưới để khách hàng tra
          cứu.
        </p>
      </div>
    );
  }

  const goToImage = (nextIndex: number) => {
    if (nextIndex === activeIndex) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(nextIndex);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  const goToNext = () => {
    setDirection(1);
    setActiveIndex((current) => (current + 1) % total);
  };

  return (
    <div className="flex h-full flex-col gap-4 sm:gap-5">
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[4/4.6] lg:aspect-[4/4.8]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.img
            key={images[activeIndex]}
            custom={direction}
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.06}
            onDragEnd={(_, info) => {
              if (info.offset.x <= -70 || info.velocity.x <= -500) {
                goToNext();
                return;
              }

              if (info.offset.x >= 70 || info.velocity.x >= 500) {
                goToPrevious();
              }
            }}
            initial={{ opacity: 0, x: direction > 0 ? 56 : -56, scale: 0.992 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -56 : 56, scale: 0.992 }}
            transition={{
              x: { type: "spring", stiffness: 280, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.22 },
            }}
            src={images[activeIndex]}
            alt={`${productName} ${activeIndex + 1}`}
            className="h-full w-full cursor-grab object-cover active:cursor-grabbing"
          />
        </AnimatePresence>
      </div>

      {total > 1 ? (
        <div className="w-full touch-pan-x [scrollbar-width:none] overflow-x-auto overflow-y-visible py-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-3 px-1">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => goToImage(index)}
                className={`group relative h-16 w-16 shrink-0 overflow-hidden rounded-[20px] transition duration-200 sm:h-20 sm:w-20 ${
                  index === activeIndex
                    ? "ring-2 ring-[#111111] ring-offset-2 ring-offset-[#f6f1e8] dark:ring-white dark:ring-offset-[#050505]"
                    : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`Xem ảnh ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                />
                <span
                  className={`absolute inset-0 transition ${
                    index === activeIndex
                      ? "bg-transparent"
                      : "bg-black/10 dark:bg-black/22"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductPreviewContent({ product }: { product: ProductQR }) {
  const info = product.jsonContent;
  const productName = normalizeValue(info.productName) || "Sản phẩm";
  const productImages = (product.imageUrl ?? []).filter(Boolean);
  const sku = normalizeValue(info.sku);
  const website = normalizeValue(info.website);
  const manufacturer = normalizeValue(info.manufacturer);
  const marketResponsible = normalizeValue(info.marketResponsible);
  const volume = normalizeValue(info.netVolume);
  const packageSpecification = normalizeValue(info.packageSpecification);
  const shelfLife = normalizeValue(info.shelfLife);
  const batchNumber = normalizeValue(info.batchNumber);
  const manufacturingDate = normalizeValue(info.manufacturingDate);
  const expirationDate = normalizeValue(info.expirationDate);
  const notificationNumber = normalizeValue(info.notificationNumber);
  const origin = normalizeValue(info.origin);
  const storage = normalizeValue(info.storage);
  const extraContent = normalizeValue(info.unmappedContent);
  const highlights = [
    { label: "SKU", value: sku },
    { label: "Dung tích", value: volume },
    { label: "Quy cách", value: packageSpecification },
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
    <div className="font-haffer min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
      <PublicLandingNavbar isDarkBg={true} />

      <main className="mx-auto max-w-[1400px] px-4 pt-24 pb-16 sm:px-6 sm:pt-28 lg:px-10 xl:px-12">
        <section className="py-6 sm:py-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-14 xl:grid-cols-[minmax(420px,0.78fr)_minmax(0,1.22fr)] xl:gap-[4.5rem]">
            <div className="order-1">
              <div className="aspect-[4/4.9] w-full sm:aspect-[4/4.55] lg:aspect-auto lg:min-h-[760px] xl:min-h-[820px]">
                <ProductImageCarousel
                  images={productImages}
                  productName={productName}
                />
              </div>
            </div>

            <div className="order-2 pt-1 lg:pt-4">
              <p className="text-sm font-medium text-[#58654b] dark:text-[#9db08f]">
                Thông tin sản phẩm
              </p>
              <h1 className="mt-3 max-w-[18ch] text-[1.85rem] leading-[1.08] font-semibold text-[#111111] sm:max-w-[20ch] sm:text-[2.2rem] lg:max-w-[19ch] lg:text-[2.85rem] xl:max-w-[22ch] xl:text-[3rem] dark:text-white">
                {productName}
              </h1>

              {website ? (
                <div className="mt-5">
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 bg-[#111111] px-5 text-xs font-medium text-white shadow-sm transition hover:bg-black/80 dark:border-white/20 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    <FiShoppingCart className="text-sm" />
                    Mua hàng chính hãng
                  </a>
                </div>
              ) : null}

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
      </main>

      <PublicLandingFooter />
    </div>
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
      <div className="font-haffer min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
        <PublicLandingNavbar isDarkBg={true} />
        <main className="flex min-h-[60vh] items-center justify-center px-6 pt-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <Spinner size="lg" color="primary" />
            <p className="text-sm text-black/55 dark:text-white/55">
              Đang tải thông tin sản phẩm...
            </p>
          </div>
        </main>
        <PublicLandingFooter />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="font-haffer min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
        <PublicLandingNavbar isDarkBg={true} />
        <main className="flex min-h-[60vh] items-center justify-center px-6 pt-28">
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
        <PublicLandingFooter />
      </div>
    );
  }

  return <ProductPreviewContent product={product} />;
}
