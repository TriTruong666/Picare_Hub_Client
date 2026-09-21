import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineX } from "react-icons/hi";
import { FiCopy, FiEdit3, FiMail, FiPhone } from "react-icons/fi";
import { Badge } from "@/components/custom_ui/Badge";
import { formatDateTime, formatRelativeTime } from "@/common/format";
import { toast } from "@/hooks/useToast";
import { ROLE_LABELS, type User } from "@/types/User";

export interface AccountDetailDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
}

export function AccountDetailDrawer({
  user,
  isOpen,
  onClose,
  onEdit,
}: AccountDetailDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const copyValue = async (value: string | null | undefined, label: string) => {
    if (!value) {
      toast.error(
        "Không có dữ liệu",
        `Tài khoản chưa có ${label.toLowerCase()}`,
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success("Đã sao chép", label);
    } catch {
      toast.error(
        "Không thể sao chép",
        "Trình duyệt không cho phép sao chép dữ liệu",
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex shadow-2xl"
          >
            <aside className="flex h-full w-[min(100vw,600px)] flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a]">
              {/* Drawer Header */}
              <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white/90 px-5 py-5 backdrop-blur-md sm:px-6 dark:border-white/10 dark:bg-[#0a0a0a]/90">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-primary/20 text-base font-bold text-gray-900 dark:text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-gray-900 dark:text-white">
                      {user.name || "Chi tiết tài khoản"}
                    </h2>
                    <p className="truncate font-mono text-xs text-gray-500 dark:text-white/45">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Đóng chi tiết tài khoản"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </header>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                {/* Top Status & Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
                  <p className="text-xs text-gray-500 dark:text-white/45">
                    Khởi tạo {formatDateTime(user.createdAt)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      type={user.isOnline ? "success" : "info"}
                      value={user.isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                    />
                    <Badge
                      type="primary"
                      value={ROLE_LABELS[user.role] || user.role}
                    />
                  </div>
                </div>

                {/* Action Cards */}
                <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <DrawerActionCard
                    title="Chỉnh sửa tài khoản"
                    icon={<FiEdit3 />}
                    onClick={() => {
                      onClose();
                      onEdit(user);
                    }}
                    primary
                  />
                  <DrawerActionCard
                    title="Sao chép SĐT"
                    icon={<FiPhone />}
                    onClick={() =>
                      void copyValue(user.phone, "Số điện thoại")
                    }
                  />
                  <DrawerActionCard
                    title="Sao chép Email"
                    icon={<FiMail />}
                    onClick={() => void copyValue(user.email, "Email")}
                  />
                  <DrawerActionCard
                    title="Sao chép User ID"
                    icon={<FiCopy />}
                    onClick={() =>
                      void copyValue(user.userId, "Mã tài khoản")
                    }
                  />
                </div>

                {/* Account Summary Card */}
                <section className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/60 dark:border-white/10 dark:bg-white/[0.025]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 dark:border-white/10">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-white/45">
                        Tổng quan tài khoản
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-white/30">
                        Thông số hoạt động & định danh hệ thống
                      </p>
                    </div>
                    <Badge
                      type={user.isOnline ? "success" : "info"}
                      value={user.isOnline ? "Đang hoạt động" : "Offline"}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3">
                    <Metric
                      label="Vai trò"
                      value={ROLE_LABELS[user.role] || user.role}
                    />
                    <Metric
                      label="Trạng thái"
                      value={user.isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                      emphasis={user.isOnline}
                    />
                    <Metric
                      label="Số điện thoại"
                      value={user.phone || "Chưa có"}
                    />
                    <Metric
                      label="Ngày tạo"
                      value={formatRelativeTime(user.createdAt)}
                    />
                    <Metric
                      label="Cập nhật"
                      value={formatRelativeTime(user.updatedAt || user.createdAt)}
                    />
                    <Metric
                      label="Mã định danh"
                      value={user.userId.slice(0, 8) + "..."}
                    />
                  </div>
                </section>

                {/* Section: Thông tin chi tiết */}
                <Section title="Thông tin tài khoản">
                  <Row label="Họ và tên" value={user.name || "Chưa có"} />
                  <Row label="Email đăng nhập" value={user.email || "Chưa có"} mono />
                  <Row
                    label="Số điện thoại"
                    value={user.phone || "Chưa thiết lập"}
                    mono
                  />
                  <Row
                    label="Vai trò hệ thống"
                    value={ROLE_LABELS[user.role] || user.role}
                  />
                  <Row
                    label="Trạng thái trực tuyến"
                    value={
                      user.isOnline
                        ? "Đang trực tuyến"
                        : "Ngoại tuyến (Offline)"
                    }
                  />
                </Section>

                {/* Section: Thông tin hệ thống */}
                <Section title="Thông tin hệ thống">
                  <Row label="Mã tài khoản (User ID)" value={user.userId} mono />
                  <Row label="Ngày tạo tài khoản" value={formatDateTime(user.createdAt)} />
                  <Row
                    label="Lần cập nhật cuối"
                    value={formatDateTime(user.updatedAt || user.createdAt)}
                  />
                  <Row
                    label="Thời gian tương đối"
                    value={formatRelativeTime(user.createdAt)}
                  />
                </Section>
              </div>
            </aside>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-gray-200 py-5 last:border-b-0 dark:border-white/10">
      <h3 className="mb-4 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-white/45">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DrawerActionCard({
  title,
  icon,
  onClick,
  primary = false,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-22 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5 ${
        primary
          ? "border-primary/30 bg-primary/5 hover:border-primary/50 dark:bg-primary/10"
          : "border-gray-200 bg-gray-50/70 hover:border-gray-400 hover:bg-white dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
      }`}
    >
      <span
        className={
          primary
            ? "text-primary text-base"
            : "text-base text-gray-500 dark:text-white/55"
        }
      >
        {icon}
      </span>
      <span
        className={
          primary
            ? "text-primary text-[11px] leading-4 font-semibold"
            : "text-[11px] leading-4 text-gray-600 dark:text-white/65"
        }
      >
        {title}
      </span>
    </button>
  );
}

function Metric({
  label,
  value,
  emphasis = false,
  danger = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="border-r border-b border-gray-200 px-4 py-3 last:border-r-0 dark:border-white/10">
      <p className="text-[9px] font-semibold tracking-wide text-gray-500 uppercase dark:text-white/35">
        {label}
      </p>
      <p
        className={`mt-1 text-[11px] font-semibold tabular-nums ${
          danger
            ? "text-red-600 dark:text-red-400"
            : emphasis
              ? "text-primary font-bold"
              : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
  multiline = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div
      className={multiline ? "block" : "flex items-start justify-between gap-6"}
    >
      <span className="shrink-0 text-xs text-gray-500 dark:text-white/45">
        {label}
      </span>
      <span
        className={`${multiline ? "mt-1 block" : "text-right"} ${mono ? "font-mono" : ""} text-xs break-words text-gray-800 dark:text-white/85`}
      >
        {value}
      </span>
    </div>
  );
}
