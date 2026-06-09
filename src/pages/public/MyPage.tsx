import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import RotatingText, {
  type RotatingTextRef,
} from "@/components/reactbit/RotatingText";
import Beams from "@/components/reactbit/Beams";
import SideRays from "@/components/reactbit/SideRay";

const PROFILE_IMAGE_SRC = "/quynh-nhu-profile.jpg";
const GREETINGS = ["Xin chào", "Hello", "Hallo", "Bonjour"];
const NICKNAMES = [
  "Quỳnh Như",
  "Miboo Nguyen",
  "congchua",
  "boobcatiii",
  "@niiiz52",
];

const PROFILE_DETAILS = [
  { label: "Ngày sinh", value: "08/05/2004" },
  { label: "Biệt danh", value: "Boo" },
  {
    label: "Món ăn",
    value:
      "Matcha latte, ốc len xào dừa, cút lộn xào me, trà sữa Đài Loan trân châu khoai môn và vô vàn món mà ck chưa biết...",
  },
  {
    label: "Đặc điểm",
    value:
      "Xinh (nhất thế giới), lỳ như trâu (số 2 không ai số 1), dăm, tướng nét như Sinbad, thích hoa, đánh liqi ngu.",
  },
];

const STAGES = [
  { id: 1, label: "01", name: "Lời chào" },
  { id: 2, label: "02", name: "Quỳnh Như" },
] as const;

