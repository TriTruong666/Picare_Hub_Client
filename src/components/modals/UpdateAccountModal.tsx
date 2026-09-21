import clsx from "clsx";
import { useAtom } from "jotai";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import GlassSelect from "@/components/custom_ui/Select";
import { featureFlags } from "@/config/features.config";
import {
  useRevokeAllUserTrustedIps,
  useUpdateUser,
  useUpdateUserAuthPolicy,
  useUserTrustedIps,
} from "@/hooks/data/useUserHooks";
import { toast } from "@/hooks/useToast";
import { closeModalAtom } from "@/stores/modalStore";
import type {
  UpdateUserPayload,
  User,
  UserRole,
  UserStatus,
} from "@/types/User";

type UpdateFormState = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  bypassIpVerification: boolean;
};

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "admin_brand", label: "Admin Brand" },
  { value: "ceo", label: "CEO" },
  { value: "supply_chain", label: "Supply Chain" },
  { value: "hr", label: "HR" },
  { value: "qc", label: "QC" },
  { value: "ecom", label: "Ecom" },
  { value: "warehouse", label: "Warehouse" },
  { value: "logistics", label: "Logistics" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "business_development", label: "Business Development" },
  { value: "finance", label: "Finance" },
  { value: "demo", label: "Demo" },
];

const STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Đã khóa" },
];

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

export function UpdateAccountModal({ user }: { user: User }) {
  const [, closeModal] = useAtom(closeModalAtom);
  const updateUserMutation = useUpdateUser();
  const updateAuthPolicyMutation = useUpdateUserAuthPolicy();
  const revokeTrustedIpsMutation = useRevokeAllUserTrustedIps();
  const {
    data: trustedIpsData,
    isLoading: isTrustedIpsLoading,
    isError: isTrustedIpsError,
  } = useUserTrustedIps(user.userId, featureFlags.loginVerification);
  const [form, setForm] = useState<UpdateFormState>(() => ({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role,
    status: user.status ?? "ACTIVE",
    bypassIpVerification: Boolean(user.bypassIpVerification),
  }));

  const isSubmitting =
    updateUserMutation.isPending || updateAuthPolicyMutation.isPending;

  const setField = <K extends keyof UpdateFormState>(
    key: K,
    value: UpdateFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload: UpdateUserPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      status: form.status,
    };

    if (!payload.name || !payload.email) {
      toast.warning(
        "Thiếu thông tin",
        "Vui lòng nhập đủ họ tên, email và vai trò.",
      );
      return;
    }

    const response = await updateUserMutation.mutateAsync({
      userId: user.userId,
      payload,
    });

    if (response.success) {
      if (
        featureFlags.loginVerification &&
        form.bypassIpVerification !== user.bypassIpVerification
      ) {
        const policyResponse = await updateAuthPolicyMutation.mutateAsync({
          userId: user.userId,
          payload: {
            bypassIpVerification: form.bypassIpVerification,
          },
        });
        if (!policyResponse.success) return;
      }
      closeModal();
    }
  };

  const handleRevokeTrustedIps = async () => {
    const confirmed = window.confirm(
      "Thu hồi toàn bộ IP tin cậy? Người dùng sẽ phải xác minh email ở lần đăng nhập tiếp theo.",
    );
    if (!confirmed) return;
    await revokeTrustedIpsMutation.mutateAsync(user.userId);
  };

  return (
    <div className="dashboard-theme flex max-h-[calc(100dvh-2rem)] w-[960px] max-w-full flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Chỉnh sửa tài khoản
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cập nhật thông tin và vai trò của tài khoản.
          </p>
        </div>

        <button
          type="button"
          onClick={closeModal}
          disabled={isSubmitting}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Chọn vai trò
              </p>
              <GlassSelect
                value={form.role}
                onChange={(value) => setField("role", value as UserRole)}
                placeholder="Chọn vai trò"
                options={ROLE_OPTIONS}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Trạng thái tài khoản
              </p>
              <GlassSelect
                value={form.status}
                onChange={(value) => setField("status", value as UserStatus)}
                placeholder="Chọn trạng thái"
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel required>Họ và tên</FieldLabel>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <FieldLabel required>Email</FieldLabel>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                placeholder="email@company.com"
              />
            </div>

            <div>
              <FieldLabel>Số điện thoại</FieldLabel>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          {featureFlags.loginVerification ? (
            <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Bỏ qua xác minh IP
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Chỉ bật cho tài khoản quản trị đặc biệt. Khi bật, người dùng
                    không cần nhập mã email khi đăng nhập từ IP mới.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.bypassIpVerification}
                  disabled={isSubmitting}
                  onClick={() =>
                    setField("bypassIpVerification", !form.bypassIpVerification)
                  }
                  className={clsx(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    form.bypassIpVerification
                      ? "bg-indigo-600"
                      : "bg-gray-300 dark:bg-white/15",
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      form.bypassIpVerification
                        ? "translate-x-5"
                        : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={handleRevokeTrustedIps}
                disabled={isSubmitting || revokeTrustedIpsMutation.isPending}
                className="mt-4 text-xs font-medium text-red-600 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
              >
                {revokeTrustedIpsMutation.isPending
                  ? "Đang thu hồi IP..."
                  : "Thu hồi toàn bộ IP tin cậy"}
              </button>

              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                    IP đã tin cậy
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-500">
                    {trustedIpsData?.trustedIpRecords.length ?? 0}/
                    {trustedIpsData?.policy.maxRecords ?? 10}
                  </span>
                </div>

                {isTrustedIpsLoading ? (
                  <p className="text-xs text-gray-500">Đang tải danh sách...</p>
                ) : isTrustedIpsError ? (
                  <p className="text-xs text-red-500">
                    Không thể tải danh sách IP tin cậy.
                  </p>
                ) : trustedIpsData?.trustedIpRecords.length ? (
                  <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                    {trustedIpsData.trustedIpRecords.map((record) => (
                      <div
                        key={record.ipAddress}
                        className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-black/20"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            {record.ipAddress}
                          </span>
                          {record.ipAddress ===
                          trustedIpsData.currentLoginIp ? (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              Hiện tại
                            </span>
                          ) : null}
                        </div>
                        <p
                          className="mt-1 truncate text-[11px] text-gray-500 dark:text-gray-400"
                          title={record.device}
                        >
                          {record.device}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
                          <span>
                            Dùng gần nhất: {formatDateTime(record.lastUsedAt)}
                          </span>
                          <span>
                            Hết hạn: {formatDateTime(record.expiresAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Chưa có địa chỉ IP nào được tin cậy.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 justify-between gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
        <button
          type="button"
          onClick={closeModal}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <FiArrowLeft />
          Hủy
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={clsx(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-95",
            isSubmitting
              ? "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-white/40"
              : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400",
          )}
        >
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật tài khoản"}
        </button>
      </div>
    </div>
  );
}
