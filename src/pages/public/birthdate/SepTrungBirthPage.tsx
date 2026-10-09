import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import logoPicareNonBg from "@/assets/images/logo_picare_nonbg.png";
import logoTrungHanhNonBg from "@/assets/images/logo_trunghanh_nonbg.png";
import logoDermacoonNonBg from "@/assets/images/logo_dermacoon_nonbg.png";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import huongdan1 from "@/assets/images/huongdan1.jpg";
import huongdan2 from "@/assets/images/huongdan2.jpg";
import huongdan3 from "@/assets/images/huongdan3.jpg";
import huongdan4 from "@/assets/images/huongdan4.jpg";
import huongdan5 from "@/assets/images/huongdan5.jpg";

gsap.registerPlugin(useGSAP);

const MOCK_PHOTOS = [huongdan1, huongdan2, huongdan3, huongdan4, huongdan5];

// 8 tấm ảnh tách rời các hướng rõ rệt, kích thước tự nhiên to rõ (không ép vuông)
// Xuất hiện so le nhịp nhàng 2s/tấm, tạo chiều sâu 3D sâu hun hút
const TUNNEL_ITEMS = [
  {
    src: huongdan1,
    tx: "-42rem",
    ty: "-20rem",
    rot: "-4deg",
    delay: "0s",
  },
  {
    src: huongdan2,
    tx: "42rem",
    ty: "20rem",
    rot: "4deg",
    delay: "2s",
  },
  {
    src: huongdan3,
    tx: "-42rem",
    ty: "20rem",
    rot: "3deg",
    delay: "4s",
  },
  {
    src: huongdan4,
    tx: "42rem",
    ty: "-20rem",
    rot: "-3deg",
    delay: "6s",
  },
  {
    src: huongdan5,
    tx: "-48rem",
    ty: "0rem",
    rot: "-5deg",
    delay: "8s",
  },
  {
    src: huongdan1,
    tx: "48rem",
    ty: "0rem",
    rot: "5deg",
    delay: "10s",
  },
  {
    src: huongdan2,
    tx: "-20rem",
    ty: "-28rem",
    rot: "2deg",
    delay: "12s",
  },
  {
    src: huongdan3,
    tx: "20rem",
    ty: "28rem",
    rot: "-2deg",
    delay: "14s",
  },
];

const STEP_INTERVAL = 1500; // 1.5s cho mỗi nhịp đếm
const VIDEO_FADE_IN_DURATION = 8.5; // Video sáng dần chậm rãi hơn (8.5s)
const VIDEO_SRC =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1790064168652_9f235726-a528-4e55-9052-47489360b497_trahangcustomer.mp4";

const ACTORS_44 = [
  "Nguyễn Thành Trung",
  "Trần Thị Mỹ Hạnh",
  "Trương Hoàng Trí",
  "Nguyễn Khánh Ngọc",
  "Dương Ngọc Tiến",
  "Phạm Minh Hoàng",
  "Lê Thị Mai Phương",
  "Trần Thị Thu Hà",
  "Đỗ Minh Tuấn",
  "Hoàng Văn Đạt",
  "Vũ Anh Khoa",
  "Bùi Thanh Phong",
  "Đặng Hữu Tài",
  "Ngô Quang Huy",
  "Lê Thị Hồng Nhung",
  "Phạm Thùy Linh",
  "Nguyễn Ngọc Mai",
  "Trần Phương Uyên",
  "Võ Quỳnh Trang",
  "Đỗ Thị Lan Anh",
  "Phan Bích Ngọc",
  "Trịnh Kim Ngân",
  "Nguyễn Văn Nam",
  "Trần Đình Trọng",
  "Lê Văn Hải",
  "Phạm Quốc Bảo",
  "Huỳnh Tấn Phát",
  "Đoàn Minh Khang",
  "Lâm Hoài An",
  "Trương Gia Hưng",
  "Vũ Bảo Long",
  "Nguyễn Hoàng Anh",
  "Lê Minh Khôi",
  "Trần Đăng Khoa",
  "Đặng Thị Ngọc Ánh",
  "Hà Thảo Vy",
  "Lý Tuấn Kiệt",
  "Mai Nhật Minh",
  "Chu Thị Diệu Huyền",
  "Hồ Bảo Ngọc",
  "Tống Gia Huy",
  "Cao Thục Quyên",
  "Lương Trọng Nghĩa",
  "Quách Gia Lạc",
];

