import { useMemo } from "react";
import { motion } from "framer-motion";
import { FiRefreshCw, FiImage } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import Masonry, { type MasonryItem } from "@/components/reactbit/Masonry";
import { getS3Assets } from "@/apis/s3.service";
import type { S3Asset } from "@/types/S3";

// Hàm xáo trộn ngẫu nhiên (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Danh sách mock đa dạng tỉ lệ ảnh (ngang, dọc, vuông) dành cho môi trường Dev xem UI
const DEV_MOCK_ITEMS: MasonryItem[] = [
  {
    id: "mock-1",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Picare Collaboration Team",
  },
  {
    id: "mock-video-1",
    img: "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1790064168652_9f235726-a528-4e55-9052-47489360b497_trahangcustomer.mp4",
    type: "video",
    alt: "Picare Customer Return Demo Video",
  },
  {
    id: "mock-2",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Picare Technology & Data",
  },
  {
    id: "mock-3",
    img: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Modern Design Workspace",
  },
  {
    id: "mock-4",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Picare Office Interior",
  },
  {
    id: "mock-5",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Minimalist Workspace",
  },
  {
    id: "mock-6",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Enterprise Architecture",
  },
  {
    id: "mock-7",
    img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Product Design Review",
  },
  {
    id: "mock-8",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Executive Conference",
  },
  {
    id: "mock-9",
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Creative Session",
  },
  {
    id: "mock-10",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Engineering Center",
  },
  {
    id: "mock-video-2",
    img: "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1790064213123_843477d9-2efd-4ca0-9494-0a37910faec2_taoyeucautrahang.mp4",
    type: "video",
    alt: "Picare Order Create Return Demo Video",
  },
  {
    id: "mock-11",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Partnership Signing",
  },
  {
    id: "mock-12",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Picare Leadership",
  },
  {
    id: "mock-13",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Business Growth",
  },
  {
    id: "mock-14",
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Team Strategy",
  },
  {
    id: "mock-15",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Skyscraper Architecture",
  },
  {
    id: "mock-16",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Digital Workflow",
  },
  {
    id: "mock-17",
    img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Creative Agency",
  },
  {
    id: "mock-18",
    img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Code Development",
  },
  {
    id: "mock-19",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "All Hands Meeting",
  },
  {
    id: "mock-20",
    img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=800&auto=format&fit=crop",
    type: "image",
    alt: "Corporate Campus",
  },
];

// Hàm tự động load toàn bộ file trong folder picare_gallery theo cursor
async function fetchAllPimoryAssets(): Promise<S3Asset[]> {
  const all: S3Asset[] = [];
  let cursor: string | undefined = undefined;
  let hasNext = true;

  while (hasNext) {
    const res = await getS3Assets({
      folder: "picare_gallery",
      assetType: "",
      limit: 50,
      cursor,
    });

    if (!res.success) {
      throw new Error(res.message || "Không thể tải thư viện ảnh");
    }

    const pageAssets = res.data?.assets || [];
    all.push(...pageAssets);

    hasNext = Boolean(
      res.data?.pagination?.hasNext && res.data?.pagination?.nextCursor,
    );
    cursor = res.data?.pagination?.nextCursor || undefined;
  }

  return all;
}

