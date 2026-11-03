import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const { data } = useQuery<{ auditId: string; buildId: string }>({
    queryKey: ["ui-trace", user?.userId, enabled],
    enabled,
    staleTime: 0,
    retry: 1,
    queryFn: async () => {
      const response = await fetch(
        `/__ui/session?path=${encodeURIComponent(pathname)}`,
        { credentials: "same-origin" },
      );
      if (!response.ok) throw new Error("UI audit session unavailable");
      return (await response.json()).data;
    },
  });
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

  if (!enabled || !user) return null;
  const label = `Picare · ${user.userId.slice(-8)} · ${data?.auditId ?? ""}`;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2147483000] overflow-hidden select-none print:hidden"
    >
      {[18, 48, 78].map((top) => (
        <div
          key={top}
          className="absolute left-0 flex w-full justify-around text-[11px] tracking-wide text-zinc-500/15"
          style={{ top: `${top}%` }}
        >
          {[0, 1, 2].map((column) => (
            <span key={column} className="-rotate-12 whitespace-nowrap">
              {label}
            </span>
          ))}
        </div>
      ))}
      <span className="absolute right-3 bottom-2 rounded bg-zinc-900/50 px-2 py-1 text-[9px] tracking-wide text-zinc-200/70">
        {label}
      </span>
    </div>
  );
}
