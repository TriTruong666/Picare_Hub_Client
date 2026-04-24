import { motion } from "framer-motion";

export const Spinner = ({
  size = "md",
  color = "primary",
}: {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white";
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 border",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  const colorClasses = {
    primary: "border-primary/30 border-t-primary",
    white: "border-white/30 border-t-white",
  };

  return (
    <motion.div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
    />
  );
};

export const FullScreenSpinner = () => {
  return (
    <div className="fixed inset-0 z-[200] flex h-screen w-screen items-center justify-center bg-black">
      <Spinner size="lg" color="primary" />
    </div>
  );
};