export default function PimoryPage() {
  // Tự động load cho đến khi nào đầy đủ toàn bộ data
  const {
    data: allAssets,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["s3-assets-pimory-all"],
    queryFn: fetchAllPimoryAssets,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Chuyển đổi thành Masonry items và xáo trộn ngẫu nhiên toàn bộ danh sách
  const items = useMemo<MasonryItem[]>(() => {
    const validAssets = (allAssets ?? []).filter((asset) =>
      Boolean(asset.presignedUrl || asset.s3Url),
    );

    if (validAssets.length > 0) {
      const mapped: MasonryItem[] = validAssets.map((asset) => {
        const isVideo =
          asset.assetType === "video" ||
          asset.mimeType?.startsWith("video/") ||
          /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(
            asset.s3Url || asset.s3Key || "",
          );

        return {
          id: asset.assetId || asset.s3Key,
          img: asset.presignedUrl || asset.s3Url,
          type: isVideo ? ("video" as const) : ("image" as const),
          alt: asset.originalName || "Pimory Picare Gallery",
          span: 1,
        };
      });

      // Tự random các tấm hình ngẫu nhiên
      return shuffleArray(mapped);
    }

    // Fallback sang DEV_MOCK_ITEMS cũng được xáo trộn ngẫu nhiên
    return shuffleArray(DEV_MOCK_ITEMS);
  }, [allAssets]);

  const shouldShowGrid = !isLoading && items.length > 0;

  return (
    <div className="font-haffer relative flex min-h-screen flex-col overflow-x-hidden bg-[#07060A] text-white selection:bg-[#F86D2B] selection:text-white">
      {/* 1. Header Navigation */}
      <PublicLandingNavbar isDarkBg={false} showNoticeBanner={false} />

      {/* Decorative ambient background lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#F86D2B]/12 via-[#FFA336]/6 to-transparent blur-3xl" />
        <div className="absolute top-[45%] -left-32 h-[450px] w-[450px] rounded-full bg-[#F86D2B]/6 blur-3xl" />
        <div className="absolute -right-24 bottom-24 h-[500px] w-[500px] rounded-full bg-[#FFA336]/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      </div>

      {/* 2. Main Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1920px] flex-1 flex-col px-3 pt-24 pb-16 sm:px-6 md:px-8 lg:px-10">
        {/* Loading State: 1 cái spinner và 1 dòng text ở chính giữa màn hình */}
        {isLoading && (
          <div className="my-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute h-14 w-14 animate-pulse rounded-full bg-[#FFA336]/20 blur-md" />
              <div className="h-10 w-10 animate-spin rounded-full border-[2.5px] border-white/10 border-t-[#FFA336]" />
            </div>
            <p className="font-haffer text-sm font-normal tracking-wide text-zinc-300">
              Đang tải toàn bộ khoảnh khắc Pimory...
            </p>
          </div>
        )}

        {/* Error State khi tải dữ liệu thất bại */}
        {!isLoading && isError && !shouldShowGrid && (
          <div className="my-auto flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#F86D2B]">
              <FiImage size={24} />
            </div>
            <h2 className="mb-2 text-lg font-medium text-white">
              Không thể tải thư viện Pimory
            </h2>
            <p className="mb-6 max-w-md text-sm text-zinc-400">
              Vui lòng kiểm tra lại kết nối mạng hoặc phiên đăng nhập để truy
              cập tài nguyên thư mục picare_gallery.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-medium text-white transition-all hover:border-[#FFA336]/40 hover:bg-white/[0.15]"
            >
              <FiRefreshCw
                size={14}
                className={isFetching ? "animate-spin text-[#FFA336]" : ""}
              />
              <span>Tải lại</span>
            </button>
          </div>
        )}

        {/* Empty State khi không có ảnh */}
        {!isLoading && !isError && !shouldShowGrid && (
          <div className="my-auto flex flex-col items-center justify-center py-28 text-center">
            <h2 className="mb-2 text-lg font-medium text-white">
              Thư mục Pimory chưa có ảnh
            </h2>
            <p className="max-w-md text-sm text-zinc-500">
              Chưa tìm thấy ảnh nào trong thư mục picare_gallery trên S3.
            </p>
          </div>
        )}

        {/* Khi nào load hết thì hiện 1 thể toàn bộ Masonry Grid (đã random) */}
        {shouldShowGrid && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1"
          >
            <Masonry
              items={items}
              preset="mosaic"
              columns="auto"
              columnWidth={160}
              gap={4}
              radius={4}
              stagger={0.035}
              duration={0.9}
              bounce={0.06}
              captions="none"
              hoverEffect="zoom"
              lightbox={true}
              draggable={true}
              animateFrom="top"
              blurToFocus={false}
            />
          </motion.div>
        )}
      </main>

      {/* 3. Footer */}
      <PublicLandingFooter />
    </div>
  );
}
