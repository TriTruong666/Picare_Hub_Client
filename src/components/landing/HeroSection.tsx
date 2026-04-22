import { motion } from "framer-motion";
import DarkVeil from "../reactbit/DarkVeil";
import AnimatedGrid from "../reactbit/AnimatedGrid";

export default function HeroSection() {
  return (
    <section className="relative flex h-[100vh] min-h-[700px] w-full flex-col items-center justify-start overflow-hidden rounded-b-[48px] bg-[#050505] px-6 pt-40 text-center shadow-2xl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      {/* Main Text Content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-bricolage text-4xl leading-[1.1] font-bold tracking-tight text-white md:text-5xl lg:text-[56px]"
        >
          Mọi công cụ bạn cần <br className="hidden md:block" /> hội tụ tại một
          nơi
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-inter mt-6 max-w-xl text-sm leading-relaxed font-light text-white/60 md:mt-8"
        >
          Picare Hub là trung tâm điều hướng đến toàn bộ hệ thống phần mềm nội
          bộ — giúp cải thiện năng suất làm việc của bạn mỗi ngày.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <button className="font-inter rounded-full bg-white px-6 py-2 text-[13px] font-bold text-black transition-all hover:bg-white/90 active:scale-95 shadow-lg">
            Sign up as a Creator
          </button>
          <button className="font-inter rounded-full border border-white/20 bg-white/5 px-6 py-2 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95">
            Sign up as Brand
          </button>
        </motion.div>
      </div>

      {/* Infinite Horizontal UI Cards (Matching Demo) */}
      {/* <AnimatedGrid /> */}

      {/* Bottom Left: Social Links */}
      <div className="font-inter absolute bottom-12 left-12 hidden items-center gap-8 text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase lg:flex">
        {["Instagram", "Linkedin", "X", "TikTok"].map((platform) => (
          <a
            key={platform}
            href="#"
            className="transition-all hover:-translate-y-1 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          >
            {platform}
          </a>
        ))}
      </div>

      {/* Bottom Right: Scroll Down */}
      <div className="absolute right-12 bottom-12 z-20 flex items-center justify-center">
        <motion.button
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
        >
          <svg
            className="transition-transform duration-300 group-hover:translate-y-1"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}
