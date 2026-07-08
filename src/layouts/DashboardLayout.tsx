import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBell,
  FiLogOut,
  FiLayout,
  FiMessageCircle,
  FiMoon,
  FiSettings,
  FiSun,
  FiUser,
} from "react-icons/fi";
import {
  HiChevronDown,
  HiOutlineQuestionMarkCircle,
  HiSearch,
} from "react-icons/hi";
import Lenis from "lenis";
import { Link, NavLink, Outlet } from "react-router-dom";
import { getSidebarNavigation } from "@/config/routes.config";
import type { RouteConfig } from "@/config/routes.config";
import { PATHS } from "@/config/paths";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/data/useAuthHooks";
import logo from "@/assets/images/logo.png";
import { IoBusinessOutline } from "react-icons/io5";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

const NAVBAR_PLACEHOLDER_TEXTS = [
  "Tim collection dang index...",
  "Toi muon chat voi AI...",
  "Tong quan he thong...",
];

export default function DashboardLayout() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: contentRef.current,
      autoRaf: true,
      duration: 1.2,
      smoothWheel: true,
    });

    return () => lenis.destroy();
  }, []);

  return (
    <div className="dashboard-theme relative bg-white text-gray-800 transition-colors duration-300 dark:bg-[#050505] dark:text-white">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex h-full flex-1 flex-col overflow-hidden">
          <Navbar />
          <div ref={scrollRef} className="relative flex-1 overflow-hidden">
            <div ref={contentRef}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    if (NAVBAR_PLACEHOLDER_TEXTS.length === 0) return;

    const currentText = NAVBAR_PLACEHOLDER_TEXTS[index];
    const typingSpeed = isDeleting ? 80 : 70;
    const delayBeforeDeleting = 4000;

    const timeout = window.setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setPlaceholder((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholder((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        window.setTimeout(() => setIsDeleting(true), delayBeforeDeleting);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % NAVBAR_PLACEHOLDER_TEXTS.length);
      }
    }, typingSpeed);

    return () => window.clearTimeout(timeout);
  }, [charIndex, index, isDeleting]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white/90 p-4 backdrop-blur-md md:p-6 dark:border-white/5 dark:bg-[#050505]/90">
      <div className="flex flex-1 items-center gap-4">
        <div className="group relative hidden w-full max-w-[28rem] md:block">
          <HiSearch
            size={18}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900 dark:group-focus-within:text-white"
          />
          <input
            type="text"
            placeholder={placeholder}
            className="dashboard-input"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DashboardThemeToggle />

        <NavbarActionButton
          to={PATHS.DASHBOARD.NOTIFICATIONS}
          label="Notifications"
        >
          <FiBell />
        </NavbarActionButton>

        <NavbarActionButton to={PATHS.DASHBOARD.MESSAGES} label="Messages">
          <FiMessageCircle />
        </NavbarActionButton>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="group flex items-center gap-2.5 rounded-full border border-gray-300 bg-white p-1 pr-3 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
          >
            <span className="from-primary to-primary/60 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-black">
              {user?.name?.[0]?.toUpperCase() || "P"}
            </span>
            <span className="hidden md:block">{user?.name || "Profile"}</span>
            <HiChevronDown className="text-sm text-gray-400 transition-transform duration-300" />
          </button>

          <AnimatePresence>
            {isProfileOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)]"
              >
                <div className="border-b border-white/5 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="from-primary to-primary/60 flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-black">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {user?.name || "Profile"}
                      </p>
                      <p className="truncate text-[11px] text-white/40">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1">
                  <ProfileRouteLink
                    to={PATHS.HOME}
                    icon={
                      <IoBusinessOutline size={16} className="text-white/40" />
                    }
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Hub Center
                  </ProfileRouteLink>

                  <ProfileRouteLink
                    to={PATHS.DASHBOARD.PROFILE}
                    icon={<FiUser className="text-[15px] text-white/40" />}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Hồ sơ của tôi
                  </ProfileRouteLink>

                  <ProfileRouteLink
                    to={PATHS.DASHBOARD.SETTINGS.ROOT}
                    icon={<FiSettings className="text-[15px] text-white/40" />}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Cài đặt
                  </ProfileRouteLink>

                  <ProfileRouteLink
                    to={PATHS.DASHBOARD.NOTIFICATIONS}
                    icon={<FiBell className="text-[15px] text-white/40" />}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Thông báo
                  </ProfileRouteLink>

                  <ProfileRouteLink
                    to={PATHS.DASHBOARD.MESSAGES}
                    icon={
                      <FiMessageCircle className="text-[15px] text-white/40" />
                    }
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Tin nhắn
                  </ProfileRouteLink>
                </div>

                <div className="border-t border-white/5 p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-red-400 transition-colors hover:bg-red-400/10"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-400/10 text-red-400">
                      <FiLogOut size={16} />
                    </span>
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function NavbarActionButton({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
    >
      <span className="text-base">{children}</span>
    </Link>
  );
}

