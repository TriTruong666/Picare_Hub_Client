import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PixelSwap from "@/components/custom_ui/PixelSwap";
import MoltenMetal from "@/components/custom_ui/MoltenMetal";
import MorphSlider from "@/components/custom_ui/MorphSlider";
import omsLandingImg from "@/assets/images/oms_landing.png";
import wmsLandingImg from "@/assets/images/wms_landing.png";
import sfaLandingImg from "@/assets/images/sfa_landing.png";
import catalogueLandingImg from "@/assets/images/catalogue_landing.png"

// Mảng items gộp hình màu đen thuần ở Slide 0 và 3 hình thực tế (One, Two, Three)
const items = [
  {
    image:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect width="1600" height="1000" fill="%23000000"/></svg>',
    caption: "Start",
  },
  {
    image: omsLandingImg,
    caption: "Picare OMS",
  },
  {
    image: wmsLandingImg,
    caption: "Picare WMS",
  },
  {
    image: sfaLandingImg,
    caption: "Saleforce",
  },
  {
    image: catalogueLandingImg,
    caption: "Picare Catalougues",
  },
];

export default function LandingPageTest() {
  const [isSwapActive, setIsSwapActive] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Quản lý hiển thị mờ dần cho chữ "Chờ mình một chút nhé."
  const [isTextVisible, setIsTextVisible] = useState(true);
  // Quản lý hiển thị Hero Section (chỉ xuất hiện sau khi MorphSlider animate xong hình thứ 2)
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  // Khóa cuộn trang ở content 1 và mở cuộn khi chuyển cảnh xong
  useEffect(() => {
    if (!isUnlocked) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isUnlocked]);

  // Căn thời gian hiển thị:
  // 1. Chữ "Chờ mình một chút nhé..." mờ dần sau 1.2s
  // 2. MorphSlider bắt đầu morph ở 2.5s (duration 2.5s) -> 5.0s hình 2 animate hoàn tất
  // 3. Đúng 5.0s kích hoạt Hero Section xuất hiện lần lượt (Hero Title -> Subtitle -> 2 Nút)
  useEffect(() => {
    if (!isUnlocked) return;

    const fadeTimer = setTimeout(() => {
      setIsTextVisible(false);
    }, 1200);

    const heroTimer = setTimeout(() => {
      setIsHeroVisible(true);
    }, 4300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(heroTimer);
    };
  }, [isUnlocked]);

  // Content 1: Fullscreen với MoltenMetal WebGL làm background màu sáng và chữ ở giữa
  const firstContent = (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer">
      {/* Background WebGL Shader giữ nguyên 100% độ sáng trong khi chạy pixel và mờ dần êm dịu 1.5s sau khi hoàn tất */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-[1500ms] ease-in-out ${isUnlocked ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
      >
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

      {/* Text Overlay ở chính giữa */}
      <div className="relative z-10 text-center pointer-events-none px-6">
        <h1 className="font-plus-jakarta text-4xl font-light text-white drop-shadow-md">
          <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500">
            Picare
          </span>{" "}
          xin chào
        </h1>
      </div>
    </div>
  );

  // Content 2: Bật Autoplay cho MorphSlider (cho phép vừa autoplay vừa dùng tay vuốt), gộp slide đen làm Slide 0
  const secondContent = (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white font-quicksand text-center overflow-hidden">
      {/* MorphSlider Full-Width Background chứa cả Slide đen + 3 Hình thực tế, autoplay 3.5s */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MorphSlider
          items={items}
          transition="melt"
          intensity={0.55}
          aberration={0.35}
          drift={0.4}
          autoplay={isUnlocked}
          firstAutoplayDelay={2.5}
          autoplayDelay={10}
          overlayColor="#05060a"
          duration={2.5}
          ease="power2.inOut"
          scale={2.4}
          loop
          radius={0}
          showCaptions={false}
          showControls={false}
          showIndicators={false}
        />
      </div>

      {/* Chữ "Chờ mình một chút nhé." hiển thị 2.2s -> mờ dần 1.0s bằng Framer Motion trước khi Autoplay Morph sang Hình 1 */}
      <AnimatePresence>
        {isTextVisible && (
          <motion.div
            key="waiting-text"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none"
          >
            <h1 className="font-plus-jakarta text-2xl font-light text-white drop-shadow-md">
              Chờ mình một chút nhé...
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section Layout đè lên MorphSlider: Chỉ xuất hiện sau khi hình thứ 2 animate xong và xuất hiện so le theo thứ tự: Hero Title -> Subtitle -> 2 Nút */}
      <AnimatePresence>
        {isHeroVisible && (
          <motion.div
            key="hero-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 w-full h-full flex items-center pointer-events-none"
          >
            <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 text-left">
              <div className="max-w-lg flex flex-col items-start gap-3 sm:gap-4">
                {/* 1. Hero Title xuất hiện trước tiên (delay 0.1s) */}
                <motion.h1
                  initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-plus-jakarta text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-medium text-zinc-950 tracking-tight leading-[1.2]"
                >
                  Bạn đang bán hàng thủ công?
                  <br />
                  Đừng lo vì đã có{" "}
                  <span className="font-semibold font-plus-jakarta text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500">
                    Picare Hub
                  </span>
                </motion.h1>

                {/* 2. Subtitle xuất hiện tiếp theo (delay 0.4s) */}
                <motion.p
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="font-plus-jakarta text-xs sm:text-[13px] font-normal text-zinc-600 leading-relaxed max-w-md"
                >
                  Nếu doanh nghiệp đang gặp vấn đề với quy trình vận hành thủ công Kinh doanh, E-Commercial, Kho bãi và Logictics. Picare Hub sẽ cung cấp cho bạn các modules mà bạn có thể giải quyết chúng mà không cần phải cài đặt toàn bộ cả một kiến trúc phần mềm khổng lồ.
                </motion.p>

                {/* 3. Hai nút bấm xuất hiện sau cùng (delay 0.7s) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center gap-2.5 pt-1 pointer-events-auto"
                >
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-normal text-xs sm:text-[13px] transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                  >
                    Bắt đầu ngay
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-white/70 hover:bg-white text-zinc-800 border border-zinc-200/90 font-normal text-xs sm:text-[13px] backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                  >
                    Tìm hiểu giải pháp
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-black">
      <PixelSwap
        active={isSwapActive}
        onActiveChange={(nextActive) => {
          if (nextActive) {
            setIsSwapActive(true);
          }
        }}
        onComplete={(nextActive) => {
          if (nextActive) {
            setIsUnlocked(true);
          }
        }}
        trigger="click"
        style={{ height: "100vh", aspectRatio: "unset" }}
        className={`w-full h-screen ${isSwapActive && !isUnlocked ? "pointer-events-none" : ""}`}
        pixelSize={110}
        gap={0}
        pixelRadius={0}
        pixelSpin={0}
        pixelScale={0.35}
        duration={1400}
        pixelDuration={450}
        pattern="random"
        randomness={0}
        fade
        firstContent={firstContent}
        secondContent={secondContent}
      />
    </div>
  );
}