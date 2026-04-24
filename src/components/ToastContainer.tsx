import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { toastStore, type ToastItem } from "../stores/toastStore";
import Toast from "./custom_ui/Toast";

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  return (
    <div className="pointer-events-none fixed top-10 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={toastStore.remove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
