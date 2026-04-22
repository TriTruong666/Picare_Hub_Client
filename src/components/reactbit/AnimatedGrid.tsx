import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const picareProjects = [
  { id: 1, name: "Picare CRM", desc: "Customer Relationship", color: "text-blue-500" },
  { id: 2, name: "Picare HR", desc: "Human Resources", color: "text-emerald-500" },
  { id: 3, name: "Picare Finance", desc: "Accounting & Finance", color: "text-rose-500" },
  { id: 4, name: "Picare OMS", desc: "Order Management", color: "text-amber-500" },
  { id: 5, name: "Picare Chat", desc: "Internal Comms", color: "text-purple-500" },
  { id: 6, name: "Picare Tasks", desc: "Project Management", color: "text-cyan-500" },
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
        duration: 30,
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
          const randomY = gsap.utils.random(-15, 15);
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
            }
          );

          // Cảm giác "tốc độ không đồng đều": cho các thẻ dao động ngang (X-axis)
          const randomX = gsap.utils.random(-20, 20);
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
            }
          );
        });
      }
    },
    { scope: containerRef }
  );

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0, duration: 0.8 });
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setHoveredCardIndex(null);
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.8 });
  };

  return (
    <div
      className="absolute bottom-16 left-0 right-0 z-20 w-full overflow-hidden"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradients for fade out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-48 bg-gradient-to-r from-[#050505] to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-48 bg-gradient-to-l from-[#050505] to-transparent"></div>

      <div className="flex w-max" ref={marqueeRef}>
        {[0, 1, 2].map((setIndex) => (
          <div key={setIndex} className="flex w-max items-center justify-center gap-6 pr-6">
            {picareProjects.map((project, idx) => {
              const globalIdx = setIndex * picareProjects.length + idx;
              const isCardHovered = hoveredCardIndex === globalIdx;
              const isOtherHovered = hoveredCardIndex !== null && hoveredCardIndex !== globalIdx;

              // Đồng bộ index để hover 1 item thì các bản sao cũng phải sáng lên?
              // Logic thông thường là chỉ hover đúng phần tử đó. Nhưng để trông ảo hơn thì ta có thể làm mờ tất cả những cái không đang được hover.
              // Biến globalIdx giúp React xác định duy nhất card.
              
              return (
                <div
                  key={globalIdx}
                  className="floating-card py-10"
                  onMouseEnter={() => setHoveredCardIndex(globalIdx)}
                >
                  <div
                    style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                    className={clsx(
                      "flex h-40 w-64 cursor-pointer flex-col items-center justify-center rounded-[2rem] bg-[#f9fafb] border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500",
                      isCardHovered ? "scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.1)] bg-white" : "",
                      isOtherHovered ? "opacity-40 grayscale-[50%]" : "opacity-100"
                    )}
                  >
                    <span className={clsx("text-2xl font-bold tracking-tight", project.color)}>
                      {project.name}
                    </span>
                    <span className="mt-2 text-[13px] font-medium text-gray-500 uppercase tracking-widest">
                      {project.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
