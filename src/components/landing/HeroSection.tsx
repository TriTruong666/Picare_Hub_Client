import { motion } from "framer-motion";
import DarkVeil from "../reactbit/DarkVeil";

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
          className="font-bricolage text-5xl leading-[1.05] font-medium tracking-tight text-white md:text-6xl lg:text-[72px]"
        >
          Mọi công cụ bạn cần <br className="hidden md:block" /> hội tụ tại một
          nơi
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-inter mt-6 max-w-xl text-sm font-light text-white/50 md:mt-8 md:text-base"
        >
          Picare Hub là trung tâm điều hướng đến toàn bộ hệ thống phần mềm nội
          bộ — giúp cải thiện năng suất làm việc của bạn mỗi ngày.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="font-inter flex items-center gap-2 rounded-full bg-[#f6d0d9] px-6 py-3.5 text-[15px] font-medium text-[#714f58] transition-colors hover:bg-[#ebc4ce]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Khám phá Hệ sinh thái
          </button>

          <button className="font-inter flex items-center gap-2 rounded-full bg-[#2a3040] px-6 py-3.5 text-[15px] font-medium text-white/90 transition-colors hover:bg-[#343b4f]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Đăng nhập Nội bộ
          </button>
        </motion.div>
      </div>

      {/* Decorative Mockup Area (Placeholder for the mobile/phone mockup in the image) */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-16 flex h-[500px] w-full max-w-[340px] flex-col overflow-hidden rounded-[44px] border-[8px] border-[#1a1a1a] bg-[#f6d0d9] shadow-2xl md:mt-24"
      >
        {/* Fake Phone Notch */}
        <div className="absolute top-0 left-1/2 h-[30px] w-[120px] -translate-x-1/2 rounded-b-[18px] bg-[#1a1a1a]"></div>

        {/* Mock Screen Content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-[#714f58]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
            </svg>
            <span className="font-bricolage text-xl font-bold tracking-tight">
              Picare
            </span>
          </div>
        </div>
      </motion.div>

      {/* Bottom Left: Social Links */}
      <div className="font-inter absolute bottom-10 left-10 hidden items-center gap-6 text-[11px] tracking-[0.15em] text-white/30 uppercase lg:flex">
        <a href="#" className="transition-colors hover:text-white">
          Instagram
        </a>
        <a href="#" className="transition-colors hover:text-white">
          Linkedin
        </a>
        <a href="#" className="transition-colors hover:text-white">
          X
        </a>
        <a href="#" className="transition-colors hover:text-white">
          TikTok
        </a>
      </div>

      {/* Bottom Right: Scroll Down */}
      <div className="absolute right-10 bottom-10 z-20 flex items-center justify-center">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-110">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5" />
          </svg>
        </button>
      </div>
    </section>
  );
}
