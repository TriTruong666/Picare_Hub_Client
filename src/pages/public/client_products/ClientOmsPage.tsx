import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import CinematicVideoModal from "@/components/custom_ui/CinematicVideoModal";
import picareHubLogo from "@/assets/images/logo.png";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";

// Video demo OMS
const VIDEO_URL =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789040815604_17f37e20-4e17-4d6f-b077-80c2110842f7_test.mp4";

// Hệ số phóng lớn khung video theo độ rộng tiêu đề
const MOCKUP_ZOOM = 1.25;

const BENEFITS_LIST = [
  {
    id: "01",
    number: "01",
    title: "Tập trung là chìa khoá",
    desc: "Nền tảng sẽ tiết kiệm thời gian nếu quản lý nhiều cửa hàng trên cùng một giao diện mà không cần phải chuyển hàng chục cửa sổ trên website sàn. Chỉ với một nút bấm, toàn bộ đơn hàng sẽ được đồng bộ về với hệ thống",
  },
  {
    id: "02",
    number: "02",
    title: "Cá nhân hoá phần mềm",
    desc: "Tính năng tuỳ chỉnh các chức năng và quy trình làm việc để phù hợp chính xác với nhu cầu và quy mô của doanh nghiệp, đảm bảo tối ưu hiệu quả và năng suất lao động",
  },
  {
    id: "03",
    number: "03",
    title: "Tốc độ và bảo mật",
    desc: "Nền tảng sẽ tiết kiệm thời gian nếu quản lý nhiều cửa hàng trên cùng một giao diện mà không cần phải chuyển hàng chục cửa sổ trên website sàn. Chỉ với một nút bấm, toàn bộ đơn hàng sẽ được đồng bộ về với hệ thống",
  },
  {
    id: "04",
    number: "04",
    title: "Tập trung là chìa khoá",
    desc: "Nền tảng sẽ tiết kiệm thời gian nếu quản lý nhiều cửa hàng trên cùng một giao diện mà không cần phải chuyển hàng chục cửa sổ trên website sàn. Chỉ với một nút bấm, toàn bộ đơn hàng sẽ được đồng bộ về với hệ thống",
  },
];

