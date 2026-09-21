import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { HiOutlineX } from "react-icons/hi";
import { FiEdit3, FiMail, FiPhone } from "react-icons/fi";
import { Badge } from "@/components/custom_ui/Badge";
import { formatDateTime, formatRelativeTime } from "@/common/format";
import { toast } from "@/hooks/useToast";
import { ROLE_LABELS } from "@/types/User";
import { useAuth } from "@/hooks/useAuth";
import { useUserTrustedIps } from "@/hooks/data/useUserHooks";
import {
  accountDetailUserAtom,
  closeDrawerAtom,
} from "@/stores/drawerStore";
import { openUpdateAccountModalAtom } from "@/stores/modalStore";

export function AccountDetailDrawer() {
  const [user] = useAtom(accountDetailUserAtom);
  const [, closeDrawer] = useAtom(closeDrawerAtom);
  const [, openUpdateAccountModal] = useAtom(openUpdateAccountModalAtom);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimationDone(true), 350);
    return () => clearTimeout(timer);
  }, []);

  const { user: currentUser } = useAuth();
  const canViewTrustedIps = currentUser?.role === "admin";
  const {
    data: security,
    isLoading: isSecurityLoading,
    isError: isSecurityError,
    isFetching: isSecurityFetching,
    refetch: refetchSecurity,
  } = useUserTrustedIps(
    user?.userId ?? "",
    Boolean(user && canViewTrustedIps && isAnimationDone),
  );

  if (!user) return null;

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
    closeDrawer();
    openUpdateAccountModal(user);
  };

  return (
    <aside className="flex h-full w-[min(100vw,600px)] flex-col border-l border-gray-200 bg-white dark:border-white/10 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-5 sm:px-6 dark:border-white/10 dark:bg-[#0a0a0a]">
        <div className="min-w-0">
          <h2 className="mt-1 truncate text-base font-semibold text-gray-900 dark:text-white">
            {user.name || "Chi tiết tài khoản"}
          </h2>
        </div>
        <button
          type="button"
          onClick={closeDrawer}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Đóng chi tiết tài khoản"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </header>

      {/* Scrollable details */}
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
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
                    onClick={() => void copyValue(user.phone, "Số điện thoại")}
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
                      value={
                        user.userId
                          ? `${user.userId.slice(0, 10)}...`
                          : "Chưa có"
                      }
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

                <Section title="Bảo mật đăng nhập & IP tin cậy">
                  {!canViewTrustedIps ? (
                    <p className="text-xs text-gray-500 dark:text-white/45">
                      Chỉ quản trị viên được xem thông tin IP tin cậy.
                    </p>
                  ) : isSecurityLoading ? (
                    <p
                      role="status"
                      className="text-xs text-gray-500 dark:text-white/45"
                    >
                      Đang tải thông tin bảo mật...
                    </p>
                  ) : isSecurityError ? (
                    <div role="alert" className="space-y-2 text-xs">
                      <p className="text-red-600 dark:text-red-400">
                        Không thể tải thông tin IP tin cậy.
                      </p>
                      <button
                        type="button"
                        disabled={isSecurityFetching}
                        onClick={() => void refetchSecurity()}
                        className="text-primary underline disabled:opacity-50"
                      >
                        {isSecurityFetching ? "Đang tải..." : "Thử lại"}
                      </button>
                    </div>
                  ) : security ? (
                    <>
                      <Row
                        label="Bỏ qua xác minh IP"
                        value={
                          security.bypassIpVerification
                            ? "Đang bật"
                            : "Đang tắt"
                        }
                      />
                      <Row
                        label="IP đăng nhập gần nhất"
                        value={security.currentLoginIp || "Chưa ghi nhận"}
                        mono
                      />
                      <Row
                        label="Đăng nhập gần nhất"
                        value={
                          security.lastLoginAt
                            ? formatDateTime(security.lastLoginAt)
                            : "Chưa ghi nhận"
                        }
                      />
                      <Row
                        label="IP còn tin cậy"
                        value={`${security.trustedIpRecords.length} / ${security.policy.maxRecords}`}
                      />
                      <Row
                        label="Thời hạn tin cậy"
                        value={`${security.policy.ttlDays} ngày kể từ xác minh`}
                      />
                      {security.bypassIpVerification && (
                        <p className="text-xs leading-5 text-amber-700 dark:text-amber-400">
                          Tài khoản này được bỏ qua bước xác minh IP, kể cả khi
                          danh sách tin cậy trống.
                        </p>
                      )}
                      {security.trustedIpRecords.length ? (
                        <div className="space-y-3">
                          {security.trustedIpRecords.map((record) => (
                            <div
                              key={record.ipAddress}
                              className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-white/10 dark:bg-white/[0.025]"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono text-xs font-semibold break-all text-gray-900 dark:text-white">
                                  {record.ipAddress}
                                </span>
                                {record.ipAddress ===
                                  security.currentLoginIp && (
                                  <Badge
                                    type="primary"
                                    value="Đăng nhập gần nhất"
                                  />
                                )}
                              </div>
                              <Row
                                label="Thiết bị / trình duyệt"
                                value={record.device || "Chưa ghi nhận"}
                                multiline
                              />
                              <Row
                                label="Đã xác minh"
                                value={formatDateTime(record.trustedAt)}
                              />
                              <Row
                                label="Dùng gần nhất"
                                value={formatDateTime(record.lastUsedAt)}
                              />
                              <Row
                                label="Hết hạn"
                                value={formatDateTime(record.expiresAt)}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-white/45">
                          Chưa có IP tin cậy còn hiệu lực.
                        </p>
                      )}
                    </>
                  ) : null}
                </Section>

                {/* Section: Thông tin hệ thống */}
                <Section title="Thông tin hệ thống">
                  <Row label="User ID" value={user.userId || "Chưa có"} mono />
                  <Row
                    label="Ngày tạo"
                    value={formatDateTime(user.createdAt)}
                  />
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
