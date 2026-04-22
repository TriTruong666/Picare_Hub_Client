import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import logo from "@/assets/images/logo.png";
import {
  FiChevronDown,
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiGlobe,
} from "react-icons/fi";

export default function LandingHeader() {
  const [activeTab, setActiveTab] = useState("Giới thiệu");
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsSystemMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Giới thiệu", hasDropdown: false },
    { name: "Hệ thống", hasDropdown: true },
    { name: "Tính năng", hasDropdown: false },
    { name: "Liên hệ", hasDropdown: false },
  ];

  const systemMenuItems = [
    {
      title: "Picare CRM",
      desc: "Quản lý quan hệ khách hàng.",
      icon: <FiUsers size={20} className="text-purple-500" />,
    },
    {
      title: "Picare HR",
      desc: "Quản trị nhân sự & Chấm công.",
      icon: <FiBriefcase size={20} className="text-blue-500" />,
    },
    {
      title: "Picare Finance",
      desc: "Hệ thống quản lý tài chính.",
      icon: <FiDollarSign size={20} className="text-emerald-500" />,
    },
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
        <div
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
          ref={navRef}
        >
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
                <div key={item.name} className="relative">
                  <button
                    onClick={() => {
                      setActiveTab(item.name);
                      if (item.hasDropdown) {
                        setIsSystemMenuOpen(!isSystemMenuOpen);
                      } else {
                        setIsSystemMenuOpen(false);
                      }
                    }}
                    className={`relative flex items-center gap-2 rounded-full px-5 py-2 font-sans text-[13px] font-medium transition-colors duration-300 ${
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
                        <motion.div
                          animate={{
                            rotate:
                              item.hasDropdown && isSystemMenuOpen ? 180 : 0,
                          }}
                          className="flex items-center justify-center"
                        >
                          <FiChevronDown
                            size={14}
                            className={isActive ? "text-white" : ""}
                          />
                        </motion.div>
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
          </motion.nav>

          <AnimatePresence>
            {isSystemMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full left-1/2 mt-4 w-[540px] -translate-x-1/2 rounded-[24px] border border-black/5 bg-white p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
              >
                <div className="grid grid-cols-2 gap-2">
                  {systemMenuItems.map((sysItem, i) => (
                    <motion.button
                      key={sysItem.title}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-all hover:bg-neutral-100/80 active:scale-95"
                    >
                      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-black/5 bg-neutral-100 shadow-sm">
                        {sysItem.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] leading-none font-bold tracking-tight text-neutral-900">
                          {sysItem.title}
                        </div>
                        <div className="mt-1.5 text-[12px] leading-snug font-medium text-neutral-500">
                          {sysItem.desc}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <button className="font-inter hidden items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white md:flex">
            <FiGlobe size={16} />
            Vn
            <FiChevronDown size={14} />
          </button>

          <Link
            to="/dashboard"
            className="font-inter rounded-full bg-white px-6 py-2 text-[13px] font-bold text-black shadow-lg transition-all hover:bg-white/90 active:scale-95"
          >
            Đăng nhập vào hệ thống
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