const WAREHOUSE_TEAM = [
  "Nguyễn Văn Nam",
  "Trần Đình Trọng",
  "Lê Văn Hải",
  "Phạm Quốc Bảo",
  "Đỗ Minh Tuấn",
  "Hoàng Văn Đạt",
  "Vũ Anh Khoa",
  "Bùi Thanh Phong",
  "Đặng Hữu Tài",
  "Ngô Quang Huy",
];

const ECOM_TEAM = [
  "Lê Thị Hồng Nhung",
  "Phạm Thùy Linh",
  "Nguyễn Ngọc Mai",
  "Trần Phương Uyên",
  "Võ Quỳnh Trang",
  "Đỗ Thị Lan Anh",
  "Phan Bích Ngọc",
  "Trịnh Kim Ngân",
];

/**
 * Component hiển thị 1 chữ số với hiệu ứng cuộn xoay 3D (Spin Drum) cực mượt, không giật
 * Dùng Framer Motion AnimatePresence mode="popLayout", chỉ animate khi số thực sự thay đổi
 */
function SpinDigit({ value }: { value: string }) {
  return (
    <div
      className="relative inline-flex h-[1.12em] w-[0.66em] items-center justify-center overflow-hidden text-center select-none"
      style={{ perspective: "1000px" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={value}
          initial={{ y: "100%", rotateX: -60, opacity: 0 }}
          animate={{ y: "0%", rotateX: 0, opacity: 1 }}
          exit={{ y: "-100%", rotateX: 60, opacity: 0 }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            transformOrigin: "50% 50% -30px",
            backfaceVisibility: "hidden",
          }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SepTrungBirthPage() {
  const [isIntro, setIsIntro] = useState(true);
  // stage: 'idle' (chờ click 1) -> 'animating' (đang chảy nước) -> 'ready' (chảy xong, chờ click 2) -> 'exiting'
  const [stage, setStage] = useState<
    "idle" | "animating" | "ready" | "exiting"
  >("idle");

  // Section 2: Timer 10s logic
  const [isSection2Active, setIsSection2Active] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isCounting, setIsCounting] = useState(false);

  // Section 3: Video logic
  const [showVideo, setShowVideo] = useState(false);
  const [showAfterCredits, setShowAfterCredits] = useState(true);
  const [showTunnelGallery, setShowTunnelGallery] = useState(false);
  const [showCenterText, setShowCenterText] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blackWipeRef = useRef<HTMLDivElement>(null);
  const creditsRollRef = useRef<HTMLDivElement>(null);
  const finalMessageRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const introTitleRef = useRef<HTMLHeadingElement>(null);
  const liquidContainerRef = useRef<HTMLDivElement>(null);
  const introSubTextRef = useRef<HTMLParagraphElement>(null);

  // State 2: Lớp nền màu sáng quét mở rộng theo hình tròn từ vị trí con trỏ chuột
  const state2Ref = useRef<HTMLDivElement>(null);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  // Entrance ban đầu: Chữ Picare Client màu trắng tĩnh xuất hiện mượt mà
  useGSAP(
    () => {
      if (!introTitleRef.current) return;

      gsap.fromTo(
        introTitleRef.current,
        {
          opacity: 0,
          y: 16,
          filter: "blur(6px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power2.out",
        },
      );
    },
    { scope: containerRef },
  );

  // Section 2: Sau khi chuyển cảnh xong, delay đúng 0.5s hiển thị số 10
  useEffect(() => {
    if (!isSection2Active) return;

    const timer = setTimeout(() => {
      setShowTimer(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isSection2Active]);

  // Entrance animation cho số 10 khi vừa xuất hiện
  useEffect(() => {
    if (showTimer && timerContainerRef.current) {
      gsap.fromTo(
        timerContainerRef.current,
        {
          opacity: 0,
          scale: 0.9,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power3.out",
        },
      );
    }
  }, [showTimer]);

  // Đếm ngược chậm rãi: mỗi bước chuyển số cách nhau 1.5s
  useEffect(() => {
    if (!isCounting) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCounting(false);
          return 0;
        }
        return prev - 1;
      });
    }, STEP_INTERVAL);

    return () => clearInterval(interval);
  }, [isCounting]);

  // Bắt đầu làm tối màn hình từ từ TỪ SỐ 5 (5 bước x 1.5s = 7.5s)
  // Bằng cách fade out toàn bộ lớp State 2 (#F6F4EF) vào nền đen (bg-black) phía sau:
  // - Nền sáng chuyển dần sang đen cực kỳ mượt mà, không bị nhanh
  // - Chữ số giữ nguyên độ tương phản trên nền kem của nó, ở số 3 và 2 vẫn thấy rất rõ
  // - Đến đúng số 0 thì màn hình mới tối hẳn thành đen tuyệt đối và biến mất hoàn toàn
  useEffect(() => {
    if (countdown === 5 && isCounting) {
      const state2El = state2Ref.current;
      // Từ số 5 về số 0 có đúng 5 bước x 1.5s = 7.5s
      const durationTo0 = (5 * STEP_INTERVAL) / 1000;

      if (state2El) {
        gsap.to(state2El, {
          opacity: 0,
          duration: durationTo0,
          ease: "power1.5.in",
        });
      }
    }
  }, [countdown, isCounting]);

  // Khi đếm về 0 (màn hình tối hoàn tất và chữ biến mất), delay 0.5s bắt đầu video
  useEffect(() => {
    if (countdown === 0 && isSection2Active) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [countdown, isSection2Active]);

  // Khi video bắt đầu: auto play trong bóng tối và chuyển cảnh sáng dần lâu hơn (8.5s)
  useEffect(() => {
    if (!showVideo || !videoRef.current) return;

    const videoEl = videoRef.current;
    videoEl.play().catch(() => {
      // Fallback nếu trình duyệt yêu cầu tương tác thêm cho âm thanh
      videoEl.muted = true;
      videoEl.play();
    });

    // Chuyển cảnh video sáng dần từ bóng tối cho đến khi full sáng (duration 8.5s)
    gsap.fromTo(
      videoEl,
      {
        opacity: 0,
        filter: "brightness(0)",
      },
      {
        opacity: 1,
        filter: "brightness(1)",
        duration: VIDEO_FADE_IN_DURATION,
        ease: "power1.inOut",
      },
    );
  }, [showVideo]);

  // Khi video hết: Khúc màu đen bên trái quẹt sang bên phải thành fullscreen đen, delay rồi mới chạy After Credit
  const handleVideoEnded = () => {
    const wipeEl = blackWipeRef.current;
    const videoEl = videoRef.current;

    if (!wipeEl) {
      setTimeout(() => setShowAfterCredits(true), 3000);
      return;
    }

    // Quét dải màu đen từ bên trái sang toàn màn hình chậm rãi và mượt mà hơn (2.4s)
    const wipeState = { p: 0 };
    gsap.to(wipeState, {
      p: 100,
      duration: 4,
      ease: "power2.inOut",
      onUpdate: () => {
        if (!wipeEl) return;
        const p = wipeState.p;
        // Vát chéo nhẹ ở mép quẹt tạo hiệu ứng điện ảnh mượt mà
        const top = Math.min(100, p * 1.05);
        const bottom = Math.min(100, Math.max(0, p * 1.05 - 5));
        wipeEl.style.clipPath = `polygon(0% 0%, ${top}% 0%, ${bottom}% 100%, 0% 100%)`;
      },
      onComplete: () => {
        // Tắt video
        if (videoEl) {
          videoEl.pause();
          videoEl.style.display = "none";
        }
        // Delay sau khi animation màu đen quẹt xong hoàn toàn: giữ tĩnh lặng trên nền đen rồi mới mở After Credit
        setTimeout(() => {
          setShowAfterCredits(true);
        }, 3000);
      },
    });
  };

  // After-Credit: Tự động cuộn chậm rãi, trang trọng từ dưới lên trên chuẩn điện ảnh
  // Khi logo Powered By cuộn lên khỏi đỉnh màn hình, dải cuộn kết thúc và lớp chữ trung tâm xuất hiện
  useEffect(() => {
    if (!showAfterCredits || !creditsRollRef.current) return;

    const creditsEl = creditsRollRef.current;
    const windowH = window.innerHeight;

    // Đặt vị trí ban đầu hoàn toàn dưới đáy màn hình
    gsap.set(creditsEl, { y: windowH, opacity: 1 });

    // Cuộn hết toàn bộ credits lên qua khỏi đỉnh màn hình
    const targetY = -(creditsEl.scrollHeight + 60);
    const totalDistance = windowH - targetY;
    const speed = 220; // 220px/s cuộn mượt mà
    const duration = totalDistance / speed;

    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        // Logo cuối vừa lên hết màn hình -> hiện ngay chữ ở giữa màn hình (lớp riêng biệt độc lập 100% ở tâm)
        setShowCenterText(true);
        // Sau khi chữ xuất hiện, delay 1s bắt đầu các tấm hình 3D tunnel bay ra từ trong sâu
        setTimeout(() => {
          setShowTunnelGallery(true);
        }, 1000);
      },
    });

    tl.to(creditsEl, {
      y: targetY,
      duration: duration,
      ease: "none",
    });

    return () => {
      tl.kill();
    };
  }, [showAfterCredits]);

  // Click đúp vào màn hình để tua nhanh xem ngay kết quả nếu cần
  const handleSkipCredits = () => {
    if (creditsRollRef.current) {
      gsap.killTweensOf(creditsRollRef.current);
      gsap.set(creditsRollRef.current, {
        y: -(creditsRollRef.current.scrollHeight + 60),
      });
    }
    setShowCenterText(true);
    setShowTunnelGallery(true);
  };

  // Bấm vào bất kỳ đâu trên màn hình Section 2 để bắt đầu đếm ngược
  const handleStartCountdown = () => {
    if (isCounting || countdown <= 0) return;
    setIsCounting(true);
  };

  // Tách 2 chữ số riêng biệt: tens (hàng chục) và units (hàng đơn vị)
  const formattedCountdown = countdown < 10 ? `0${countdown}` : `${countdown}`;
  const tensDigit = formattedCountdown[0];
  const unitsDigit = formattedCountdown[1];

  // Xử lý click ở State 1:
  // Click 1: Chảy nước vàng đa hướng trong chữ
  // Click 2: Quét vòng tròn mở rộng chậm rãi từ vị trí con trỏ chuột sang State 2
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Nếu Section 2 đã kích hoạt, bấm vào màn hình là kích hoạt đếm ngược
    if (isSection2Active) {
      handleStartCountdown();
      return;
    }

    if (stage === "animating" || stage === "exiting") return;

    // CLICK LẦN 2: Làn sóng tròn mở rộng chậm rãi từ đúng tọa độ con trỏ chuột
    if (stage === "ready") {
      setStage("exiting");

      const x = event.clientX;
      const y = event.clientY;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const tl = gsap.timeline({
        onComplete: () => {
          setIsIntro(false);
          setIsSection2Active(true);
        },
      });

      // Lớp State 2 (màu sáng) mở rộng chậm rãi từ tọa độ con trỏ (x, y)
      const waveState = { r: 0 };
      if (state2Ref.current) {
        state2Ref.current.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        state2Ref.current.style.opacity = "1";

        tl.to(waveState, {
          r: maxRadius * 1.05,
          duration: 3.0,
          ease: "power2.inOut",
          onUpdate: () => {
            if (state2Ref.current) {
              state2Ref.current.style.clipPath = `circle(${waveState.r}px at ${x}px ${y}px)`;
            }
          },
        });
      }

      return;
    }

    // CLICK LẦN 1: Kích hoạt dòng nước chảy đa hướng trong chữ
    if (stage === "idle") {
      setStage("animating");

      const tl = gsap.timeline({
        onComplete: () => {
          setStage("ready");
        },
      });

      if (liquidContainerRef.current) {
        tl.set(liquidContainerRef.current, { opacity: 1 });
      }

      const fluidState = { p: 0 };

      // Chạy animation chậm rãi trong 3.6s
      tl.to(fluidState, {
        p: 1,
        duration: 3.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (!liquidContainerRef.current) return;
          const p = fluidState.p;

          const solid = p * 130;
          const fade = solid + 15;

          const maskVal = `
            linear-gradient(to top, rgba(0,0,0,1) ${solid}%, rgba(0,0,0,0) ${fade}%),
            radial-gradient(ellipse 90% 90% at 50% 50%, rgba(0,0,0,1) ${solid * 0.9}%, rgba(0,0,0,0) ${fade}%),
            linear-gradient(125deg, rgba(0,0,0,1) ${solid}%, rgba(0,0,0,0) ${fade}%)
          `;

          liquidContainerRef.current.style.maskImage = maskVal;
          liquidContainerRef.current.style.webkitMaskImage = maskVal;
        },
      });

      // Giữa chừng (giây thứ 1.6), hiện chữ helper mượt mà
      if (introSubTextRef.current) {
        tl.fromTo(
          introSubTextRef.current,
          {
            opacity: 0,
            y: 12,
            filter: "blur(5px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power2.out",
          },
          1.6,
        );
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="font-haffer relative h-screen w-screen cursor-pointer overflow-hidden bg-black text-white select-none"
    >
      {/* SECTION 4: After-Credits cuộn mượt mà như rạp chiếu phim sau khi video quẹt đen xong */}
      {showAfterCredits && (
        <div
          onDoubleClick={handleSkipCredits}
          className="fixed inset-0 z-50 overflow-hidden bg-black text-white select-none"
        >
          {/* Dải cuộn After-Credit: xuất phát hoàn toàn từ dưới đáy màn hình (translateY 100vh) */}
          <div
            ref={creditsRollRef}
            className="absolute top-0 right-0 left-0 mx-auto flex w-full flex-col items-center px-6 will-change-transform sm:px-12 md:px-20"
            style={{ transform: "translateY(100vh)" }}
          >
            {/* Header: Happy Birthday */}
            <div className="mb-28 text-center">
              <h1 className="text-3xl font-normal tracking-tight text-white sm:text-4xl">
                Happy Birthday
              </h1>
            </div>

            {/* SECTION 1: Lên ý tưởng */}
            <div className="mb-28 w-full">
              <h2 className="mb-8 text-center text-[14px] font-normal text-white uppercase">
                Lên Ý Tưởng
              </h2>
              <div className="space-y-4">
                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Đạo diễn
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Khánh Ngọc
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Biên kịch
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Trương Hoàng Trí
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Bộ phận sản xuất
                  </div>
                  <div className="space-y-1 text-left font-normal whitespace-nowrap text-white">
                    <div>Marketing Picare Vietnam</div>
                    <div>IT Picare Vietnam</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Diễn viên */}
            <div className="mb-28 w-full">
              <h2 className="mb-8 text-center text-[14px] font-normal text-white uppercase">
                Diễn Viên
              </h2>
              <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                <div className="text-right font-normal whitespace-nowrap text-white">
                  Thành viên
                </div>
                <div className="text-left">
                  <div className="grid w-fit grid-cols-[max-content_max-content] gap-x-6 gap-y-2.5 font-normal whitespace-nowrap text-white sm:gap-x-8">
                    {ACTORS_44.map((actor, idx) => (
                      <div key={idx}>{actor}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Quay phim */}
            <div className="mb-28 w-full">
              <h2 className="mb-8 text-center text-[14px] font-normal text-white uppercase">
                Quay Phim
              </h2>
              <div className="space-y-6">
                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Đạo diễn hình ảnh
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Trần Thị Thu Hà
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Quay phim chính
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Trương Hoàng Trí
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Team Kho
                  </div>
                  <div className="text-left">
                    <div className="grid w-fit grid-cols-[max-content_max-content] gap-x-6 gap-y-2 font-normal whitespace-nowrap text-white sm:gap-x-8">
                      {WAREHOUSE_TEAM.map((name, idx) => (
                        <div key={idx}>{name}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Team Ecom
                  </div>
                  <div className="text-left">
                    <div className="grid w-fit grid-cols-[max-content_max-content] gap-x-6 gap-y-2 font-normal whitespace-nowrap text-white sm:gap-x-8">
                      {ECOM_TEAM.map((name, idx) => (
                        <div key={idx}>{name}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Hậu kỳ & Xử lý hình ảnh */}
            <div className="mb-28 w-full">
              <h2 className="mb-8 text-center text-[14px] font-normal text-white uppercase">
                Hậu Kỳ & Xử Lý Hình Ảnh
              </h2>
              <div className="space-y-4">
                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Dựng phim
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Lê Minh Khôi
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Trợ lý dựng
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Trần Đăng Khoa
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Hiệu ứng
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Nguyễn Hoàng Anh
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Chỉnh màu
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Vũ Bảo Long
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: Sản xuất video & phần mềm */}
            <div className="mb-28 w-full">
              <h2 className="mb-8 text-center text-[14px] font-normal text-white uppercase">
                Sản Xuất Video & Phần Mềm
              </h2>
              <div className="space-y-4">
                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Quản lý sản xuất video
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Đặng Thị Ngọc Ánh
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Quản lý phần mềm
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Dương Ngọc Tiến
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    UI Designer
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Trương Hoàng Trí
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: Special Thanks To */}
            <div className="mb-28 w-full text-center">
              <h2 className="mb-6 text-center text-[14px] font-normal text-white uppercase">
                Special Thanks To
              </h2>
              <div className="mx-auto max-w-2xl rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                <p className="text-[15px] leading-relaxed font-normal text-white">
                  Trước tiên cảm ơn Sếp Hạnh và toàn bộ thành viên đã cùng tụi
                  em tham gia vào chiếc clip nhỏ này và xin gửi lời cảm ơn đặc
                  biệt tới Sếp Trung mặc dù không tham gia nhưng vì Sếp đã tạo
                  ra một gia đình.
                </p>
              </div>
            </div>

            {/* SECTION 7: We are from */}
            <div className="mb-28 w-full text-center">
              <h2 className="mb-10 text-center text-[14px] font-normal text-white uppercase">
                We Are From
              </h2>
              {/* 3 hình logo công ty nằm ngang: Picare, Trung Hạnh, Dermacoon (cân bằng kích thước quang học) */}
              <div className="mb-16 flex items-center justify-center gap-10 sm:gap-16">
                <img
                  src={logoPicareNonBg}
                  alt="Picare"
                  className="h-[52px] w-auto object-contain sm:h-[85px]"
                />
                <img
                  src={logoTrungHanhNonBg}
                  alt="Trung Hạnh"
                  className="h-[67px] w-auto object-contain sm:h-[104px]"
                />
                <img
                  src={logoDermacoonNonBg}
                  alt="Dermacoon"
                  className="h-[43px] w-auto object-contain sm:h-[84px]"
                />
              </div>

              <h2 className="mb-10 text-center text-[14px] font-normal text-white uppercase">
                Powered By
              </h2>
              <div className="mb-20 flex items-center justify-center">
                <img
                  src={logoPicareNewBlack}
                  alt="Picare Client"
                  className="h-[43px] w-auto object-contain brightness-0 invert sm:h-[68px]"
                />
              </div>
            </div>
          </div>

          {/* LAYER RIÊNG BIỆT CHO CHỮ "Picare Vietnam" - CỐ ĐỊNH 100% Ở TÂM MÀN HÌNH, NẰM TRÊN CÙNG (Z-50) KHÔNG BAO GIỜ BỊ HÌNH CHE */}
          {showCenterText && (
            <div
              ref={finalMessageRef}
              className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-in fade-in zoom-in-95 duration-700"
            >
              <div className="max-w-4xl px-6 text-center">
                <h1
                  className="text-4xl font-bold tracking-tight text-white select-none sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{
                    textShadow:
                      "0 0 1.5rem rgba(0, 0, 0, 0.95), 0 0 3rem rgba(0, 0, 0, 0.85), 0 0 5rem rgba(0, 0, 0, 0.7), 0 0 25px rgba(255, 163, 54, 0.5)",
                  }}
                >
                  Picare Vietnam
                </h1>
              </div>
            </div>
          )}

          {/* 3D TUNNEL GALLERY COMPONENT (Clone từ https://centered-future-205322.framer.app/)
              Xuất hiện sau khi chữ xuất hiện delay 1s, chiều sâu 3D sâu hun hút, không chạm và không bao giờ che chữ (z-10 < z-50) */}
          {showTunnelGallery && (
            <div className="pointer-events-auto fixed inset-0 z-10 flex items-center justify-center overflow-hidden [perspective:800px] [transform-style:preserve-3d]">
              <style>{`
                @property --translate-z {
                  syntax: '<length>';
                  inherits: false;
                  initial-value: -5000px;
                }
                @keyframes move-3d {
                  0% {
                    opacity: 0;
                    --translate-z: -5000px;
                    transform: translate3d(var(--tx), var(--ty), -5000px) scale(0.35) rotate(var(--rot));
                    filter: brightness(0.4) contrast(0.9);
                  }
                  15% {
                    opacity: 0.95;
                    filter: brightness(0.85);
                  }
                  85% {
                    opacity: 0.95;
                    filter: brightness(1.05);
                  }
                  100% {
                    opacity: 0;
                    --translate-z: 1800px;
                    transform: translate3d(calc(var(--tx) * 1.5), calc(var(--ty) * 1.5), 1800px) scale(1.25) rotate(var(--rot));
                    filter: brightness(1.15);
                  }
                }
                .tunnel-photo {
                  position: absolute;
                  inset: 0;
                  margin: auto;
                  width: fit-content;
                  height: fit-content;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  will-change: transform, opacity;
                  cursor: pointer;
                  opacity: 0;
                  animation: move-3d 16s linear infinite;
                  animation-delay: var(--delay);
                  transition: box-shadow 0.3s ease, border-color 0.3s ease, filter 0.3s ease;
                }
                .tunnel-photo:hover {
                  animation-play-state: paused !important;
                  z-index: 40 !important;
                  box-shadow: 0 0 45px rgba(255, 163, 54, 0.9), 0 0 20px rgba(255, 255, 255, 0.95);
                  border-color: #FFA336 !important;
                  filter: brightness(1.15) contrast(1.05) !important;
                }
              `}</style>

              <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
                {TUNNEL_ITEMS.map((item, index) => (
                  <div
                    key={index}
                    className="tunnel-photo overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/90 shadow-2xl backdrop-blur-sm"
                    style={
                      {
                        "--tx": item.tx,
                        "--ty": item.ty,
                        "--rot": item.rot,
                        "--delay": item.delay,
                      } as React.CSSProperties
                    }
                  >
                    <img
                      src={item.src}
                      alt={`Kỷ niệm ${index + 1}`}
                      className="pointer-events-none block h-auto w-auto max-h-[19rem] max-w-[28rem] select-none rounded-2xl object-contain sm:max-h-[24rem] sm:max-w-[34rem] md:max-h-[28rem] md:max-w-[40rem]"
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Video tự động phát khi tối hoàn tất, sáng dần trong 8.5s */}
      {showVideo && !showAfterCredits && (
        <div className="fixed inset-0 z-40 flex h-screen w-screen items-center justify-center overflow-hidden bg-black select-none">
          {/* Video chính */}
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            playsInline
            onEnded={handleVideoEnded}
            className="h-full w-full object-contain"
            style={{ opacity: 0, filter: "brightness(0)" }}
          />

          {/* Màn đen quét từ bên trái sang toàn màn hình khi video kết thúc */}
          <div
            ref={blackWipeRef}
            className="pointer-events-none absolute inset-0 z-30 bg-black"
            style={{
              clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            }}
          />
        </div>
      )}

      {/* STATE 2: Lớp nền màu sáng #F6F4EF từ 10 xuống 5, bắt đầu tối dần từ 5 về #000000 ở 0 */}
      <div
        ref={state2Ref}
        onClick={handleStartCountdown}
        className="fixed inset-0 z-30 flex h-screen w-screen cursor-pointer flex-col items-center justify-center bg-[#F6F4EF] text-[#161413] opacity-0 select-none"
        style={{
          clipPath: "circle(0px at 0px 0px)",
        }}
      >
        {/* Chỉ hiển thị duy nhất số */}
        {showTimer && !showVideo && (
          <div
            ref={timerContainerRef}
            className="font-haffer flex items-center justify-center text-8xl font-extralight tracking-tight select-none sm:text-9xl md:text-[180px] lg:text-[220px]"
            style={{
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {/* Hàng chục: Xoay lúc 10 -> 09, giữ nguyên 0 lúc 09 -> 08... */}
            <SpinDigit value={tensDigit} />
            {/* Hàng đơn vị: Xoay qua từng số 0 -> 9 -> 8 -> 7... */}
            <SpinDigit value={unitsDigit} />
          </div>
        )}
      </div>

      {/* STATE 1: Intro Overlay màu đen */}
      {isIntro && (
        <div
          ref={introOverlayRef}
          className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden bg-black select-none"
        >
          {/* Trung tâm: Khối chữ Picare Client */}
          <div
            ref={introTextRef}
            className="relative z-10 flex flex-col items-center justify-center px-4 text-center"
          >
            {/* Box chứa 2 lớp: Lớp chữ trắng ban đầu & Lớp chất lỏng vàng chảy đa hướng */}
            <div className="relative flex items-center justify-center">
              {/* Lớp 1 (Gốc): Chữ màu trắng nguyên bản kích thước chuẩn */}
              <h1
                ref={introTitleRef}
                className="font-haffer text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl"
              >
                <span className="font-light italic">Picare</span>{" "}
                <span className="font-normal text-white/90">
                  Client<span className="text-[#FFA336]">.</span>
                </span>
              </h1>

              {/* Lớp 2: Dòng nước màu vàng kim chảy ĐA HƯỚNG */}
              <div
                ref={liquidContainerRef}
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0"
                style={{
                  maskComposite: "add",
                  WebkitMaskComposite: "destination-in",
                }}
              >
                <h1
                  className="font-haffer bg-clip-text text-3xl font-light tracking-[-0.04em] text-transparent drop-shadow-[0_0_20px_rgba(255,163,54,0.65)] select-none sm:text-4xl"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #FF6F00 0%, #FFA336 40%, #FFD074 75%, #FFECC0 100%)",
                  }}
                >
                  <span className="font-light italic">Picare</span>{" "}
                  <span className="font-normal">
                    Client<span className="text-[#FF8D10]">.</span>
                  </span>
                </h1>
              </div>
            </div>

            {/* Dòng chữ ở dưới: Hiện lên trong lúc nước đang chảy */}
            <p
              ref={introSubTextRef}
              className="font-haffer mt-3 text-[12px] font-light text-zinc-400 opacity-0"
            >
              Happy birthday! Cheers to more laughs together.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
