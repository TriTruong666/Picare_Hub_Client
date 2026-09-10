import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { createPortal } from "react-dom";
import Lenis from "lenis";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import CurvePageTransition, {
  useCurveTransition,
} from "@/components/custom_ui/CurvePageTransition";
import AeroShards from "@/components/reactbit/AeroShard";
import LoginHubFormSection from "@/components/custom_ui/LoginHubFormSection";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";
import picareHubLogo from "@/assets/images/logo.png";
import saleforceIntroImg from "@/assets/images/saleforce_intro.png";
import gsap from "gsap";

interface GsapCtaButtonProps {
  onClick: () => void;
  label?: string;
  delay?: number;
}

function GsapCtaButton({
  onClick,
  label = "Trải nghiệm ngay",
  delay = 0.85,
}: GsapCtaButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    // 1. GSAP Entrance Animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        btn,
        { opacity: 0, y: 24, scale: 0.94, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.85,
          delay,
          ease: "power3.out",
        },
      );

      // 2. Ambient subtle pulsing glow with GSAP
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.18,
          opacity: 0.75,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, btn);

    // 3. GSAP Magnetic Mouse Follow & Tilt
    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        rotateX: -y * 0.08,
        rotateY: x * 0.08,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 600,
      });

      if (arrowRef.current) {
        gsap.to(arrowRef.current, { x: 5, duration: 0.22, ease: "power2.out" });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "elastic.out(1.1, 0.4)",
      });

      if (arrowRef.current) {
        gsap.to(arrowRef.current, { x: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ctx.revert();
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [delay]);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Ambient Outer Glow powered by GSAP */}
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-[#F86D2B]/40 via-[#FFA336]/30 to-[#F86D2B]/40 opacity-40 blur-xl transition-opacity duration-500"
      />

      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        className="group font-haffer relative inline-flex h-12 cursor-pointer items-center gap-2.5 overflow-hidden rounded-full bg-white px-6 text-[13px] font-semibold tracking-normal text-[#120F17] shadow-[0_4px_24px_rgba(248,109,43,0.25)] transition-shadow hover:shadow-[0_8px_32px_rgba(255,163,54,0.45)] active:scale-[0.98]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Shimmer light pass */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />

        <span className="relative z-10">{label}</span>
        <svg
          ref={arrowRef}
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="relative z-10 transition-transform"
        >
          <path
            d="M3 8H13M9 4L13 8L9 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

interface ProductShowcaseItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  image: string;
}

const PRODUCT_SHOWCASE_LIST: ProductShowcaseItem[] = [
  // Trang 1: Picare OMS, Picare WMS, Picare Saleforce (theo yêu cầu)
  {
    id: "picare-oms",
    name: "Picare OMS",
    category: "Order Management System",
    desc: "Nền tảng xử lý và phân phối đơn hàng đa kênh tập trung",
    image: saleforceIntroImg,
  },
  {
    id: "picare-wms",
    name: "Picare WMS",
    category: "Warehouse Management System",
    desc: "Quản trị kho hàng thông minh, tối ưu sơ đồ và luồng xuất nhập",
    image: saleforceIntroImg,
  },
  {
    id: "picare-saleforce",
    name: "Picare Saleforce",
    category: "Sales Field Automation",
    desc: "Tự động hóa lực lượng bán hàng, quản trị tuyến và phễu chuyển đổi",
    image: saleforceIntroImg,
  },
  // Trang 2: Các phân hệ bổ trợ trong hệ sinh thái Picare
  {
    id: "picare-crm",
    name: "Picare CRM",
    category: "Customer Relationship Management",
    desc: "Quản trị mối quan hệ khách hàng và dịch vụ hậu mãi đa kênh",
    image: saleforceIntroImg,
  },
  {
    id: "picare-scm",
    name: "Picare SCM",
    category: "Supply Chain Management",
    desc: "Điều phối chuỗi cung ứng, theo dõi nhà cung cấp và tối ưu tồn kho",
    image: saleforceIntroImg,
  },
  {
    id: "picare-ai",
    name: "Picare AI Automation",
    category: "Intelligent Workflows",
    desc: "Trợ lý ảo thông minh và bộ máy tự động hóa tác vụ vận hành",
    image: saleforceIntroImg,
  },
];

const showcaseContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.06,
    },
  },
};

const showcaseItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 48,
    filter: "blur(10px)",
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

function ShowcaseProductCard({
  item,
  onItemClick,
}: {
  item: ProductShowcaseItem;
  onItemClick: (item: ProductShowcaseItem) => void;
}) {
  const bgRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        scale: 1.05,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        backgroundColor: "#FFA336",
        borderColor: "#FFA336",
        color: "#000000",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = () => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        scale: 1,
        duration: 0.65,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        color: "#ffffff",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  return (
    <motion.div
      variants={showcaseItemVariants}
      onClick={() => onItemClick(item)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex h-full w-[88vw] min-w-[88vw] shrink-0 cursor-pointer flex-col justify-end overflow-hidden border-r border-white/[0.08] bg-transparent sm:w-[50vw] sm:max-w-[50vw] sm:min-w-[50vw] lg:w-[50vw] lg:max-w-[50vw] lg:min-w-[50vw]"
    >
      {/* Shared Warm Light Apricot & Coral Bright Background Layer animated with GSAP */}
      <div
        ref={bgRef}
        className="pointer-events-none absolute inset-0 z-0 bg-[#fff9f5]"
        style={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255, 220, 190, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 245, 238, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 210, 180, 0.15) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Full-width/screen transparent item image layout */}
      <div className="absolute inset-0 z-[1] h-full w-full overflow-hidden">
        <img
          ref={imgRef}
          src={item.image}
          alt={item.name}
          draggable={false}
          className="pointer-events-none h-full w-full object-contain object-center select-none"
        />
      </div>

      {/* Bottom-left overlay: Project Name and Category Info */}
      <div className="pointer-events-none relative z-10 flex w-full items-end justify-between p-8 sm:p-10 lg:p-12">
        <div className="pointer-events-auto flex max-w-[calc(100%-4rem)] flex-col text-left">
          <h3 className="font-haffer text-2xl font-medium tracking-tight text-[#120F17] sm:text-3xl lg:text-[36px]">
            {item.name}
          </h3>
          {item.desc && (
            <p className="font-haffer mt-2 line-clamp-2 max-w-xl text-xs font-light text-[#120F17] sm:text-sm">
              {item.desc}
            </p>
          )}
        </div>
        <button
          ref={btnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onItemClick(item);
          }}
          className="pointer-events-auto flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md active:scale-95"
          aria-label={`Khám phá ${item.name}`}
        >
          <FiArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function HorizontalProductShowcase({
  products,
  isVisible = false,
}: {
  products: ProductShowcaseItem[];
  isVisible?: boolean;
}) {
  const { navigateWithTransition } = useCurveTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Giới hạn kéo ngang (drag limit tính theo pixel)
  const [dragLimit, setDragLimit] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleItemClick = (item: ProductShowcaseItem) => {
    if (isDragging) return;
    navigateWithTransition(PATHS.CLIENT_OMS, {
      text: item.name,
      subtext: item.category,
    });
  };

  // Custom Cursor chuyển động mượt mà với Framer Motion spring physics
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const springConfig = { damping: 28, stiffness: 420, mass: 0.35 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Tính toán khoảng cách tối đa có thể kéo dựa trên chiều rộng thực tế của slider track
  useEffect(() => {
    const calculateBounds = () => {
      if (containerRef.current && trackRef.current) {
        const containerW = containerRef.current.offsetWidth;
        const trackW = trackRef.current.scrollWidth;
        setDragLimit(Math.min(0, containerW - trackW));
      }
    };

    calculateBounds();
    window.addEventListener("resize", calculateBounds);
    return () => window.removeEventListener("resize", calculateBounds);
  }, [products]);

  // Cập nhật vị trí con trỏ chuột theo viewport (clientX, clientY)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsDragging(false);
  };

  // Custom Animated Cursor được render qua Portal ra document.body
  // Đảm bảo không bao giờ bị cắt bởi overflow-hidden hay bị đè bởi z-index của Section 1
  const customCursorPortal =
    typeof document !== "undefined"
      ? createPortal(
          <motion.div
            className="pointer-events-none fixed top-0 left-0 z-[999999] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg backdrop-blur-md"
            style={{
              x: smoothX,
              y: smoothY,
            }}
            initial={false}
            animate={{
              width: isHovered ? 48 : 6,
              height: isHovered ? 48 : 6,
              scale: isHovered ? (isDragging ? 0.88 : 1) : 0.4,
              opacity: isHovered ? 1 : 0,
              borderColor: isDragging
                ? "#FFA336"
                : isHovered
                  ? "rgba(255, 255, 255, 0.32)"
                  : "transparent",
              backgroundColor: isHovered
                ? isDragging
                  ? "rgba(18, 15, 23, 0.95)"
                  : "rgba(18, 15, 23, 0.85)"
                : "rgba(255, 255, 255, 0.9)",
              boxShadow: isDragging
                ? "0 0 24px rgba(248, 109, 43, 0.5), 0 8px 24px rgba(0, 0, 0, 0.6)"
                : isHovered
                  ? "0 8px 24px rgba(0, 0, 0, 0.5)"
                  : "none",
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 28,
              mass: 0.35,
            }}
          >
            <motion.span
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.5,
              }}
              transition={{
                duration: 0.18,
                delay: isHovered ? 0.05 : 0,
              }}
              className="font-haffer text-[11px] font-normal tracking-normal whitespace-nowrap text-white select-none"
            >
              Kéo
            </motion.span>
          </motion.div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative h-screen w-full overflow-hidden bg-transparent select-none ${
        isHovered ? "cursor-none" : ""
      }`}
    >
      {customCursorPortal}

      {/* Slider Track hỗ trợ Drag mượt mà với momentum và elastic bounce (Grid 2 items) */}
      <motion.div
        ref={trackRef}
        drag="x"
        dragConstraints={{ left: dragLimit, right: 0 }}
        dragElastic={0.12}
        dragTransition={{
          power: 0.16,
          timeConstant: 220,
          modifyTarget: (target) => {
            const cardWidth = containerRef.current
              ? containerRef.current.offsetWidth *
                (window.innerWidth >= 640 ? 0.5 : 0.88)
              : window.innerWidth * 0.5;
            // Snap về biên card gần nhất: khi kéo mạnh sẽ hãm lực và "khựng" dính chắc vị trí thẻ
            const snapped = Math.round(target / cardWidth) * cardWidth;
            return Math.max(dragLimit, Math.min(0, snapped));
          },
          bounceStiffness: 300,
          bounceDamping: 32,
        }}
        variants={showcaseContainerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 80)}
        className="flex h-full w-max flex-nowrap items-stretch will-change-transform"
      >
        {products.map((item: ProductShowcaseItem) => (
          <ShowcaseProductCard
            key={item.id}
            item={item}
            onItemClick={handleItemClick}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default function LandingPageTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith(PATHS.LOGIN);
  const isClientSelectPage = location.pathname.startsWith(PATHS.LOGIN_CLIENT);

  const isFromCatalogue = Boolean(
    (location.state as { fromCatalogue?: boolean })?.fromCatalogue ||
    new URLSearchParams(location.search).get("from") === "catalogue",
  );

  // Quản lý trạng thái Intro "Picare Client" ban đầu (chỉ thấy đúng 1 lần khi vào web và chỉ khi ở trang chủ)
  const [isIntro, setIsIntro] = useState(() => {
    if (isLoginPage || isFromCatalogue) return false;
    try {
      const hasSeen = sessionStorage.getItem("picare_landing_intro_seen");
      return !hasSeen;
    } catch {
      return true;
    }
  });
  const [isIntroExiting, setIsIntroExiting] = useState(false);
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const introPathRef = useRef<SVGPathElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);

  // Scroll container refs & Lenis smooth scroll instance
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const [streamDrain, setStreamDrain] = useState(() =>
    isFromCatalogue ? 1 : 0,
  );
  const streamDrainRef = useRef({ value: isFromCatalogue ? 1 : 0 });
  const [isNavigatingToCatalogue, setIsNavigatingToCatalogue] = useState(false);
  const [areProductsVisible, setAreProductsVisible] = useState(false);
  const hasRevealedRef = useRef(false);
  const [isGridSection, setIsGridSection] = useState(false);
  const isGridSectionRef = useRef(false);

  // Hiệu ứng chảy ngược (reverse flow): Khi quay lại từ catalogue, luồng AeroShard từ drain 1.0 chảy ngược lại 0.0
  useEffect(() => {
    if (isFromCatalogue) {
      window.history.replaceState({}, document.title, location.pathname);
      streamDrainRef.current.value = 1.0;
      setStreamDrain(1.0);
      gsap.to(streamDrainRef.current, {
        value: 0.0,
        duration: 1.35,
        ease: "power2.out",
        onUpdate: () => {
          setStreamDrain(streamDrainRef.current.value);
        },
      });
    }
  }, [isFromCatalogue]);

  // Tích hợp Lenis Scroll dạng Stick/Snap giữa Section 1 và Section 2:
  // - Khi cuộn qua một mức độ chiều cao (ngưỡng 18% vh) thì tự động dính/hút chặt tới Section tiếp theo
  // - Khi tới Section Grid (Section 2), luồng AeroShards MỚI BẮT ĐẦU animation biến mất (drain 0.0 -> 1.0)
  // - Animation biến mất diễn ra chậm rãi, mượt mà (2.2s) để lộ hoàn toàn nền #120F17 sạch sẽ
  // - Khi cuộn ngược về Section 1 (Hero), luồng AeroShards xuất hiện trở lại (drain 1.0 -> 0.0)
  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = scrollContentRef.current;
    if (!container || !content) return;

    const lenis = new Lenis({
      wrapper: container,
      content: content,
      duration: 1.0,
      smoothWheel: true,
      autoRaf: true,
    });

    let isSnapping = false;
    let targetSection = 0; // 0 = Section 1 (Hero), 1 = Section 2 (Grid)
    let isDrained = false; // Trạng thái đã kích hoạt animation biến mất của flow aero
    let cooldownTimer: ReturnType<typeof setTimeout> | null = null;

    const snapTo = (sectionIndex: number, duration = 0.95) => {
      const vh = window.innerHeight || 800;
      const targetY = sectionIndex === 0 ? 0 : vh;
      targetSection = sectionIndex;
      isSnapping = true;

      const inGrid = sectionIndex === 1;
      if (inGrid !== isGridSectionRef.current) {
        isGridSectionRef.current = inGrid;
        setIsGridSection(inGrid);
      }

      lenis.scrollTo(targetY, {
        duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: () => {
          if (cooldownTimer) clearTimeout(cooldownTimer);
          cooldownTimer = setTimeout(() => {
            isSnapping = false;
          }, 150);
        },
      });
    };

    // Lắng nghe scroll:
    // 1. Khi tới Section Grid (Section 2) -> MỚI BẮT ĐẦU animation biến mất của flow aero
    // 2. Tự động stick dính vào Section kế tiếp khi vượt qua ngưỡng chiều cao
    const handleLenisScroll = (e: { scroll: number }) => {
      const scrollY = e.scroll;
      const vh = window.innerHeight || 800;

      // Cập nhật trạng thái navbar dark bg khi lướt xuống section grid
      const inGrid = scrollY >= vh * 0.35;
      if (inGrid !== isGridSectionRef.current) {
        isGridSectionRef.current = inGrid;
        setIsGridSection(inGrid);
      }

      // Khi chạm tới Section Grid (>= 75% vh) -> MỚI BẮT ĐẦU animation biến mất của flow aero
      if (scrollY >= vh * 0.75 && !isDrained) {
        isDrained = true;
        gsap.to(streamDrainRef.current, {
          value: 1.0,
          duration: 1.5, // Chậm rãi, thư thái theo đúng yêu cầu
          ease: "power2.out",
          overwrite: "auto",
          onUpdate: () => {
            setStreamDrain(streamDrainRef.current.value);
          },
          onComplete: () => {
            // Khi animation aero đã chảy đi xong -> MỚI BẮT ĐẦU THẤY TỪNG ITEM (fade transition theo thứ tự)
            hasRevealedRef.current = true;
            setAreProductsVisible(true);
          },
        });
      } else if (scrollY < vh * 0.35 && isDrained) {
        // Khi cuộn ngược về Section 1 -> Animation xuất hiện lại của flow aero
        isDrained = false;
        gsap.to(streamDrainRef.current, {
          value: 0.0,
          duration: 1.4,
          ease: "power2.out",
          overwrite: "auto",
          onUpdate: () => {
            setStreamDrain(streamDrainRef.current.value);
          },
        });
      }

      // Stick snap theo độ cao: nếu người dùng kéo/cuộn vượt quá ngưỡng chiều cao (18% vh)
      if (!isSnapping) {
        if (targetSection === 0 && scrollY > vh * 0.18) {
          snapTo(1);
        } else if (targetSection === 1 && scrollY < vh * 0.82) {
          snapTo(0);
        }
      }
    };

    // Bắt sự kiện wheel để stick/snap dính ngay lập tức khi lăn chuột
    const handleWheel = (e: WheelEvent) => {
      if (isSnapping) return;
      const vh = window.innerHeight || 800;
      const currentScroll = lenis.scroll;

      if (e.deltaY > 10 && currentScroll < vh * 0.4) {
        snapTo(1);
      } else if (e.deltaY < -10 && currentScroll > vh * 0.6) {
        snapTo(0);
      }
    };

    // Tự động snap nếu người dùng kéo/cuộn thả dở dang (trackpad hoặc touch)
    let endTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScrollEnd = () => {
      if (endTimer) clearTimeout(endTimer);
      endTimer = setTimeout(() => {
        if (isSnapping) return;
        const vh = window.innerHeight || 800;
        const currentScroll = lenis.scroll;
        if (targetSection === 0) {
          if (currentScroll >= vh * 0.18) {
            snapTo(1);
          } else if (currentScroll > 10) {
            snapTo(0);
          }
        } else if (targetSection === 1) {
          if (currentScroll <= vh * 0.82) {
            snapTo(0);
          } else if (currentScroll < vh - 10) {
            snapTo(1);
          }
        }
      }, 120);
    };

    lenis.on("scroll", handleLenisScroll);
    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("scroll", handleScrollEnd, { passive: true });

    return () => {
      if (cooldownTimer) clearTimeout(cooldownTimer);
      if (endTimer) clearTimeout(endTimer);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScrollEnd);
      lenis.destroy();
    };
  }, [isLoginPage, isIntro]);

  // Chuyển sang giao diện đăng nhập /login
  const handleOpenLogin = () => {
    navigate(PATHS.LOGIN);
  };

  // Chuyển sang giao diện chọn client /login/client
  const handleOpenClientSelect = () => {
    navigate(PATHS.LOGIN_CLIENT);
  };

  // Chuyển sang thư viện catalogue với hiệu ứng AeroShard chảy đi mất
  const handleNavigateToCatalogue = () => {
    setIsNavigatingToCatalogue(true);
    gsap.to(streamDrainRef.current, {
      value: 1.0,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        setStreamDrain(streamDrainRef.current.value);
      },
      onComplete: () => {
        navigate("/catalogue/public/gallery");
      },
    });
  };

  // Quay lại giao diện khách
  const handleBackToLanding = () => {
    navigate(PATHS.HOME);
  };

  // Kích hoạt hiệu ứng Curve Swipe thoát màn hình để vào thẳng Landing Page
  const handleStartTransition = () => {
    if (isIntroExiting) return;
    setIsIntroExiting(true);
    try {
      sessionStorage.setItem("picare_landing_intro_seen", "true");
    } catch {
      // ignore
    }

    const path = introPathRef.current;
    const textEl = introTextRef.current;
    const overlay = introOverlayRef.current;
    if (!path) {
      setIsIntro(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsIntro(false);
        if (overlay) overlay.style.display = "none";
      },
    });

    // 1. Chữ "Picare Client" mờ dần và bay nhẹ lên trên
    if (textEl) {
      tl.to(textEl, {
        opacity: 0,
        y: -18,
        filter: "blur(4px)",
        duration: 0.38,
        ease: "power2.in",
      });
    }

    // 2. Đường cong đen co giãn kéo cong lên trên thoát đi (Curve swipe out) để lộ Landing page
    tl.to(
      path,
      {
        attr: { d: "M 0 0 Q 50 0 100 0 L 100 0 Q 50 -25 0 0 Z" },
        duration: 0.8,
        ease: "power2.in",
      },
      "-=0.1",
    ).to(path, {
      attr: { d: "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z" },
      duration: 0.48,
      ease: "power2.out",
    });
  };

  // 1. Content Intro: Y chang giao diện page transition (Nền đen, chữ Picare Client ở giữa)
  const introContent = (
    <div
      ref={introOverlayRef}
      onClick={handleStartTransition}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden select-none"
    >
      {/* SVG Canvas che phủ toàn màn hình màu đen với đường cong co giãn */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={introPathRef}
          fill="#000000"
          d="M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z"
        />
      </svg>

      {/* Trung tâm: Text Picare Client thanh lịch y chang như page transition */}
      <div
        ref={introTextRef}
        className="pointer-events-none relative z-10 flex flex-col items-center justify-center px-4 text-center"
      >
        <div className="flex items-center gap-2.5">
          <h1 className="font-haffer text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl">
            <span className="font-light italic">Picare</span>{" "}
            <span className="font-normal text-white/90">
              Client<span className="text-[#FFA336]">.</span>
            </span>
          </h1>
        </div>
        <p className="font-haffer mt-2.5 animate-pulse text-[12px] font-light text-zinc-500">
          Bấm vào màn hình để tiếp tục
        </p>
      </div>
    </div>
  );

  // 2. Content Dành cho Khách: Chứa trực tiếp AeroShards WebGPU để PixelSwap đồng bộ hoàn hảo
  const guestContent = (
    <div
      ref={scrollContainerRef}
      className="font-haffer relative flex h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-[#120F17] text-white select-none"
    >
      {/* Background WebGPU AeroShards CỐ ĐỊNH XUYÊN SUỐT TẤT CẢ SECTION VÀ LOGIN VIEW */}
      <div className="pointer-events-auto fixed inset-0 z-0 overflow-hidden">
        <AeroShards
          backgroundColor="#120F17"
          shardColor="#F86D2B"
          accentColor="#FFA336"
          placement={isLoginPage && !isClientSelectPage ? "right" : "full"}
          flow="stream"
          drain={isLoginPage ? 0 : streamDrain}
          material="satin"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
          density={1.5}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1.2}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather
          paused={false}
        />
      </div>

      {/* Foreground Content: Chuyển đổi giữa Hero khách và Login Form */}
      <div ref={scrollContentRef} className="relative z-10 min-h-screen w-full">
        <AnimatePresence mode="wait">
          {!isLoginPage ? (
            <motion.div
              key="guest-hero"
              initial={{ opacity: 0, x: 0 }}
              animate={{
                opacity: isNavigatingToCatalogue ? 0 : 1,
                y: isNavigatingToCatalogue ? -20 : 0,
                filter: isNavigatingToCatalogue ? "blur(6px)" : "blur(0px)",
                x: 0,
              }}
              exit={{ opacity: 0, x: -70, filter: "blur(4px)" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex min-h-screen w-full flex-col"
            >
              {/* 1. Navbar: Reusable PublicLandingNavbar with GSAP-powered dark bg in grid section */}
              <PublicLandingNavbar
                onOpenLogin={handleOpenLogin}
                onOpenClientSelect={handleOpenClientSelect}
                onCatalogueClick={handleNavigateToCatalogue}
                isDarkBg={isGridSection}
              />

              {/* 1. SECTION 1: HERO */}
              <section className="relative flex h-screen min-h-screen w-full flex-col justify-between overflow-hidden bg-transparent">
                {/* Main Hero Content: cascade animate tuần tự từng phần tử */}
                <main className="relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pt-32 pb-16 text-center sm:pt-40 sm:pb-20">
                  {/* 2. Flat editorial kicker */}
                  {/* <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.65, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 inline-flex items-center gap-3 font-haffer sm:mb-7"
            >
              <span aria-hidden="true" className="h-px w-6 bg-white/35 sm:w-9" />
              <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-white/68 uppercase sm:text-xs">
                Hệ sinh thái vận hành · Picare 2.0
              </span>
              <span aria-hidden="true" className="h-px w-6 bg-white/35 sm:w-9" />
            </motion.div> */}

                  {/* 3. Main Headline: Picare Client {logo picare hub} Nền tảng ERP */}
                  <motion.h1
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
                      delay: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="font-haffer flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-center text-[clamp(2.8rem,7.2vw,5rem)] leading-[1.08] font-light tracking-[-0.05em] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] sm:gap-x-5"
                  >
                    <span className="inline-flex items-center">
                      <span className="font-light text-white italic">
                        Picare
                      </span>
                      <span className="ml-2.5 font-normal text-white sm:ml-3">
                        Client
                      </span>
                    </span>
                    <img
                      src={picareHubLogo}
                      alt="Picare Hub"
                      className="pointer-events-none inline-block h-10 w-10 object-contain drop-shadow-[0_4px_28px_rgba(248,109,43,0.5)] select-none sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-18 lg:w-18"
                    />
                    <span className="inline-flex items-center">
                      <span className="font-light text-white">Nền tảng</span>
                      <span className="ml-2.5 font-normal text-white sm:ml-3">
                        ERP<span className="text-[#f7a276]">.</span>
                      </span>
                    </span>
                  </motion.h1>

                  {/* Cũ: Main Headline Picare Client. */}
                  {/* <motion.h1
              initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-haffer text-[clamp(4rem,9vw,5.5rem)] leading-[0.92] font-light tracking-[-0.06em] text-[#fff9f5]"
            >
              <span className="italic font-light">Picare</span>{" "}
              <span className="tracking-[-0.04em] text-white/90">
                Client<span className="text-[#f7a276]">.</span>
              </span>
            </motion.h1> */}

                  {/* 4. Subtitle */}
                  {/* <motion.p
                    initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.75,
                      delay: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="font-haffer mx-auto mt-7 max-w-[48rem] px-4 text-center text-base leading-[1.65] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:text-[18px] md:text-[19px]"
                  >
                    Chúng tôi xây dựng một mô hình tập trung các phần mềm bán
                    hàng, quản lý, AI Automation tạo nên hệ sinh thái cho toàn
                    bộ doanh nghiệp. Phân hệ có thể được tách rời để sử dụng
                    hoặc kết hợp với nhau tuỳ nhu cầu của từng doanh nghiệp.
                  </motion.p> */}

                  {/* 5. GSAP Animated Primary CTA Button */}
                  <div className="mt-9 flex justify-center sm:mt-10">
                    <GsapCtaButton
                      onClick={handleOpenLogin}
                      label="Trải nghiệm ngay"
                      delay={0.85}
                    />
                  </div>

                  {/* Cũ: Subtitle 2 dòng & Button tĩnh (Lưu lại để tham khảo khi cần) */}
                  {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-7 max-w-[38rem] space-y-1.5 text-center font-haffer"
            >
              <p className="text-base font-semibold tracking-[-0.01em] text-white/92 sm:text-lg">
                Nền tảng quản trị và trợ lý thông minh cho doanh nghiệp.
              </p>
              <p className="text-base leading-[1.6] font-normal text-white/58">
                Đồng bộ toàn diện Kinh doanh, E-Commerce, Kho bãi và Chuỗi cung ứng trong một hệ thống duy nhất.
              </p>
            </motion.div> */}
                </main>
              </section>

              {/* 2. SECTION 2: PRODUCTS SHOWCASE */}
              <section
                id="products-section"
                className="relative z-20 h-screen min-h-screen w-full overflow-hidden bg-transparent text-white"
              >
                <HorizontalProductShowcase
                  products={PRODUCT_SHOWCASE_LIST}
                  isVisible={areProductsVisible}
                />
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="login-form-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-screen w-full"
            >
              <LoginHubFormSection
                key="login-form"
                onBack={handleBackToLanding}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="font-haffer relative min-h-screen w-full overflow-hidden bg-[#120F17] select-none">
      {isIntro && !isLoginPage && introContent}
      {guestContent}
      <Outlet />
    </div>
  );
}
