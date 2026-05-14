import type { Variants } from "framer-motion";

export const dashboardContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.25,
      ease: "easeOut",
    },
  },
};

export const dashboardItem: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.97,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
