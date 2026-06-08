import { FiArrowLeft, FiGlobe } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { useProductQRDetail } from "@/hooks/data/useProductQRHooks";
import type { ProductQR } from "@/types/QRProduct";

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
    <section className="border-t border-black/10 py-6 sm:py-8">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="text-[11px] font-medium text-black/35 uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-lg font-medium text-[#111111] sm:text-xl">
            {title}
          </h2>
        </div>

        {items.length > 1 ? (
          <ul
            className={`${dense ? "space-y-2" : "space-y-3"} text-sm leading-7 text-black/72 sm:text-[15px]`}
          >
            {items.map((item) => (
              <li key={item} className="border-b border-black/6 pb-3 last:border-b-0">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-[72ch] text-sm leading-7 text-black/72 sm:text-[15px]">
            {normalized}
          </p>
        )}
      </div>
    </section>
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
  ].filter((item) => item.value);

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#111111]">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-black/10 py-4 sm:py-5">
          <Link
            to={PATHS.HOME}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black/55 transition hover:border-black/20 hover:text-black"
            aria-label="Quay về trang chủ"
          >
            <FiArrowLeft />
          </Link>

          <span className="text-[11px] font-medium text-black/35 uppercase">
            Xác thực sản phẩm
          </span>

          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 text-xs font-medium text-black/70 transition hover:border-black/20 hover:text-black"
            >
              <FiGlobe />
              Website
            </a>
          ) : (
            <span className="w-10" />
          )}
        </header>

        <section className="py-6 sm:py-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-14">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-medium text-[#58654b]">
                Chi tiết sản phẩm
              </p>
              <h1 className="mt-3 max-w-[16ch] text-[2rem] leading-[1.02] font-medium text-[#111111] sm:text-[2.8rem] lg:max-w-[12ch] lg:text-[4.2rem]">
                {productName}
              </h1>

              <div className="mt-6 max-w-[60ch] space-y-3 text-sm leading-7 text-black/68 sm:text-[15px]">
                {manufacturer ? <p>{manufacturer}</p> : null}
                {marketResponsible ? <p>{marketResponsible}</p> : null}
                {normalizeValue(info.uses) ? <p>{info.uses}</p> : null}
              </div>

              {highlights.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-black/10 pt-6 sm:grid-cols-4">
                  {highlights.map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] font-medium text-black/35 uppercase">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#111111] sm:text-[15px]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden border border-black/10 bg-[#fbf8f2]">
                <div className="aspect-[4/4.6] w-full">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={productName}
                      className="h-full w-full object-contain p-6 sm:p-10"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                      <p className="text-base font-medium text-black/45">
                        Chưa có hình ảnh sản phẩm
                      </p>
                      <p className="mt-3 max-w-[24rem] text-sm leading-6 text-black/35">
                        Nội dung chi tiết vẫn được hiển thị đầy đủ bên dưới để khách hàng tra cứu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {facts.length > 0 ? (
          <section className="border-t border-black/10 py-6 sm:py-8">
            <div className="grid gap-y-5 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-5">
              {facts.map((item) => (
                <div key={item.label} className="border-b border-black/8 pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[10px] font-medium text-black/35 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/72 sm:text-[15px]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

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
  const { data: product, isLoading, isError, refetch } = useProductQRDetail(productId);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size="lg" color="black" />
          <p className="text-sm text-black/55">Đang tải thông tin sản phẩm...</p>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111]">
        <div className="max-w-md text-center">
          <p className="text-[11px] font-medium text-black/35 uppercase">
            Product Preview
          </p>
          <h1 className="mt-3 text-2xl font-medium">Không tìm thấy sản phẩm</h1>
          <p className="mt-3 text-sm leading-7 text-black/58">
            Link preview này có thể đã hết hiệu lực hoặc mã sản phẩm không còn tồn tại.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex h-11 items-center justify-center border border-black px-5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  return <ProductPreviewContent product={product} />;
}
