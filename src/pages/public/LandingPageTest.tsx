import { useState, useEffect } from "react";
import PixelSwap from "@/components/custom_ui/PixelSwap";
import MoltenMetal from "@/components/custom_ui/MoltenMetal";

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
      {/* Background WebGL Shader */}
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

  // Content 2: Đưa vào giữa, nền đen (bg-black), font quicksand
  const secondContent = (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white font-quicksand text-center p-6">
      <div className="max-w-xl space-y-4">
        <span className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          You found me
        </span>
        <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed">
          Trang đã chuyển sang màu đen. Bây giờ bạn có thể bắt đầu cuộn trang tự do.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-black">
      <PixelSwap
        active={isSwapActive}
        onActiveChange={(nextActive) => setIsSwapActive(nextActive)}
        onComplete={(nextActive) => {
          if (nextActive) {
            setIsUnlocked(true);
          }
        }}
        trigger="click"
        style={{ height: "100vh", aspectRatio: "unset" }}
        className="w-full h-screen"
        pixelSize={64}
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