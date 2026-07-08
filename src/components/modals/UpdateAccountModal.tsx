import clsx from "clsx";
import { useAtom } from "jotai";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import GlassSelect from "@/components/custom_ui/Select";
import { useUpdateUser } from "@/hooks/data/useUserHooks";
import { toast } from "@/hooks/useToast";
import { closeModalAtom } from "@/stores/modalStore";
import type { UpdateUserPayload, User, UserRole } from "@/types/User";

type UpdateFormState = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
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
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "business_development", label: "Business Development" },
  { value: "finance", label: "Finance" },
  { value: "demo", label: "Demo" },
];

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
  const [form, setForm] = useState<UpdateFormState>(() => ({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role,
  }));

  const isSubmitting = updateUserMutation.isPending;

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
      closeModal();
    }
  };

  return (
    <div className="dashboard-theme flex w-[960px] max-w-full flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]">
      <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
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

      <div className="max-h-[calc(100vh-160px)] overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
              Chọn vai trò
            </p>
            <GlassSelect
              value={form.role}
              onChange={(value) => setField("role", value as UserRole)}
              placeholder="Chọn vai trò"
              options={ROLE_OPTIONS}
            />
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
        </div>
      </div>

      <div className="flex justify-between gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
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
