import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronDown,
  FiArrowRight,
  FiLayout,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import PixelSwap from "@/components/custom_ui/PixelSwap";
import MoltenMetal from "@/components/custom_ui/MoltenMetal";
import AeroShards from "@/components/reactbit/AeroShard";
import LoginHubFormSection from "@/components/custom_ui/LoginHubFormSection";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/data/useAuthHooks";
import { canAccessDashboard } from "@/config/dashboardAccess";
import { ROLE_LABELS } from "@/types/User";
import { STATIC_HUB_CLIENTS } from "@/constants/staticHubClients";
import type { HubClient } from "@/types/HubClient";
import { PATHS } from "@/config/paths";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import picareHubLogo from "@/assets/images/logo.png";
import gsap from "gsap";

interface GsapCtaButtonProps {
  onClick: () => void;
  label?: string;
  delay?: number;
}

function GsapCtaButton({ onClick, label = "Trải nghiệm ngay", delay = 0.85 }: GsapCtaButtonProps) {
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
        }
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
        className="group relative inline-flex h-12 cursor-pointer items-center gap-2.5 overflow-hidden rounded-full bg-white px-6 font-haffer text-[13px] font-semibold tracking-normal text-[#120F17] shadow-[0_4px_24px_rgba(248,109,43,0.25)] transition-shadow hover:shadow-[0_8px_32px_rgba(255,163,54,0.45)] active:scale-[0.98]"
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
  const [searchParams] = useSearchParams();
  const initialIsLogin = window.location.pathname === PATHS.LOGIN_HUB;

  // Quản lý trạng thái swap:
  // isSwapActive: false (Intro "Picare xin chào"), true (Trang cho khách)
  const [isSwapActive, setIsSwapActive] = useState(initialIsLogin);
  const [isSwapDone, setIsSwapDone] = useState(initialIsLogin);

  // Chỉ hiển thị Navbar và Hero Typography sau khi PixelSwap hoàn tất
  const [isHeroReady, setIsHeroReady] = useState(initialIsLogin);

  // Quản lý chuyển cảnh sang Form đăng nhập (giữ nguyên AeroShards, chỉ đổi placement="right")
  const [isLoginView, setIsLoginView] = useState(initialIsLogin);

  // Lắng nghe sự kiện browser Back/Forward (popstate) để đồng bộ URL
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === PATHS.LOGIN_HUB) {
        setIsLoginView(true);
      } else {
        setIsLoginView(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Chuyển sang giao diện đăng nhập: đổi URL thành /login/hub và trượt form vào
  const handleOpenLogin = () => {
    setIsLoginView(true);
    window.history.pushState({ page: "login" }, "", PATHS.LOGIN_HUB);
  };

  // Quay lại giao diện khách: đổi URL thành /test và trượt form ra
  const handleBackToLanding = () => {
    setIsLoginView(false);
    window.history.pushState({}, "", PATHS.TEST);
  };

  // Mega-menu "Sản phẩm" state & data
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [currentMenuPage, setCurrentMenuPage] = useState(0);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // User Profile & Menu state
  const { isAuthenticated, user } = useAuth();
  const { mutate: logout } = useLogout();
  const canUseDashboard = canAccessDashboard(user?.role);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(target)
      ) {
        setIsProductMenuOpen(false);
      }
      if (
        userMenuContainerRef.current &&
        !userMenuContainerRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    if (isProductMenuOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProductMenuOpen, isUserMenuOpen]);

  const { data: hubClients, isLoading: isClientsLoading } = useHubClients({
    limit: 100,
    status: "active",
  });

  const seenClientIds = new Set<string>();
  const mergedClients = [...(hubClients || []), ...STATIC_HUB_CLIENTS].filter(
    (client) => {
      if (seenClientIds.has(client.clientId)) {
        return false;
      }
      seenClientIds.add(client.clientId);
      return true;
    },
  );

  const totalMenuPages = Math.max(1, Math.ceil(mergedClients.length / 3));
  const normalizedMenuPage = currentMenuPage % totalMenuPages;
  const displayedMenuItems = mergedClients.slice(
    normalizedMenuPage * 3,
    normalizedMenuPage * 3 + 3,
  );

  const handleNextMenuPage = () => {
    setCurrentMenuPage((prev) => (prev + 1) % totalMenuPages);
  };

  // 1. Content Intro: Fullscreen với MoltenMetal WebGL + "Picare xin chào"
  const introContent = (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer">
      <div className="absolute inset-0 z-0">
        <MoltenMetal
          color1="#FFFFFF"
          color2="#F1F5F9"
          color3="#E2E8F0"
          speed={0.35}
          scale={4}
          detail={3}
          glow={1.6}
          coreSize={0.1}
          swirl={1}
          fold={-0.2}
          blackPoint={0.05}
          brightness={1.3}
          colorMode="molten"
          grain
          grainIntensity={0.05}
          mouseInteraction={false}
          mouseStrength={0}
          opacity={1}
        />
      </div>

      <div className="relative z-10 text-center pointer-events-none px-6 flex flex-col items-center gap-3 font-haffer">
        <h1 className="text-4xl sm:text-4xl font-light text-white drop-shadow-md">
          <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500">
            Picare
          </span>{" "}
          xin chào
        </h1>
        <p className="text-xs sm:text-[12px] text-zinc-400/90 font-light tracking-wide animate-pulse">
          Bấm vào màn hình để tiếp tục
        </p>
      </div>
    </div>
  );

  // 2. Content Dành cho Khách: Chứa trực tiếp AeroShards WebGPU để PixelSwap đồng bộ hoàn hảo
  const guestContent = (
    <div className="relative min-h-screen w-full flex flex-col bg-[#120F17] text-white overflow-x-hidden select-none font-haffer">
      {/* Background WebGPU AeroShards nằm TRỰC TIẾP tại đây để PixelSwap đồng bộ hoàn hảo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <AeroShards
          backgroundColor="#120F17"
          shardColor="#F86D2B"
          accentColor="#FFA336"
          placement={isLoginView ? "right" : "full"}
          flow="stream"
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
      <div className="relative z-10 min-h-screen w-full">
        <AnimatePresence mode="wait">
          {!isLoginView ? (
            isHeroReady && (
              <motion.div
                key="guest-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -40, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative min-h-screen w-full flex flex-col"
              >
                {/* 1. Navbar không bg: các phần tử nổi trực tiếp trên nền để xem UI */}
                <motion.header
                  initial={{ opacity: 0, y: -22, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-3 top-3 z-40 sm:inset-x-6 sm:top-4.5"
                >
            <div
              ref={menuContainerRef}
              className="relative flex h-15 w-full items-center justify-between px-6 sm:h-16 sm:px-8 lg:px-10"
            >
              <a href="#" aria-label="Picare Client" className="flex items-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <img
                  src={logoPicareNewBlack}
                  alt="Picare Client"
                  className="h-10 w-auto object-contain mix-blend-screen sm:h-14 -my-4 sm:-my-6"
                />
              </a>

              {/* Navigation Items: No background + Left-to-right smooth width expanding underline animation */}
              <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 font-haffer text-[13px] font-normal tracking-normal lg:flex">
                {/* 1. Sản phẩm (Active & Dropdown trigger) */}
                <button
                  type="button"
                  onClick={() => setIsProductMenuOpen((prev) => !prev)}
                  className={`nav-link-underline group relative flex cursor-pointer items-center gap-1.5 py-1.5 px-0.5 font-normal transition-colors duration-200 ${
                    isProductMenuOpen ? "active text-white" : "text-white/75 hover:text-white"
                  }`}
                >
                  <span>Sản phẩm</span>
                  <FiChevronDown
                    size={14}
                    className={`transition-transform duration-300 ease-out ${
                      isProductMenuOpen
                        ? "rotate-180 text-white"
                        : "text-white/50 group-hover:text-white group-hover:translate-y-0.5"
                    }`}
                  />
                </button>

                {/* 2. Doanh nghiệp */}
                <a
                  href="#enterprise"
                  className="nav-link-underline group cursor-pointer py-1.5 px-0.5 font-normal text-white/75 transition-colors duration-200 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                >
                  <span>Picare Vietnam</span>
                </a>

                {/* 3. Giải pháp */}
                <a
                  href="#solutions"
                  className="nav-link-underline group cursor-pointer py-1.5 px-0.5 font-normal text-white/75 transition-colors duration-200 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                >
                  <span>Liên hệ</span>
                </a>

                {/* 4. Tài nguyên */}
                <a
                  href="#resources"
                  className="nav-link-underline group cursor-pointer py-1.5 px-0.5 font-normal text-white/75 transition-colors duration-200 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                >
                  <span>Catalogues</span>
                </a>
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 font-haffer sm:gap-4">
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuContainerRef}>
                    {/* User profile capsule card */}
                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] p-1.5 pr-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.12] active:scale-[0.98]"
                    >
                      {/* Avatar with accent gradient */}
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#F86D2B] to-[#FFA336] text-xs font-semibold text-black shadow-[0_2px_8px_rgba(248,109,43,0.4)]">
                        {user?.name ? user.name.trim()[0].toUpperCase() : "U"}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
                      </div>

                      {/* Name & Role */}
                      <div className="hidden flex-col text-left leading-tight min-[460px]:flex">
                        <span className="max-w-[120px] truncate text-[12.5px] font-medium text-white transition-colors group-hover:text-[#FFA336]">
                          {user?.name || "Tài khoản"}
                        </span>
                        <span className="text-[10px] font-light text-zinc-400">
                          {user?.role ? ROLE_LABELS[user.role] || user.role : "Thành viên"}
                        </span>
                      </div>

                      {/* Dropdown Chevron */}
                      <FiChevronDown
                        size={14}
                        className={`text-white/50 transition-transform duration-300 ${
                          isUserMenuOpen ? "rotate-180 text-white" : "group-hover:text-white"
                        }`}
                      />
                    </button>

                    {/* Custom User Menu Dropdown */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-[#303030] bg-[#000000]/95 p-2.5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.95),0_0_30px_-15px_rgba(248,109,43,0.2)] backdrop-blur-2xl"
                        >
                          {/* Top ambient glow line */}
                          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#F86D2B]/50 to-transparent" />

                          {/* Profile Header */}
                          <div className="mb-1.5 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#F86D2B] to-[#FFA336] text-sm font-bold text-black shadow-md">
                              {user?.name ? user.name.trim()[0].toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13.5px] font-medium text-white">
                                {user?.name || "Tài khoản"}
                              </p>
                              <p className="truncate text-[11px] font-light text-zinc-400">
                                {user?.email}
                              </p>
                              <div className="mt-1 inline-flex items-center rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-[#FFA336]">
                                {user?.role ? ROLE_LABELS[user.role] || user.role : "Thành viên"}
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="space-y-0.5 font-haffer text-[13px]">
                            {canUseDashboard && (
                              <Link
                                to={PATHS.DASHBOARD.ROOT}
                                onClick={() => setIsUserMenuOpen(false)}
                                className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                              >
                                <FiLayout size={15} className="text-zinc-500 transition-colors group-hover:text-[#FFA336]" />
                                <span>Bảng điều khiển Hub</span>
                              </Link>
                            )}

                            <Link
                              to="/login/client"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                            >
                              <FiGrid size={15} className="text-zinc-500 transition-colors group-hover:text-[#FFA336]" />
                              <span>Không gian làm việc</span>
                            </Link>

                            <Link
                              to={PATHS.DASHBOARD.SETTINGS.ROOT}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                            >
                              <FiSettings size={15} className="text-zinc-500 transition-colors group-hover:text-[#FFA336]" />
                              <span>Cài đặt hệ thống</span>
                            </Link>
                          </div>

                          {/* Divider */}
                          <div className="my-1.5 h-px bg-white/10" />

                          {/* Logout Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          >
                            <FiLogOut size={15} className="transition-transform group-hover:-translate-x-0.5" />
                            <span>Đăng xuất</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenLogin}
                      className="nav-link-underline group hidden cursor-pointer py-1.5 px-0.5 text-[13px] font-normal tracking-normal text-white/75 transition-colors hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] min-[410px]:inline-flex"
                    >
                      <span>Đăng nhập</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-[13px] font-normal tracking-normal text-[#120F17] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:bg-white/92 hover:shadow-[0_4px_24px_rgba(255,255,255,0.25)]"
                    >
                      <span>Bắt đầu</span>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Upgraded Dropdown Mega-Menu: Copied and synchronized with new UI & dark palette */}
              <AnimatePresence mode="wait">
                {isProductMenuOpen && (
                  <motion.div
                    key="system-mega-menu"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={{
                      hidden: { opacity: 0, y: 14, scale: 0.96 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1],
                          staggerChildren: 0.08,
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: 10,
                        scale: 0.97,
                        transition: { duration: 0.2, ease: "easeOut" },
                      },
                    }}
                    className="absolute top-full left-1/2 mt-4 w-[min(1160px,calc(100vw-2.5rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#303030] bg-[#000000]/92 p-5.5 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.92),0_0_40px_-20px_rgba(248,109,43,0.25)] backdrop-blur-2xl sm:p-6"
                  >
                    {/* Subtle top ambient line */}
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#F86D2B]/50 to-transparent" />

                    <div className="flex flex-col gap-5">
                     

                      {/* Cards Grid */}
                      <motion.div
                        key={currentMenuPage}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.1,
                              delayChildren: 0.04,
                            },
                          },
                          exit: {
                            opacity: 0,
                            transition: { duration: 0.15 },
                          },
                        }}
                        className="grid grid-cols-1 gap-4 md:grid-cols-3"
                      >
                        {isClientsLoading
                          ? Array.from({ length: 3 }).map((_, i) => (
                              <ProductMenuSkeleton key={i} />
                            ))
                          : displayedMenuItems.map((item) => (
                              <ProductMenuCard key={item.clientId} item={item} />
                            ))}
                      </motion.div>

                      {/* Bottom Pagination & Navigation */}
                      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 px-1">
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: totalMenuPages }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setCurrentMenuPage(i)}
                              aria-label={`Trang ${i + 1}`}
                              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                normalizedMenuPage === i
                                  ? "w-8 bg-gradient-to-r from-[#F86D2B] to-[#FFA336] shadow-[0_0_10px_rgba(248,109,43,0.5)]"
                                  : "w-2 bg-[#424242] hover:bg-zinc-500"
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-zinc-500">
                            {normalizedMenuPage + 1} / {totalMenuPages}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMenuPage}
                            className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#424242] bg-[#212121]/90 text-zinc-300 transition-all hover:border-[#F86D2B]/50 hover:bg-[#303030] hover:text-white active:scale-95"
                            aria-label="Tiếp theo"
                          >
                            <FiChevronDown className="-rotate-90 transition-transform group-hover:translate-x-0.5" size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.header>

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
              initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-haffer flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 sm:gap-x-5 text-[clamp(2.8rem,7.2vw,5rem)] leading-[1.08] font-light tracking-[-0.05em] text-white text-center drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]"
            >
              <span className="inline-flex items-center">
                <span className="italic font-light text-white">Picare</span>
                <span className="ml-2.5 sm:ml-3 font-normal text-white">Client</span>
              </span>
              <img
                src={picareHubLogo}
                alt="Picare Hub"
                className="inline-block h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-18 lg:w-18 object-contain drop-shadow-[0_4px_28px_rgba(248,109,43,0.5)] select-none pointer-events-none"
              />
              <span className="inline-flex items-center">
                <span className="font-light text-white">Nền tảng</span>
                <span className="ml-2.5 sm:ml-3 font-normal text-white">
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
            <motion.p
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.75, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-7 max-w-[48rem] font-haffer text-base sm:text-[19px] md:text-[20px] leading-[1.65]  text-white text-center px-4 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]"
            >
              Chúng tôi xây dựng một mô hình tập trung các phần mềm bán hàng, quản lý, AI Automation tạo nên hệ sinh thái cho toàn bộ doanh nghiệp
            </motion.p>

            {/* 5. GSAP Animated Primary CTA Button */}
            <div className="mt-9 sm:mt-10 flex justify-center">
              <GsapCtaButton onClick={handleOpenLogin} label="Trải nghiệm ngay" delay={0.85} />
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
              </motion.div>
            )
          ) : (
            <LoginHubFormSection
              key="login-form"
              onBack={handleBackToLanding}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-black select-none font-haffer">
      <PixelSwap
        active={isSwapActive}
        onActiveChange={(nextActive) => {
          setIsSwapActive(nextActive);
        }}
        onComplete={(nextActive) => {
          if (nextActive) {
            setIsSwapDone(true);
            setIsHeroReady(true);
          }
        }}
        trigger={isSwapDone ? "manual" : "click"}
        style={{ height: "100vh", aspectRatio: "unset" }}
        className="w-full h-screen"
        pixelSize={120}
        gap={0}
        pixelRadius={0}
        pixelSpin={0}
        pixelScale={0.35}
        duration={1450}
        pixelDuration={480}
        pattern="random"
        randomness={0}
        fade
        firstContent={introContent}
        secondContent={guestContent}
      />
    </div>
  );
}

