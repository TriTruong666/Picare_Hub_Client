import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PixelSwap from "@/components/custom_ui/PixelSwap";
import MoltenMetal from "@/components/custom_ui/MoltenMetal";
import BorderGlow from "@/components/reactbit/BorderGlow";
import { PATHS } from "@/config/paths";
import logo from "@/assets/images/logo.png";

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
  const [isHeroReady, setIsHeroReady] = useState(false);

  // Bấm chọn vai trò ở Role Selection: kích hoạt PixelSwap lần 2 (chuyển ngược từ layer 1 về layer 0 mới)
  const handleSelectRole = (role: "guest" | "employee") => {
    if (isSecondSwapStartedRef.current) return;
    isSecondSwapStartedRef.current = true;
    if (role === "guest") setIsHeroReady(true);
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
                  Tìm hiểu hệ sinh thái giải pháp và khám phá quy trình vận hành của Picare Hub.
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

  // 3. Content Dành cho Khách (Chỉ hiện background gradient khi đang swap, swap xong mới animate tiếp navbar & header)
  const guestContent = (
    <div className="relative min-h-screen w-full flex flex-col gradient-nokoribi text-white overflow-x-hidden select-none">
      {isHeroReady && (
        <>
          {/* 1. Inset navbar: trượt xuống nhẹ nhàng sau khi swap đã xong và nền tĩnh lại */}
          <motion.header
            initial={{ opacity: 0, y: -22, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 top-4 z-40 sm:inset-x-6 sm:top-5"
          >
            <div className="mx-auto flex h-14 w-full max-w-[1392px] items-center justify-between rounded-[14px] border border-white/[0.12] bg-[#160f13]/75 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:h-[60px] sm:px-5">
              <a href="#" aria-label="Picare Hub" className="flex items-center gap-2.5">
                <img src={logo} alt="" className="h-6 w-6 object-contain" />
                <span className="font-bricolage text-[1.05rem] font-medium tracking-[-0.035em] text-[#fff9f5] sm:text-lg">
                  Picare Hub
                </span>
              </a>

              <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 font-over text-[0.69rem] font-semibold tracking-[0.08em] text-white/62 uppercase lg:flex">
                <button
                  type="button"
                  className="group flex h-9 cursor-pointer items-center gap-2 rounded-[9px] bg-white/[0.07] px-3 text-white transition-colors hover:bg-white/[0.11]"
                >
                  <span>Sản phẩm</span>
                  <span aria-hidden="true" className="text-base font-light leading-none text-white/55 transition-transform group-hover:rotate-90">
                    +
                  </span>
                </button>
                <a href="#enterprise" className="rounded-[9px] px-3 py-2.5 transition-colors hover:bg-white/[0.06] hover:text-white">
                  Doanh nghiệp
                </a>
                <a href="#solutions" className="rounded-[9px] px-3 py-2.5 transition-colors hover:bg-white/[0.06] hover:text-white">
                  Giải pháp
                </a>
                <a href="#resources" className="rounded-[9px] px-3 py-2.5 transition-colors hover:bg-white/[0.06] hover:text-white">
                  Tài nguyên
                </a>
              </nav>

              <div className="flex items-center gap-1.5 font-over sm:gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/login/hub")}
                  className="hidden h-10 cursor-pointer px-2.5 text-[0.7rem] font-semibold tracking-[0.08em] text-white/72 uppercase transition-colors hover:text-white min-[410px]:inline-flex min-[410px]:items-center"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-[#fffaf6] px-3.5 text-[0.7rem] font-semibold tracking-[0.08em] text-[#211519] uppercase transition-colors hover:bg-white sm:px-4"
                >
                  <span>Bắt đầu</span>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.header>

          {/* Main Hero Content: cascade animate tuần tự từng phần tử */}
          <main className="relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pt-32 pb-16 text-center sm:pt-40 sm:pb-20">
            {/* 2. Flat editorial kicker */}
            <motion.div
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
            </motion.div>

            {/* 3. Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-bricolage text-[clamp(4rem,9vw,7.5rem)] leading-[0.92] font-[430] tracking-[-0.06em] text-[#fff9f5]"
            >
              Picare Hub<span className="text-[#f7a276]">.</span>
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
                Hub
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
            if (selectedRole === "employee") {
              navigate(PATHS.LOGIN_HUB);
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
