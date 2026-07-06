import type { ReactNode } from "react";
import { useState } from "react";
import { FiServer } from "react-icons/fi";
import { IoIosInformationCircleOutline } from "react-icons/io";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useChangePassword } from "@/hooks/data/useAuthHooks";
import { useCommercialSoftwareConnections } from "@/hooks/data/useSystemHooks";
import { useUpdateUserInfo } from "@/hooks/data/useUserHooks";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/useToast";
import type { CommercialSoftwareConnection } from "@/hooks/data/useSystemHooks";

type SettingCardProps = {
  label: string;
  description: string;
  children: ReactNode;
  helper?: ReactNode;
  info?: ReactNode;
  buttonTitle?: string;
  onSubmit?: () => void | Promise<void>;
  disabled?: boolean;
};

function SettingCard({
  label,
  description,
  children,
  helper,
  info,
  buttonTitle = "Lưu thay đổi",
  onSubmit,
  disabled = false,
}: SettingCardProps) {
  return (
    <section className="setting-card">
      <div className="setting-card-main">
        <div className="flex flex-col gap-3">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            {label}
          </h1>
          <p className="text-[13px] text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        {children}
        {info && (
          <div className="dark:border-border-dark flex gap-3 rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:text-white/70">
            <IoIosInformationCircleOutline className="mt-0.5 shrink-0" />
            {info}
          </div>
        )}
      </div>
      {(helper || onSubmit) && (
        <footer className="flex items-center justify-between gap-4 px-6 py-4">
          <div>{helper}</div>
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled}
              className="btn-primary"
            >
              {buttonTitle}
            </button>
          )}
        </footer>
      )}
    </section>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div className="w-full space-y-6 px-6 py-4 xl:px-12">{children}</div>;
}

export function ProfileSettingDashboardPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateUserInfo();
  const [form, setForm] = useState<{
    name: string | null;
    phone: string | null;
  }>({ name: null, phone: null });
  const name = form.name ?? user?.name ?? "";
  const phone = form.phone ?? user?.phone ?? "";

  return (
    <Page>
      <SettingCard
        label="Thông tin cơ bản"
        description="Bạn có thể cập nhật tên và số điện thoại của bạn"
        buttonTitle={updateProfile.isPending ? "Đang cập nhật…" : "Cập nhật"}
        disabled={updateProfile.isPending}
        onSubmit={() => {
          if (!user?.userId) return;
          updateProfile.mutate({
            userId: user.userId,
            data: { name: name.trim(), phone: phone.trim() },
          });
        }}
        helper={
          <span className="helper-setting-card">
            Chỉ được thay đổi 1 lần / tuần
          </span>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={user?.email || ""}
              aria-label="Email"
              className="input-primary"
              readOnly
              disabled
            />
            <input
              value={phone}
              aria-label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              className="input-primary"
              onChange={(event) =>
                setForm((value) => ({ ...value, phone: event.target.value }))
              }
            />
          </div>
          <input
            value={name}
            aria-label="Tên của bạn"
            placeholder="Tên của bạn"
            className="input-primary"
            onChange={(event) =>
              setForm((value) => ({ ...value, name: event.target.value }))
            }
          />
        </form>
      </SettingCard>
    </Page>
  );
}

export function SecuritySettingDashboardPage() {
  const changePassword = useChangePassword();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Thiếu thông tin", "Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Xác nhận chưa đúng", "Mật khẩu xác nhận không khớp.");
      return;
    }

    const response = await changePassword.mutateAsync({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    if (response.success) {
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <Page>
      <SettingCard
        label="Mật khẩu"
        description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn"
        buttonTitle={changePassword.isPending ? "Đang đổi…" : "Đổi mật khẩu"}
        onSubmit={handleSubmit}
        disabled={changePassword.isPending}
        helper={
          <span className="helper-setting-card">
            Bạn có thể đổi mật khẩu 1 tháng / lần
          </span>
        }
      >
        <form
          className="flex max-w-3xl flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          {(
            [
              ["oldPassword", "Mật khẩu hiện tại"],
              ["newPassword", "Mật khẩu mới"],
              ["confirmPassword", "Xác nhận mật khẩu mới"],
            ] as const
          ).map(([key, placeholder]) => (
            <input
              key={key}
              type="password"
              value={form[key]}
              aria-label={placeholder}
              placeholder={placeholder}
              className="input-primary"
              onChange={(event) =>
                setForm((value) => ({ ...value, [key]: event.target.value }))
              }
            />
          ))}
        </form>
      </SettingCard>
    </Page>
  );
}

