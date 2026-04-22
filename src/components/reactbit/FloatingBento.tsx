import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { FiLayers } from "react-icons/fi";
import officeLogo from "@/assets/images/office_logo.png";
import crmLogo from "@/assets/images/crm_logo.png";
import loyaltyLogo from "@/assets/images/loyalty_logo.png";
// Logic cụm:
// 1. Cụm Top-Left
// 2. Cụm Bottom-Left
// 3. Cụm Top-Right
// 4. Cụm Bottom-Right
// Trong mỗi cụm có kết hợp Hình ảnh + Chữ (hoặc Thống kê) nằm so le nhau
const floatingCards = [
  // --- CLUSTER TOP-LEFT ---
  {
    id: 1,
    type: "image",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop",
    className: "absolute top-[12%] left-[12%] w-36 h-36 rounded-lg",
    movement: { x: 15, y: -15 },
    delay: 0.2,
  },
  {
    id: 2,
    type: "text_only",
    text: "OMS",
    font: "font-zoo text-3xl text-[#de3c3c]",
    className: "absolute top-[26%] left-[20%] w-28 h-28 bg-black rounded-md",
    movement: { x: -10, y: 15 },
    delay: 0.5,
  },

  // --- CLUSTER BOTTOM-LEFT ---
  {
    id: 3,
    type: "image",
    src: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=300&auto=format&fit=crop",
    className: "absolute bottom-[14%] left-[14%] w-48 h-48 rounded-lg",
    movement: { x: -25, y: 15 },
    delay: 0.8,
  },
  {
    id: 4,
    type: "image",
    src: officeLogo,
    className: "absolute bottom-[28%] left-[8%] w-24 h-24 rounded-[1rem]",
    movement: { x: 15, y: -20 },
    delay: 0.4,
  },
  {
    id: 8,
    type: "image",
    src: loyaltyLogo,
    className:
      "absolute bottom-[8%] left-[28%] w-29 h-29 bg-purple-100 text-purple-900 rounded-[0.5rem]",
    movement: { x: -10, y: -15 },
    delay: 0.9,
  },

  // --- CLUSTER TOP-RIGHT ---
  {
    id: 6,
    type: "image",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop",
    className: "absolute top-[16%] right-[12%] w-40 h-40 rounded-lg",
    movement: { x: -20, y: -15 },
    delay: 0.6,
  },
  {
    id: 7,
    type: "image",
    src: crmLogo,
    className: "absolute top-[8%] right-[24%] w-28 h-28 rounded-[1rem]",
    movement: { x: 15, y: 20 },
    delay: 0.3,
  },

  // --- CLUSTER BOTTOM-RIGHT ---
  {
    id: 9,
    type: "image",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&auto=format&fit=crop",
    className: "absolute bottom-[10%] right-[10%] w-52 h-52 rounded-[2.5rem]",
    movement: { x: 25, y: 15 },
    delay: 1.2,
  },
];

export default function FloatingBento() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = containerRef.current?.querySelectorAll(".bento-card");
      if (!cards) return;

      cards.forEach((card, i) => {
        const item = floatingCards[i];

        // Tạo chuyển động lơ lửng liên tục (Ambient floating, KHÔNG XOAY)
        gsap.to(card, {
          y: `+=${item.movement.y}`,
          x: `+=${item.movement.x}`,
          duration: gsap.utils.random(4, 7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: gsap.utils.random(0, 2),
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {floatingCards.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: item.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={clsx(
            "absolute",
            item.className
              .split(" ")
              .filter(
                (c) =>
                  c.startsWith("top-") ||
                  c.startsWith("left-") ||
                  c.startsWith("right-") ||
                  c.startsWith("bottom-"),
              )
              .join(" "),
          )}
        >
          <div
            className={clsx(
              "bento-card flex flex-col items-center justify-center overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.15)]",
              item.className
                .split(" ")
                .filter(
                  (c) =>
                    !c.startsWith("top-") &&
                    !c.startsWith("left-") &&
                    !c.startsWith("right-") &&
                    !c.startsWith("bottom-") &&
                    !c.startsWith("absolute"),
                )
                .join(" "),
            )}
          >
            {item.type === "image" && (
              <img
                src={item.src}
                alt="bento"
                className="h-full w-full object-cover"
              />
            )}

            {item.type === "text_only" && (
              <span className={clsx("px-4 text-center", item.font)}>
                {item.text}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