function ProductMenuCard({ item }: { item: HubClient }) {
  return (
    <motion.a
      href={item.clientInternalUrl}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.25 },
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#303030] bg-[#161616]/90 p-3.5 transition-all duration-300 hover:border-[#F86D2B]/50 hover:bg-[#212121] hover:shadow-[0_12px_32px_-8px_rgba(248,109,43,0.22)]"
    >
      {/* Thumbnail Banner */}
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-black/60 outline outline-1 outline-white/5 transition-all group-hover:outline-[#F86D2B]/30">
        <img
          src={
            item.clientLogoImage?.trim() ||
            item.clientMockupImage?.trim() ||
            "https://framerusercontent.com/images/gTH5qA521PTXYmAuTkvadn5fso.png?width=1292&height=450"
          }
          alt={item.clientName}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col justify-between space-y-2">
        <div>
          <h4 className="text-[14.5px] font-medium tracking-tight text-zinc-100 transition-colors group-hover:text-white">
            {item.clientName}
          </h4>
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-400/90 transition-colors group-hover:text-zinc-300">
            {item.clientDescription || "Hệ sinh thái phân hệ tối ưu hóa quy trình vận hành toàn diện."}
          </p>
        </div>

        {/* Action Link */}
        <div className="flex items-center gap-1.5 pt-2 text-[11.5px] font-medium tracking-wide text-zinc-400 transition-colors group-hover:text-[#FFA336]">
          <span>Khám phá ngay</span>
          <FiArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </motion.a>
  );
}

function ProductMenuSkeleton() {
  return (
    <div className="flex flex-col space-y-3 rounded-xl border border-[#303030] bg-[#161616]/90 p-3.5">
      <div className="h-40 w-full animate-pulse rounded-lg bg-[#262626]" />
      <div className="space-y-2 pt-1">
        <div className="h-4 w-3/5 animate-pulse rounded bg-[#262626]" />
        <div className="h-3 w-full animate-pulse rounded bg-[#212121]" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-[#212121]" />
      </div>
    </div>
  );
}
