import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiBell,
  HiChevronDown,
  HiMenuAlt2,
  HiOutlineQuestionMarkCircle,
  HiSearch,
  HiUserCircle,
  HiX,
  HiSun,
  HiMoon,
} from "react-icons/hi";
import { AiFillMessage } from "react-icons/ai";
import {
  FiChevronLeft,
  FiChevronRight,
  FiLayout,
  FiSettings,
} from "react-icons/fi";
import Lenis from "lenis";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import clsx from "clsx";
import { getSidebarNavigation, PRIVATE_ROUTES } from "@/config/routes.config";
import type { RouteConfig } from "@/config/routes.config";
import { PATHS } from "@/config/paths";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/data/useAuthHooks";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import DrawerContainer from "@/components/DrawerContainer";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

export function getInitialTheme(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("theme");
  if (saved) return saved === "dark";
  return true;
}

export function useThemeDarkMode(): boolean {
  return useSyncExternalStore(
    subscribeToThemeClass,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
}

function subscribeToThemeClass(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot(): boolean {
  return true;
}

export default function DashboardLayout() {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("picare_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const isDark = useThemeDarkMode();

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("picare_sidebar_collapsed", String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Keyboard shortcut: Cmd/Ctrl + B to toggle desktop sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Smooth scroll Lenis
  useEffect(() => {
    if (!scrollRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: contentRef.current,
      autoRaf: true,
      duration: 1.2,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Lock body scroll on mobile when sidebar drawer is open
  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <div className="relative bg-white font-sans text-gray-800 transition-colors duration-300 dark:bg-[#050505] dark:text-white">
      <DrawerContainer />
      <div className="relative flex h-dvh h-screen overflow-hidden">
        {/* Mobile drawer sidebar */}
        <MobileSidebar
          isDark={isDark}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Desktop collapsible sidebar */}
        <DesktopSidebar isDark={isDark} isCollapsed={isSidebarCollapsed} />

        {/* Desktop toggle button */}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          title={
            isSidebarCollapsed
              ? "Mở rộng thanh điều hướng (⌘B)"
              : "Ẩn thanh điều hướng (⌘B)"
          }
          aria-label={
            isSidebarCollapsed
              ? "Mở rộng thanh điều hướng"
              : "Ẩn thanh điều hướng"
          }
          className={`absolute top-1/2 z-30 hidden h-14 w-8 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-gray-300 bg-[#eeeeee]/96 text-gray-600 shadow-xl backdrop-blur-xl transition-[left,background-color,color] duration-300 hover:bg-white hover:text-black xl:flex dark:border-white/10 dark:bg-[#171717]/95 dark:text-white/55 dark:hover:bg-[#242424] dark:hover:text-white ${
            isSidebarCollapsed ? "left-0" : "left-64"
          }`}
        >
          {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar onMenuOpen={() => setIsSidebarOpen(true)} />
          <div
            id="dashboard-scroll-container"
            ref={scrollRef}
            className="relative flex-1 overflow-x-hidden overflow-y-auto [overscroll-behavior:contain]"
          >
            <div ref={contentRef}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SearchableRoute {
  label: string;
  path: string;
  parentLabel?: string;
  icon?: any;
}

function RouteSearchItem({
  label,
  path,
  parentLabel,
  icon: Icon,
  onSelect,
}: {
  label: string;
  path: string;
  parentLabel?: string;
  icon?: any;
  onSelect?: () => void;
}) {
  const navigate = useNavigate();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    navigate(path);
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="group/item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition-all hover:bg-gray-100 dark:hover:bg-[#202024]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-700 transition-colors group-hover/item:bg-gray-300 dark:bg-white/5 dark:text-white/70 dark:group-hover/item:bg-white/10">
        {Icon ? <Icon size={16} /> : <HiSearch size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-gray-900 dark:text-white">
          {label}
        </span>
        {parentLabel && (
          <span className="block truncate text-[10px] text-gray-500 dark:text-white/40">
            {parentLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function Navbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isSearchPanelOpen = isSearchFocused;
  const searchTerm = debouncedSearch.trim();

  // Close search panel on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { user } = useAuth();
  const role = user?.role;

  const searchableRoutes = useMemo(() => {
    const routes: SearchableRoute[] = [];
    const traverse = (configList: RouteConfig[], parent?: RouteConfig) => {
      for (const route of configList) {
        const hasRole = !route.roles || (role && route.roles.includes(role));
        if (!hasRole) continue;

        if (
          route.label &&
          route.path &&
          !route.path.includes(":") &&
          route.showInSidebar !== false
        ) {
          routes.push({
            label: route.label,
            path: route.path,
            parentLabel: parent?.label,
            icon: route.icon || parent?.icon,
          });
        }

        if (route.children) {
          traverse(route.children, route);
        }
      }
    };
    traverse(PRIVATE_ROUTES);

    // Deduplicate by path
    const uniqueRoutesMap = new Map<string, SearchableRoute>();
    for (const r of routes) {
      uniqueRoutesMap.set(r.path, r);
    }
    return Array.from(uniqueRoutesMap.values());
  }, [role]);

  const matchingRoutes = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return searchableRoutes.filter(
      (r) =>
        r.label.toLowerCase().includes(term) ||
        (r.parentLabel && r.parentLabel.toLowerCase().includes(term)),
    );
  }, [searchableRoutes, searchTerm]);

  const placeholderTexts = useMemo(
    () => [
      "Tìm kiếm chức năng, trang quản trị...",
      "Quản lý hợp đồng & tài liệu số...",
      "Quản lý bản quyền & Hub clients...",
      "Quản lý lưu trữ & tài khoản...",
      "Đi tới trang cài đặt...",
    ],
    [],
  );

  useEffect(() => {
    if (placeholderTexts.length === 0) return;

    const currentText = placeholderTexts[index];
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
        setIndex((prev) => (prev + 1) % placeholderTexts.length);
      }
    }, typingSpeed);

    return () => window.clearTimeout(timeout);
  }, [charIndex, isDeleting, index, placeholderTexts]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  // Global keydown for Ctrl+K / Cmd+K to focus search, and Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === "Escape") {
        setIsSearchFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-2.5 border-b border-gray-200 bg-white/85 px-3 py-2.5 backdrop-blur-xl transition-colors duration-300 sm:gap-4 sm:px-4 sm:py-3 lg:px-6 dark:border-white/5 dark:bg-[#050505]/85">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-xs transition hover:bg-gray-50 xl:hidden dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          aria-label="Mở menu điều hướng"
        >
          <HiMenuAlt2 className="text-xl" />
        </button>

        {/* Global Search Bar */}
        <div
          ref={searchContainerRef}
          className="group relative max-w-md flex-1 md:max-w-lg lg:max-w-xl xl:max-w-2xl"
        >
          <HiSearch
            size={18}
            className="absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900 sm:left-4 dark:group-focus-within:text-white"
          />

          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={placeholder}
            className="focus:border-primary/40 focus:ring-primary/10 h-10 w-full rounded-xl border border-gray-200 bg-white pr-14 pl-10 text-xs text-gray-800 shadow-xs transition-all placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:bg-white focus:ring-2 focus:outline-none sm:h-11 sm:pr-20 sm:pl-11 sm:text-sm dark:border-white/10 dark:bg-[#141416] dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-white/20 dark:hover:bg-[#1a1a1d] dark:focus:border-white/25 dark:focus:bg-[#1a1a1d] dark:focus:ring-white/10"
          />

          {/* Badges / Clear button inside input */}
          <div className="absolute top-1/2 right-2.5 z-10 flex -translate-y-1/2 items-center gap-1.5 sm:right-3">
            {searchValue ? (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  inputRef.current?.focus();
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            ) : (
              <kbd className="hidden items-center gap-0.5 rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-400 select-none sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-white/30">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {isSearchPanelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#141416]"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-white/5">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-white/40">
                    {searchTerm
                      ? `Kết quả cho "${searchTerm}"`
                      : "Gợi ý tìm kiếm"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      inputRef.current?.blur();
                    }}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800 sm:hidden dark:text-white/50 dark:hover:text-white"
                  >
                    Đóng
                  </button>
                </div>

                <div className="max-h-[calc(75vh-50px)] overflow-y-auto bg-white py-2 sm:max-h-84 dark:bg-[#141416]">
                  {/* Search helper guide when input is empty */}
                  {!searchTerm && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="mx-2 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-700 dark:bg-[#1c1c1f] dark:text-white/50"
                    >
                      <p className="mb-2 flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white/80">
                        <HiOutlineQuestionMarkCircle
                          size={15}
                          className="text-primary"
                        />
                        Hướng dẫn tìm kiếm nhanh:
                      </p>
                      <ul className="list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed">
                        <li>
                          Nhập{" "}
                          <span className="font-semibold text-gray-950 dark:text-white/90">
                            Tên trang hoặc chức năng
                          </span>{" "}
                          (Hợp đồng, Bản quyền, Lưu trữ, Tài khoản...) để di
                          chuyển nhanh.
                        </li>
                        <li>
                          Sử dụng phím tắt{" "}
                          <span className="font-semibold text-gray-950 dark:text-white/90">
                            ⌘K / Ctrl+K
                          </span>{" "}
                          ở bất kỳ trang nào để mở thanh tìm kiếm.
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Client-side Routes Section */}
                  {matchingRoutes.length > 0 && (
                    <div className="mb-2 px-2">
                      <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase dark:text-white/30">
                        Chuyển trang nhanh
                      </div>
                      <div className="space-y-0.5">
                        {matchingRoutes.map((route) => (
                          <RouteSearchItem
                            key={route.path}
                            label={route.label}
                            path={route.path}
                            parentLabel={route.parentLabel}
                            icon={route.icon}
                            onSelect={() => {
                              setIsSearchFocused(false);
                              setSearchValue("");
                              inputRef.current?.blur();
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {searchTerm && matchingRoutes.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-gray-500 dark:text-white/45">
                      Không tìm thấy chức năng phù hợp với "{searchTerm}".
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Controls - EXACTLY LIKE Picare Saleforce Client */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <DarkModeIconSwitch />
        <div className="hidden sm:block">
          <ChatUserDropdown />
        </div>
        <NotificationDropdown />
        <AvatarDropdown />
      </div>
    </header>
  );
}


/**
 * Exact DarkModeIconSwitch component from Saleforce Client
 */
export function DarkModeIconSwitch() {
  const [dark, setDark] = useState(getInitialTheme);
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const nextDark = !isDark;

    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? Math.round(rect.left + rect.width / 2) : e.clientX;
    const y = rect ? Math.round(rect.top + rect.height / 2) : e.clientY;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const applyTheme = () => {
      if (nextDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      setDark(nextDark);
    };

    const doc = document as ViewTransitionDocument;
    if (!doc.startViewTransition) {
      applyTheme();
      return;
    }

    const transition = doc.startViewTransition(applyTheme);

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
      aria-label="Chuyển đổi theme"
      type="button"
    >
      {/* Glow */}
      <AnimatePresence>
        {dark && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-lg bg-indigo-500/30 blur-md"
          />
        )}
      </AnimatePresence>

      {/* Icon */}
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
            <HiMoon className="text-lg text-indigo-400" />
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
            <HiSun className="text-lg text-amber-400" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/**
 * Exact ChatUserDropdown component like Saleforce Client
 */
export function ChatUserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm backdrop-blur-md transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
        aria-label="Tin nhắn"
      >
        <AiFillMessage className="text-lg text-gray-700 dark:text-gray-300" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-95 overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/95"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Tin nhắn
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-white/10" />

            <div className="max-h-105 overflow-x-hidden overflow-y-auto">
              <div className="p-8 text-center text-xs text-gray-500 dark:text-white/40">
                Chưa có cuộc hội thoại nào
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-3 text-center text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/70"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Exact NotificationDropdown component like Saleforce Client
 */
export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"system" | "auto">("system");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm backdrop-blur-md transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
        aria-label="Mở thông báo"
      >
        <HiBell className="text-lg text-gray-700 dark:text-white/80" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-90 overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/95"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Thông báo
              </p>
            </div>

            <div className="relative flex border-y border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("system")}
                className={clsx(
                  "relative flex-1 px-4 py-2.5 text-[11px] uppercase transition-all",
                  activeTab === "system"
                    ? "z-20 font-semibold text-red-600 dark:text-red-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/60",
                )}
              >
                Hệ thống
                {activeTab === "system" ? (
                  <motion.div
                    layoutId="notificationActiveTabUnderline"
                    className="absolute inset-x-0 bottom-0 h-px bg-red-500/70"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("auto")}
                className={clsx(
                  "relative flex-1 border-l border-gray-200 px-4 py-2.5 text-[11px] uppercase transition-all dark:border-white/10",
                  activeTab === "auto"
                    ? "z-20 font-semibold text-red-600 dark:text-red-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/60",
                )}
              >
                Tự động
                {activeTab === "auto" ? (
                  <motion.div
                    layoutId="notificationActiveTabUnderline"
                    className="absolute inset-x-0 bottom-0 h-px bg-red-500/70"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                ) : null}
              </button>
            </div>

            <div className="max-h-100 overflow-x-hidden overflow-y-auto">
              <div className="py-10 text-center text-xs text-gray-500 dark:text-white/40">
                {activeTab === "system"
                  ? "Hộp thư hệ thống đang trống"
                  : "Chưa có thông báo tự động"}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="block w-full px-3 py-3 text-center text-[11px] font-medium text-gray-500 hover:text-gray-800 dark:text-white/40 dark:hover:text-white/70"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Exact AvatarDropdown component like Saleforce Client
 */
export function AvatarDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { mutate: logout } = useLogout();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white p-2 text-gray-700 shadow-sm backdrop-blur-md transition-all hover:border-gray-400 hover:bg-gray-50 sm:px-3 sm:py-2 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
      >
        <HiUserCircle className="text-xl text-gray-700 sm:text-2xl dark:text-gray-300" />
        <span className="hidden text-sm text-gray-700 md:block dark:text-gray-200">
          {user?.name || "Người dùng"}
        </span>
        <HiChevronDown
          className={`text-xs transition-transform duration-200 sm:text-sm ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]"
          >
            <AvatarDropdownItem
              label="Tài khoản"
              url={PATHS.DASHBOARD.SETTINGS.ROOT}
              onClick={() => setOpen(false)}
            />
            <AvatarDropdownItem
              label="Cài đặt"
              url={PATHS.DASHBOARD.SETTINGS.ROOT}
              onClick={() => setOpen(false)}
            />
            <AvatarDropdownItem
              label="Quay về Hub"
              url={PATHS.HOME}
              onClick={() => setOpen(false)}
            />
            <div className="h-px bg-gray-200 dark:bg-white/10" />
            <AvatarDropdownItem
              label="Đăng xuất"
              danger
              onClick={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type AvatarDropdownItemProps = {
  label: string;
  danger?: boolean;
  url?: string;
  onClick?: () => void;
};

function AvatarDropdownItem({
  label,
  danger = false,
  url,
  onClick,
}: AvatarDropdownItemProps) {
  const className = `block w-full px-4 py-2 text-left text-sm transition-colors ${
    danger
      ? "text-red-500 hover:bg-red-500/10"
      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
  } `;

  if (url) {
    return (
      <Link to={url} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {label}
    </button>
  );
}

function SidebarContent({
  isLoading,
  navigation,
  onItemClick,
  isMobile = false,
}: {
  isDark: boolean;
  isLoading?: boolean;
  navigation: RouteConfig[];
  onItemClick?: () => void;
  isMobile?: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden">
      <div className="flex flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1">
        {/* Logo Header: Exactly like PublicLandingNavbar, no Picare Hub text */}
        <div className="flex items-center justify-between gap-3 px-5 py-5 select-none xl:px-6">
          <Link
            to={PATHS.HOME}
            className="flex min-w-0 cursor-pointer items-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            <img
              src={logoPicareNewBlack}
              alt="Picare"
              className="-my-2 h-8 w-auto scale-[110%] object-contain invert transition-opacity hover:opacity-85 sm:h-9 dark:mix-blend-screen dark:invert-0"
            />
          </Link>

          {isMobile ? (
            <button
              type="button"
              onClick={onItemClick}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Đóng menu điều hướng"
            >
              <HiX className="text-xl" />
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          <nav
            onClick={(event) => {
              if (onItemClick && (event.target as HTMLElement).closest("a")) {
                onItemClick();
              }
            }}
            className="mt-4 flex-1 space-y-2 px-3 pb-6"
          >
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
        )}
      </div>

      {/* Bottom section */}
      <div
        onClick={(event) => {
          if (onItemClick && (event.target as HTMLElement).closest("a")) {
            onItemClick();
          }
        }}
        className="shrink-0 space-y-1 border-t border-gray-200 px-3 py-4 dark:border-white/5"
      >
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
    </div>
  );
}

function DesktopSidebar({
  isDark,
  isCollapsed,
}: {
  isDark: boolean;
  isCollapsed: boolean;
}) {
  const { user, isLoading } = useAuth();
  const navigation = getSidebarNavigation(user?.role);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 0 : 256,
        opacity: isCollapsed ? 0 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      className={`relative z-20 hidden h-screen shrink-0 flex-col justify-between overflow-hidden border-r bg-white transition-[border-color] duration-300 xl:flex dark:bg-[#050505] ${
        isCollapsed
          ? "pointer-events-none border-transparent"
          : "border-gray-200 dark:border-white/5"
      }`}
    >
      <div className="flex h-full w-64 min-w-[16rem] flex-col justify-between overflow-hidden">
        <SidebarContent
          isDark={isDark}
          isLoading={isLoading}
          navigation={navigation}
        />
      </div>
    </motion.aside>
  );
}

function MobileSidebar({
  isDark,
  isOpen,
  onClose,
}: {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, isLoading } = useAuth();
  const navigation = getSidebarNavigation(user?.role);

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng menu điều hướng"
        className={`fixed inset-0 z-30 bg-black/55 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(18rem,calc(100vw-2rem))] shrink-0 flex-col justify-between overflow-y-hidden border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out xl:hidden dark:border-white/5 dark:bg-[#050505] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          isDark={isDark}
          isLoading={isLoading}
          navigation={navigation}
          onItemClick={onClose}
          isMobile
        />
      </aside>
    </>
  );
}

function SidebarSkeleton() {
  return (
    <div className="mt-4 space-y-4 px-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-10 w-full animate-pulse rounded-lg bg-gray-200/70 dark:bg-white/5"
        />
      ))}
    </div>
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
        className="flex w-full items-center justify-between rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
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

type SidebarItemProps = {
  icon?: React.ReactNode;
  label: string;
  to: string;
  exact?: boolean;
};

export function SidebarItem({
  icon,
  label,
  to,
  exact = false,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all ${
          isActive
            ? "border-gray-300 bg-gray-100/80 font-bold text-gray-950 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-inner"
            : "border-transparent font-medium text-gray-700 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );
}

type SubItemProps = {
  label: string;
  to: string;
};

export function SubItem({ label, to }: SubItemProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block rounded-lg border px-3 py-2 text-xs transition-all ${
          isActive
            ? "border-gray-300 bg-gray-100/80 font-semibold text-gray-950 dark:border-white/10 dark:bg-white/10 dark:text-white"
            : "border-transparent font-medium text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
