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
  const [currentPage, setCurrentPage] = useState(0);
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

  const megamenuItems = [
    {
      id: 1,
      title: "Picare OMS",
      fullName: "Order Management System",
      desc: "Hệ thống quản lý đơn hàng của Picare Vietnam giúp quản lý đơn hàng, tồn kho, báo cáo chuyên sâu.",
    },
    {
      id: 2,
      title: "Picare CRM",
      fullName: "Customer Relationship Management",
      desc: "Giải pháp tối ưu quản lý và chăm sóc khách hàng chuyên nghiệp cho doanh nghiệp.",
    },
    {
      id: 3,
      title: "Picare HR",
      fullName: "Human Resources Management",
      desc: "Quản trị nhân sự, chấm công và tính lương tự động, minh bạch và chính xác.",
    },
    {
      id: 4,
      title: "Picare FINANCE",
      fullName: "Finance & Accounting Tool",
      desc: "Kiểm soát dòng tiền, báo cáo tài chính và quản lý ngân sách tập trung.",
    },
    {
      id: 5,
      title: "Picare ASSETS",
      fullName: "Asset Management Tool",
      desc: "Quản lý tài sản cố định, trang thiết bị và lịch trình bảo trì định kỳ.",
    },
    {
      id: 6,
      title: "Picare LOGS",
      fullName: "Operation Logs & Audit",
      desc: "Theo dõi nhật ký vận hành, kiểm soát rủi ro và tăng cường bảo mật hệ thống.",
    },
  ];

  const itemsPerPage = 3;
  const totalPages = Math.ceil(megamenuItems.length / itemsPerPage);
  const displayedItems = megamenuItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const nextMore = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

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
                      isActive ? "text-black" : "text-white hover:text-white"
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

                    <span className="relative z-10 flex items-center gap-x-2">
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
                            className={isActive ? "text-black" : ""}
                          />
                        </motion.div>
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
          </motion.nav>

          <AnimatePresence mode="wait">
            {isSystemMenuOpen && (
              <motion.div
                key="system-menu"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                      staggerChildren: 0.1,
                    },
                  },
                  exit: {
                    opacity: 0,
                    y: 15,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                  },
                }}
                className="absolute top-full left-1/2 mt-4 w-[1200px] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              >
                <div className="flex flex-col gap-6">
                  <motion.div
                    key={currentPage}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.15,
                          delayChildren: 0.05,
                        },
                      },
                      exit: {
                        opacity: 0,
                        transition: { duration: 0.2 },
                      },
                    }}
                    className="grid grid-cols-3 gap-4"
                  >
                    {displayedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, y: 30, scale: 0.95 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              duration: 0.8,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          },
                        }}
                        whileHover={{
                          y: -6,
                          backgroundColor: "rgba(38, 38, 38, 0.5)",
                          borderColor: "rgba(255, 255, 255, 0.15)",
                          transition: { duration: 0.3 },
                        }}
                        className="group flex cursor-pointer flex-col space-y-3 rounded-xl border border-white/5 bg-neutral-900/40 p-4 transition-colors duration-300"
                      >
                        <div className="relative overflow-hidden rounded-lg outline-1 outline-white/5 group-hover:outline-white/10">
                          <img
                            src="https://framerusercontent.com/images/gTH5qA521PTXYmAuTkvadn5fso.png?width=1292&height=450"
                            alt=""
                            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="group-hover:text-primary-foreground text-[15px] font-semibold tracking-tight text-white transition-colors">
                            {item.title} - {item.fullName}
                          </h4>
                          <p className="text-[13px] leading-relaxed text-white/50 group-hover:text-white/70">
                            {item.desc}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 text-[12px] font-medium text-white/40 transition-colors group-hover:text-white">
                          <span>Khám phá ngay</span>
                          <FiChevronDown className="-rotate-90" size={14} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            currentPage === i
                              ? "w-8 bg-white"
                              : "w-2 bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextMore}
                      className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 active:scale-95"
                      aria-label="Tiếp theo"
                    >
                      <FiChevronDown className="-rotate-90" size={18} />
                    </button>
                  </div>
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
            to="/login"
            className="font-inter rounded-full bg-white px-6 py-2 text-[13px] font-bold text-black shadow-lg transition-all hover:bg-white/90 active:scale-95"
          >
            Đăng nhập vào hệ thống
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
