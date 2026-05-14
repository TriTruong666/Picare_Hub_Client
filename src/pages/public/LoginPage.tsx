import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight, FiGrid, FiX } from "react-icons/fi";
import logo from "@/assets/images/logo.png";
import loginMockup from "@/assets/images/login_mockup.jpeg";
import { useLogin } from "@/hooks/data/useAuthHooks";
import { getApiErrorMessage } from "@/common/api.error";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  useCheckAccessHubClient,
  useHubClientDetail,
} from "@/hooks/data/useHubClientHooks";
import { ClientAccessGuard } from "@/components/guards/ClientAccessGuard";
import { checkAccessHubClient } from "@/apis/hub_client.service";
import { toast } from "@/hooks/useToast";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const { isAuthenticated, user } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const projects = [
    { name: "Picare CRM", desc: "Quản lý khách hàng chuyên sâu" },
    { name: "Picare OMS", desc: "Hệ thống vận hành đơn hàng" },
    { name: "Picare Hub", desc: "Trung tâm quản trị tập trung" },
    { name: "Picare Analytics", desc: "Phân tích dữ liệu kinh doanh" },
  ];

  const { data: clientDetail } = useHubClientDetail(clientId || "");

  const {
    fullResponse: accessResponse,
    isLoading: isAccessLoading,
    error: accessError,
  } = useCheckAccessHubClient(isAuthenticated ? clientId || "" : "");

  // Lấy error code từ cả response thành công (success: false) hoặc response lỗi (Axios error)
  const axiosError = accessError as any;
  const errorCode =
    accessResponse?.error_code || axiosError?.response?.data?.error_code;
  const status = axiosError?.response?.status;

  const hasAccess = accessResponse?.success === true;
  const isAccessDenied =
    !hasAccess &&
    (errorCode === "ERR_AUTH_003" ||
      status === 403 ||
      (accessResponse && accessResponse.success === false));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (res) => {
          if (res.success && clientId && clientDetail) {
            try {
              const accessRes = await checkAccessHubClient(clientId);

              if (accessRes.success) {
                window.location.href = clientDetail.clientExternalUrl;
                return;
              }

              // Sai role → ghi kết quả vào cache để hook không re-fetch
              // và accessResponse vẫn tồn tại → không trigger spinner
              queryClient.setQueryData(
                ["hub-clients-access", clientId],
                accessRes,
              );
              // Ép refetch auth để lấy đúng tên user mới (await = đợi xong mới update UI)
              await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
              toast.error(
                "Truy cập bị từ chối",
                "Tài khoản không có quyền truy cập hệ thống",
              );
              setShowLoginForm(false);
              setIsSubmitting(false);
            } catch (err: any) {
              const errCode = err.response?.data?.error_code;
              if (errCode === "ERR_AUTH_003" || err.response?.status === 403) {
                toast.error(
                  "Truy cập bị từ chối",
                  "Tài khoản không có quyền truy cập hệ thống",
                );
              } else {
                toast.error(
                  "Lỗi xác thực",
                  "Không thể kiểm tra quyền lúc này",
                );
              }
              // Ghi lỗi vào cache để tránh spinner
              queryClient.setQueryData(
                ["hub-clients-access", clientId],
                { success: false, error_code: errCode || "ERR_UNKNOWN" },
              );
              await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
              setShowLoginForm(false);
              setIsSubmitting(false);
            }
          } else {
            setIsSubmitting(false);
          }
        },
        onError: () => setIsSubmitting(false),
      },
    );
  };

  if (!clientId) {
    return <Navigate to="/login" replace />;
  }

  const isInitialAccessLoading =
    isAuthenticated &&
    isAccessLoading &&
    !accessResponse &&
    !accessError &&
    !isSubmitting;

  return (
    <ClientAccessGuard isCheckingAccess={isInitialAccessLoading}>
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
              {/* Title & Auth Status */}
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
                  {clientDetail?.clientName || "Picare Hub"}
                </h1>

                {isAuthenticated && user && !showLoginForm ? (
                  <div className="mt-4 flex flex-col gap-1">
                    <p className="font-inter text-[13px] font-medium text-[#F6C9F9]">
                      Đang đăng nhập với tài khoản:{" "}
                      <span className="text-white/90">{user.name}</span>
                    </p>
                    {isAccessDenied && (
                      <div className="mt-1 space-y-1">
                        <p className="font-inter text-[12px] font-semibold text-red-400/80">
                          Truy cập bị từ chối
                        </p>
                        <p className="font-inter text-[12px] text-white/30 italic">
                          Tài khoản của bạn không có quyền truy cập vào hệ thống
                          này.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-inter mt-2 text-[13px] font-light text-white/40">
                    Vui lòng đăng nhập để vào hệ thống{" "}
                    {clientDetail?.clientName || "Picare Hub"}
                  </p>
                )}
              </motion.div>

              {/* ─── CASE 1: Đã đăng nhập, chưa bấm "đổi tài khoản" ─── */}
              {isAuthenticated && !showLoginForm ? (
                <div className="space-y-4">
                  {/* Nút sáng: chỉ hiện khi đúng role */}
                  {hasAccess && (
                    <motion.button
                      onClick={() =>
                        clientDetail?.clientExternalUrl &&
                        (window.location.href = clientDetail.clientExternalUrl)
                      }
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-[#E1A3F1] to-[#D192E1] py-4 text-sm font-bold tracking-tight text-[#050505] shadow-[0_10px_30px_-10px_rgba(225,163,241,0.5)] transition-all hover:scale-[1.01] hover:shadow-[0_15px_40px_-12px_rgba(225,163,241,0.6)] active:scale-95"
                    >
                      <span className="relative z-10">
                        Đi tới {clientDetail?.clientName || "hệ thống"}
                      </span>
                      <FiArrowRight className="relative z-10 text-[18px] transition-transform group-hover:translate-x-1" />
                      <div className="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    </motion.button>
                  )}

                  {/* Nút mờ: luôn luôn hiện */}
                  <motion.button
                    onClick={() => setShowLoginForm(true)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: hasAccess ? 0.55 : 0.4 }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-4 text-sm font-medium text-white/40 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white/70"
                  >
                    Đăng nhập bằng tài khoản khác
                  </motion.button>
                </div>
              ) : (
                /* ─── CASE 2: Chưa đăng nhập hoặc đang đổi tài khoản ─── */
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
                    <label className="text-[12px] text-white/30">
                      Mật khẩu
                    </label>
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

                    {/* Inline Error */}
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

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
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
                      {isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống"}
                    </span>
                    <FiArrowRight className="relative z-10 text-[18px] transition-transform group-hover:translate-x-1" />
                    <div className="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  </motion.button>
                </form>
              )}
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
