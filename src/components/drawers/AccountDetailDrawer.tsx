import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineX } from "react-icons/hi";
import { FiEdit3, FiMail, FiPhone } from "react-icons/fi";
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
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleEdit = () => {
    if (!user) return;
    onClose();
    onEdit(user);
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          {/* Backdrop - pure bg-black/80 for 60fps performance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80"
          />

          {/* Sliding drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full h-dvh max-h-screen shadow-2xl"
          >
            <aside
              data-lenis-prevent
              className="flex h-full h-dvh max-h-screen w-[min(100vw,600px)] flex-col overflow-hidden border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a]"
            >
              {/* Header */}
              <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 bg-white/90 px-5 py-5 backdrop-blur-md sm:px-6 dark:border-white/10 dark:bg-[#0a0a0a]/90">
                <div className="min-w-0">
                  <h2 className="mt-1 truncate text-base font-semibold text-gray-900 dark:text-white">
                    {user.name || "Chi tiết tài khoản"}
                  </h2>
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

              {/* Scrollable details */}
              <div
                data-lenis-prevent
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
              >
                {/* Top bar with update date & badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
                  <p className="text-xs text-gray-500 dark:text-white/45">
                    Cập nhật {formatDateTime(user.updatedAt || user.createdAt)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      type={user.status === "ACTIVE" ? "success" : "info"}
                      value={
                        user.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"
                      }
                    />
                    {user.isOnline ? (
                      <Badge type="primary" value="Trực tuyến" />
                    ) : null}
                  </div>
                </div>

                {/* 3 Action cards (bỏ nút sao chép mã tài khoản) */}
                <div className="mb-5 grid grid-cols-3 gap-2">
                  <DrawerActionCard
                    title="Chỉnh sửa thông tin"
                    icon={<FiEdit3 />}
                    onClick={handleEdit}
                    primary
                  />
                  <DrawerActionCard
                    title="Sao chép số điện thoại"
                    icon={<FiPhone />}
                    onClick={() =>
                      void copyValue(user.phone, "Số điện thoại")
                    }
                  />
                  <DrawerActionCard
                    title="Sao chép email"
                    icon={<FiMail />}
                    onClick={() => void copyValue(user.email, "Email")}
                  />
                </div>

                {/* Account Summary Card - exactly like Saleforce DebtSummaryCard */}
                <section className="mb-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/60 dark:border-white/10 dark:bg-white/[0.025]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 dark:border-white/10">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase dark:text-white/45">
                        Thông tin tổng quan
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                        Tổng hợp định danh & trạng thái hoạt động
                      </p>
                    </div>
                    <Badge
                      type={user.status === "ACTIVE" ? "success" : "info"}
                      value={
                        user.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3">
                    <Metric
                      label="Vai trò"
                      value={ROLE_LABELS[user.role] || user.role}
                    />
                    <Metric
                      label="Trực tuyến"
                      value={user.isOnline ? "Online" : "Offline"}
                      emphasis={user.isOnline}
                    />
                    <Metric
                      label="Số điện thoại"
                      value={user.phone || "Chưa có"}
                    />
                    <Metric
                      label="Ngày tạo"
                      value={formatDateTime(user.createdAt)}
                    />
                    <Metric
                      label="Cập nhật"
                      value={formatDateTime(user.updatedAt || user.createdAt)}
                    />
                    <Metric
                      label="Mã User ID"
                      value={user.userId ? `${user.userId.slice(0, 10)}...` : "Chưa có"}
                    />
                  </div>
                </section>

                {/* Section: Thông tin tài khoản */}
                <Section title="Thông tin tài khoản">
                  <Row label="Họ tên" value={user.name || "Chưa có"} />
                  <Row label="Email" value={user.email || "Chưa có"} mono />
                  <Row
                    label="Số điện thoại"
                    value={user.phone || "Chưa có"}
                    mono
                  />
                  <Row
                    label="Vai trò"
                    value={ROLE_LABELS[user.role] || user.role}
                  />
                  <Row
                    label="Status"
                    value={
                      user.status === "ACTIVE"
                        ? "ACTIVE (Đang hoạt động)"
                        : user.status === "INACTIVE"
                          ? "INACTIVE (Ngừng hoạt động)"
                          : user.status || "ACTIVE"
                    }
                  />
                </Section>

                {/* Section: Thông tin hệ thống */}
                <Section title="Thông tin hệ thống">
                  <Row label="User ID" value={user.userId || "Chưa có"} mono />
                  <Row label="Ngày tạo" value={formatDateTime(user.createdAt)} />
                  <Row
                    label="Cập nhật"
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
      <p className="text-[9px] font-semibold text-gray-500 uppercase dark:text-white/35">
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-gray-200 py-5 last:border-b-0 dark:border-white/10">
      <h3 className="mb-4 text-[11px] font-semibold text-gray-500 uppercase dark:text-white/45">
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
      className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5 ${
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
