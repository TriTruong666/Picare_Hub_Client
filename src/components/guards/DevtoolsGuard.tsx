import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/useToast";

const DEVTOOLS_THRESHOLD = 160;
const TOAST_COOLDOWN_MS = 3000;

function isBlockedShortcut(event: KeyboardEvent) {
  const key = event.key.toUpperCase();

  if (key === "F12") {
    return true;
  }

  if (event.ctrlKey && event.shiftKey && ["I", "J", "C"].includes(key)) {
    return true;
  }

  if (event.ctrlKey && key === "U") {
    return true;
  }

  return false;
}

export function DevtoolsGuard() {
  const { user } = useAuth();
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false);
  const canShowToastRef = useRef(true);
  const lastDevtoolsStateRef = useRef(false);

  const shouldRestrict = !!user && user.role !== "admin";

  useEffect(() => {
    if (!shouldRestrict) {
      setIsDevtoolsOpen(false);
      return;
    }

    const cooldown = () => {
      canShowToastRef.current = false;
      window.setTimeout(() => {
        canShowToastRef.current = true;
      }, TOAST_COOLDOWN_MS);
    };

    const notifyBlockedAction = () => {
      if (!canShowToastRef.current) return;

      toast.warning(
        "Restricted",
        "Developer tools are disabled for this account.",
      );
      cooldown();
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      notifyBlockedAction();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isBlockedShortcut(event)) return;

      event.preventDefault();
      event.stopPropagation();
      notifyBlockedAction();
    };

    const checkDevtools = () => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      const nextIsOpen =
        widthGap > DEVTOOLS_THRESHOLD || heightGap > DEVTOOLS_THRESHOLD;

      if (lastDevtoolsStateRef.current !== nextIsOpen) {
        lastDevtoolsStateRef.current = nextIsOpen;
        setIsDevtoolsOpen(nextIsOpen);

        if (nextIsOpen && canShowToastRef.current) {
          toast.error(
            "Restricted",
            "Close developer tools to continue using this account.",
          );
          cooldown();
        }
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown, true);

    checkDevtools();
    const intervalId = window.setInterval(checkDevtools, 1000);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.clearInterval(intervalId);
    };
  }, [shouldRestrict]);

  if (!shouldRestrict || !isDevtoolsOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/96 px-6 text-center text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <p className="text-lg font-semibold">Developer tools blocked</p>
        <p className="mt-2 text-sm text-white/70">
          This account cannot continue while browser developer tools are open.
        </p>
      </div>
    </div>
  );
}
