import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight, FiGrid, FiX } from "react-icons/fi";
import logo from "@/assets/images/logo.png";
import { useLogin } from "@/hooks/data/useAuthHooks";
import { getApiErrorMessage } from "@/common/api.error";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/config/paths";
import { toast } from "@/hooks/useToast";

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return PATHS.HOME;
  }

  if (value.startsWith(PATHS.LOGIN_HUB)) {
    return PATHS.HOME;
  }

  return value;
}

export default function LoginHubPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));

  const projects = [
    { name: "Picare CRM", desc: "Quản lý khách hàng chuyên sâu" },
    { name: "Picare OMS", desc: "Hệ thống vận hành đơn hàng" },
    { name: "Picare Hub", desc: "Trung tâm quản trị tập trung" },
    { name: "Picare Analytics", desc: "Phân tích dữ liệu kinh doanh" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (res) => {
          if (res.success) {
            toast.success(
              "Đăng nhập thành công",
              "Chào mừng quay trở lại Picare Hub!",
            );
            await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
            // Full refresh / redirection to clean up query states
            window.location.href = redirectPath;
          } else {
            setIsSubmitting(false);
          }
        },
        onError: () => setIsSubmitting(false),
      },
    );
  };

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="font-inter flex min-h-screen w-full items-center justify-center bg-[#050505] px-6 py-12">
      {/* Visual background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E1A3F1]/10 blur-[130px]" />
        <div className="absolute top-1/3 left-1/3 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A3CFF1]/5 blur-[110px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white/5 bg-neutral-900/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <img
              src={logo}
              alt="Picare Hub"
              className="h-10 w-10 object-contain transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>

        {/* Header Text */}
        <div className="mb-8 text-center">
          <h1 className="font-bricolage text-3xl font-bold tracking-tight text-white">
            Picare Hub
          </h1>
          <p className="font-inter mt-2 text-[13px] font-light text-white/40">
            Vui lòng đăng nhập để vào hệ thống quản trị chung
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-1">
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
          </div>

          {/* Password */}
          <div className="space-y-1">
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
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <div className="absolute bottom-0 h-px w-full bg-white/10" />
              <div className="absolute bottom-0 h-px w-full origin-left scale-x-0 bg-linear-to-r from-[#E1A3F1] to-[#A3CFF1] transition-transform duration-500 ease-[0.16,1,0.3,1] group-focus-within:scale-x-100" />
            </div>

            {/* Inline Error */}
            {loginMutation.isError && (
              <p className="mt-2 text-[12px] font-medium text-red-500">
                * {getApiErrorMessage(loginMutation.error)}
              </p>
            )}

            <div className="flex justify-start pt-3">
              <Link
                to="#"
                className="text-[12px] text-red-300 transition-colors hover:text-white/40 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative mt-4 flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-[#E1A3F1] to-[#D192E1] py-4 text-sm font-bold tracking-tight text-[#050505] shadow-[0_10px_30px_-10px_rgba(225,163,241,0.5)] transition-all hover:scale-[1.01] hover:shadow-[0_15px_40px_-12px_rgba(225,163,241,0.6)] active:scale-95 disabled:opacity-50"
          >
            <span className="relative z-10">
              {isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống"}
            </span>
            <FiArrowRight className="relative z-10 text-[18px] transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-white/20">
          Copyright © {new Date().getFullYear()} Picare Hub - All rights
          reserved.
        </p>
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
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-2xl transition-shadow hover:shadow-white/10"
        >
          {showProjects ? <FiX size={22} /> : <FiGrid size={22} />}
        </motion.button>
      </div>
    </div>
  );
}
