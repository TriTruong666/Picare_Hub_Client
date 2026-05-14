import React, { useMemo, useState } from "react";
import { useSseAlerts } from "@/hooks/data/useSseHooks";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiExclamationCircle, HiLightningBolt, HiInformationCircle, HiFire } from "react-icons/hi";
import type { AlertEntry } from "@/stores/sseStore";

const severityConfig = {
  low: {
    icon: HiInformationCircle,
    bgColor: "bg-neutral-500/10",
    borderColor: "border-neutral-500/20",
    textColor: "text-neutral-700 dark:text-neutral-400",
    accentColor: "bg-neutral-500",
    label: "THÔNG BÁO",
  },
  medium: {
    icon: HiExclamationCircle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    textColor: "text-yellow-400",
    accentColor: "bg-yellow-500",
    label: "CẢNH BÁO",
  },
  high: {
    icon: HiLightningBolt,
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    textColor: "text-orange-400",
    accentColor: "bg-orange-500",
    label: "QUAN TRỌNG",
  },
  critical: {
    icon: HiFire,
    bgColor: "bg-red-500/15",
    borderColor: "border-red-500/25",
    textColor: "text-red-400",
    accentColor: "bg-red-500",
    label: "NGUY CẤP",
  },
};

export const AlertBanner: React.FC = () => {
  const { alerts } = useSseAlerts("app-global");
  const [dismissed, setDismissed] = useState<string | null>(null);

  const activeAlert = useMemo(() => {
    if (!alerts || alerts.length === 0) return null;

    const latest = alerts[alerts.length - 1] as AlertEntry & { receivedAt: string };
    
    // Auto show if it's a new alert after being dismissed
    if (dismissed && dismissed !== latest.receivedAt + latest.message) {
      return latest;
    }
    
    return dismissed ? null : latest;
  }, [alerts, dismissed]);

  const config = activeAlert ? severityConfig[activeAlert.severity as keyof typeof severityConfig] : null;
  const Icon = config?.icon;

  if (!activeAlert || !config || !Icon) return null;

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`relative w-full transition-colors ${config.bgColor}`}
        >
          <div className="flex min-h-[36px] items-center justify-center px-12 py-4">
            <div className="flex items-center gap-3 text-center">
              {/* <span className={`text-[13px] font-bold tracking-[0.2em] uppercase ${config.textColor} whitespace-nowrap`}>
                [{config.label}]
              </span> */}
              <p className={`text-[12px] font-medium tracking-tight ${config.textColor}`}>
                {activeAlert.message}
              </p>
            </div>

            <button
              onClick={() => setDismissed(activeAlert.receivedAt + activeAlert.message)}
              className="absolute right-3 group flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            >
              <HiX className="text-sm text-gray-500 transition-colors group-hover:text-white" />
            </button>
          </div>
          {/* Severity Accent Bar */}
          <div className={`absolute bottom-0 left-0 h-[1px] w-full ${config.accentColor} opacity-50`}></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
