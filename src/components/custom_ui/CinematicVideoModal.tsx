import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

export interface CinematicVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export default function CinematicVideoModal({
  isOpen,
  onClose,
  videoSrc,
}: CinematicVideoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const exitBtnRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    if (!overlayRef.current || !videoContainerRef.current) {
      onClose();
      return;
    }

    gsap.killTweensOf([
      overlayRef.current,
      videoContainerRef.current,
      ambientGlowRef.current,
      exitBtnRef.current,
    ]);

    const tl = gsap.timeline({
      onComplete: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        onClose();
      },
    });

    // 1. Nút Thoát và quầng sáng mờ đi nhanh
    if (exitBtnRef.current) {
      tl.to(exitBtnRef.current, { opacity: 0, duration: 0.2 }, 0);
    }
    if (ambientGlowRef.current) {
      tl.to(ambientGlowRef.current, { opacity: 0, duration: 0.3 }, 0);
    }

    // 2. Video mờ dần và biến mất
    tl.to(
      videoContainerRef.current,
      {
        opacity: 0,
        scale: 0.95,
        filter: "blur(16px)",
        duration: 0.35,
        ease: "power2.in",
      },
      0,
    );

    // 3. Layout đen co lại về giữa màn hình
    tl.to(
      overlayRef.current,
      {
        clipPath: "circle(0% at 50% 50%)",
        duration: 0.85,
        ease: "power2.inOut",
      },
      0.15,
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    // Khóa cuộn trang nền
    document.body.style.overflow = "hidden";

    // Lắng nghe phím Escape để thoát
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    if (overlayRef.current && videoContainerRef.current) {
      gsap.killTweensOf([
        overlayRef.current,
        videoContainerRef.current,
        ambientGlowRef.current,
        exitBtnRef.current,
      ]);

      // Reset trạng thái ban đầu
      gsap.set(overlayRef.current, {
        clipPath: "circle(0% at 50% 50%)",
        opacity: 1,
      });
      gsap.set(videoContainerRef.current, {
        opacity: 0,
        scale: 0.95,
        filter: "blur(20px) brightness(0.5)",
      });
      if (ambientGlowRef.current) {
        gsap.set(ambientGlowRef.current, { opacity: 0 });
      }
      if (exitBtnRef.current) {
        gsap.set(exitBtnRef.current, { opacity: 0, y: -6 });
      }

      const tl = gsap.timeline();

      // GIAI ĐOẠN 1 (0.0s -> 1.3s):
      // Ở giữa màn hình layout đen nở ra toàn bộ màn hình (tầm 1.3s)
      tl.to(
        overlayRef.current,
        {
          clipPath: "circle(150% at 50% 50%)",
          duration: 1.3,
          ease: "power2.inOut",
        },
        0,
      );

      // GIAI ĐOẠN 2 (t = 1.3s):
      // Video bắt đầu play từ đúng mốc 1.3s
      tl.add(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }, 1.3);

      // GIAI ĐOẠN 3 (t = 1.5s, tức sau 0.2s tiếp theo):
      // Video mờ dần xuất hiện ở giữa màn hình
      tl.to(
        videoContainerRef.current,
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px) brightness(1)",
          duration: 0.6,
          ease: "power2.out",
        },
        1.5,
      );

      // Quầng sáng ambient rực nhẹ sau video
      if (ambientGlowRef.current) {
        tl.to(
          ambientGlowRef.current,
          {
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          1.52,
        );
      }

      // Nút Thoát nhỏ ở góc trên bên phải mờ dần xuất hiện
      if (exitBtnRef.current) {
        tl.to(
          exitBtnRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
          },
          1.55,
        );
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleClose}
      style={{ clipPath: "circle(0% at 50% 50%)" }}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black px-4 py-8 select-none sm:px-8 md:px-12"
    >
      {/* Nút thoát: Dòng chữ Thoát nhỏ ở góc trên bên phải, hover kèm underline (không dùng icon) */}
      <button
        ref={exitBtnRef}
        type="button"
        onClick={handleClose}
        className="font-haffer absolute top-6 right-6 z-[1000000] cursor-pointer text-xs font-light tracking-wider text-zinc-400 opacity-0 transition-colors hover:text-white hover:underline underline-offset-4 sm:top-8 sm:right-10 sm:text-[13px]"
      >
        Thoát
      </button>

      {/* Quầng sáng ambient rực nhẹ phía sau video */}
      <div
        ref={ambientGlowRef}
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-0"
      >
        <div className="h-[40vh] w-[65vw] rounded-full bg-gradient-to-tr from-[#FFA336]/15 via-[#F86D2B]/10 to-transparent blur-[120px]" />
      </div>

      {/* Video nằm ở giữa: Tự phát video, không có nút điều khiển, không có viền border */}
      <div
        ref={videoContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 aspect-video w-full max-w-6xl overflow-hidden rounded-2xl bg-black opacity-0 shadow-[0_0_150px_rgba(0,0,0,1)] sm:rounded-3xl"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          loop
          controls={false}
          className="h-full w-full object-contain select-none"
        />
      </div>
    </div>,
    document.body,
  );
}
