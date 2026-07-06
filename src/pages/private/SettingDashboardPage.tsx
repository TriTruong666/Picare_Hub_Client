import type { ReactNode } from "react";
import { useState } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { LuSearch } from "react-icons/lu";

import { formatDateTime } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import { Checkbox } from "@/components/custom_ui/Checkbox";
import { Pagination } from "@/components/custom_ui/Pagination";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { useChangePassword } from "@/hooks/data/useAuthHooks";
import {
  useDeleteSystemLogs,
  useSystemHealth,
  useSystemLogs,
} from "@/hooks/data/useSystemHooks";
import { useUpdateUserInfo } from "@/hooks/data/useUserHooks";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/useToast";
import type { SystemLogStatus } from "@/types/System";

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

const STORAGE_OPTIONS = ["Kho Picare", "Kho Dermacoon", "Kho Trung Hành"] as const;

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
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">{label}</h1>
          <p className="text-[13px] text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        {children}
        {info && (
          <div className="flex gap-3 rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:border-border-dark dark:text-white/70">
            <IoIosInformationCircleOutline className="mt-0.5 shrink-0" />
            {info}
          </div>
        )}
      </div>
      <footer className="flex items-center justify-between gap-4 px-6 py-4">
        <div>{helper}</div>
        {onSubmit && (
          <button type="button" onClick={onSubmit} disabled={disabled} className="btn-primary">
            {buttonTitle}
          </button>
        )}
      </footer>
    </section>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div className="w-full space-y-6 px-6 py-4 xl:px-12">{children}</div>;
}

export function ProfileSettingDashboardPage() {
  const { user: me } = useAuth();
  const updateProfile = useUpdateUserInfo();
  const [form, setForm] = useState<{
    name: string | null;
    phone: string | null;
  }>({ name: null, phone: null });
  const name = form.name ?? me?.name ?? "";
  const phone = form.phone ?? me?.phone ?? "";

  return (
    <Page>
      <SettingCard
        label="Thông tin cơ bản"
        description="Bạn có thể cập nhật tên và số điện thoại của bạn"
        buttonTitle={updateProfile.isPending ? "Đang cập nhật…" : "Cập nhật"}
        disabled={updateProfile.isPending}
        onSubmit={() => {
          if (!me?.userId) return;
          updateProfile.mutate({
            userId: me.userId,
            data: { name: name.trim(), phone: phone.trim() },
          });
        }}
        helper={<span className="helper-setting-card">Chỉ được thay đổi 1 lần / tuần</span>}
      >
        <form className="flex max-w-3xl flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={me?.email || ""} aria-label="Email" className="input-primary" disabled />
            <input
              value={phone}
              aria-label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              className="input-primary"
              onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))}
            />
          </div>
          <input
            value={name}
            aria-label="Tên của bạn"
            placeholder="Tên của bạn"
            className="input-primary"
            onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
          />
        </form>
      </SettingCard>
    </Page>
  );
}

export function SecuritySettingDashboardPage() {
  const changePassword = useChangePassword();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

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
    if (response.success) setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <Page>
      <SettingCard
        label="Mật khẩu"
        description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn"
        buttonTitle={changePassword.isPending ? "Đang đổi…" : "Đổi mật khẩu"}
        onSubmit={handleSubmit}
        disabled={changePassword.isPending}
        helper={<span className="helper-setting-card">Bạn có thể đổi mật khẩu 1 tháng / lần</span>}
      >
        <form className="flex max-w-3xl flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          {([
            ["oldPassword", "Mật khẩu hiện tại"],
            ["newPassword", "Mật khẩu mới"],
            ["confirmPassword", "Xác nhận mật khẩu mới"],
          ] as const).map(([key, placeholder]) => (
            <input
              key={key}
              type="password"
              value={form[key]}
              aria-label={placeholder}
              placeholder={placeholder}
              className="input-primary"
              onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))}
            />
          ))}
        </form>
      </SettingCard>
    </Page>
  );
}

export function StorageSettingDashboardPage() {
  const [storage, setStorage] = useState<string | null>(() => localStorage.getItem("storage"));
  const [message, setMessage] = useState<string | null>(null);

  return (
    <Page>
      <SettingCard
        label="Tồn kho"
        description="Chọn kho mặc định để sử dụng trong dashboard"
        buttonTitle="Cập nhật"
        onSubmit={() => {
          if (!storage) {
            toast.error("Thiếu kho mặc định", "Vui lòng chọn kho trước khi lưu.");
            return;
          }
          localStorage.setItem("storage", storage);
          setMessage("Đã lưu kho mặc định.");
          toast.success("Thành công", "Đã lưu kho mặc định.");
        }}
        helper={<span className="helper-setting-card">Chọn kho mặc định cho các tác vụ tồn kho</span>}
        info={<span className="text-[13px]">{message || "Chọn một kho rồi bấm Cập nhật để lưu."}</span>}
      >
        <div className="flex max-w-3xl flex-col gap-3">
          {STORAGE_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 transition ${
                storage === option
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-[13px] font-medium text-gray-900 dark:text-white">{option}</span>
              <input
                type="radio"
                name="storage"
                checked={storage === option}
                onChange={() => { setStorage(option); setMessage(null); }}
                className="size-4 accent-emerald-500"
              />
            </label>
          ))}
        </div>
      </SettingCard>
    </Page>
  );
}