export default function ClientOmsPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleWidth, setTitleWidth] = useState<number | null>(null);

  // Card Refs
  const cardOverlayRef = useRef<HTMLDivElement>(null);
  const cardLogoRef = useRef<HTMLDivElement>(null);
  const cardHelperRef = useRef<HTMLParagraphElement>(null);

  // Cinematic Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setTitleWidth(rect.width);
        }
      }
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    window.addEventListener("resize", updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Card Hover GSAP Animation: Bình thường ẩn, chỉ khi hover mới hiện lớp đen mờ + logo + text helper
  const handleCardMouseEnter = () => {
    if (!cardOverlayRef.current) return;
    gsap.killTweensOf([
      cardOverlayRef.current,
      cardLogoRef.current,
      cardHelperRef.current,
    ]);

    const tl = gsap.timeline();

    tl.to(
      cardOverlayRef.current,
      {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      },
      0,
    );

    if (cardLogoRef.current) {
      tl.fromTo(
        cardLogoRef.current,
        {
          scale: 0.9,
          y: 8,
          opacity: 0,
        },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
        },
        0.05,
      );
    }

    if (cardHelperRef.current) {
      tl.fromTo(
        cardHelperRef.current,
        {
          y: 6,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
        },
        0.1,
      );
    }
  };

  const handleCardMouseLeave = () => {
    if (!cardOverlayRef.current) return;
    gsap.killTweensOf([
      cardOverlayRef.current,
      cardLogoRef.current,
      cardHelperRef.current,
    ]);

    const tl = gsap.timeline();

    if (cardHelperRef.current) {
      tl.to(
        cardHelperRef.current,
        {
          y: 4,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        },
        0,
      );
    }

    if (cardLogoRef.current) {
      tl.to(
        cardLogoRef.current,
        {
          scale: 0.92,
          y: 6,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        },
        0,
      );
    }

    tl.to(
      cardOverlayRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      },
      0.05,
    );
  };

  return (
    <div className="font-haffer relative min-h-screen w-full overflow-x-hidden bg-[#120F17] text-white select-none">
      {/* Reusable Landing Navbar */}
      <PublicLandingNavbar />

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start px-4 pt-40 pb-32 text-center sm:px-6 sm:pt-48 md:pt-56">
        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.h1
            ref={titleRef}
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.96,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="font-haffer inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-center text-[clamp(2.8rem,7.2vw,5.5rem)] leading-[1.08] font-medium tracking-[-0.05em] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] sm:gap-x-5"
          >
            <span className="inline-flex items-center">
              <span className="font-light text-white italic">Picare</span>
              <span className="ml-2.5 font-light text-white sm:ml-3">OMS</span>
            </span>
            <img
              src={picareHubLogo}
              alt="Picare Hub"
              className="pointer-events-none inline-block h-10 w-10 object-contain drop-shadow-[0_4px_28px_rgba(248,109,43,0.5)] select-none sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-18 lg:w-18"
            />
            <span className="inline-flex items-center">
              <span className="ml-1 font-light text-white sm:ml-1">
                E-Commerce<span className="text-[#f7a276]">.</span>
              </span>
            </span>
          </motion.h1>

          {/* Subtitle cách xa title hơn */}
          <p className="font-haffer mt-10 max-w-3xl text-base leading-relaxed font-light text-zinc-200 sm:mt-8 sm:text-lg md:mt-15 md:text-xl">
            Kết nối tới hai sàn TMĐT là{" "}
            <span className="font-medium text-[#FFA336] underline decoration-[#FFA336]/60 underline-offset-4">
              Shopee
            </span>{" "}
            &{" "}
            <span className="font-medium text-[#36ff68] underline decoration-[#36ff68]/60 underline-offset-4">
              Tiktok
            </span>
            , nền tảng tích hợp các hệ thống tự động hoá, quay video đóng hàng,
            in đơn hàng loạt...
          </p>
        </motion.div>

        {/* Video Card ngoài trang: Bình thường thấy video, HOVER vào mới hiện lớp đen mờ + Logo Picare Client + Text helper 'Nhấn để chơi video' */}
        {/* LƯU Ý: HOVER KHÔNG ZOOM VIDEO LÊN */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: titleWidth
              ? `${Math.min(titleWidth * MOCKUP_ZOOM, 1100)}px`
              : "100%",
            maxWidth: "100vw",
          }}
          className="mt-16 flex w-full max-w-5xl items-center justify-center sm:mt-20 md:mt-24"
        >
          <div
            onClick={() => setIsModalOpen(true)}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#0e0b13] shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(248,109,43,0.12)] transition-all duration-500 hover:border-white/25 hover:shadow-[0_28px_90px_rgba(0,0,0,0.95),0_0_70px_rgba(248,109,43,0.28)] sm:rounded-3xl"
          >
            {/* Top ambient highlight line */}
            <div className="pointer-events-none absolute inset-x-12 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#F86D2B]/60 to-transparent" />

            {/* Video preview tự nhiên ban đầu - HOVER KHÔNG ZOOM VIDEO LÊN */}
            <div className="relative aspect-video w-full overflow-hidden bg-black/50">
              <video
                src={VIDEO_URL}
                playsInline
                muted
                preload="metadata"
                className="h-full w-full object-cover select-none"
              />
            </div>

            {/* Lớp layout đen mờ: BAN ĐẦU ẨN (opacity: 0), CHỈ HOVER MỚI THẤY và click mới vào video */}
            <div
              ref={cardOverlayRef}
              className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 px-6 opacity-0 backdrop-blur-[3px]"
            >
              {/* Logo Picare Client */}
              <div
                ref={cardLogoRef}
                className="flex flex-col items-center justify-center opacity-0"
              >
                <img
                  src={logoPicareNewBlack}
                  alt="Picare Client"
                  className="h-12 w-auto object-contain mix-blend-screen drop-shadow-[0_8px_32px_rgba(248,109,43,0.45)] sm:h-16 md:h-20"
                />
              </div>

              {/* Text helper */}
              <p
                ref={cardHelperRef}
                className="font-haffer mt-1 text-[11px] font-normal text-zinc-300 opacity-0 sm:text-[12px]"
              >
                Nhấn để chơi video
              </p>
            </div>
          </div>
        </motion.div>

        {/* Component Transition Video Cinematic đè lên HẾT TẤT CẢ */}
        <CinematicVideoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoSrc={VIDEO_URL}
        />

        {/* Text giải pháp bài toán vận hành dưới mockup */}
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 max-w-5xl text-center sm:mt-24 md:mt-32"
        >
          <p className="font-haffer text-2xl leading-relaxed font-normal tracking-normal text-zinc-100 sm:text-xl md:text-2xl lg:text-[31px] lg:leading-[1.6]">
            Việc quản lý nhiều cửa hàng khác nhau trên mỗi sàn TMĐT thực sự làm{" "}
            <span className="text-[#FFA336]">tốn rất nhiều thời gian</span> bán
            hàng cũng như quản lý{" "}
            <span className="text-[#FFA336]">gặp khó khăn</span>. OMS đã giải
            quyết được phần lớn bài toán khó của nghiệp vụ bán hàng trên sàn
            TMĐT, nền tảng cũng có thể{" "}
            <span className="text-[#FFA336]">tuỳ chỉnh riêng</span> cho mỗi
            doanh nghiệp.
          </p>
        </motion.div>

        {/* Grid 2 cột các lợi ích */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-x-12 gap-y-12 text-left sm:mt-28 sm:gap-y-14 md:mt-36 md:grid-cols-2 md:gap-x-8 md:gap-y-16"
        >
          {BENEFITS_LIST.map((benefit) => (
            <div
              key={benefit.id}
              className="group flex items-start border-t border-white/15 pt-5 transition-colors duration-300 hover:border-white/40 sm:pt-6"
            >
              {/* Số ở góc bên trái */}
              <span className="font-haffer shrink-0 text-[15px] leading-normal font-normal text-neutral-500">
                {benefit.number}
              </span>

              {/* Div chứa Title + Description nằm bên phải số */}
              <div className="ml-12 flex flex-col">
                <h3 className="font-haffer text-[17px] leading-normal font-medium text-white">
                  {benefit.title}
                </h3>
                <p className="font-haffer mt-4.5 text-[15px] leading-relaxed font-normal text-white">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

