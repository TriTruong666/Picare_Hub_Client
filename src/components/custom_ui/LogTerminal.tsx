import React, { useEffect, useRef, useState } from "react";
import { useSseLogs, useSseLogViewer } from "@/hooks/data/useSseHooks";

type LogTerminalProps = {
  /** Unique ID for the log source (e.g. companyId, cronJobName) */
  sourceId: string;
  /** SSE endpoint URL (ignored if connect=false) */
  endpoint?: string;
  /** Title shown in the terminal header */
  title?: string;
  /** Max height of the terminal */
  maxHeight?: string;
  /** Whether to show the terminal */
  show?: boolean;
  /** Custom class for the container */
  className?: string;
  /** Whether to initiate the connection. Default true. */
  connect?: boolean;
  /** Explicit sourceId to check for connection status */
  connectionSourceId?: string;
};

export const LogTerminal: React.FC<LogTerminalProps> = ({
  sourceId,
  endpoint = "/api/v1/sse/logs",
  title = "terminal.sh",
  maxHeight = "500px",
  show = true,
  className = "",
  connect = true,
  connectionSourceId,
}) => {
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);

  // Hook 1: Connection (only active if connect=true)
  const connectionHook = useSseLogs(
    sourceId,
    endpoint,
    show && connect && !isManualDisconnect,
  );

  // Hook 2: Viewer (only active if connect=false)
  const viewerHook = useSseLogViewer(
    sourceId,
    connectionSourceId || sourceId,
  );

  // Pick the right source of data
  const { logs, isConnected, clearLogs } = connect
    ? connectionHook
    : viewerHook;

  const scrollRef = useRef<HTMLDivElement>(null);

  // Match SyncHaravanModal scroll logic exactly
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!show) return null;

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0b]/80 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div
              className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-red-500/60" : "bg-red-500/20"}`}
            />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
            <div
              className={`h-2.5 w-2.5 rounded-full ${isConnected ? "animate-pulse bg-green-500/60" : "bg-green-500/20"}`}
            />
          </div>
          <span className="ml-2 font-mono text-[11px] font-medium tracking-tight text-gray-400">
            {title} {isConnected ? "[ONLINE]" : "[OFFLINE]"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {connect && (
            <button
              onClick={() => setIsManualDisconnect(!isManualDisconnect)}
              className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
                isManualDisconnect
                  ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              }`}
            >
              {isManualDisconnect ? "Kết nối lại" : "Ngắt kết nối"}
            </button>
          )}
          <button
            onClick={clearLogs}
            className="rounded px-2 py-0.5 font-mono text-[10px] text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-300"
          >
            Dọn dẹp
          </button>
        </div>
      </div>

      {/* Terminal Body - Match Modal exactly */}
      <div
        ref={scrollRef}
        style={{ maxHeight }}
        className="scrollbar-thin scrollbar-thumb-white/10 overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-0.5 font-mono text-[11px] leading-relaxed">
          {logs.length === 0 ? (
            <div className="text-gray-600 italic">
              Đang chờ server phản hồi...
            </div>
          ) : (
            logs.map((log, i) => {
              const status = log.status?.toUpperCase();
              const message = log.message.toLowerCase();

              let colorClass = "text-gray-300";
              if (status === "SUCCESS") {
                colorClass = "text-green-400";
              } else if (status === "FAIL") {
                colorClass = "text-red-400";
              } else if (status === "WARN") {
                colorClass = "text-yellow-400";
              } else if (status === "INFO") {
                colorClass = "text-blue-400";
              } else {
                // Fallback content-based coloring
                if (
                  message.includes("done") ||
                  message.includes("success") ||
                  message.includes("thành công")
                ) {
                  colorClass = "text-green-400";
                } else if (
                  message.includes("error") ||
                  message.includes("failed") ||
                  message.includes("lỗi")
                ) {
                  colorClass = "text-red-400";
                } else if (
                  message.includes("warn") ||
                  message.includes("cảnh báo")
                ) {
                  colorClass = "text-yellow-400";
                } else if (message.includes("[system]")) {
                  colorClass = "font-bold text-blue-400";
                }
              }

              return (
                <div
                  key={`${sourceId}-log-${i}`}
                  className={`${colorClass}`}
                >
                  {`> ${log.message}`}
                </div>
              );
            })
          )}
          {/* Animated Blinking Cursor */}
          <div className="text-primary inline-block animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
};
