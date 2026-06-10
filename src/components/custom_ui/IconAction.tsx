type IconActionProps = {
  icon: React.ReactNode;
  danger?: boolean;
  className?: string;
  onClick?(): void;
  disabled?: boolean;
};

export default function IconAction({
  icon,
  danger = false,
  className = "",
  onClick,
  disabled = false,
}: IconActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-1.5 text-gray-400 transition-colors dark:hover:bg-white/10 ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : `hover:bg-gray-100 ${
              danger
                ? "hover:text-red-500 dark:hover:text-red-400"
                : "hover:text-primary dark:hover:text-white"
            }`
      } ${className}`}
    >
      {icon}
    </button>
  );
}