function statusLabel(status: SystemLogStatus) {
  return status === "complete" ? "Hoàn thành" : status === "running" ? "Đang chạy" : "Lỗi";
}

function statusType(status: SystemLogStatus): "success" | "warning" | "error" {
  return status === "complete" ? "success" : status === "running" ? "warning" : "error";
}

function durationLabel(duration?: number) {
  if (typeof duration !== "number") return "--";
  if (duration < 1000) return `${duration} ms`;
  if (duration < 60_000) return `${(duration / 1000).toFixed(1)} s`;
  return `${(duration / 60_000).toFixed(1)} phút`;
}

export function SystemSettingDashboardPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SystemLogStatus | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const limit = 20;
  const health = useSystemHealth();
  const logs = useSystemLogs({ page, limit, status, search });
  const deleteLogs = useDeleteSystemLogs();
  const rows = logs.data || [];
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  const toggleAll = () => setSelectedIds(allSelected ? [] : rows.map((row) => row.id));

  return (
    <Page>
      <SettingCard
        label="Nhật ký hệ thống"
        description="Theo dõi trạng thái Hub, OMS và các job hệ thống mới nhất."
        buttonTitle={health.isFetching || logs.isFetching ? "Đang làm mới…" : "Làm mới"}
        onSubmit={async () => {
          await Promise.all([health.refetch(), logs.refetch()]);
          toast.success("Thành công", "Đã làm mới dữ liệu hệ thống.");
        }}
        helper={<span />}
        info={<span className="text-[13px]">Hiển thị log hệ thống để quản lý và kiểm tra các job chạy.</span>}
      >
        {health.isLoading ? (
          <div className="flex min-h-20 items-center justify-center"><Spinner size="md" /></div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {health.data?.map((system) => (
              <div key={system.key} className="flex items-center justify-between rounded-xl border border-gray-300 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div>
                  <p className="text-[13px] font-medium text-gray-900 dark:text-white">{system.label}</p>
                  <p className="text-xs text-gray-500 dark:text-white/50">{system.error || `Uptime: ${Math.floor((system.health?.uptime || 0) / 60)}m`}</p>
                </div>
                <Badge
                  value={system.health?.status === "running" ? "Đang hoạt động" : "Không phản hồi"}
                  type={system.health?.status === "running" ? "success" : "error"}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-72 flex-1">
            <LuSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); setSelectedIds([]); }}
              placeholder="Tìm theo tên job, thông điệp hoặc mã công ty…"
              className="input-primary w-full pl-11"
            />
          </div>
          <div className="w-56">
            <GlassSelect
              value={status || ""}
              onChange={(value) => { setStatus((value || null) as SystemLogStatus | null); setPage(1); setSelectedIds([]); }}
              options={[
                { label: "Tất cả trạng thái", value: "" },
                { label: "Hoàn thành", value: "complete" },
                { label: "Đang chạy", value: "running" },
                { label: "Lỗi", value: "error" },
              ]}
            />
          </div>
        </div>

        {rows.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-gray-300 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <Checkbox checked={allSelected} onChange={toggleAll} />
              <span className="text-xs text-gray-500 dark:text-white/50">{selectedIds.length ? `${selectedIds.length} đã chọn` : "Chọn tất cả trang này"}</span>
            </div>
            {selectedIds.length > 0 && (
              <button
                type="button"
                disabled={deleteLogs.isPending}
                onClick={async () => { await deleteLogs.mutateAsync(selectedIds); setSelectedIds([]); }}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Xóa {selectedIds.length} log
              </button>
            )}
          </div>
        )}

        {logs.isLoading ? (
          <div className="flex min-h-56 items-center justify-center"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 border-collapse border border-gray-300 text-left dark:border-white/10">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="border-b border-gray-300 px-4 py-3 dark:border-white/10"><Checkbox checked={allSelected} onChange={toggleAll} /></th>
                  {['Log hệ thống', 'Trạng thái', 'Mã công ty', 'Thời gian hoàn thành', 'Thời gian thực hiện'].map((label) => (
                    <th key={label} className="border-b border-gray-300 px-4 py-3 text-xs font-semibold text-gray-600 dark:border-white/10 dark:text-white/70">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3"><Checkbox checked={selectedIds.includes(log.id)} onChange={(checked) => setSelectedIds((ids) => checked ? [...ids, log.id] : ids.filter((id) => id !== log.id))} /></td>
                    <td className="max-w-xl px-4 py-3 text-[13px] text-gray-900 dark:text-white">{log.message || log.jobName}</td>
                    <td className="px-4 py-3"><Badge value={statusLabel(log.status)} type={statusType(log.status)} /></td>
                    <td className="px-4 py-3 text-[13px] text-gray-600 dark:text-white/70">{log.companyId || "--"}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600 tabular-nums dark:text-white/70">{formatDateTime(log.completedAt)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600 tabular-nums dark:text-white/70">{durationLabel(log.durationMs)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-gray-500 dark:text-white/45">Chưa có log hệ thống.</td></tr>
                )}
              </tbody>
            </table>
            <Pagination
              page={page}
              pageSize={limit}
              total={logs.fullResponse?.pagination?.totalRecords || 0}
              onPageChange={(value) => { setPage(value); setSelectedIds([]); }}
            />
          </div>
        )}
      </SettingCard>
    </Page>
  );
}