function ProfileRouteLink({
  to,
  icon,
  onClick,
  children,
}: {
  to: string;
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/5"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-600 dark:text-gray-300">
        {icon}
      </span>
      <span className="block text-[13px] font-medium text-white/80">
        {children}
      </span>
    </Link>
  );
}

function Sidebar() {
  const { user } = useAuth();
  const navigation = getSidebarNavigation(user?.role);

  return (
    <aside className="fixed z-20 hidden max-h-screen w-64 flex-col justify-between overflow-hidden border-r border-gray-300 bg-white md:relative md:flex dark:border-white/5 dark:bg-[#050505]">
      <div className="flex flex-col overflow-auto [&::-webkit-scrollbar]:w-1">
        <div className="flex items-center gap-3 px-6 py-5 select-none">
          <img
            src={logo}
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            alt="Picare"
          />
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Picare Hub
          </span>
        </div>

        <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-3 pb-6">
          {navigation.map((item) => (
            <div key={item.path}>
              {item.children ? (
                <CollapsibleNavItem item={item} />
              ) : (
                <SidebarItem
                  to={item.index ? PATHS.DASHBOARD.ROOT : item.path}
                  icon={item.icon ? <item.icon /> : <FiLayout />}
                  label={item.label || ""}
                  exact={item.index}
                />
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="space-y-1 border-t border-gray-300 px-3 py-4 dark:border-white/5">
        <SidebarItem
          to={PATHS.DASHBOARD.SETTINGS.ROOT}
          icon={<FiSettings />}
          label="Cài đặt"
        />
        <SidebarItem
          to={PATHS.DASHBOARD.HELP}
          icon={<HiOutlineQuestionMarkCircle />}
          label="Trợ giúp"
        />
      </div>
    </aside>
  );
}

function CollapsibleNavItem({ item }: { item: RouteConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="text-lg" /> : null}
          {item.label}
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <HiChevronDown className="text-lg" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -4 }}
              animate={{ y: 0 }}
              exit={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-2 ml-6 space-y-1"
            >
              {item.children
                ?.filter((child) => child.showInSidebar !== false)
                .map((child) => (
                  <SubItem
                    key={child.path}
                    to={child.path}
                    label={child.label || ""}
                  />
                ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DashboardThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") !== "light";
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      return;
    }

    // Mặc định dark mode
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
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
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm backdrop-blur-md transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
      aria-label="Toggle theme"
      type="button"
    >
      <AnimatePresence>
        {dark ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-lg bg-indigo-500/30 blur-md"
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

type SidebarItemProps = {
  icon?: ReactNode;
  label: string;
  to: string;
  exact?: boolean;
};

function SidebarItem({ icon, label, to, exact = false }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
          isActive
            ? "border-gray-200 bg-gray-100 text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
            : "border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );
}

function SubItem({ label, to }: { label: string; to: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
          isActive
            ? "border-gray-200 bg-gray-100 text-gray-900 dark:border-white/10 dark:bg-white/10 dark:text-white"
            : "border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
