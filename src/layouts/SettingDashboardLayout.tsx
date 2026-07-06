import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";

import { PATHS } from "@/config/paths";

const tabs = [
  { to: PATHS.DASHBOARD.SETTINGS.ROOT, label: "Tổng quan", end: true },
  { to: PATHS.DASHBOARD.SETTINGS.SECURITY, label: "Bảo mật" },
  { to: PATHS.DASHBOARD.SETTINGS.STORAGE, label: "Tồn kho" },
  { to: PATHS.DASHBOARD.SETTINGS.SYSTEM, label: "Hệ thống" },
];

export default function SettingDashboardLayout() {
  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-gray-300 dark:border-white/10">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className="relative min-w-32 flex-1"
            >
              {({ isActive }) => (
                <div
                  className={`relative flex w-full items-center justify-center py-4 text-[13px] transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.span
                      layoutId="settings-tab-indicator"
                      className="absolute inset-x-0 bottom-0 h-px bg-indigo-500"
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  );
}
