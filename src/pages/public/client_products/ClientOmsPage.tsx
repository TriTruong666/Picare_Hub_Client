import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import CinematicVideoModal from "@/components/custom_ui/CinematicVideoModal";
import picareHubLogo from "@/assets/images/logo.png";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast } from "@/hooks/useToast";
import {
  OMS_MOCKUP_SLIDES,
  OMS_FEATURE_HOTSPOTS,
  type FeatureHotspotItem,
} from "@/constants/omsFeatureHotspots";

const PICARE_WMS_IMG =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789379206979_85f318ed-1e59-4137-a52b-df52fb49c52a_picarewmsnonbg.png";

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

const WMS_BENEFITS = [
  {
    id: "01",
    number: "01",
    title: "Đồng bộ tồn kho hai chiều Real-time",
    desc: "Tự động cập nhật và trừ trực tiếp trên hệ thống vật lý ngay khi phát sinh đơn hàng hoặc xuất nhập kho.",
  },
  {
    id: "02",
    number: "02",
    title: "Tác động sâu vào dữ liệu kho thực tế",
    desc: "Can thiệp trực tiếp vào luồng luân chuyển, định vị từng vị trí kệ hàng và xử lý luồng hàng hoàn.",
  },
  {
    id: "03",
    number: "03",
    title: "Tối ưu lộ trình nhặt hàng Pick & Pack",
    desc: "Gợi ý lộ trình di chuyển ngắn nhất, quét Barcode/QR giúp hạn chế sai sót nhầm SKU lên đến 99.9%.",
  },
  {
    id: "04",
    number: "04",
    title: "Cảnh báo ngưỡng an toàn & Date thông minh",
    desc: "Cảnh báo ngưỡng tồn tối thiểu, quản lý chặt chẽ date/lô FEFO & FIFO chống tồn đọng hàng cận hạn.",
  },
];

interface GsapWmsCtaButtonProps {
  onClick?: () => void;
  label?: string;
}

