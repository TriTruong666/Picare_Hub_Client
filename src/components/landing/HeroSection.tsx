import { motion } from "framer-motion";
import { FiPlay, FiChevronRight, FiArrowDown, FiZap } from "react-icons/fi";
import FloatingBento from "../reactbit/FloatingBento";
import DarkVeil from "../reactbit/DarkVeil";
import AnimatedGrid from "../reactbit/AnimatedGrid";

export default function HeroSection() {
  return (
    <section className="relative flex h-[100vh] min-h-[700px] w-full flex-col items-center justify-start overflow-hidden rounded-b-[48px] bg-[#050505] px-6 pt-50 text-center shadow-2xl">
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
        {/* Simplified Pill: Smart Tools & Real Growth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex items-center gap-2 rounded-full bg-[#1a1a1a]/80 px-4 py-2 text-white shadow-lg backdrop-blur-md"
        >
          <FiZap size={14} className="text-white opacity-90" />
          <span className="font-inter text-xs font-medium tracking-wide uppercase opacity-90">
            Smart Tools & Real Growth
          </span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-5xl leading-[1.1] font-medium tracking-tight text-white"
        >
          Mọi công cụ bạn cần <br className="hidden md:block" /> hội tụ tại một
          nơi
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-lg font-sans text-sm leading-relaxed font-light text-white/60 md:mt-8"
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
          <button
            type="button"
            className="font-inter cursor-pointer rounded-full bg-white px-6 py-2 text-[13px] font-bold text-black shadow-lg transition-all hover:bg-white/90 active:scale-95"
          >
            Sign up as a Creator
          </button>

          <button
            type="button"
            className="font-inter cursor-pointer rounded-full border border-white/20 bg-white/5 px-6 py-2 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
          >
            Sign up as Brand
          </button>
        </motion.div>
      </div>

      {/* Scattered Floating Cards Background around the Hero section */}
      <FloatingBento />

      {/* Bottom Left: Social Links */}
      <div className="font-inter absolute bottom-12 left-12 hidden items-center gap-8 text-[11px] font-light tracking-[0.2em] text-white/40 uppercase lg:flex">
        {["Instagram", "Linkedin", "X", "TikTok"].map((platform) => (
          <a
            key={platform}
            href="#"
            className="transition-all duration-500 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
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
          <FiArrowDown
            size={20}
            strokeWidth={2.5}
            className="transition-transform duration-300 group-hover:translate-y-1"
          />
        </motion.button>
      </div>
    </section>
  );
}
