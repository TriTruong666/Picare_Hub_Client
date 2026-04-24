import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import type { ToastType } from "@/types/Toast";

type ToastProp = {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
};

export default function Toast({
  id,
  title,
  message,
  type,
  onClose,
}: ToastProp) {
  // Icons based on type
  const Icon = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    info: FiInfo,
    warning: FiAlertTriangle,
  }[type];

  // Neutral theme configuration
  const config = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400",
    warning: "text-amber-400",
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="group pointer-events-auto relative flex max-w-[440px] min-w-[320px] items-center gap-3.5 rounded-full border border-white/[0.08] bg-[#121212]/90 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    >
      {/* Icon */}
      <div className={`flex shrink-0 items-center justify-center ${config}`}>
        <Icon size={19} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <h4 className="font-inter truncate text-[13px] font-semibold tracking-tight text-white/90">
          {title}
        </h4>
        {message && (
          <p className="font-inter line-clamp-1 text-[12px] text-white/40">
            {message}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        className="ml-1 shrink-0 text-white/20 transition-colors hover:text-white/60"
      >
        <FiX size={16} />
      </button>
    </motion.div>
  );
}
