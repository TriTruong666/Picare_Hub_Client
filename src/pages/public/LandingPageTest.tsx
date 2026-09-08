import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiArrowRight } from "react-icons/fi";
import PixelSwap from "@/components/custom_ui/PixelSwap";
import MoltenMetal from "@/components/custom_ui/MoltenMetal";
import BorderGlow from "@/components/reactbit/BorderGlow";
import AeroShards from "@/components/reactbit/AeroShard";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
import { STATIC_HUB_CLIENTS } from "@/constants/staticHubClients";
import type { HubClient } from "@/types/HubClient";
import { PATHS } from "@/config/paths";
import logo from "@/assets/images/logo.png";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";

export default function LandingPageTest() {
  const navigate = useNavigate();

  // Quản lý trạng thái swap:
  // Phase 1 (Intro -> Role Selection): isSwapActive: false -> true
  // Phase 2 (Role Selection -> Guest/Employee): isSwapActive: true -> false
  const [isSwapActive, setIsSwapActive] = useState(false);
  const [isFirstSwapDone, setIsFirstSwapDone] = useState(false);
  const isSecondSwapStartedRef = useRef(false);

  // Role được chọn ("guest" hoặc "employee")
  const [selectedRole, setSelectedRole] = useState<"guest" | "employee" | null>(null);
  const selectedRoleRef = useRef<"guest" | "employee" | null>(null);
  const [isHeroReady, setIsHeroReady] = useState(false);

  // Mega-menu "Sản phẩm" state & data
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [currentMenuPage, setCurrentMenuPage] = useState(0);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsProductMenuOpen(false);
      }
    };
    if (isProductMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProductMenuOpen]);

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

  // Bấm chọn vai trò ở Role Selection: kích hoạt PixelSwap lần 2 (chuyển ngược từ layer 1 về layer 0 mới)
  const handleSelectRole = (role: "guest" | "employee") => {
    if (isSecondSwapStartedRef.current) return;
    isSecondSwapStartedRef.current = true;
    selectedRoleRef.current = role;
    setSelectedRole(role);
    setIsSwapActive(false); // Kích hoạt PixelSwap lần 2 lật mở về layer 0 (guestContent hoặc employeeContent)
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

      <div className="relative z-10 text-center pointer-events-none px-6 flex flex-col items-center gap-3">
        <h1 className="font-plus-jakarta text-4xl sm:text-4xl font-light text-white drop-shadow-md">
          <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500">
            Picare
          </span>{" "}
          xin chào
        </h1>
        <p className="font-plus-jakarta text-xs sm:text-[12px] text-zinc-400/90 font-light tracking-wide animate-pulse">
          Bấm vào màn hình để tiếp tục
        </p>
      </div>
    </div>
  );

  // 2. Content Role Selection: Màn hình chọn vai trò với 2 Option Cards (BorderGlow)
  const roleSelectionContent = (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-black px-6 py-8 select-none overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-sm mb-7">
        <h2 className="font-plus-jakarta text-base sm:text-lg font-medium text-zinc-100 tracking-tight">
          Bạn muốn tiếp tục với vai trò nào?
        </h2>
        <p className="font-plus-jakarta text-xs text-zinc-500 mt-1 font-light">
          Chọn phương thức truy cập phù hợp với bạn
        </p>
      </div>

      {/* 2 Card Options UI */}
      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-5 w-full max-w-xl">
        {/* Option 1: Bạn là khách */}
        <div className="w-full sm:w-1/2">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="200 80 80"
            backgroundColor="#120F17"
            borderRadius={22}
            glowRadius={36}
            glowIntensity={1}
            coneSpread={25}
            animated={false}
            colors={['#818cf8', '#c084fc', '#38bdf8']}
            className="cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.985] w-full group text-left"
            onClick={() => handleSelectRole("guest")}
          >
            <div className="p-5 sm:p-6 flex flex-col h-full justify-between gap-5">
              <div>
                <h3 className="font-plus-jakarta text-sm sm:text-[15px] font-medium text-zinc-100 tracking-tight">
                  Bạn là khách
                </h3>
                <p className="font-plus-jakarta text-xs text-zinc-400 mt-2 leading-relaxed font-light">
                  Tìm hiểu hệ sinh thái giải pháp và khám phá quy trình vận hành của Picare Client.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  Khám phá giải pháp
                </span>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all">
                  &rarr;
                </span>
              </div>
            </div>
          </BorderGlow>
        </div>

        {/* Option 2: Bạn là nhân viên công ty */}
        <div className="w-full sm:w-1/2">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120F17"
            borderRadius={22}
            glowRadius={36}
            glowIntensity={1}
            coneSpread={25}
            animated={false}
            colors={['#f59e0b', '#ec4899', '#8b5cf6']}
            className="cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.985] w-full group text-left"
            onClick={() => handleSelectRole("employee")}
          >
            <div className="p-5 sm:p-6 flex flex-col h-full justify-between gap-5">
              <div>
                <h3 className="font-plus-jakarta text-sm sm:text-[15px] font-medium text-zinc-100 tracking-tight">
                  Bạn là nhân viên công ty
                </h3>
                <p className="font-plus-jakarta text-xs text-zinc-400 mt-2 leading-relaxed font-light">
                  Truy cập không gian làm việc số và hệ thống quản trị, điều hành nội bộ Picare.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  Đăng nhập hệ thống
                </span>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all">
                  &rarr;
                </span>
              </div>
            </div>
          </BorderGlow>
        </div>
      </div>
    </div>
  );

  // 3. Content Dành cho Khách: Thay thế gradient bằng AeroShards WebGPU, đồng bộ nhịp xuất hiện với PixelSwap
  const guestContent = (
    <div className="relative min-h-screen w-full flex flex-col bg-[#120F17] text-white overflow-x-hidden select-none">
      {/* Background WebGPU AeroShards */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AeroShards
          backgroundColor="#120F17"
          shardColor="#F86D2B"
          accentColor="#FFA336"
          placement="full"
          flow="stream"
          material="pearl"
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
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather
          paused={false}
        />
      </div>

      {isHeroReady && (
        <>
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
              <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 font-inter text-[13px] font-normal tracking-normal lg:flex">
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
                  <span>Doanh nghiệp</span>
                </a>

                {/* 3. Giải pháp */}
                <a
                  href="#solutions"
                  className="nav-link-underline group cursor-pointer py-1.5 px-0.5 font-normal text-white/75 transition-colors duration-200 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                >
                  <span>Giải pháp</span>
                </a>

                {/* 4. Tài nguyên */}
                <a
                  href="#resources"
                  className="nav-link-underline group cursor-pointer py-1.5 px-0.5 font-normal text-white/75 transition-colors duration-200 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                >
                  <span>Tài nguyên</span>
                </a>
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 font-inter sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/login/hub")}
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
              className="mb-6 inline-flex items-center gap-3 font-over sm:mb-7"
            >
              <span aria-hidden="true" className="h-px w-6 bg-white/35 sm:w-9" />
              <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-white/68 uppercase sm:text-xs">
                Hệ sinh thái vận hành · Picare 2.0
              </span>
              <span aria-hidden="true" className="h-px w-6 bg-white/35 sm:w-9" />
            </motion.div> */}

            {/* 3. Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-bricolage text-[clamp(4rem,9vw,7.5rem)] leading-[0.92] font-light tracking-[-0.06em] text-[#fff9f5]"
            >
              <span className="italic font-light">Picare</span>{" "}
              <span className="text-[0.82em] font-normal tracking-[-0.04em] text-white/90">
                Client<span className="text-[#f7a276]">.</span>
              </span>
            </motion.h1>

            {/* 4. Subtitle & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-7 max-w-[38rem] space-y-1.5 text-center font-over"
            >
              <p className="text-base font-semibold tracking-[-0.01em] text-white/92 sm:text-lg">
                Nền tảng quản trị và trợ lý thông minh cho doanh nghiệp.
              </p>
              <p className="text-base leading-[1.6] font-normal text-white/58">
                Đồng bộ toàn diện Kinh doanh, E-Commerce, Kho bãi và Chuỗi cung ứng trong một hệ thống duy nhất.
              </p>
            </motion.div>

            {/* 5. Origin-Style Primary CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <button
                type="button"
                className="font-over inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-[10px] bg-[#fffaf6] px-5 text-xs font-semibold tracking-[0.08em] text-[#211519] uppercase transition-colors hover:bg-white"
              >
                <span>Trải nghiệm ngay</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>

            {/* 6. Origin-Style Interactive AI Prompt / Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-9 w-full max-w-[37rem] font-over"
            >
              <div className="relative flex min-h-16 items-center rounded-full border border-white/12 bg-white/[0.09] py-2 pr-2 pl-5 shadow-[0_18px_50px_rgba(20,10,14,0.2)] backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.11]">
                <span className="flex-1 truncate text-left text-sm font-normal text-white/58 sm:text-base">
                  Hỏi Picare AI về giải pháp tối ưu cho kho và bán hàng...
                </span>
                <button
                  type="button"
                  aria-label="Gửi câu hỏi"
                  className="ml-3 flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/18 text-white transition-colors hover:bg-white/26"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="mt-3 text-xs font-normal tracking-[0.02em] text-white/50">
                Đồng bộ dữ liệu. Đặt bất kỳ câu hỏi nào.
              </p>
            </motion.div>
          </main>
        </>
      )}
    </div>
  );

  // 4. Content Dành cho Nhân viên (Giao diện Đăng nhập Picare Hub)
  const employeeContent = (
    <div className="font-plus-jakarta relative flex min-h-screen w-full items-center justify-center bg-black px-6 py-12 select-none overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={24}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#f59e0b', '#ec4899', '#8b5cf6']}
          className="w-full shadow-2xl"
        >
          <div className="p-7 sm:p-8 flex flex-col gap-5 text-left">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Picare Hub" className="h-8 w-8 object-contain" />
              <span className="font-plus-jakarta text-xl font-medium tracking-tight text-white">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500">
                  Picare
                </span>{" "}
                Client
              </span>
            </div>
            <p className="font-plus-jakarta text-xs text-zinc-400 font-light leading-relaxed">
              Đang chuyển đến cổng đăng nhập nội bộ...
            </p>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-purple-500 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        </BorderGlow>
      </div>
    </div>
  );

  // Xác định layer 0 dựa vào giai đoạn:
  // - Khi chưa chọn vai trò: layer 0 là introContent ("Picare xin chào")
  // - Khi đã bấm chọn vai trò: layer 0 chuyển thành guestContent hoặc employeeContent tương ứng
  const currentFirstContent = !isFirstSwapDone
    ? introContent
    : selectedRole === "employee"
    ? employeeContent
    : guestContent;

  return (
    <div className="min-h-screen w-full bg-black select-none">
      <PixelSwap
        active={isSwapActive}
        onActiveChange={(nextActive) => {
          setIsSwapActive(nextActive);
        }}
        onComplete={(nextActive) => {
          if (nextActive) {
            // Hoàn tất PixelSwap 1: Đã chuyển từ Intro sang Role Selection
            setIsFirstSwapDone(true);
          } else {
            // Hoàn tất PixelSwap 2: Đã chuyển từ Role Selection sang Guest hoặc Employee
            const role = selectedRoleRef.current;
            if (role === "employee") {
              navigate(PATHS.LOGIN_HUB);
            } else if (role === "guest") {
              setIsHeroReady(true);
            }
          }
        }}
        trigger={isFirstSwapDone ? "manual" : "click"}
        style={{ height: "100vh", aspectRatio: "unset" }}
        className={`w-full h-screen ${
          !isFirstSwapDone && isSwapActive ? "pointer-events-none" : ""
        }`}
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
        firstContent={currentFirstContent}
        secondContent={roleSelectionContent}
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
