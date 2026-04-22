import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/images/logo.png";

export default function LandingHeader() {
  const [activeTab, setActiveTab] = useState("Giới thiệu");

  const navItems = [
    { name: "Giới thiệu", hasDropdown: false },
    { name: "Hệ thống", hasDropdown: true },
    { name: "Tính năng", hasDropdown: false },
    { name: "Liên hệ", hasDropdown: false },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 left-0 z-50 w-full px-6 py-4"
    >
      <div className="relative mx-10 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 text-white">
          <img src={logo} alt="" className="h-9 w-9 object-contain" />
          <span className="font-bricolage text-xl font-medium tracking-tight text-white">
            Picare Hub
          </span>
        </div>

        {/* Center: Nav Pill */}
        <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <motion.nav
            initial={{
              clipPath: "inset(0% 50% 0% 50% round 999px)",
              opacity: 0,
            }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 999px)", opacity: 1 }}
            transition={{
              duration: 1.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center rounded-full border border-white/5 bg-neutral-900 p-1"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`font-inter relative flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold transition-colors duration-300 ${
                    isActive ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="bg-primary absolute inset-0 rounded-full"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    {item.name}
                    {item.hasDropdown && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={isActive ? "text-neutral-950/60" : ""}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </motion.nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <button className="font-inter hidden items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white md:flex">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            Vn
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <a
            href="#"
            className="font-inter hidden text-sm text-white/80 transition-colors hover:text-white sm:block"
          >
            Đăng nhập
          </a>
          <Link
            to="/dashboard"
            className="font-inter rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm text-white transition-all hover:bg-white/20"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
