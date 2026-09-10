import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiLogOut,
  FiLayout,
  FiGrid,
  FiSettings,
  FiArrowRight,
  FiX,
} from "react-icons/fi";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/data/useAuthHooks";
import { canAccessDashboard } from "@/config/dashboardAccess";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
import { STATIC_HUB_CLIENTS } from "@/constants/staticHubClients";
import { ROLE_LABELS } from "@/types/User";
import { PATHS } from "@/config/paths";
import { useCurveTransition } from "@/components/custom_ui/CurvePageTransition";
import gsap from "gsap";

import type { User } from "@/types/User";
import type { HubClient } from "@/types/HubClient";

export interface PublicLandingNavbarProps {
  onOpenLogin?: () => void;
  onOpenClientSelect?: () => void;
  onLogoClick?: () => void;
  onCatalogueClick?: () => void;
  className?: string;
  isDarkBg?: boolean;
  isAuthenticated?: boolean;
  user?: User | null;
  showNoticeBanner?: boolean;
}

export function PublicLandingNavbar({
  onOpenLogin,
  onOpenClientSelect,
  onLogoClick,
  onCatalogueClick,
  className = "",
  isDarkBg = false,
  isAuthenticated: propIsAuth,
  user: propUser,
  showNoticeBanner = true,
}: PublicLandingNavbarProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(showNoticeBanner);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [currentMenuPage, setCurrentMenuPage] = useState(0);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const navbarBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navbarBgRef.current) return;
    if (isDarkBg) {
      gsap.to(navbarBgRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(navbarBgRef.current, {
        opacity: 0,
        y: -4,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [isDarkBg]);

  const auth = useAuth();
  const isAuthenticated =
    propIsAuth !== undefined ? propIsAuth : auth.isAuthenticated;
  const user = propUser !== undefined ? propUser : auth.user;
  const { mutate: logout } = useLogout();
  const canUseDashboard = canAccessDashboard(user?.role);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { navigateWithTransition } = useCurveTransition();

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

  const location = useLocation();

  const handleNextMenuPage = () => {
    setCurrentMenuPage((prev) => (prev + 1) % totalMenuPages);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLogoClick) {
      onLogoClick();
    } else {
      const isFromCatalogue = location.pathname.startsWith("/catalogue");
      navigate(PATHS.HOME, { state: { fromCatalogue: isFromCatalogue } });
    }
  };

  const handleCatalogueClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCatalogueClick) {
      onCatalogueClick();
    } else {
      navigate("/catalogue/public/gallery");
    }
  };

  const handleDefaultLoginClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      navigate(PATHS.LOGIN);
    }
  };

  const handleStartClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onOpenClientSelect) {
      onOpenClientSelect();
    } else {
      navigate(PATHS.LOGIN_CLIENT);
    }
  };

  useEffect(() => {
    setIsBannerVisible(showNoticeBanner);
  }, [showNoticeBanner]);

  return (
    <>
      {/* 0. Top Upgrade Notice Banner (Màu cam) */}
      <AnimatePresence>
        {isBannerVisible && (
          <motion.aside
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Thông báo nâng cấp giao diện Picare Hub"
            className="pointer-events-auto fixed inset-x-0 top-0 z-50 flex min-h-[36px] items-center justify-between border-b border-orange-400/30 bg-gradient-to-r from-[#F86D2B] via-[#FFA336] to-[#F86D2B] px-3.5 py-1.5 shadow-[0_4px_20px_rgba(248,109,43,0.35)] backdrop-blur-md sm:px-6"
          >
            <div className="mx-auto flex flex-1 items-center justify-center gap-2 text-center">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <p className="font-haffer text-[11px] font-medium tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] sm:text-[12px]">
                Picare Hub đang trong quá trình nâng cấp giao diện, các hệ thống
                khác sẽ không bị ảnh hưởng
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBannerVisible(false)}
              title="Đóng thông báo"
              aria-label="Đóng thông báo"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/80 transition-all hover:bg-black/15 hover:text-white"
            >
              <FiX size={15} />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ opacity: 0, y: -22, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          duration: 0.75,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`pointer-events-none fixed inset-x-3 z-40 transition-all duration-300 sm:inset-x-6 ${
          isBannerVisible ? "top-12 sm:top-13.5" : "top-3 sm:top-4.5"
        } ${className}`}
      >
        <div
          ref={menuContainerRef}
          className="pointer-events-auto relative flex h-15 w-full items-center justify-between px-6 sm:h-16 sm:px-8 lg:px-10"
        >
          {/* Animated Dark Background for Grid section and contrast protection */}
          <div
            ref={navbarBgRef}
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl border border-white/[0.12] bg-[#0E0B14]/92 shadow-[0_8px_32px_rgba(0,0,0,0.65)] backdrop-blur-md"
            style={{ opacity: 0 }}
          />
          {/* Logo */}
          <a
            href={PATHS.HOME}
            onClick={handleLogoClick}
            aria-label="Picare Client"
            className="flex cursor-pointer items-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            <img
              src={logoPicareNewBlack}
              alt="Picare Client"
              className="-my-4 h-10 w-auto object-contain mix-blend-screen sm:-my-6 sm:h-14"
            />
          </a>

          {/* Navigation Items: No background + Left-to-right smooth width expanding underline animation */}
          <nav className="font-haffer absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-[13px] font-normal tracking-normal lg:flex">
            {/* 1. Sản phẩm (Active & Dropdown trigger) */}
            <button
              type="button"
              onClick={() => setIsProductMenuOpen((prev) => !prev)}
              className="group relative flex cursor-pointer items-center gap-1.5 px-0.5 py-1.5 font-normal text-white/75 transition-colors duration-200 hover:text-white"
            >
              <span
                className={`nav-link-underline ${
                  isProductMenuOpen ? "active text-white" : ""
                }`}
              >
                Sản phẩm
              </span>
              <FiChevronDown
                size={14}
                className={`transition-transform duration-300 ease-out ${
                  isProductMenuOpen
                    ? "rotate-180 text-white"
                    : "text-white/50 group-hover:translate-y-0.5 group-hover:text-white"
                }`}
              />
            </button>

            {/* 2. Doanh nghiệp */}
            <a
              href="/test#enterprise"
              className="group relative flex cursor-pointer items-center px-0.5 py-1.5 font-normal text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] transition-colors duration-200 hover:text-white"
            >
              <span className="nav-link-underline">Picare Vietnam</span>
            </a>

            {/* 3. Giải pháp */}
            <a
              href="/test#solutions"
              className="group relative flex cursor-pointer items-center px-0.5 py-1.5 font-normal text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] transition-colors duration-200 hover:text-white"
            >
              <span className="nav-link-underline">Liên hệ</span>
            </a>

            {/* 4. Tài nguyên */}
            <a
              href="/catalogue/public/gallery"
              onClick={handleCatalogueClick}
              className="group relative flex cursor-pointer items-center px-0.5 py-1.5 font-normal text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] transition-colors duration-200 hover:text-white"
            >
              <span className="nav-link-underline">Catalogues</span>
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="font-haffer flex items-center gap-2 sm:gap-4">
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
                    <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
                  </div>

                  {/* Name & Role */}
                  <div className="hidden flex-col text-left leading-tight min-[460px]:flex">
                    <span className="max-w-[120px] truncate text-[12.5px] font-medium text-white transition-colors group-hover:text-[#FFA336]">
                      {user?.name || "Tài khoản"}
                    </span>
                    <span className="text-[10px] font-light text-zinc-400">
                      {user?.role
                        ? ROLE_LABELS[user.role] || user.role
                        : "Thành viên"}
                    </span>
                  </div>

                  {/* Dropdown Chevron */}
                  <FiChevronDown
                    size={14}
                    className={`text-white/50 transition-transform duration-300 ${
                      isUserMenuOpen
                        ? "rotate-180 text-white"
                        : "group-hover:text-white"
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
                      transition={{
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute top-full right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-[#303030] bg-[#000000]/95 p-2.5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.95),0_0_30px_-15px_rgba(248,109,43,0.2)] backdrop-blur-2xl"
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
                            {user?.role
                              ? ROLE_LABELS[user.role] || user.role
                              : "Thành viên"}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="font-haffer space-y-0.5 text-[13px]">
                        {canUseDashboard && (
                          <Link
                            to={PATHS.DASHBOARD.ROOT}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                          >
                            <FiLayout
                              size={15}
                              className="text-zinc-500 transition-colors group-hover:text-[#FFA336]"
                            />
                            <span>Bảng điều khiển Hub</span>
                          </Link>
                        )}

                        <Link
                          to="/login/client"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <FiGrid
                            size={15}
                            className="text-zinc-500 transition-colors group-hover:text-[#FFA336]"
                          />
                          <span>Không gian làm việc</span>
                        </Link>

                        <Link
                          to={PATHS.DASHBOARD.SETTINGS.ROOT}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <FiSettings
                            size={15}
                            className="text-zinc-500 transition-colors group-hover:text-[#FFA336]"
                          />
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
                        <FiLogOut
                          size={15}
                          className="transition-transform group-hover:-translate-x-0.5"
                        />
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
                  onClick={handleDefaultLoginClick}
                  className="group pointer-events-auto relative hidden cursor-pointer items-center px-0.5 py-1.5 text-[13px] font-normal tracking-normal text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] transition-colors hover:text-white min-[410px]:inline-flex"
                >
                  <span className="nav-link-underline">Đăng nhập</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartClick}
                  className="pointer-events-auto inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-[13px] font-normal tracking-normal text-[#120F17] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:bg-white/92 hover:shadow-[0_4px_24px_rgba(255,255,255,0.25)]"
                >
                  <span>Bắt đầu</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8H13M9 4L13 8L9 12"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dropdown Menu: Floating Mega Menu */}
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
                          <ProductMenuCard
                            key={item.clientId}
                            item={item}
                            onNavigate={() => setIsProductMenuOpen(false)}
                          />
                        ))}
                  </motion.div>

                  {/* Bottom Pagination & Navigation */}
                  <div className="flex items-center justify-between border-t border-white/[0.06] px-1 pt-3">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalMenuPages }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentMenuPage(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            normalizedMenuPage === i
                              ? "w-6 bg-[#FFA336]"
                              : "w-1.5 bg-white/20 hover:bg-white/40"
                          }`}
                          aria-label={`Trang ${i + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11.5px] font-normal tracking-wide text-zinc-500">
                        Trang {normalizedMenuPage + 1} / {totalMenuPages}
                      </span>
                      {totalMenuPages > 1 && (
                        <button
                          type="button"
                          onClick={handleNextMenuPage}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11.5px] font-normal text-zinc-300 transition-colors hover:border-[#FFA336]/40 hover:bg-white/[0.08] hover:text-[#FFA336]"
                        >
                          <span>Xem thêm hệ thống</span>
                          <FiArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}

function ProductMenuCard({
  item,
  onNavigate,
}: {
  item: HubClient;
  onNavigate?: () => void;
}) {
  const { navigateWithTransition } = useCurveTransition();

  const handleClick = (e: React.MouseEvent) => {
    // If internal route starting with /client/oms or similar
    if (item.clientInternalUrl?.startsWith("/client/")) {
      e.preventDefault();
      onNavigate?.();
      navigateWithTransition(item.clientInternalUrl, { text: "Picare Client" });
    }
  };

  return (
    <motion.a
      href={item.clientInternalUrl}
      onClick={handleClick}
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
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-black/60 outline-1 outline-white/5 transition-all group-hover:outline-[#F86D2B]/30">
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
            {item.clientDescription ||
              "Hệ sinh thái phân hệ tối ưu hóa quy trình vận hành toàn diện."}
          </p>
        </div>

        {/* Action Link */}
        <div className="flex items-center gap-1.5 pt-2 text-[11.5px] font-medium tracking-wide text-zinc-400 transition-colors group-hover:text-[#FFA336]">
          <span>Khám phá ngay</span>
          <FiArrowRight
            size={13}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
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

export default PublicLandingNavbar;
