import { useEffect, useRef, useState } from "react";
import RotatingText, {
  type RotatingTextRef,
} from "@/components/reactbit/RotatingText";
import SideRays from "@/components/reactbit/SideRay";

const GREETINGS = ["Xin chao", "Hallo", "Bonjour", "Privet", "Hola"];
const NICKNAMES = [
  "Quynh Nhu",
  "Miboo Nguyen",
  "congchua",
  "boobcatiii",
  "niiiz52",
];

export default function MyPage() {
  const [activeStage] = useState(1);
  const nameRotatingTextRef = useRef<RotatingTextRef>(null);

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

  if (activeStage !== 1) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0">
        <SideRays
          className="h-full w-full"
          rayColor1="#f2d0dc"
          rayColor2="#fff3f7"
          speed={1.1}
          intensity={1.8}
          spread={1.2}
          tilt={-12}
          saturation={1.2}
          blend={0.55}
          falloff={1.9}
          opacity={0.7}
          origin="top-left"
        />
      </div>

      <section className="relative flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-wrap items-center justify-center gap-3 text-center md:gap-5">
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
      </section>
    </main>
  );
}
