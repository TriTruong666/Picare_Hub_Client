import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiArrowLeft, FiHome, FiGrid } from "react-icons/fi";
import { PATHS } from "@/config/paths";
import { useAuth } from "@/hooks/useAuth";

interface ServiceSuspendedPageProps {
  clientName?: string;
  title?: string;
  description?: string;
  isDashboard?: boolean;
}

export default function ServiceSuspendedPage({
  clientName = "Dịch vụ",
  title,
  description,
  isDashboard = false,
}: ServiceSuspendedPageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const displayTitle = title || `${clientName} tạm ngưng hoạt động`;
  const displayDescription =
    description ||
    `Tính năng và các trang liên quan tới ${clientName} hiện đang tạm ngưng phục vụ hoặc đang trong kế hoạch nâng cấp hệ thống. Quý khách và cán bộ nhân viên vui lòng quay lại sau hoặc liên hệ bộ phận quản trị để biết thêm thông tin chi tiết.`;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center"
    >
      {/* Icon with glowing ambient badge */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/20 bg-linear-to-b from-amber-500/15 to-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-xl" />
        <FiAlertTriangle className="relative text-3xl text-amber-400" />
      </div>

      {/* Status Pill Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <span>Trạng thái: Ngưng hoạt động</span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {displayTitle}
      </h1>

      {/* Detailed Notice */}
      <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
        {displayDescription}
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white transition-all hover:border-white/20 hover:bg-white/10 active:scale-95"
        >
          <FiArrowLeft className="text-sm transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Quay lại</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(PATHS.HOME)}
          className="group flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white transition-all hover:border-white/20 hover:bg-white/10 active:scale-95"
        >
          <FiHome className="text-sm" />
          <span>Trang chủ Hub</span>
        </button>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => navigate(PATHS.DASHBOARD.ROOT)}
            className="group flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95"
          >
            <FiGrid className="text-sm" />
            <span>Vào Dashboard</span>
          </button>
        )}
      </div>

      {/* Footer Support Info */}
      <div className="mt-10 border-t border-white/5 pt-4">
        <p className="text-[12px] text-zinc-500">
          Cần hỗ trợ gấp? Vui lòng liên hệ quản trị viên nội bộ Picare qua email{" "}
          <span className="text-zinc-400">admin@picare.vn</span>
        </p>
      </div>
    </motion.div>
  );

  if (isDashboard) {
    return (
      <div className="page-layout dashboard-theme flex min-h-[calc(100vh-140px)] items-center justify-center p-6">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070709] px-6 py-12 select-none">
      {/* Background ambient pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      {content}
    </div>
  );
}
