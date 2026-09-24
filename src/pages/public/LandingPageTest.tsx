import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";
import AeroShards from "@/components/reactbit/AeroShard";
import LoginHubFormSection from "@/components/custom_ui/LoginHubFormSection";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import { PATHS } from "@/config/paths";
import picareHubLogo from "@/assets/images/logo.png";
import { useAuth } from "@/hooks/useAuth";
import gsap from "gsap";

interface GsapCtaButtonProps {
  onClick: () => void;
  label?: string;
  delay?: number;
}

function GsapCtaButton({
  onClick,
  label = "Khám phá ngay",
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

export default function LandingPageTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
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
  const [isScrolled, setIsScrolled] = useState(false);

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
  }, [isFromCatalogue, location.pathname]);

  // Tích hợp Lenis Smooth Scroll mượt mà cuộn từ Hero xuống Footer
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

    const handleLenisScroll = (e: { scroll: number }) => {
      setIsScrolled(e.scroll > 40);
    };

    lenis.on("scroll", handleLenisScroll);

    return () => {
      lenis.destroy();
    };
  }, [isLoginPage, isIntro]);

  // Chuyển sang giao diện đăng nhập /login (hoặc /login/client nếu đã đăng nhập)
  const handleOpenLogin = () => {
    if (isAuthenticated) {
      navigate(PATHS.LOGIN_CLIENT);
    } else {
      navigate(PATHS.LOGIN);
    }
  };

  // Chuyển sang giao diện chọn client /login/client
  const handleOpenClientSelect = () => {
    navigate(PATHS.LOGIN_CLIENT);
  };

  // Nếu đã đăng nhập mà truy cập vào route /login (không có clientId), tự động điều hướng sang /login/client
  useEffect(() => {
    if (isLoginPage && !isClientSelectPage && isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const clientId = searchParams.get("clientId");
      const redirectParam = searchParams.get("redirect");
      if (!clientId) {
        if (
          redirectParam &&
          redirectParam.startsWith("/") &&
          !redirectParam.startsWith(PATHS.LOGIN)
        ) {
          navigate(redirectParam, { replace: true });
        } else {
          navigate(PATHS.LOGIN_CLIENT, { replace: true });
        }
      }
    }
  }, [
    isLoginPage,
    isClientSelectPage,
    isAuthenticated,
    location.search,
    navigate,
  ]);

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

  // 1. Content Intro: Nền đen, chữ Picare Client ở giữa
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

      {/* Trung tâm: Text Picare Client thanh lịch */}
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

      {/* Fixed Navbar: Cố định trên viewport khi scroll trang */}
      <AnimatePresence>
        {!isLoginPage && (
          <motion.div
            key="fixed-landing-navbar"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isNavigatingToCatalogue ? 0 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-x-0 top-0 z-40"
          >
            <PublicLandingNavbar
              onOpenLogin={handleOpenLogin}
              onOpenClientSelect={handleOpenClientSelect}
              onCatalogueClick={handleNavigateToCatalogue}
              isDarkBg={isScrolled}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                filter: isNavigatingToCatalogue ? "blur(6px)" : "none",
                x: 0,
              }}
              exit={{ opacity: 0, x: -70, filter: "blur(4px)" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex min-h-screen w-full flex-col"
            >
              {/* 1. SECTION 1: HERO */}
              <section className="relative flex h-screen min-h-screen w-full flex-col justify-between overflow-hidden bg-transparent">
                {/* Main Hero Content: cascade animate tuần tự từng phần tử */}
                <main className="relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pt-32 pb-16 text-center sm:pt-40 sm:pb-20">
                  {/* Main Headline: Picare Client {logo picare hub} Nền tảng ERP */}
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

                  {/* GSAP Animated Primary CTA Button */}
                  <div className="mt-9 flex justify-center sm:mt-10">
                    <GsapCtaButton
                      onClick={handleOpenLogin}
                      label="Khám phá ngay"
                      delay={0.85}
                    />
                  </div>
                </main>
              </section>

              {/* Footer */}
              <PublicLandingFooter
                onOpenLogin={handleOpenLogin}
                onOpenClientSelect={handleOpenClientSelect}
              />
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