export default function MyPage() {
  const [activeStage, setActiveStage] = useState<1 | 2>(1);
  const [imageFailed, setImageFailed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTargetStage, setTransitionTargetStage] = useState<1 | 2>(1);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRotatingTextRef = useRef<RotatingTextRef>(null);
  const transitionCleanupRef = useRef<gsap.core.Timeline | null>(null);

  const activeStageIndex = useMemo(
    () => STAGES.findIndex((stage) => stage.id === activeStage),
    [activeStage],
  );

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionElement = document.querySelector(
      'meta[name="description"]',
    );
    const previousDescription =
      descriptionElement?.getAttribute("content") ?? "";

    document.title = "Quỳnh Như";
    descriptionElement?.setAttribute(
      "content",
      "Xin chào vk, ck có một bất ngờ nhỏ dành cho vk, vk vào xem đi nhé",
    );

    return () => {
      document.title = previousTitle;
      descriptionElement?.setAttribute("content", previousDescription);
    };
  }, []);

  useEffect(() => {
    const rotationInterval = 4200;
    const startDelay = 1600;
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      nameRotatingTextRef.current?.next();

      intervalId = window.setInterval(() => {
        nameRotatingTextRef.current?.next();
      }, rotationInterval);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    if (isTransitioning) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 28, filter: "blur(10px)", scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power3.out",
        },
      );
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStage]);

  useEffect(() => {
    return () => {
      transitionCleanupRef.current?.kill();
    };
  }, []);

  const handleStageChange = (nextStage: 1 | 2) => {
    if (nextStage === activeStage || isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    setTransitionTargetStage(nextStage);
    transitionCleanupRef.current?.kill();

    gsap.set(overlayRef.current, {
      pointerEvents: "auto",
      opacity: 0,
    });
    gsap.set(overlayTextRef.current, {
      opacity: 0,
      y: 24,
      scale: 0.96,
    });

    const closeTimeline = gsap.timeline({
      onComplete: () => {
        flushSync(() => {
          setActiveStage(nextStage);
        });

        gsap.set(contentRef.current, {
          opacity: 0.08,
          scale: 0.96,
          filter: "blur(16px)",
        });

        const revealTimeline = gsap.timeline({
          onComplete: () => {
            gsap.set(overlayRef.current, {
              pointerEvents: "none",
              opacity: 0,
            });
            setIsTransitioning(false);
          },
        });

        transitionCleanupRef.current = revealTimeline;

        revealTimeline
          .to(
            contentRef.current,
            {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.72,
              ease: "power3.out",
            },
            0.08,
          )
          .to(
            overlayTextRef.current,
            {
              opacity: 0,
              y: -18,
              scale: 1.02,
              duration: 0.28,
              ease: "power2.in",
            },
            0,
          )
          .to(
            overlayRef.current,
            {
              opacity: 0,
              duration: 0.52,
              ease: "power2.out",
            },
            0.16,
          );
      },
    });

    transitionCleanupRef.current = closeTimeline;

    closeTimeline
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.34,
        ease: "power2.out",
      })
      .to(
        contentRef.current,
        {
          scale: 0.94,
          opacity: 0.08,
          filter: "blur(18px)",
          duration: 0.34,
          ease: "power2.inOut",
        },
        0,
      )
      .to(
        overlayTextRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: "power3.out",
        },
        0.08,
      )
      .to({}, { duration: 0.18 });
  };

  const renderStage = () => {
    if (activeStage === 1) {
      return (
        <section className="relative flex min-h-screen items-center justify-center px-6">
          <div
            ref={contentRef}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              <RotatingText
                texts={GREETINGS}
                mainClassName="font-ephesis justify-center overflow-hidden px-1 text-[clamp(2.85rem,7vw,5rem)] leading-none text-white/88"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.04}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{
                  type: "spring",
                  damping: 36,
                  stiffness: 180,
                  mass: 1.1,
                }}
                rotationInterval={4200}
                splitBy="characters"
                auto
                loop
              />

              <RotatingText
                ref={nameRotatingTextRef}
                texts={NICKNAMES}
                mainClassName="font-ephesis inline-flex max-w-full justify-center overflow-hidden px-1 text-[clamp(2.7rem,7.2vw,5.2rem)] leading-none text-[#f6d2df]"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.04}
                splitLevelClassName="overflow-hidden pb-1"
                elementLevelClassName="will-change-transform"
                transition={{
                  type: "spring",
                  damping: 36,
                  stiffness: 180,
                  mass: 1.1,
                }}
                rotationInterval={4200}
                splitBy="characters"
                auto={false}
                loop
              />
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="relative flex min-h-screen items-center px-6 py-14 md:px-10 xl:px-16">
        <div className="absolute inset-0 -z-10 opacity-70">
          <Beams
            beamWidth={2.2}
            beamHeight={16}
            beamNumber={12}
            lightColor="#f6d2df"
            speed={1.25}
            noiseIntensity={1.45}
            scale={0.22}
            rotation={-8}
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(246,210,223,0.14),transparent_30%),linear-gradient(180deg,rgba(5,5,5,0.36),rgba(5,5,5,0.82))]" />

        <div
          ref={contentRef}
          className="mx-auto grid w-full max-w-[92rem] items-center gap-8 lg:grid-cols-[minmax(20rem,0.95fr)_minmax(24rem,1.05fr)] lg:gap-14"
        >
          <div className="order-2 flex flex-col gap-7 lg:order-1">
            <div className="space-y-3">
              <p className="font-ephesis text-[clamp(2.7rem,5vw,4.2rem)] leading-none text-[#f6d2df]/88">
                Boo
              </p>
              <h2 className="font-over text-[66px] leading-[0.88] text-white">
                Nguyễn Quỳnh Như
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
              {PROFILE_DETAILS.map((detail, index) => (
                <div
                  key={detail.label}
                  className={`border-white/10 pb-5 ${
                    index < PROFILE_DETAILS.length - 2
                      ? "border-b"
                      : "border-b md:border-b-0"
                  }`}
                >
                  <p className="mb-2 text-sm leading-6 text-white/34">
                    {detail.label}
                  </p>
                  <p className="text-base leading-7 text-white/86">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[34rem]">
              <div className="absolute -inset-6 rounded-[2.4rem] bg-[radial-gradient(circle_at_top_left,rgba(246,210,223,0.2),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_45%)] blur-2xl" />
              <div className="absolute top-0 left-0 h-full w-px bg-white/10" />
              <div className="absolute right-0 bottom-0 h-px w-full bg-white/10" />

              {imageFailed ? (
                <div className="relative flex aspect-[4/5] items-end overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(255,241,246,0.14),rgba(255,255,255,0.04))] px-7 py-8">
                  <div className="absolute top-6 -left-10 h-28 w-28 rounded-full bg-[#f6d2df]/16 blur-3xl" />
                  <div className="absolute right-4 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                  <div className="relative">
                    <p className="font-ephesis text-5xl leading-none text-[#f6d2df]">
                      Quỳnh Như
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={PROFILE_IMAGE_SRC}
                  alt="Nguyễn Quỳnh Như"
                  className="relative aspect-[4/5] w-full rounded-[2rem] border border-white/8 object-cover object-center shadow-[0_30px_80px_rgba(0,0,0,0.3)]"
                  onError={() => setImageFailed(true)}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {activeStage === 1 && (
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_28%),linear-gradient(180deg,_rgba(5,5,5,0.08)_0%,_rgba(5,5,5,0.22)_36%,_rgba(5,5,5,0.6)_100%)]" />
          <SideRays
            className="h-full w-full"
            rayColor1="#f2d0dc"
            rayColor2="#fff3f7"
            speed={1}
            intensity={1.8}
            spread={1.18}
            tilt={-10}
            saturation={1.15}
            blend={0.5}
            falloff={1.85}
            opacity={0.62}
            origin="top-left"
          />
        </div>
      )}

      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-40 opacity-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,210,223,0.16),transparent_24%),linear-gradient(180deg,rgba(5,5,5,0.96),rgba(5,5,5,1))]" />
        <div
          ref={overlayTextRef}
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
        >
          <span className="font-ephesis text-[clamp(3.5rem,8vw,6rem)] leading-none text-[#f6d2df]">
            {STAGES.find((stage) => stage.id === transitionTargetStage)?.label}
          </span>
          <span className="mt-3 text-base text-white/68">
            {STAGES.find((stage) => stage.id === transitionTargetStage)?.name}
          </span>
        </div>
      </div>

      <div className="relative z-10">{renderStage()}</div>

      <div className="fixed top-1/2 right-5 z-30 -translate-y-1/2">
        <div className="flex flex-col gap-2">
          {STAGES.map((stage) => {
            const isActive = stage.id === activeStage;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageChange(stage.id)}
                disabled={isTransitioning}
                className={`group flex items-center justify-end gap-3 transition-all ${
                  isTransitioning ? "cursor-wait opacity-60" : ""
                }`}
              >
                <span
                  className={`text-sm leading-none transition-opacity ${
                    isActive
                      ? "text-white/78"
                      : "text-white/26 group-hover:text-white/52"
                  }`}
                >
                  {stage.name}
                </span>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm transition-all ${
                    isActive
                      ? "border-[#f6d2df]/38 bg-[#f6d2df]/12 text-[#f6d2df]"
                      : "border-white/12 bg-white/4 text-white/54 group-hover:border-white/24 group-hover:bg-white/7 group-hover:text-white/82"
                  }`}
                >
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() =>
              handleStageChange(
                STAGES[Math.max(activeStageIndex - 1, 0)].id as 1 | 2,
              )
            }
            disabled={activeStageIndex === 0 || isTransitioning}
            className="rounded-full px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Trước
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={() =>
              handleStageChange(
                STAGES[Math.min(activeStageIndex + 1, STAGES.length - 1)].id as
                  | 1
                  | 2,
              )
            }
            disabled={activeStageIndex === STAGES.length - 1 || isTransitioning}
            className="rounded-full px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Sau
          </button>
        </div>
      </div>
    </main>
  );
}
