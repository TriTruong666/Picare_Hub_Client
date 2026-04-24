import type { ToastType } from "@/types/Toast";
import { nanoid } from "nanoid";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: Listener[] = [];

function emit() {
  listeners.forEach((l) => l(toasts));
}

export const toastStore = {
  subscribe(listener: Listener) {
    listeners.push(listener);
    listener(toasts);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  push(toast: Omit<ToastItem, "id">) {
    const id = nanoid();
    const item = { id, ...toast };
    toasts = [...toasts, item];
    emit();

    if (toast.duration !== 0) {
      setTimeout(() => {
        toastStore.remove(id);
      }, toast.duration ?? 5000);
    }
  },

  remove(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  },
};
