import { useState, useEffect } from "react";
import PixelSwap from "@/components/custom_ui/PixelSwap";
import MoltenMetal from "@/components/custom_ui/MoltenMetal";
import MorphSlider from "@/components/custom_ui/MorphSlider";

const items = [
  {
    image:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect width="1600" height="1000" fill="%23000000"/></svg>',
    caption: "Start",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1600&auto=format&fit=crop",
    caption: "One",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=1600&auto=format&fit=crop",
    caption: "Two",
  },
  {
    image:
      "https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=1600&auto=format&fit=crop",
    caption: "Three",
  },
];

export default function LandingPageTest() {
  const [isSwapActive, setIsSwapActive] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

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

  // Content 1: Fullscreen với MoltenMetal WebGL làm background màu sáng và chữ ở giữa
  const firstContent = (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer">
      {/* Background WebGL Shader giữ nguyên 100% độ sáng trong khi chạy pixel và mờ dần êm dịu 1.5s sau khi hoàn tất */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-[1500ms] ease-in-out ${
          isUnlocked ? "opacity-0 pointer-events-none" : "opacity-100"
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

  // Content 2: Full-width MorphSlider nền đen không nút bấm với chữ Picare xin chào ở giữa
  const secondContent = (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white font-quicksand text-center overflow-hidden">
      {/* MorphSlider Full-Width Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MorphSlider
          items={items}
          transition="melt"
          intensity={0.55}
          aberration={0.35}
          drift={0.4}
          autoplay={false}
          overlayColor="#05060a"
          duration={1.1}
          ease="power2.inOut"
          scale={2.4}
          autoplayDelay={4}
          loop
          radius={0}
          showCaptions={false}
          showControls={false}
          showIndicators={false}
        />
      </div>

      {/* Tiêu đề Picare xin chào ở chính giữa - Đồng bộ 100% font size với Content 1 */}
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