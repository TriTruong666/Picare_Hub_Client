import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
import logo from "@/assets/images/logo.png";
import { FiArrowRight } from "react-icons/fi";
import type { HubClient } from "@/types/HubClient";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function LoginClientPage() {
  const navigate = useNavigate();
  // Lấy danh sách client (không giới hạn hoặc giới hạn lớn để chọn)
  const { data: clients, isLoading } = useHubClients({
    limit: 20,
    page: 1,
    status: "active",
  });

  const handleSelectClient = (clientId: string) => {
    navigate(`/login?clientId=${clientId}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#050505] px-6 py-20">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-12 flex flex-col items-center text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 p-3 backdrop-blur-sm">
          <img
            src={logo}
            alt="Picare Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="font-bricolage text-4xl font-bold tracking-tight text-white md:text-5xl">
          Chào mừng đến với{" "}
          <span className="bg-linear-to-r from-[#E1A3F1] to-[#A3CFF1] bg-clip-text text-transparent">
            Picare Hub
          </span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-white/40">
          Vui lòng chọn hệ thống bạn muốn truy cập để tiếp tục đăng nhập
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
              />
            ))
          : clients?.map((client: HubClient) => (
              <motion.button
                key={client.clientId}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectClient(client.clientId)}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-left transition-all hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 p-2 transition-colors group-hover:bg-white/10">
                  {client.clientLogoImage ? (
                    <img
                      src={client.clientLogoImage}
                      alt={client.clientName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-xl font-bold text-white/20">
                      {client.clientName[0]}
                    </div>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-[#E1A3F1]">
                  {client.clientName}
                </h3>
                <p className="mb-6 line-clamp-2 flex-1 text-sm text-white/40 group-hover:text-white/60">
                  {client.clientDescription}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#A3CFF1] uppercase">
                  <span>Truy cập</span>
                  <FiArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>

                {/* Decorative gradient on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-linear-to-r from-[#E1A3F1] to-[#A3CFF1] transition-transform duration-500 group-hover:scale-x-100" />
              </motion.button>
            ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10 mt-16 text-center"
      >
        <p className="text-sm text-white/20">
          Bạn gặp vấn đề khi truy cập?{" "}
          <button className="text-white/40 underline underline-offset-4 hover:text-white">
            Liên hệ quản trị viên
          </button>
        </p>
      </motion.div>
    </div>
  );
}
