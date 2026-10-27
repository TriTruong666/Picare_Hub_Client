import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import { SepTrungVideoPlayer } from "./SepTrungVideoPlayer";
import logoPicareNonBg from "@/assets/images/logo_picare_nonbg.png";
import logoTrungHanhNonBg from "@/assets/images/logo_trunghanh_nonbg.png";
import logoDermacoonNonBg from "@/assets/images/logo_dermacoon_nonbg.png";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import { TUNNEL_ITEMS } from "./SepTrungTunnelData";

gsap.registerPlugin(useGSAP);

// Hỗ trợ cả hình ảnh và video (.mp4, .webm, .mov hoặc gán type: 'video')
const isMediaVideo = (src: string, type?: "video" | "image") => {
  if (type === "video") return true;
  if (type === "image") return false;
  return /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(src);
};

const STEP_INTERVAL = 1500; // 1.5s cho mỗi nhịp đếm
const VIDEO_FADE_IN_DURATION = 8.5; // Video sáng dần chậm rãi hơn (8.5s)
const VIDEO_SRC =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1793127884749_7ff9e3c0-34a7-4b6e-9b4a-9dcb49a1716b_finalweb.mp4";

const ACTORS_44 = [
  "Lê Thị Bích Hạnh",
  "Trương Hoàng Trí",
  "Nguyễn Viết Khánh Ngọc",
  "Dương Ngọc Tiến",
  "Lương Việt Anh",
  "Võ Thị Tiên",
  "Nguyễn Trọng Danh",
  "Nguyễn Đặng Minh Tú",
  "Trương Nguyễn Mạnh Tưởng",
  "Nguyễn Thị Thanh Xiếu",
  "Nguyễn Lê Hoài Thương",
  "Giang Anh Thư",
  "Lê Phạm Thị Ngọc Hiếu",
  "Lê Thị Hương Giang",
  "Nguyễn Bảo Quang",
  "Bùi Phạm Mỹ Duyên",
  "Diệp Thái Nhật Nguyên",
  "Trần Thị Thanh Thương",
  "Nguyễn Mộng Bích",
  "Huỳnh Thị Bạch Tuyết Nhung",
  "Phạm Thị Xuân Trang",
  "Phan Ngọc Thảo Nguyên",
];

const WAREHOUSE_TEAM = [
  "Đào Cao Thành",
  "Phan Ngọc Thảo Nguyên",
  "Phạm Ngọc Hằng",
];

