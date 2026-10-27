import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolume1,
  FiVolumeX,
  FiMaximize2,
  FiMinimize2,
  FiRotateCcw,
  FiRotateCw,
} from "react-icons/fi";

interface SepTrungVideoPlayerProps {
  src: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  fadeInDuration?: number;
  onEnded: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const SepTrungVideoPlayer: React.FC<SepTrungVideoPlayerProps> = ({
  src,
  videoRef,
  isActive,
  fadeInDuration = 8.5,
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Trạng thái phát
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hiển thị điều khiển
  const [showControls, setShowControls] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [rippleAction, setRippleAction] = useState<"play" | "pause" | null>(
    null,
  );

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeStartedRef = useRef(false);

  // Khoá điều khiển hoàn toàn ở 30s đầu và 10s cuối của video (không hiện dù di chuột hay bấm)
  const isControlsLocked =
    currentTime < 30 ||
    (duration > 0 && currentTime >= Math.max(30, duration - 10));

  // Tự động ẩn controls sau 2.5s không di chuột (nếu không bị khoá)
  const resetIdleTimer = useCallback(() => {
    if (isControlsLocked) {
      setShowControls(false);
      return;
    }
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !isScrubbing) {
      idleTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, isScrubbing, isControlsLocked]);

  const handleMouseMove = () => {
    if (isControlsLocked) {
      if (showControls) setShowControls(false);
      return;
    }
    resetIdleTimer();
  };

  const handleMouseLeave = () => {
    if (isPlaying && !isScrubbing) {
      setShowControls(false);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Xử lý fade-in cinematic khi video bắt đầu bung frame thực tế
  useEffect(() => {
    if (!isActive || !videoRef.current) return;
    const videoEl = videoRef.current;

    const startFadeIn = () => {
      if (fadeStartedRef.current) return;
      fadeStartedRef.current = true;
      gsap.fromTo(
        videoEl,
        {
          opacity: 0,
          filter: "brightness(0)",
        },
        {
          opacity: 1,
          filter: "brightness(1)",
          duration: fadeInDuration,
          ease: "power1.inOut",
        },
      );
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      startFadeIn();
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleSeeking = () => {
      setIsBuffering(true);
    };

    const handleSeeked = () => {
      setIsBuffering(false);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);

      if (pendingSeekTimeRef.current !== null) {
        const nextTarget = pendingSeekTimeRef.current;
        pendingSeekTimeRef.current = null;
        applyVideoSeek(nextTarget);
      } else {
        isSeekingRef.current = false;
      }
    };

    videoEl.addEventListener("playing", handlePlaying);
    videoEl.addEventListener("waiting", handleWaiting);
    videoEl.addEventListener("canplay", handleCanPlay);
    videoEl.addEventListener("seeking", handleSeeking);
    videoEl.addEventListener("seeked", handleSeeked);

    // Bắt đầu phát
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay audio blocked, falling back to muted", err);
        videoEl.muted = true;
        setIsMuted(true);
        videoEl.play();
      });
    }

    // Dự phòng an toàn nếu event playing trễ
    const fallbackTimer = setTimeout(() => {
      if (!fadeStartedRef.current && !videoEl.paused) {
        startFadeIn();
      }
    }, 1200);

    return () => {
      videoEl.removeEventListener("playing", handlePlaying);
      videoEl.removeEventListener("waiting", handleWaiting);
      videoEl.removeEventListener("canplay", handleCanPlay);
      videoEl.removeEventListener("seeking", handleSeeking);
      videoEl.removeEventListener("seeked", handleSeeked);
      clearTimeout(fallbackTimer);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    };
  }, [isActive, fadeInDuration, videoRef]);

  // Cập nhật tiến trình phát và buffer (chống giật lùi timeline khi đang tua)
  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (!isDraggingScrubberRef.current && pendingSeekTimeRef.current === null) {
      setCurrentTime(videoEl.currentTime);
    }

    // Tính % buffer đã nạp
    if (videoEl.buffered.length > 0 && videoEl.duration > 0) {
      const bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
      setBufferedPercent((bufferedEnd / videoEl.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    setDuration(videoEl.duration);
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
      setRippleAction("play");
    } else {
      videoEl.pause();
      setIsPlaying(false);
      setRippleAction("pause");
      if (!isControlsLocked) {
        setShowControls(true);
      }
    }

    setTimeout(() => {
      setRippleAction(null);
    }, 600);
  };

  // --- TỐI ƯU HOÁ TUA VIDEO: SINGLE-FLIGHT SEEKING + FASTSEEK ---
  const isSeekingRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingScrubberRef = useRef(false);

  const applyVideoSeek = useCallback(
    (targetTime: number) => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      isSeekingRef.current = true;
      if (
        "fastSeek" in videoEl &&
        typeof (videoEl as unknown as { fastSeek: (t: number) => void })
          .fastSeek === "function"
      ) {
        try {
          (
            videoEl as unknown as { fastSeek: (t: number) => void }
          ).fastSeek(targetTime);
        } catch {
          videoEl.currentTime = targetTime;
        }
      } else {
        videoEl.currentTime = targetTime;
      }

      // Fallback an toàn nếu trình duyệt nuốt mất event seeked
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = setTimeout(() => {
        isSeekingRef.current = false;
        if (pendingSeekTimeRef.current !== null) {
          const next = pendingSeekTimeRef.current;
          pendingSeekTimeRef.current = null;
          applyVideoSeek(next);
        }
      }, 350);
    },
    [videoRef],
  );

  const performSeek = useCallback(
    (targetTime: number) => {
      const videoEl = videoRef.current;
      if (!videoEl || !duration) return;

      const boundedTime = Math.max(0, Math.min(duration, targetTime));
      // Cập nhật state UI ngay tức khắc để mượt 60fps
      setCurrentTime(boundedTime);

      if (isSeekingRef.current) {
        pendingSeekTimeRef.current = boundedTime;
        return;
      }

      applyVideoSeek(boundedTime);
    },
    [duration, videoRef, applyVideoSeek],
  );

  // Tua thời gian (khoá khi ở 30s đầu hoặc 10s cuối)
  const seekBy = (offset: number) => {
    if (isControlsLocked) return;
    const videoEl = videoRef.current;
    if (!videoEl || !duration) return;
    const currentBase = pendingSeekTimeRef.current ?? videoEl.currentTime;
    const target = Math.max(0, Math.min(duration, currentBase + offset));
    performSeek(target);
    resetIdleTimer();
  };

  // Volume & Mute
  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const nextMuted = !isMuted;
    videoEl.muted = nextMuted;
    setIsMuted(nextMuted);
    resetIdleTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.volume = newVol;
    setVolume(newVol);
    if (newVol === 0) {
      videoEl.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoEl.muted = false;
      setIsMuted(false);
    }
    resetIdleTimer();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Không thể mở toàn màn hình", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Không thể thoát toàn màn hình", err);
      });
    }
    resetIdleTimer();
  };

  // Scrubber scrubbing logic (kéo thả mượt mà không khựng hình)
  const calculateTimeFromEvent = useCallback(
    (clientX: number): number | null => {
      const bar = progressBarRef.current;
      if (!bar || !duration) return null;
      const rect = bar.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      return (clickX / rect.width) * duration;
    },
    [duration],
  );

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isControlsLocked) return;
    isDraggingScrubberRef.current = true;
    setIsScrubbing(true);
    const newTime = calculateTimeFromEvent(e.clientX);
    if (newTime !== null) {
      performSeek(newTime);
    }
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isControlsLocked) {
      setHoverTime(null);
      return;
    }
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const timeAtHover = (hoverX / rect.width) * duration;
    setHoverTime(timeAtHover);
    setHoverPosition(hoverX);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  // Kéo thả scrubber toàn màn hình
  useEffect(() => {
    if (!isScrubbing) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingScrubberRef.current) return;
      const newTime = calculateTimeFromEvent(e.clientX);
      if (newTime !== null) {
        performSeek(newTime);
      }
    };

    const handleWindowMouseUp = () => {
      isDraggingScrubberRef.current = false;
      setIsScrubbing(false);
      resetIdleTimer();
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isScrubbing, calculateTimeFromEvent, performSeek, resetIdleTimer]);

  // Kết thúc video: chuyển cảnh tối dần (fade to black) mềm mại 4s
  const handleInternalEnded = () => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      onEnded();
      return;
    }

    gsap.to(videoEl, {
      opacity: 0,
      filter: "brightness(0)",
      duration: 4.0,
      ease: "power2.inOut",
      onComplete: () => {
        if (videoEl) {
          videoEl.pause();
        }
        setTimeout(() => {
          onEnded();
        }, 1500);
      },
    });
  };

  // Phím tắt bàn phím
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekBy(-5);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekBy(5);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isPlaying, isMuted, duration]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-black select-none"
    >
      {/* Thẻ Video chính */}
      <video
        ref={videoRef}
        src={src}
        preload="auto"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleInternalEnded}
        className="h-full w-full cursor-pointer object-contain"
        onClick={togglePlay}
        style={{ opacity: 0, filter: "brightness(0)" }}
      />

      {/* SPINNER HIỂN THỊ KHI BỊ BUFFER / LAG */}
      <AnimatePresence>
        {isBuffering && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-5 py-2.5 shadow-2xl backdrop-blur-md">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span className="text-xs font-medium text-white/90">
                Đang tải...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ICON RIPPLE POP KHI BẤM PLAY / PAUSE Ở GIỮA MÀN HÌNH */}
      <AnimatePresence>
        {rippleAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white shadow-2xl backdrop-blur-md">
              {rippleAction === "play" ? (
                <FiPlay className="ml-1 text-3xl" />
              ) : (
                <FiPause className="text-3xl" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BỘ ĐIỀU KHIỂN TỐI GIẢN (MINIMALIST CINEMATIC CONTROLS - KHOÁ Ở 30s ĐẦU & 10s CUỐI) */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pt-16 pb-4 transition-opacity duration-500 sm:px-8 sm:pb-6 ${
          (showControls || !isPlaying) && !isControlsLocked
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto flex flex-col gap-3">
          {/* THANH TIMELINE / SCRUBBER */}
          <div
            ref={progressBarRef}
            onMouseDown={handleScrubberMouseDown}
            onMouseMove={handleScrubberMouseMove}
            onMouseLeave={handleScrubberMouseLeave}
            className="group/bar relative flex h-4 w-full cursor-pointer items-center select-none"
          >
            {/* Tooltip thời gian khi hover trên thanh scrubber */}
            {hoverTime !== null && (
              <div
                className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-black/80 px-2 py-0.5 font-mono text-[11px] text-white/90 shadow backdrop-blur-sm"
                style={{ left: `${hoverPosition}px` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}

            {/* Track nền */}
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-all duration-200 group-hover/bar:h-2">
              {/* Buffer bar (phần trăm đã tải xong vào RAM) */}
              <div
                className="absolute inset-y-0 left-0 bg-white/35 transition-all duration-300"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Tiến trình phát hiện tại */}
              <div
                className="absolute inset-y-0 left-0 bg-white"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Nút Scrubber Thumb */}
            <div
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-lg transition-transform duration-150 group-hover/bar:scale-125"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* CÁC NÚT ĐIỀU KHIỂN */}
          <div className="flex items-center justify-between text-white/90">
            {/* Cụm bên trái: Play/Pause, Tua 10s, Đồng hồ thời gian */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
              >
                {isPlaying ? (
                  <FiPause size={17} />
                ) : (
                  <FiPlay size={17} className="ml-0.5" />
                )}
              </button>

              {/* Nút tua lùi 10s */}
              <button
                type="button"
                onClick={() => seekBy(-10)}
                aria-label="Tua lùi 10 giây"
                title="Tua lùi 10 giây"
                className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <FiRotateCcw size={16} />
                <span className="absolute -bottom-1 text-[9px] font-semibold tracking-tighter">
                  10
                </span>
              </button>

              {/* Nút tua tới 10s */}
              <button
                type="button"
                onClick={() => seekBy(10)}
                aria-label="Tua tới 10 giây"
                title="Tua tới 10 giây"
                className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <FiRotateCw size={16} />
                <span className="absolute -bottom-1 text-[9px] font-semibold tracking-tighter">
                  10
                </span>
              </button>

              {/* Đồng hồ thời gian */}
              <div className="ml-1 font-mono text-xs tracking-tight text-white/70 select-none">
                <span className="text-white/95">{formatTime(currentTime)}</span>
                <span className="mx-1 text-white/40">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Cụm bên phải: Âm lượng, Toàn màn hình */}
            <div className="flex items-center gap-3">
              {/* Cụm âm lượng với slider mở rộng */}
              <div className="group/vol flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <FiVolumeX size={18} />
                  ) : volume < 0.5 ? (
                    <FiVolume1 size={18} />
                  ) : (
                    <FiVolume2 size={18} />
                  )}
                </button>

                <div className="hidden w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-20 sm:block">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-20 cursor-pointer accent-white"
                    aria-label="Điều chỉnh âm lượng"
                  />
                </div>
              </div>

              {/* Nút toàn màn hình */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"
                }
                title={
                  isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"
                }
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {isFullscreen ? (
                  <FiMinimize2 size={17} />
                ) : (
                  <FiMaximize2 size={17} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
