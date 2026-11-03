import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

function isPrivatePath(path: string) {
  return (
    /^\/dashboard(?:\/|$)/.test(path) ||
    /^\/pimory\/?$/.test(path) ||
    /^\/catalogue\/(?:public\/|create\/?$|[^/]+\/edit\/?$)/.test(path) ||
    /^\/contracts\/(?:create\/?$|[^/]+\/(?:edit|preview)\/?$)/.test(path) ||
    /^\/qr-products\/(?:generator\/?$|[^/]+\/edit\/?$)/.test(path)
  );
}

export default function UiTrace() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const enabled = import.meta.env.PROD && !!user && isPrivatePath(pathname);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetch("/__ui/event", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [enabled, pathname]);

  return null;
}
