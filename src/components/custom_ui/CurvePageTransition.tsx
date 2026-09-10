import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

export interface TransitionOptions {
  text?: string;
  subtext?: string;
  color?: string;
}

export interface CurveTransitionContextValue {
  navigateWithTransition: (to: string, options?: TransitionOptions) => void;
  triggerTransition: (
    onCovered?: () => void,
    options?: TransitionOptions,
  ) => void;
}

const CurveTransitionContext =
  createContext<CurveTransitionContextValue | null>(null);

export function useCurveTransition() {
  const context = useContext(CurveTransitionContext);
  if (!context) {
    throw new Error(
      "useCurveTransition must be used within a CurveTransitionProvider",
    );
  }
  return context;
}

// 12-number matching SVG path templates for 100% reliable GSAP string interpolation
const PATH_INITIAL = "M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z";
const PATH_CURVE_ENTER = "M 0 0 Q 50 -25 100 0 L 100 100 Q 50 100 0 100 Z";
const PATH_COVERED = "M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z";
const PATH_CURVE_EXIT = "M 0 0 Q 50 0 100 0 L 100 0 Q 50 -25 0 0 Z";
const PATH_EXITED = "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z";

export function CurveTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [transitionText, setTransitionText] = useState("Picare Client");
  const [transitionSubtext, setTransitionSubtext] = useState<
    string | undefined
  >(undefined);
  const [transitionColor, setTransitionColor] = useState("#000000");

  const onCoveredCallbackRef = useRef<(() => void) | null>(null);

  const triggerTransition = useCallback(
    (onCovered?: () => void, options?: TransitionOptions) => {
      setTransitionText(options?.text || "Picare Client");
      setTransitionSubtext(options?.subtext);
      setTransitionColor(options?.color || "#000000");
      onCoveredCallbackRef.current = onCovered || null;
      setIsActive(true);
    },
    [],
  );

  const navigateWithTransition = useCallback(
    (to: string, options?: TransitionOptions) => {
      triggerTransition(() => {
        navigate(to);
      }, options);
    },
    [navigate, triggerTransition],
  );

  const handleCovered = useCallback(() => {
    if (onCoveredCallbackRef.current) {
      onCoveredCallbackRef.current();
      onCoveredCallbackRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return (
    <CurveTransitionContext.Provider
      value={{
        navigateWithTransition,
        triggerTransition,
      }}
    >
      {children}
      <CurvePageTransition
        isActive={isActive}
        text={transitionText}
        subtext={transitionSubtext}
        color={transitionColor}
        onCovered={handleCovered}
        onComplete={handleComplete}
      />
    </CurveTransitionContext.Provider>
  );
}

export interface CurvePageTransitionProps {
  isActive: boolean;
  text?: string;
  subtext?: string;
  color?: string;
  onCovered?: () => void;
  onComplete?: () => void;
}

export default function CurvePageTransition({
  isActive,
  text = "Picare Client",
  subtext,
  color = "#000000",
  onCovered,
  onComplete,
}: CurvePageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    const path = pathRef.current;
    const textEl = textRef.current;
    if (!container || !path) return;

    // Hiển thị overlay trước khi chạy timeline
    container.style.display = "block";
    container.style.pointerEvents = "all";

    // Khởi tạo vị trí ban đầu
    gsap.set(path, { attr: { d: PATH_INITIAL } });
    if (textEl) {
      gsap.set(textEl, { opacity: 0, y: 20, filter: "blur(4px)" });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        container.style.display = "none";
        container.style.pointerEvents = "none";
        // Reset lại path cho lần sau
        gsap.set(path, { attr: { d: PATH_INITIAL } });
        onComplete?.();
      },
    });

    // GIAI ĐOẠN 1: Curve vuốt từ dưới lên trên màn hình (Elastic curve swipe in) - tốc độ nhanh, gọn
    tl.to(path, {
      attr: { d: PATH_CURVE_ENTER },
      duration: 0.52,
      ease: "power2.in",
    })
      // Đạt trạng thái phẳng bao phủ 100% màn hình màu đen
      .to(path, {
        attr: { d: PATH_COVERED },
        duration: 0.28,
        ease: "power1.out",
        onComplete: () => {
          // Điểm giữa: Toàn màn hình đã phủ đen -> chuyển content/route bên dưới
          onCovered?.();
        },
      });

    // HIỂN THỊ CHỮ: Text xuất hiện sớm ngay khi curve đang quét lên
    if (textEl) {
      tl.to(
        textEl,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.32,
          ease: "power2.out",
        },
        "-=0.42",
      )
        // Giữ chữ vừa vặn, biến mất dứt khoát
        .to(textEl, {
          opacity: 0,
          y: -14,
          filter: "blur(4px)",
          duration: 0.24,
          ease: "power2.in",
          delay: 0.3,
        });
    }

    // GIAI ĐOẠN 2: Curve vuốt thoát lên trên mở ra trang mới (Curve swipe out)
    tl.to(
      path,
      {
        attr: { d: PATH_CURVE_EXIT },
        duration: 0.5,
        ease: "power2.in",
      },
      textEl ? "-=0.08" : "+=0.1",
    ).to(path, {
      attr: { d: PATH_EXITED },
      duration: 0.3,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
    };
  }, [isActive, onCovered, onComplete]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999999] hidden overflow-hidden select-none"
    >
      {/* SVG Canvas toàn màn hình với curve path morphing */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path ref={pathRef} fill={color} d={PATH_INITIAL} />
      </svg>

      {/* Trung tâm: Text Picare Client hoặc tên Client */}
      <div
        ref={textRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-2.5">
          <h1 className="font-haffer text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl">
            {text === "Picare Client" ? (
              <>
                <span className="font-light italic">Picare</span>{" "}
                <span className="font-normal text-white/90">
                  Client<span className="text-[#FFA336]">.</span>
                </span>
              </>
            ) : (
              <span className="font-normal text-white/90">
                {text}
                <span className="text-[#FFA336]">.</span>
              </span>
            )}
          </h1>
        </div>
        <p className="font-haffer mt-2 text-[12px] font-light text-zinc-400">
          {subtext || "Do more for better life"}
        </p>
      </div>
    </div>
  );
}