const ECOM_TEAM = [
  "Lương Việt Anh",
  "Võ Thị Tiên",
  "Nguyễn Trọng Danh",
  "Nguyễn Đặng Minh Tú",
  "Trương Nguyễn Mạnh Tưởng",
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
  // stage: 'idle' (sẵn sàng click) -> 'exiting' (đang quét vòng tròn sang Section 2)
  const [stage, setStage] = useState<"idle" | "exiting">("idle");

  // Section 2: Timer 10s logic
  const [isSection2Active, setIsSection2Active] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isCounting, setIsCounting] = useState(false);

  // Section 3: Video logic
  const [showVideo, setShowVideo] = useState(false);
  const [showAfterCredits, setShowAfterCredits] = useState(false);
  const [showTunnelGallery, setShowTunnelGallery] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const creditsRollRef = useRef<HTMLDivElement>(null);
  const finalMessageRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const introLogosRef = useRef<HTMLDivElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const introTitleRef = useRef<HTMLHeadingElement>(null);
  const introSubTextRef = useRef<HTMLParagraphElement>(null);

  // State 2: Lớp nền màu sáng quét mở rộng theo hình tròn từ vị trí con trỏ chuột
  const state2Ref = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Âm thanh tíc tắc cơ học chân thực, âm lượng nhỏ dần về các số cuối
  const playClockTick = useCallback((step: number) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // Giảm dần âm lượng khi tiến gần về 0 (từ 5 về 1, số 0 tắt hẳn)
      let volumeMultiplier = 1;
      if (step <= 0) return;
      if (step === 5) volumeMultiplier = 0.75;
      else if (step === 4) volumeMultiplier = 0.5;
      else if (step === 3) volumeMultiplier = 0.3;
      else if (step === 2) volumeMultiplier = 0.15;
      else if (step === 1) volumeMultiplier = 0.05;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
      masterGain.connect(ctx.destination);

      const isTick = step % 2 === 0; // Chẵn: "Tíc" (pitch cao hơn), Lẻ: "Tắc" (pitch trầm hơn)

      // 1. Tiếng va chạm cơ học bánh răng đồng hồ (transient bandpass noise)
      const bufferSize = Math.floor(ctx.sampleRate * 0.012);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(isTick ? 3200 : 2500, now);
      noiseFilter.Q.setValueAtTime(2.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noise.start(now);
      noise.stop(now + 0.015);

      // 2. Độ vang cộng hưởng âm thoa / buồng máy (resonant body tone)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "sine";
      const startFreq = isTick ? 1150 : 850;
      const endFreq = isTick ? 620 : 440;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

      oscGain.gain.setValueAtTime(0.65, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio context không khả dụng hoặc bị chặn bởi chính sách bảo mật
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  // Entrance ban đầu: Toàn bộ chữ và logo xuất hiện mượt mà ngay từ đầu
  useGSAP(
    () => {
      if (introLogosRef.current) {
        gsap.fromTo(
          introLogosRef.current,
          {
            opacity: 0,
            y: -10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
          },
        );
      }

      if (!introTextRef.current) return;

      gsap.fromTo(
        introTextRef.current,
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

  // Section 2: Sau khi chuyển cảnh sang nền sáng xong, delay 0.5s hiển thị số 10 và TỰ ĐỘNG đếm ngược luôn
  useEffect(() => {
    if (!isSection2Active) return;

    const timer = setTimeout(() => {
      setShowTimer(true);
      // Tự động đếm ngược luôn, không cần người dùng phải bấm thêm lần nào nữa
      setIsCounting(true);
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

  // Đếm ngược chậm rãi: mỗi bước chuyển số cách nhau 1.5s kèm âm thanh tíc tắc
  useEffect(() => {
    if (!isCounting) return;

    // Phát âm thanh nhịp đầu tiên (số 10)
    playClockTick(countdown);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next >= 1) {
          playClockTick(next);
        }
        if (prev <= 1) {
          clearInterval(interval);
          setIsCounting(false);
          return 0;
        }
        return next;
      });
    }, STEP_INTERVAL);

    return () => clearInterval(interval);
  }, [isCounting, playClockTick]);

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

  // Khi đếm về 0 (màn hình tối hoàn tất và chữ biến mất), delay 1.0s tĩnh lặng hoàn toàn trong bóng tối trước khi bắt đầu video
  useEffect(() => {
    if (countdown === 0 && isSection2Active) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [countdown, isSection2Active]);

  // Khi video kết thúc hoàn tất: Chuyển sang phần After-Credit
  const handleVideoEnded = () => {
    setShowAfterCredits(true);
  };

  // After-Credit: Tự động cuộn chậm rãi, trang trọng từ dưới lên trên chuẩn điện ảnh và neo cụm chữ cuối tại giữa màn hình
  useEffect(() => {
    if (!showAfterCredits || !creditsRollRef.current) return;

    const creditsEl = creditsRollRef.current;
    const finalMsgEl = finalMessageRef.current;
    const windowH = window.innerHeight;

    // Đặt vị trí ban đầu hoàn toàn dưới đáy màn hình
    gsap.set(creditsEl, { y: windowH, opacity: 1 });

    // Tính điểm dừng targetY để chữ "Chúc mừng sinh nhật" neo chính xác tại giữa màn hình (đo trực tiếp h1 và xích nhẹ xuống theo yêu cầu)
    let targetY = -(creditsEl.scrollHeight + 100);
    if (finalMsgEl) {
      const h1El = finalMsgEl.querySelector("h1") || finalMsgEl;
      const creditsTop = creditsEl.getBoundingClientRect().top;
      const h1Top = h1El.getBoundingClientRect().top;
      const h1Offset = h1Top - creditsTop;
      const h1H = h1El.offsetHeight;
      // Tâm của h1 nằm ở giữa màn hình và xích nhẹ xuống (+ 28px) cho vừa vặn tầm nhìn
      targetY = (windowH - h1H) / 2 - h1Offset + 28;
    }

    // Tổng quãng đường từ đáy (y = windowH) đến điểm neo (y = targetY)
    const totalDistance = windowH - targetY;
    const speed = 60; // px/s cuộn êm đềm
    const settleDistance = 100; // 100px cuối cùng hãm phanh nhẹ nhàng vào vị trí neo

    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        setShowTunnelGallery(true);
      },
    });

    if (totalDistance > settleDistance) {
      const linearDistance = totalDistance - settleDistance;
      const linearDuration = linearDistance / speed;
      const settleDuration = 2.0;

      // Giai đoạn 1: Cuộn đều đặn tuyến tính cùng credit
      tl.to(creditsEl, {
        y: targetY + settleDistance,
        duration: linearDuration,
        ease: "none",
      });

      // Giai đoạn 2: Giảm tốc mềm mại, dính và neo vững chắc ở giữa màn hình
      tl.to(creditsEl, {
        y: targetY,
        duration: settleDuration,
        ease: "power2.out",
      });
    } else {
      tl.to(creditsEl, {
        y: targetY,
        duration: totalDistance / speed,
        ease: "power2.out",
      });
    }

    return () => {
      tl.kill();
    };
  }, [showAfterCredits]);

  // Click đúp vào màn hình để tua nhanh xem ngay kết quả nếu cần
  const handleSkipCredits = () => {
    if (creditsRollRef.current) {
      gsap.killTweensOf(creditsRollRef.current);
      const creditsEl = creditsRollRef.current;
      const finalMsgEl = finalMessageRef.current;
      const windowH = window.innerHeight;
      let targetY = -(creditsEl.scrollHeight + 100);
      if (finalMsgEl) {
        const h1El = finalMsgEl.querySelector("h1") || finalMsgEl;
        const creditsTop = creditsEl.getBoundingClientRect().top;
        const h1Top = h1El.getBoundingClientRect().top;
        const h1Offset = h1Top - creditsTop;
        const h1H = h1El.offsetHeight;
        targetY = (windowH - h1H) / 2 - h1Offset + 28;
      }
      gsap.set(creditsEl, { y: targetY });
    }
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
  // Ban đầu hiện hết toàn bộ chữ. Người dùng bấm 1 lần duy nhất để quét vòng tròn mở rộng sang Section 2 (đếm số).
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Nếu Section 2 đã kích hoạt, bấm vào màn hình là kích hoạt đếm ngược
    if (isSection2Active) {
      handleStartCountdown();
      return;
    }

    if (stage === "exiting") return;

    // Bấm 1 lần: Làn sóng tròn mở rộng chậm rãi từ đúng tọa độ con trỏ chuột sang Section 2
    setStage("exiting");

    // Đệm trước dữ liệu video ngay từ khi user click tương tác đầu tiên (tận dụng 18-19s chuyển cảnh & đếm số)
    if (videoRef.current) {
      videoRef.current.load();
    }

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
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="font-haffer relative h-screen w-screen cursor-pointer overflow-hidden bg-black text-white select-none"
    >
      {/* SECTION 4: After-Credits cuộn mượt mà như rạp chiếu phim sau khi video tối dần hoàn tất */}
      {showAfterCredits && (
        <div
          onDoubleClick={handleSkipCredits}
          className="fixed inset-0 z-50 overflow-hidden bg-black text-white select-none"
        >
          {/* Dải cuộn After-Credit: xuất phát hoàn toàn từ dưới đáy màn hình (translateY 100vh) */}
          <div
            ref={creditsRollRef}
            className="absolute top-0 right-0 left-0 z-30 mx-auto flex w-full flex-col items-center px-6 will-change-transform sm:px-12 md:px-20"
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
                    Trương Hoàng Trí
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
                  <div className="grid w-fit grid-cols-1 gap-x-6 gap-y-2.5 font-normal whitespace-nowrap text-white sm:gap-x-8">
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
                    Trương Hoàng Trí
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
                    Hỗ trợ quay
                  </div>
                  <div className="text-left">
                    <div className="grid w-fit grid-cols-1 gap-x-6 gap-y-2 font-normal whitespace-nowrap text-white sm:gap-x-8">
                      {WAREHOUSE_TEAM.map((name, idx) => (
                        <div key={idx}>{name}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Team Kho
                  </div>
                  <div className="text-left">
                    <div className="grid w-fit grid-cols-1 gap-x-6 gap-y-2 font-normal whitespace-nowrap text-white sm:gap-x-8">
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
                    Trương Hoàng Trí
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Trợ lý dựng
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Đào Cao Thành
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Hậu kỳ ảnh
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Trần Khôi Nguyên
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Ánh sáng
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Phan Ngọc Thảo Nguyên
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 items-start gap-x-8 text-[15px] leading-relaxed sm:gap-x-12 md:gap-x-16">
                  <div className="text-right font-normal whitespace-nowrap text-white">
                    Chỉnh màu
                  </div>
                  <div className="text-left font-normal whitespace-nowrap text-white">
                    Phạm Ngọc Hằng
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
                    Trương Hoàng Trí
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
                Lời tri ân tới
              </h2>
              <div className="mx-auto max-w-2xl rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                <p className="text-[15px] leading-relaxed font-normal text-white">
                  Nguyễn Ngọc Phúc, Huỳnh Thị Bạch Tuyết Nhung, Nguyễn Kim Thy,
                  Giang Anh Thư, Lê Nguyễn Thuý Quỳnh, Trần Thị Thanh Thương,
                  Trần Thị Quế Chi, Nguyễn Thị Thanh Xiếu, Phan Thị Nga, Lương
                  Bích Hạnh, Nguyễn Mộng Bích, Nguyễn Thành Trung, Nguyễn Trần
                  Thị Minh Hiền, Võ Thị Tiên, Võ Thị Trường An, Nguyễn Đặng Minh
                  Tú, Võ Văn Tâm
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
              <div className="flex items-center justify-center">
                <img
                  src={logoPicareNewBlack}
                  alt="Picare Client"
                  className="h-[43px] w-auto object-contain brightness-0 invert sm:h-[68px]"
                />
              </div>

              {/* DÒNG CHỮ KẾT THÚC: Đi chung với credit roll, tới giữa màn hình hãm phanh neo lại chuẩn xác */}
              <div
                ref={finalMessageRef}
                className="pointer-events-none relative z-50 mt-[60vh] flex w-full flex-col items-center justify-center text-center"
              >
                <div className="max-w-3xl px-6">
                  <h1
                    className="font-haffer bg-clip-text text-3xl font-normal text-transparent select-none sm:text-4xl"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #FFFDF8 0%, #FFE2B7 25%, #FFA336 55%, #FF8D10 80%, #FFB049 100%)",
                      filter:
                        "drop-shadow(0 0 16px rgba(255, 163, 54, 0.8)) drop-shadow(0 0 35px rgba(255, 141, 16, 0.45)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.95))",
                    }}
                  >
                    From Picare With Love
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* 3D TUNNEL GALLERY COMPONENT */}
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
                  animation: move-3d 28s linear infinite;
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
                {TUNNEL_ITEMS.map((item, index) => {
                  const isVideo = isMediaVideo(item.src, item.type);
                  return (
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
                      {isVideo ? (
                        <video
                          src={item.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                          className="pointer-events-none block h-auto max-h-[19rem] w-auto max-w-[28rem] rounded-2xl object-contain select-none sm:max-h-[24rem] sm:max-w-[34rem] md:max-h-[28rem] md:max-w-[40rem]"
                        />
                      ) : (
                        <img
                          src={item.src}
                          alt={`Kỷ niệm ${index + 1}`}
                          className="pointer-events-none block h-auto max-h-[19rem] w-auto max-w-[28rem] rounded-2xl object-contain select-none sm:max-h-[24rem] sm:max-w-[34rem] md:max-h-[28rem] md:max-w-[40rem]"
                          loading="eager"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Custom Video Player (Preload ngầm, Spinner chống lag, Bộ điều khiển tối giản cinematic) */}
      {!showAfterCredits && (
        <div
          className={`fixed inset-0 z-40 flex h-screen w-screen items-center justify-center overflow-hidden bg-black transition-opacity duration-700 select-none ${
            showVideo
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <SepTrungVideoPlayer
            src={VIDEO_SRC}
            videoRef={videoRef}
            isActive={showVideo}
            fadeInDuration={VIDEO_FADE_IN_DURATION}
            onEnded={handleVideoEnded}
          />
        </div>
      )}

      {/* STATE 2: Lớp nền màu sáng #F6F4EF từ 10 xuống 5, bắt đầu tối dần từ 5 về #000000 ở 0 */}
      <div
        ref={state2Ref}
        onClick={handleStartCountdown}
        className="fixed inset-0 z-30 flex h-screen w-screen cursor-default flex-col items-center justify-center bg-[#F6F4EF] text-[#161413] opacity-0 select-none"
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
          {/* 3 logo ở góc trên bên trái */}
          <div
            ref={introLogosRef}
            className="absolute top-6 left-6 z-20 flex items-center gap-6 sm:top-4 sm:left-10 sm:gap-9"
          >
            <img
              src={logoPicareNonBg}
              alt="Picare"
              className="h-[38px] w-auto object-contain opacity-95 brightness-0 invert transition-all hover:scale-105 sm:h-[52px] md:h-[58px]"
            />
            <img
              src={logoTrungHanhNonBg}
              alt="Trung Hạnh"
              className="h-[50px] w-auto object-contain opacity-95 transition-all hover:scale-105 sm:h-[68px] md:h-[76px]"
            />
            <img
              src={logoDermacoonNonBg}
              alt="Dermacoon"
              className="h-[36px] w-auto object-contain opacity-95 transition-all hover:scale-105 sm:h-[50px] md:h-[66px]"
            />
          </div>

          {/* Trung tâm: Khối chữ Picare Client hiển thị đầy đủ ngay từ đầu */}
          <div
            ref={introTextRef}
            className="relative z-10 flex flex-col items-center justify-center px-4 text-center"
          >
            <h1
              ref={introTitleRef}
              className="font-haffer bg-clip-text text-3xl font-light tracking-[-0.04em] text-transparent text-white drop-shadow-[0_0_20px_rgba(255,163,54,0.65)] select-none sm:text-4xl"
            >
              <span className="font-light italic">Picare</span>{" "}
              <span className="font-normal">
                Client<span className="">.</span>
              </span>
            </h1>

            {/* Dòng chữ ở dưới: Hiển thị đầy đủ ngay từ đầu */}
            <p
              ref={introSubTextRef}
              className="font-haffer mt-3 text-[12px] font-light text-zinc-400"
            >
              Happy birthday! Cheers to more laughs together.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