function ConnectionCard({
  connection,
}: {
  connection: CommercialSoftwareConnection;
}) {
  const { software, health, customerName, isConnected, isChecking } =
    connection;

  return (
    <article className="group relative border border-gray-300 bg-white px-5 py-4 transition-colors hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20">
      <span
        className={`absolute top-1/2 -left-12 hidden h-px w-12 lg:block ${
          isConnected ? "bg-emerald-500/70" : "bg-white/15"
        }`}
      />
      <span
        className={`absolute top-1/2 -left-1.5 hidden size-3 -translate-y-1/2 rounded-full border-2 border-[#050505] lg:block ${
          isConnected ? "bg-emerald-400" : "bg-zinc-600"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <FiServer className="shrink-0 text-gray-400" />
            <h3 className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">
              {software.name || software.softwareId}
            </h3>
          </div>
          <p className="mt-2 truncate text-[11px] text-gray-500 dark:text-white/40">
            {software.domain || "Chưa cấu hình domain"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`size-1.5 rounded-full ${
              isChecking
                ? "animate-pulse bg-amber-400"
                : isConnected
                  ? "bg-emerald-400"
                  : "bg-red-400"
            }`}
          />
          <span
            className={`text-[10px] font-semibold tracking-wide uppercase ${
              isConnected
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isChecking
              ? "Đang kiểm tra"
              : isConnected
                ? "Đã kết nối"
                : "Chưa kết nối"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-3 dark:border-white/[0.07]">
        <div>
          <p className="text-[9px] tracking-wider text-gray-400 uppercase dark:text-white/25">
            Khách hàng
          </p>
          <p className="mt-1 truncate text-[11px] text-gray-700 dark:text-white/60">
            {customerName}
          </p>
        </div>
        <div>
          <p className="text-[9px] tracking-wider text-gray-400 uppercase dark:text-white/25">
            Dịch vụ
          </p>
          <p className="mt-1 text-[11px] text-gray-700 tabular-nums dark:text-white/60">
            {software.serverConfig?.filter((item) => item.active).length || 0}{" "}
            đang bật
          </p>
        </div>
      </div>

      {health && (
        <p className="mt-3 text-[10px] text-gray-400 dark:text-white/30">
          {health.app || software.softwareId} · v{health.version || "--"} ·{" "}
          {health.env || "--"}
        </p>
      )}
    </article>
  );
}

export function SystemSettingDashboardPage() {
  const connections = useCommercialSoftwareConnections();
  const connectedCount = connections.data.filter(
    (item) => item.isConnected,
  ).length;

  return (
    <Page>
      <SettingCard
        label="Trung tâm kết nối Picare Core"
        description="Theo dõi kết nối giữa Core Hub và các phần mềm thương mại được cấp bản quyền."
        buttonTitle={connections.isFetching ? "Đang kiểm tra…" : "Kiểm tra lại"}
        onSubmit={() => connections.refetch()}
        disabled={connections.isFetching}
        helper={
          <span className="helper-setting-card tabular-nums">
            {connectedCount}/{connections.data.length} server đang kết nối
          </span>
        }
        info={
          <span className="text-[13px]">
            Chỉ server trả về <code>isConnectPicare: true</code> mới được xác
            nhận là kết nối với Core.
          </span>
        }
      >
        {connections.isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : connections.isError ? (
          <div className="flex min-h-72 items-center justify-center text-sm text-red-500">
            Không thể tải danh sách phần mềm server.
          </div>
        ) : connections.data.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Chưa có phần mềm server
            </h2>
            <p className="mt-2 text-xs text-gray-500 dark:text-white/40">
              Thêm software loại server trong bản quyền để theo dõi kết nối tại
              đây.
            </p>
          </div>
        ) : (
          <div className="relative grid gap-6 py-4 lg:grid-cols-[260px_72px_minmax(0,1fr)] lg:items-center lg:gap-0">
            <div className="relative z-10 border border-indigo-500/30 bg-indigo-500/[0.06] px-6 py-7 text-center dark:bg-indigo-500/[0.08]">
              <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                <FiServer size={19} />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                Picare Core Hub
              </h2>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                Core đang hoạt động
              </div>
            </div>

            <div className="relative hidden h-full min-h-44 lg:block">
              <span className="absolute top-1/2 left-0 h-px w-1/2 bg-indigo-500/50" />
              <span className="absolute inset-y-6 left-1/2 w-px bg-white/15" />
            </div>

            <div className="flex flex-col gap-3 lg:pl-0">
              {connections.data.map((connection) => (
                <ConnectionCard key={connection.key} connection={connection} />
              ))}
            </div>
          </div>
        )}
      </SettingCard>
    </Page>
  );
}
