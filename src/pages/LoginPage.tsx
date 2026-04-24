import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight, FiGrid, FiX } from "react-icons/fi";
import logo from "@/assets/images/logo.png";
import loginMockup from "@/assets/images/login_mockup.jpeg";
import { useLogin } from "@/hooks/data/useAuthHooks";
import { getApiErrorMessage } from "@/common/api.error";
import { useSearchParams } from "react-router-dom";
import LoginClientPage from "./LoginClientPage";
import { useHubClientDetail } from "@/hooks/data/useHubClientHooks";
import { ClientAccessGuard } from "@/components/guards/ClientAccessGuard";
import { checkAccessHubClient } from "@/apis/hub_client.service";

export default function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  const loginMutation = useLogin();

  const projects = [
    { name: "Picare CRM", desc: "Quản lý khách hàng chuyên sâu" },
    { name: "Picare OMS", desc: "Hệ thống vận hành đơn hàng" },
    { name: "Picare Hub", desc: "Trung tâm quản trị tập trung" },
    { name: "Picare Analytics", desc: "Phân tích dữ liệu kinh doanh" },
  ];

  const { data: clientDetail } = useHubClientDetail(clientId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (res) => {
          if (res.success && clientId && clientDetail) {
            try {
              // Sau khi login, kiểm tra quyền ngay
              const accessRes = await checkAccessHubClient(clientId);
              if (accessRes.success) {
                window.location.href = clientDetail.clientInternalUrl;
              } else if (accessRes.error_code === "ERR_AUTH_003") {
                // Sai quyền -> Đá về grid
                setSearchParams({});
              }
            } catch {
              setSearchParams({});
            }
          }
        },
      },
    );
  };

  if (!clientId) {
    return <LoginClientPage />;
  }

  return (
    <ClientAccessGuard>
      <div className="font-inter flex h-screen w-full overflow-hidden bg-[#050505]">
        {/* ─── LEFT — Login Form Section ─── */}
        <div className="flex w-full flex-col px-8 md:w-1/2 lg:px-20">
          {/* Logo */}
          <motion.div
            className="py-8"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <Link to="/" className="flex w-fit">
              <img
                src={logo}
                alt="Picare Hub"
                className="h-8 w-8 object-contain"
              />
            </Link>
          </motion.div>

          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full">
              {/* Title */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.25,
                }}
              >
                <h1 className="font-bricolage text-3xl font-bold tracking-tight text-white">
                  {clientDetail?.clientName || "Picare OMS"}
                </h1>
                <p className="font-inter mt-2 text-[13px] font-light text-white/40">
                  Vui lòng đăng nhập để vào hệ thống{" "}
                  {clientDetail?.clientName || "Picare OMS"}
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email */}
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.4,
                  }}
                >
                  <label className="text-[12px] text-white/30">Email</label>
                  <div className="group relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-transparent py-3 text-sm text-white placeholder-white/20 transition-all outline-none"
                      required
                    />
                    <div className="absolute bottom-0 h-px w-full bg-white/10" />
                    <div className="absolute bottom-0 h-px w-full origin-left scale-x-0 bg-linear-to-r from-[#E1A3F1] to-[#A3CFF1] transition-transform duration-500 ease-[0.16,1,0.3,1] group-focus-within:scale-x-100" />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.55,
                  }}
                >
                  <label className="text-[12px] text-white/30">Mật khẩu</label>
                  <div className="group relative">
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent py-3 pr-10 text-sm text-white placeholder-white/20 transition-all outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 text-white/20 hover:text-white/40"
                      >
                        {showPassword ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    <div className="absolute bottom-0 h-px w-full bg-white/10" />
                    <div className="absolute bottom-0 h-px w-full origin-left scale-x-0 bg-linear-to-r from-[#E1A3F1] to-[#A3CFF1] transition-transform duration-500 ease-[0.16,1,0.3,1] group-focus-within:scale-x-100" />
                  </div>

                  {/* Inline Error Message */}
                  {loginMutation.isError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-[12px] font-medium text-red-500"
                    >
                      * {getApiErrorMessage(loginMutation.error)}
                    </motion.p>
                  )}

                  <motion.div
                    className="flex justify-start pt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.7 }}
                  >
                    <Link
                      to="#"
                      className="text-[12px] text-red-300 transition-colors hover:text-white/40 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loginMutation.isPending}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.75,
                  }}
                  className="group relative mt-4 flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-[#E1A3F1] to-[#D192E1] py-4 text-sm font-bold tracking-tight text-[#050505] shadow-[0_10px_30px_-10px_rgba(225,163,241,0.5)] transition-all hover:scale-[1.01] hover:shadow-[0_15px_40px_-12px_rgba(225,163,241,0.6)] active:scale-95 disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {loginMutation.isPending
                      ? "Đang xác thực..."
                      : "Đăng nhập hệ thống"}
                  </span>
                  <FiArrowRight className="relative z-10 text-[18px] transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </motion.button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            className="py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.0 }}
          >
            <p className="text-center text-[11px] text-white/20">
              Copyright © 2026 Picare Hub - All rights reserved.
            </p>
          </motion.div>
        </div>

        {/* RIGHT — Visual Section */}
        <motion.div
          className="relative hidden h-full overflow-hidden md:flex md:w-1/2"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={loginMockup}
            alt="Picare Hub Interface"
            className="h-full w-full object-cover brightness-90 transition-all duration-1000 hover:brightness-100 hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#050505] via-transparent to-transparent opacity-20" />
        </motion.div>

        {/* FLOATING ACTION BUTTON */}
        <div className="fixed right-8 bottom-8 z-100">
          <AnimatePresence>
            {showProjects && (
              <div className="absolute right-0 bottom-20 flex flex-col items-end gap-2">
                {projects.map((project, idx) => (
                  <motion.button
                    key={project.name}
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                      transition: {
                        delay: (projects.length - 1 - idx) * 0.04,
                        duration: 0.2,
                      },
                    }}
                    transition={{
                      delay: idx * 0.07,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex w-52 flex-col items-start gap-0.5 rounded-xl bg-white px-4 py-2.5 text-left shadow-lg transition-all hover:scale-[1.02]"
                  >
                    <span className="text-[12px] font-semibold text-black">
                      {project.name}
                    </span>
                    <span className="text-[10px] text-black/80">
                      {project.desc}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProjects(!showProjects)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-shadow hover:shadow-white/10"
          >
            {showProjects ? <FiX size={22} /> : <FiGrid size={22} />}
          </motion.button>
        </div>
      </div>
    </ClientAccessGuard>
  );
}
