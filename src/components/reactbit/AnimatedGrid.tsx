import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const squareItems = [
  {
    id: 1,
    type: "text",
    text: "Brand",
    style: "bg-white text-black",
    font: "font-bricolage font-black tracking-tighter text-3xl",
    verticalOffset: "-20px",
    size: "h-36 w-36",
    zIndex: "z-10",
    marginLeft: "0px",
  },
  {
    id: 2,
    type: "image",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop",
    verticalOffset: "40px",
    size: "h-56 w-56",
    zIndex: "z-0",
    marginLeft: "-30px",
  },
  {
    id: 3,
    type: "text",
    text: "CRM",
    style: "bg-blue-100 text-blue-900",
    font: "font-serif italic text-2xl",
    verticalOffset: "-30px",
    size: "h-28 w-28",
    zIndex: "z-20",
    marginLeft: "-20px",
  },
  {
    id: 4,
    type: "image",
    src: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=300&auto=format&fit=crop",
    verticalOffset: "10px",
    size: "h-48 w-48",
    zIndex: "z-10",
    marginLeft: "-40px",
  },
  {
    id: 5,
    type: "text",
    text: "Scale",
    style: "bg-yellow-100 text-yellow-900",
    font: "font-mono font-bold tracking-widest text-lg",
    verticalOffset: "45px",
    size: "h-32 w-32",
    zIndex: "z-30",
    marginLeft: "-20px",
  },
  {
    id: 6,
    type: "image",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop",
    verticalOffset: "-40px",
    size: "h-64 w-64",
    zIndex: "z-0",
    marginLeft: "-60px",
  },
  {
    id: 7,
    type: "text",
    text: "Design",
    style: "bg-rose-100 text-rose-900",
    font: "font-sans font-light text-3xl",
    verticalOffset: "20px",
    size: "h-40 w-40",
    zIndex: "z-20",
    marginLeft: "-40px",
  },
  {
    id: 8,
    type: "text",
    text: "Sync",
    style: "bg-emerald-100 text-emerald-900",
    font: "font-inter font-black italic",
    verticalOffset: "-50px",
    size: "h-32 w-32",
    zIndex: "z-10",
    marginLeft: "-25px",
  },
  {
    id: 9,
    type: "image",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&auto=format&fit=crop",
    verticalOffset: "30px",
    size: "h-52 w-52",
    zIndex: "z-0",
    marginLeft: "-50px",
  },
  {
    id: 10,
    type: "text",
    text: "Growth",
    style: "bg-purple-100 text-purple-900",
    font: "font-bricolage text-[28px] font-medium",
    verticalOffset: "-20px",
    size: "h-36 w-36",
    zIndex: "z-30",
    marginLeft: "-30px",
  },
];

export default function AnimatedGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isHoveredRef = useRef(false);

  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  useGSAP(
    () => {
      if (!marqueeRef.current) return;

      // 1. Infinite Horizontal Loop
      tweenRef.current = gsap.to(marqueeRef.current, {
        xPercent: -33.333333,
        ease: "none",
        duration: 35,
        repeat: -1,
      });

      // 2. Parallax Scroll effect
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (isHoveredRef.current || !tweenRef.current) return;

          const velocity = self.getVelocity();
          const targetTimeScale = 1 + Math.abs(velocity) / 500;

          gsap.to(tweenRef.current, {
            timeScale: Math.min(targetTimeScale, 4),
            duration: 0.2,
            overwrite: "auto",
          });

          gsap.to(tweenRef.current, {
            timeScale: 1,
            duration: 1,
            delay: 0.2,
            overwrite: "auto",
          });
        },
      });

      // 3. Floating Effect & Non-Linear effect
      const cards = containerRef.current?.querySelectorAll(".floating-card");
      if (cards) {
        cards.forEach((card) => {
          // Dao động Y (Floating) để tạo cảm giác trôi lơ lửng
          const randomY = gsap.utils.random(-25, 25);
          const randomDurationY = gsap.utils.random(2.5, 4);

          gsap.fromTo(
            card,
            { y: -randomY },
            {
              y: randomY,
              duration: randomDurationY,
              delay: gsap.utils.random(0, 2),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            },
          );

          // Cảm giác "tốc độ không đồng đều": cho các thẻ dao động ngang (X-axis)
          const randomX = gsap.utils.random(-15, 15);
          gsap.fromTo(
            card,
            { x: -randomX },
            {
              x: randomX,
              duration: gsap.utils.random(3, 6),
              delay: gsap.utils.random(0, 2),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            },
          );
        });
      }
    },
    { scope: containerRef },
  );

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (tweenRef.current)
      gsap.to(tweenRef.current, { timeScale: 0, duration: 0.8 });
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setHoveredCardIndex(null);
    if (tweenRef.current)
      gsap.to(tweenRef.current, { timeScale: 1, duration: 0.8 });
  };

  return (
    <div
      className="absolute right-0 bottom-[10%] left-0 z-20 w-full overflow-hidden"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradients for fade out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-48 bg-linear-to-r from-[#050505] to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-48 bg-linear-to-l from-[#050505] to-transparent"></div>

      <div className="flex w-max items-center py-20" ref={marqueeRef}>
        {[0, 1, 2].map((setIndex) => (
          <div
            key={setIndex}
            className="flex w-max items-center justify-center pr-10"
          >
            {squareItems.map((item, idx) => {
              const globalIdx = setIndex * squareItems.length + idx;
              const isCardHovered = hoveredCardIndex === globalIdx;
              const isOtherHovered =
                hoveredCardIndex !== null && hoveredCardIndex !== globalIdx;

              const baseClasses = clsx(
                "cursor-pointer transition-all duration-500 will-change-transform flex rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.2)] overflow-hidden shrink-0",
                item.size,
                isCardHovered
                  ? "scale-110 shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
                  : "",
                isOtherHovered ? "opacity-30 grayscale-[60%]" : "opacity-100",
              );

              return (
                <div
                  key={globalIdx}
                  className={clsx(
                    "floating-card relative",
                    isCardHovered ? "z-50" : item.zIndex,
                  )}
                  onMouseEnter={() => setHoveredCardIndex(globalIdx)}
                  style={{
                    marginTop: item.verticalOffset,
                    marginLeft:
                      idx === 0 && setIndex === 0 ? "0px" : item.marginLeft,
                  }}
                >
                  {item.type === "text" && (
                    <div
                      className={clsx(
                        baseClasses,
                        "items-center justify-center",
                        item.style,
                      )}
                    >
                      <span className={clsx("text-center", item.font)}>
                        {item.text}
                      </span>
                    </div>
                  )}

                  {item.type === "image" && (
                    <div className={baseClasses}>
                      <img
                        src={item.src}
                        alt="random grid"
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.15]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
