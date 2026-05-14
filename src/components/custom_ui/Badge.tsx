import React from "react";

export type BadgeTypeProps = 
  | "error" 
  | "success" 
  | "info" 
  | "warning" 
  | "primary" 
  | "blue" 
  | "purple" 
  | "orange" 
  | "indigo";

type BadgeProps = {
  value: string;
  type: BadgeTypeProps;
  className?: string;
};

type BadgeIconProps = {
  icon: React.ReactNode;
  type: BadgeTypeProps;
  className?: string;
};

const badgeStyles: Record<BadgeTypeProps, { border: string; messageColor: string; bg: string }> = {
  error: {
    border: "border-red-500/30 dark:border-red-500/30",
    messageColor: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  warning: {
    border: "border-amber-500/30 dark:border-yellow-500/30",
    messageColor: "text-amber-700 dark:text-yellow-400",
    bg: "bg-amber-50 dark:bg-yellow-500/10",
  },
  success: {
    border: "border-emerald-500/30 dark:border-emerald-500/30",
    messageColor: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  info: {
    border: "border-gray-300 dark:border-white/10",
    messageColor: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-white/5",
  },
  primary: {
    border: "border-primary/30 dark:border-primary/30",
    messageColor: "text-primary",
    bg: "bg-red-50 dark:bg-primary/10",
  },
  blue: {
    border: "border-blue-500/30 dark:border-blue-500/30",
    messageColor: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  purple: {
    border: "border-purple-500/30 dark:border-purple-500/30",
    messageColor: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  orange: {
    border: "border-orange-500/30 dark:border-orange-500/30",
    messageColor: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-500/10",
  },
  indigo: {
    border: "border-indigo-500/30 dark:border-indigo-500/30",
    messageColor: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
};

export function Badge({ value, type, className = "" }: BadgeProps) {
  const styles = badgeStyles[type];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur ${styles.bg} ${styles.border} ${className}`}
    >
      <span className={styles.messageColor}>{value}</span>
    </span>
  );
}

export function IconBadge({ icon, type, className = "" }: BadgeIconProps) {
  const styles = badgeStyles[type];

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur ${styles.border} ${styles.bg} ${className}`}
    >
      <span className={`${styles.messageColor} text-sm`}>{icon}</span>
    </span>
  );
}