function GsapWmsCtaButton({
  onClick,
  label = "Xem chi tiết hệ thống WMS",
}: GsapWmsCtaButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const slideFillRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    const slideFill = slideFillRef.current;
    const arrow = arrowRef.current;
    const glow = glowRef.current;
    if (!btn || !slideFill) return;

    // Thiết lập trạng thái GSAP ban đầu
    gsap.set(slideFill, { xPercent: -101 });
    if (arrow) gsap.set(arrow, { x: 0 });
    if (glow) gsap.set(glow, { opacity: 0, scale: 0.92 });

    // GSAP Magnetic Follow & 3D Tilt khi di chuột trên nút
    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      gsap.to(btn, {
        x: x * 0.18,
        y: y * 0.18,
        rotateX: -y * 0.05,
        rotateY: x * 0.05,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 600,
      });

      if (glow) {
        gsap.to(glow, {
          x: x * 0.14,
          y: y * 0.14,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseEnter = () => {
      gsap.killTweensOf([slideFill, arrow, glow]);

      // GSAP chuyển màu: hiệu ứng slide lướt từ trái sang phải mượt mà
      gsap.to(slideFill, {
        xPercent: 0,
        duration: 0.48,
        ease: "power2.out",
      });

      if (arrow) {
        gsap.to(arrow, {
          x: 4.5,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (glow) {
        gsap.to(glow, {
          opacity: 0.85,
          scale: 1.12,
          duration: 0.45,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.killTweensOf([btn, slideFill, arrow, glow]);

      // Trượt mượt ra phía bên phải và reset vị trí
      gsap.to(slideFill, {
        xPercent: 101,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(slideFill, { xPercent: -101 });
        },
      });

      if (arrow) {
        gsap.to(arrow, {
          x: 0,
          duration: 0.35,
          ease: "power2.out",
        });
      }

      if (glow) {
        gsap.to(glow, {
          opacity: 0,
          scale: 0.92,
          duration: 0.4,
          ease: "power2.out",
        });
      }

      // Elastic snap-back mượt mà về vị trí ban đầu
      gsap.to(btn, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "elastic.out(1.1, 0.4)",
      });
    };

    const handleMouseDown = () => {
      gsap.to(btn, { scale: 0.96, duration: 0.12, ease: "power2.out" });
    };

    const handleMouseUp = () => {
      gsap.to(btn, { scale: 1, duration: 0.22, ease: "power2.out" });
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseenter", handleMouseEnter);
    btn.addEventListener("mouseleave", handleMouseLeave);
    btn.addEventListener("mousedown", handleMouseDown);
    btn.addEventListener("mouseup", handleMouseUp);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseenter", handleMouseEnter);
      btn.removeEventListener("mouseleave", handleMouseLeave);
      btn.removeEventListener("mousedown", handleMouseDown);
      btn.removeEventListener("mouseup", handleMouseUp);
      gsap.killTweensOf([btn, slideFill, arrow, glow]);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
    >
      {/* GSAP Ambient Glow */}
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-r from-[#F86D2B]/50 via-[#FFA336]/40 to-[#F86D2B]/50 opacity-0 blur-xl"
      />

      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        className="group relative inline-flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-white/20 bg-white/[0.08] px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-black/40 backdrop-blur-md select-none sm:text-[15px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* GSAP Slide Fill Layer từ trái sang phải */}
        <span
          ref={slideFillRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#F86D2B] via-[#f77c3a] to-[#FFA336]"
        />

        <span className="relative z-10">{label}</span>
        <span ref={arrowRef} className="relative z-10 inline-flex items-center">
          <FiArrowRight className="text-base text-[#FFA336] transition-colors duration-300 group-hover:text-white" />
        </span>
      </button>
    </div>
  );
}

// Component hiển thị Card UI chi tiết khi hover vào Hotspot
function HotspotCard({
  hotspot,
  placementClasses,
}: {
  hotspot: FeatureHotspotItem;
  placementClasses: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Khi component mount (hover vào dot): luôn luôn bắt đầu phát video từ đầu (0s)
  useEffect(() => {
    if (hotspot.mediaType === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [hotspot.mediaType]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.94,
        y: placementClasses.includes("bottom-full") ? -6 : 6,
      }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.94,
        y: placementClasses.includes("bottom-full") ? -4 : 4,
      }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute ${placementClasses} z-50 flex w-[340px] overflow-hidden rounded-md border border-neutral-200/90 bg-white p-1 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] sm:w-[480px] sm:rounded-lg sm:p-1 md:w-[580px] lg:w-[640px] ${
        placementClasses.includes("bottom-full")
          ? "before:absolute before:inset-x-0 before:-bottom-4 before:h-5 before:content-['']"
          : "before:absolute before:inset-x-0 before:-top-4 before:h-5 before:content-['']"
      }`}
    >
      {/* Cột trái: Media to rõ ràng (Video tự play từ đầu, hoặc Ảnh) */}
      <div className="relative aspect-video w-[170px] shrink-0 overflow-hidden rounded-[4px] bg-neutral-900 sm:w-[250px] sm:rounded-md md:w-[310px] lg:w-[360px]">
        {hotspot.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={hotspot.mediaUrl}
            autoPlay
            playsInline
            muted
            loop
            preload="auto"
            className="h-full w-full object-cover select-none"
          />
        ) : (
          <img
            src={hotspot.mediaUrl}
            alt={hotspot.title}
            className="h-full w-full object-cover select-none"
          />
        )}
      </div>

      {/* Cột phải: Content gồm Title + Description (start trục Y, chữ to hơn 1px) */}
      <div className="flex flex-1 flex-col justify-start px-2.5 py-1 text-left sm:px-3.5 sm:py-1.5">
        <h4 className="font-haffer text-[13px] font-semibold tracking-tight text-neutral-900 sm:text-[14px] md:text-[15px]">
          {hotspot.title}
        </h4>
        <p className="font-haffer mt-1 line-clamp-4 text-[11.5px] leading-relaxed font-normal text-neutral-500 sm:text-[12.5px] md:text-[13px]">
          {hotspot.description}
        </p>
      </div>
    </motion.div>
  );
}

// Component Điểm Hotspot trên màn hình (Vòng tròn to hơn một tí, không nháy, có hiệu ứng xuất hiện/biến mất)
function HotspotDot({
  hotspot,
  delay = 0,
  isDragActive = false,
}: {
  hotspot: FeatureHotspotItem;
  delay?: number;
  isDragActive?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (isDragActive) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragActive) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered((prev) => !prev);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Delay 100ms giúp chuột di chuyển mượt mà giữa dot và card không bị giật/tắt
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Tự động căn chỉnh vị trí popover nếu không truyền placement
  const placement =
    hotspot.placement ||
    `${hotspot.y > 50 ? "top" : "bottom"}-${hotspot.x > 50 ? "left" : "right"}`;

  const placementClasses = {
    "bottom-left": "top-full right-0 mt-3 sm:right-[-12px]",
    "bottom-right": "top-full left-0 mt-3 sm:left-[-12px]",
    "top-left": "bottom-full right-0 mb-3 sm:right-[-12px]",
    "top-right": "bottom-full left-0 mb-3 sm:left-[-12px]",
  }[placement];

  return (
    <motion.div
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 450,
        damping: 26,
        delay,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Vòng tròn Hotspot Beacon phong cách tối giản (Apple Minimalist) */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={hotspot.title}
        className="group relative flex cursor-pointer items-center justify-center p-2 focus:outline-none select-none"
      >
        {/* Vòng sóng breathing mở rộng êm dịu, thanh lịch */}
        <motion.span
          className="pointer-events-none absolute rounded-full border border-white/65 bg-white/10"
          animate={{
            scale: [1, 2],
            opacity: [0.65, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ inset: 3 }}
        />

        {/* Nút kính đen viền trắng tương phản cao, nổi bật trên mọi nền mockup */}
        <span
          className={`relative flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 sm:h-7 sm:w-7 ${
            isHovered
              ? "border-white bg-black shadow-[0_0_16px_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.6)] scale-115"
              : "border-white/70 bg-black/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-hover:border-white group-hover:bg-black/85 group-hover:scale-115"
          }`}
        >
          {/* Biểu tượng '+' mảnh tinh tế, tự xoay thành '×' khi mở */}
          <svg
            className={`h-2.5 w-2.5 stroke-white transition-transform duration-300 ease-out sm:h-3 sm:w-3 ${
              isHovered ? "rotate-45" : "rotate-0"
            }`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <line x1="6" y1="2.5" x2="6" y2="9.5" />
            <line x1="2.5" y1="6" x2="9.5" y2="6" />
          </svg>
        </span>
      </button>

      {/* Card UI hiển thị khi hover */}
      <AnimatePresence>
        {isHovered && !isDragActive && (
          <HotspotCard hotspot={hotspot} placementClasses={placementClasses} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Component trình chiếu nhiều màn hình Mockup bên trong Studio Display kèm cử chỉ kéo thả slide
function StudioDisplayCarousel() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const activeSlide = OMS_MOCKUP_SLIDES[currentSlideIndex];

  const paginate = (newDirection: number) => {
    const nextIndex = currentSlideIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < OMS_MOCKUP_SLIDES.length) {
      setDirection(newDirection);
      setCurrentSlideIndex(nextIndex);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: {
      offset: { x: number; y: number };
      velocity: { x: number; y: number };
    },
  ) => {
    setTimeout(() => setIsDragging(false), 80);

    const swipeConfidenceThreshold = 10000;
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;

    if (swipePower < -swipeConfidenceThreshold || info.offset.x < -60) {
      if (currentSlideIndex < OMS_MOCKUP_SLIDES.length - 1) {
        paginate(1);
      }
    } else if (swipePower > swipeConfidenceThreshold || info.offset.x > 60) {
      if (currentSlideIndex > 0) {
        paginate(-1);
      }
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="relative mx-auto mt-12 flex w-full max-w-4xl flex-col items-center sm:mt-16 lg:max-w-[980px]">
      {/* Thanh tabs chuyển nhanh giữa các màn hình mockup */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {OMS_MOCKUP_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                setDirection(idx > currentSlideIndex ? 1 : -1);
                setCurrentSlideIndex(idx);
              }}
              className={`font-haffer relative flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 sm:px-4 sm:py-2 sm:text-[13px] ${
                isActive
                  ? "text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSlideIndicator"
                  className="absolute inset-0 rounded-full border border-black/10 bg-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 flex h-1.5 w-1.5 rounded-full transition-colors ${
                  isActive ? "bg-[#F86D2B]" : "bg-neutral-400"
                }`}
              />
              <span className="relative z-10">{slide.name}</span>
            </button>
          );
        })}
      </div>

      {/* Thân màn hình Studio Display (Khung nhôm viền đen) */}
      <div className="relative z-10 w-full rounded-[22px] border-[3px] border-[#d4d7dd] bg-[#0c0c0e] p-2.5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.85)] sm:p-3">
        {/* Camera Studio Display ở viền trên */}
        <div className="absolute top-1 left-1/2 flex -translate-x-1/2 items-center justify-center sm:top-1.5">
          <div className="flex h-2 w-2 items-center justify-center rounded-full bg-[#16161a]">
            <div className="h-1 w-1 rounded-full bg-[#1b344d] ring-1 ring-white/20" />
          </div>
        </div>

        {/* Mặt kính hiển thị màn hình khớp tỷ lệ 3024/1654 của ảnh mock */}
        <div className="relative aspect-[3024/1654] w-full overflow-hidden rounded-[12px] bg-black select-none">
          {/* Vùng slide kéo thả */}
          <div className="relative h-full w-full">
            <AnimatePresence
              custom={direction}
              initial={false}
              mode="popLayout"
            >
              <motion.div
                key={activeSlide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 320, damping: 32 },
                  opacity: { duration: 0.28 },
                  scale: { duration: 0.28 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.16}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 h-full w-full cursor-grab will-change-transform active:cursor-grabbing"
              >
                {/* Ảnh mockup OMS */}
                <img
                  src={activeSlide.image}
                  alt={activeSlide.name}
                  className="pointer-events-none h-full w-full object-cover select-none"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Lớp hiển thị các Hotspot Dot độc lập cho từng màn hình */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`hotspots-layer-${activeSlide.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-none absolute inset-0 z-20"
              >
                {activeSlide.hotspots.map((hotspot, idx) => (
                  <div key={hotspot.id} className="pointer-events-auto">
                    <HotspotDot
                      hotspot={hotspot}
                      delay={0.22 + idx * 0.08}
                      isDragActive={isDragging}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nút điều hướng Previous */}
          {currentSlideIndex > 0 && (
            <button
              type="button"
              onClick={() => paginate(-1)}
              className="absolute top-1/2 left-3 z-30 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 sm:h-10 sm:w-10"
              title="Màn hình trước"
            >
              <FiChevronLeft size={20} />
            </button>
          )}

          {/* Nút điều hướng Next */}
          {currentSlideIndex < OMS_MOCKUP_SLIDES.length - 1 && (
            <button
              type="button"
              onClick={() => paginate(1)}
              className="absolute top-1/2 right-3 z-30 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 sm:h-10 sm:w-10"
              title="Màn hình tiếp theo"
            >
              <FiChevronRight size={20} />
            </button>
          )}

          {/* Hiệu ứng bóng gương kính màn hình (Glass sheen) */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.07]" />
        </div>
      </div>

      {/* Thanh giá đỡ chuẩn Apple Mac Studio Display */}
      <div className="relative z-0 flex flex-col items-center">
        {/* Trục đứng kim loại (Neck) */}
        <div className="relative -mt-1 h-14 w-24 bg-gradient-to-b from-[#a8acb5] via-[#cbd0d9] to-[#8d929d] shadow-[inset_1px_0_2px_rgba(255,255,255,0.7),inset_-1px_0_2px_rgba(0,0,0,0.35)] sm:h-18 sm:w-32 md:h-20 md:w-36" />

        {/* Chân đế nhôm nguyên khối (Base) */}
        <div className="h-3 w-48 rounded-t-[2px] rounded-b-md border-t border-white/90 bg-gradient-to-b from-[#e3e6ed] via-[#d5d9e2] to-[#a8adb8] shadow-[0_14px_28px_rgba(0,0,0,0.15)] sm:h-3.5 sm:w-64 md:w-72" />

        {/* Bóng đổ chân đế lên mặt sàn trắng */}
        <div className="-mt-1 h-2.5 w-56 rounded-full bg-black/15 blur-sm sm:w-72 md:w-80" />
      </div>
    </div>
  );
}

export default function ClientOmsPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleWidth, setTitleWidth] = useState<number | null>(null);

  // Card Refs
  const cardOverlayRef = useRef<HTMLDivElement>(null);
  const cardLogoRef = useRef<HTMLDivElement>(null);
  const cardHelperRef = useRef<HTMLParagraphElement>(null);

  // Cinematic Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWmsCtaClick = () => {
    toast.info(
      "Picare WMS",
      "Tính năng chi tiết Picare WMS đang được chuẩn bị. Vui lòng liên hệ đội ngũ Picare để nhận demo & tư vấn giải pháp kho!",
    );
  };

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

        {/* Section Tính Năng (Nền trắng thật full-width, Mô hình Mac Studio Display lớn trực diện) */}
        <section className="relative left-1/2 mt-28 w-screen -translate-x-1/2 bg-white py-24 text-neutral-900 sm:mt-36 sm:py-32 md:mt-44 md:py-36">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-10">
            {/* Tiêu đề chữ to: Tính Năng */}
            <h2 className="font-haffer text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl md:text-5xl lg:text-[54px] lg:leading-[1.15]">
              Tính Năng
            </h2>

            {/* Subtitle thu gọn max-w và cỡ chữ nhỏ lại */}
            <p className="font-haffer mx-auto mt-4 max-w-xl text-xs leading-relaxed font-normal text-neutral-500 sm:text-[13.5px] md:text-base">
              Phần quan trọng nhất của OMS, câu hỏi sẽ là:{" "}
              <span className="font-medium text-neutral-800">
                &ldquo;Nó làm được gì và có gì khác biệt hơn so với các phần mềm
                tương tự khác?&rdquo;
              </span>
              . Hãy cùng tìm hiểu
            </p>

            {/* Mô hình Apple Mac Studio Display nhiều màn hình (kéo slide hoặc click tab) */}
            <StudioDisplayCarousel />
          </div>
        </section>

        {/* Section giới thiệu thêm sản phẩm Picare WMS (Không bg trắng, giữ nguyên layout & padding thoáng rộng như cũ) */}
        <section className="relative left-1/2 mt-28 w-screen -translate-x-1/2 py-20 sm:mt-36 sm:py-24 md:mt-44 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Bên trái: Tiêu đề, Subtitle, Features dạng 1 cột (grid col 1), Nút CTA */}
              <div className="flex flex-col items-start text-left lg:col-span-5">
                {/* Tiêu đề cỡ vừa */}
                <h2 className="font-haffer text-2xl leading-snug font-semibold tracking-tight text-white sm:text-3xl lg:text-[34px]">
                  Không thể thiếu Picare WMS.
                </h2>

                {/* Subtitle */}
                <p className="font-haffer mt-4 text-sm leading-relaxed font-normal text-neutral-400 sm:text-[15px]">
                  Chúng tôi nhận thấy nhu cầu quản lý tồn kho của khách hàng sau
                  khi sử dụng OMS là rất cao, hệ thống hiện tại chỉ xem cơ bản
                  về mặt tồn kho mà không có tác động vào dữ liệu tồn kho thực
                  tế của doanh nghiệp.
                </p>

                {/* Features: 1 cột (grid col 1) */}
                <div className="mt-8 flex w-full flex-col space-y-4">
                  {WMS_BENEFITS.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-start border-t border-white/15 pt-3.5 transition-colors duration-300 hover:border-white/40"
                    >
                      {/* Số bên trái */}
                      <span className="font-haffer shrink-0 text-xs font-normal text-neutral-500">
                        {item.number}
                      </span>

                      {/* Title + Desc bên phải */}
                      <div className="ml-4 flex flex-col">
                        <h3 className="font-haffer text-[14.5px] leading-snug font-medium text-white">
                          {item.title}
                        </h3>
                        <p className="font-haffer mt-1 text-[13px] leading-relaxed font-normal text-neutral-400">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nút CTA: animation GSAP hiệu ứng chuyển màu slide từ trái sang phải mượt mà & magnetic physics */}
                <div className="mt-8 flex items-center">
                  <GsapWmsCtaButton onClick={handleWmsCtaClick} />
                </div>
              </div>

              {/* Bên phải: Hình ảnh WMS to, chiếm 7 cột */}
              <div className="relative flex w-full items-center justify-center lg:col-span-7">
                {/* Ambient backlight glow */}
                <div className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-tr from-[#F86D2B]/25 via-[#FFA336]/20 to-amber-300/15 blur-[70px]" />

                {/* Hình không background to rõ ràng */}
                <img
                  src={PICARE_WMS_IMG}
                  alt="Picare WMS"
                  className="relative z-10 h-auto w-full scale-[1.4] object-contain transition-transform duration-700 ease-out select-none hover:scale-[1.43]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
