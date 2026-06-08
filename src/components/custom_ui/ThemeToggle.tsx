import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

type ThemeToggleProps = {
  className?: string;
  rounded?: "full" | "lg";
};

export function ThemeToggle({
  className = "",
  rounded = "full",
}: ThemeToggleProps) {
  const [dark, setDark] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const roundedClass = rounded === "lg" ? "rounded-lg" : "rounded-full";

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
      return;
    }

    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    setDark(true);
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const doc = document as ViewTransitionDocument;
    const isDark = root.classList.contains("dark");
    const nextDark = !isDark;

    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? Math.round(rect.left + rect.width / 2) : event.clientX;
    const y = rect ? Math.round(rect.top + rect.height / 2) : event.clientY;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const applyTheme = () => {
      root.classList.toggle("dark", nextDark);
      localStorage.setItem("theme", nextDark ? "dark" : "light");
      setDark(nextDark);
    };

    if (!doc.startViewTransition) {
      applyTheme();
      return;
    }

    const transition = doc.startViewTransition(() => {
      applyTheme();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={toggleTheme}
      className={`relative flex h-10 w-10 items-center justify-center border border-black/10 bg-white/80 text-gray-700 shadow-sm backdrop-blur-md transition-all hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10 ${roundedClass} ${className}`}
      aria-label="Toggle theme"
      type="button"
    >
      <AnimatePresence>
        {dark ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-indigo-500/30 blur-md ${roundedClass}`}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {dark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <FiMoon className="text-lg text-indigo-400" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <FiSun className="text-lg text-amber-400" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
