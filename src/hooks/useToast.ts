import { toastStore } from "@/stores/toastStore";
import type { ToastType } from "@/types/Toast";

/**
 * Tiện ích hiển thị thông báo (Toast) toàn cục.
 * Thiết kế tối giản, dạng viên thuốc, nằm chính giữa màn hình.
 */
export const toast = {
  success: (title: string, message: string = "", duration = 4000) => {
    toastStore.push({ title, message, type: "success", duration });
  },
  error: (title: string, message: string = "", duration = 5000) => {
    toastStore.push({ title, message, type: "error", duration });
  },
  info: (title: string, message: string = "", duration = 4000) => {
    toastStore.push({ title, message, type: "info", duration });
  },
  warning: (title: string, message: string = "", duration = 4000) => {
    toastStore.push({ title, message, type: "warning", duration });
  },
  custom: (
    title: string,
    message: string = "",
    type: ToastType = "info",
    duration = 4000
  ) => {
    toastStore.push({ title, message, type, duration });
  },
};
