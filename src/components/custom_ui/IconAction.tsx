type IconActionProps = {
  icon: React.ReactNode;
  danger?: boolean;
  className?: string;
  onClick?(): void;
};

export default function IconAction({
  icon,
  danger = false,
  className = "",
  onClick,
}: IconActionProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${
        danger
          ? "hover:text-red-500 dark:hover:text-red-400"
          : "hover:text-primary dark:hover:text-white"
      } ${className}`}
    >
      {icon}
    </button>
  );
}
