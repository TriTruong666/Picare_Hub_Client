import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiGrid, FiX, FiArrowLeft } from "react-icons/fi";
import logo from "@/assets/images/logo.png";
import BorderGlow from "@/components/reactbit/BorderGlow";
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

export default function LoginHubPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
              "Chào mừng quay trở lại Picare Hub!",
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

  if (
    isAuthenticated &&
    isDashboardRedirect &&
    !canAccessDashboard(user?.role)
  ) {
    return <Navigate to={PATHS.HOME} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="font-plus-jakarta relative flex min-h-screen w-full items-center justify-center bg-black px-6 py-12 select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Quay lại trang test / trang chủ */}
        <div className="mb-4">
          <Link
            to="/test"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <FiArrowLeft className="text-xs" />
            <span>Quay lại</span>
          </Link>
        </div>

        {/* Card UI với BorderGlow đồng bộ giao diện Test */}
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={24}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#f59e0b', '#ec4899', '#8b5cf6']}
          className="w-full shadow-2xl"
        >
          <div className="p-7 sm:p-8 flex flex-col gap-6 text-left">
            {/* Header: Logo & Title */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={logo}
                  alt="Picare Hub"
                  className="h-8 w-8 object-contain"
                />
                <span className="font-plus-jakarta text-xl font-medium tracking-tight text-white">
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500">
                    Picare
                  </span>{" "}
                  Hub
                </span>
              </div>
              <p className="font-plus-jakarta text-xs text-zinc-400 font-light leading-relaxed">
                Đăng nhập không gian làm việc và hệ thống quản trị nội bộ
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-400 tracking-wide">
                  Email
                </label>
                <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 transition-all focus-within:border-white/20 focus-within:bg-white/[0.05]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-400 tracking-wide">
                    Mật khẩu
                  </label>
                  <Link
                    to="#"
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 transition-all focus-within:border-white/20 focus-within:bg-white/[0.05]">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder-zinc-600 outline-none pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>

                {/* Inline Error */}
                {loginMutation.isError && (
                  <p className="mt-1 text-[11px] font-medium text-rose-400">
                    * {getApiErrorMessage(loginMutation.error)}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 py-3 text-xs sm:text-[13px] font-medium tracking-wide transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống"}</span>
              </button>
            </form>

            <p className="text-center text-[11px] text-zinc-600 font-light">
              Copyright © {new Date().getFullYear()} Picare Hub. All rights reserved.
            </p>
          </div>
        </BorderGlow>
      </motion.div>

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
