import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiGrid,
  FiX,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import { useLogin } from "@/hooks/data/useAuthHooks";
import { getApiErrorMessage } from "@/common/api.error";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/config/paths";
import { toast } from "@/hooks/useToast";
import { canAccessDashboard } from "@/config/dashboardAccess";
import type { User } from "@/types/User";

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return PATHS.HOME;
  }

  if (value.startsWith(PATHS.LOGIN_HUB)) {
    return PATHS.HOME;
  }

  return value;
}

interface LoginHubFormSectionProps {
  onBack?: () => void;
  backTo?: string;
}

export default function LoginHubFormSection({
  onBack,
  backTo = "/test",
}: LoginHubFormSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));
  const isDashboardRedirect = redirectPath.startsWith(PATHS.DASHBOARD.ROOT);

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
              "Chào mừng quay trở lại Picare Client!",
            );
            await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
            const currentUser = queryClient.getQueryData<User>(["auth", "me"]);

            if (
              isDashboardRedirect &&
              !canAccessDashboard(currentUser?.role)
            ) {
              toast.error(
                "Truy cập bị từ chối",
                "Tài khoản không có quyền truy cập dashboard.",
              );
              window.location.href = PATHS.HOME;
              return;
            }

            window.location.href = redirectPath;
          } else {
            setIsSubmitting(false);
          }
        },
        onError: () => setIsSubmitting(false),
      },
    );
  };

  return (
    <div className="font-haffer relative min-h-screen w-full overflow-hidden bg-transparent select-none">
      {/* Foreground Layout */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* LEFT — Login Form Section: 50% width, trượt từ trái sang phải */}
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "-100%" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-screen w-full flex-col justify-between border-r border-white/[0.08] bg-black/95 px-8 py-8 shadow-2xl backdrop-blur-md md:w-1/2 md:bg-black md:px-14 lg:px-20"
        >
          {/* Header Bar: Logo & Back Link */}
          <div className="flex items-center justify-between">
            <Link to="/" className="group flex items-center">
              <img
                src={logoPicareNewBlack}
                alt="Picare Client"
                className="h-7 sm:h-9 md:h-10 w-auto object-contain mix-blend-screen transition-opacity hover:opacity-85 -my-2"
              />
            </Link>

            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <FiArrowLeft className="text-xs" />
                <span>Quay lại</span>
              </button>
            ) : (
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <FiArrowLeft className="text-xs" />
                <span>Quay lại</span>
              </Link>
            )}
          </div>

          {/* Form Content */}
          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="mx-auto w-full max-w-[520px]">
              {/* Title & Auth Status */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.15,
                }}
              >
                <h1 className="font-haffer text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl">
                  <span className="italic font-light">Picare</span>{" "}
                  <span className="font-normal text-white/90">
                    Client<span className="text-[#FFA336]">.</span>
                  </span>
                </h1>
                <p className="font-haffer mt-2.5 text-[13px] font-light text-zinc-400 leading-relaxed">
                  Đăng nhập không gian làm việc và hệ thống quản trị nội bộ tập trung
                </p>
              </motion.div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email Field */}
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.25,
                  }}
                >
                  <label className="text-xs font-medium text-zinc-400 tracking-wide">
                    Email
                  </label>
                  <div className="group relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      placeholder="name@company.com"
                      className="w-full bg-transparent py-3 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      required
                    />
                    <div className="absolute bottom-0 h-px w-full bg-white/10" />
                    <motion.div
                      className="absolute bottom-0 h-px w-full origin-left bg-gradient-to-r from-[#F86D2B] to-[#FFA336]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isEmailFocused ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.35,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-400 tracking-wide">
                      Mật khẩu
                    </label>
                    <Link
                      to="#"
                      className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="group relative">
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        placeholder="••••••••"
                        className="w-full bg-transparent py-3 pr-10 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    <div className="absolute bottom-0 h-px w-full bg-white/10" />
                    <motion.div
                      className="absolute bottom-0 h-px w-full origin-left bg-gradient-to-r from-[#F86D2B] to-[#FFA336]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isPasswordFocused ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>

                {/* Inline Error */}
                {loginMutation.isError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs font-medium text-rose-400"
                  >
                    * {getApiErrorMessage(loginMutation.error)}
                  </motion.p>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group relative mt-8 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-white py-3.5 text-sm font-semibold tracking-wide text-zinc-950 shadow-[0_4px_24px_rgba(255,255,255,0.15)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_6px_30px_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống"}
                  </span>
                  <FiArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
                </motion.button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="py-4">
            <p className="text-center text-[11px] text-zinc-600 font-light">
              Copyright © {new Date().getFullYear()} Picare Client. All rights reserved.
            </p>
          </div>
        </motion.div>

        {/* RIGHT — Empty 50% to showcase AeroShards placement="right" */}
        <div className="hidden md:block md:w-1/2" />
      </div>

      {/* Floating Action Button (Dự án trong hệ sinh thái) */}
      <div className="fixed right-6 bottom-6 z-50">
        <AnimatePresence>
          {showProjects && (
            <div className="absolute right-0 bottom-16 flex flex-col items-end gap-2 mb-2">
              {projects.map((project, idx) => (
                <motion.button
                  key={project.name}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.95,
                    transition: {
                      delay: (projects.length - 1 - idx) * 0.03,
                      duration: 0.15,
                    },
                  }}
                  transition={{
                    delay: idx * 0.05,
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex w-52 flex-col items-start gap-0.5 rounded-xl bg-zinc-900/95 border border-white/10 px-4 py-2.5 text-left shadow-2xl backdrop-blur-md transition-all hover:bg-zinc-800 hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-xs font-medium text-white">
                    {project.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-light">
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
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-zinc-900 border border-white/15 text-zinc-300 hover:text-white shadow-2xl transition-all"
        >
          {showProjects ? <FiX size={18} /> : <FiGrid size={18} />}
        </motion.button>
      </div>
    </div>
  );
}
