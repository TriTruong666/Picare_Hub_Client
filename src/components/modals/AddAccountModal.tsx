import { useAtom } from "jotai";
import { useState, type ReactNode } from "react";
import { HiOutlineX } from "react-icons/hi";
import { FiArrowLeft } from "react-icons/fi";
import clsx from "clsx";

import { useCreateUser } from "@/hooks/data/useUserHooks";
import { toast } from "@/hooks/useToast";
import { closeModalAtom } from "@/stores/modalStore";
import type { CreateUserPayload } from "@/types/User";

type FormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

type RoleOption = {
  value: CreateUserPayload["role"];
  label: string;
  description: string;
  accentClass: string;
  icon: ReactNode;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Toàn quyền hệ thống",
    accentClass:
      "from-rose-500/20 to-orange-500/20 text-rose-600 dark:text-rose-300",
    icon: "A",
  },
  {
    value: "ceo",
    label: "CEO",
    description: "Ban giám đốc",
    accentClass:
      "from-rose-500/20 to-orange-500/20 text-rose-600 dark:text-rose-300",
    icon: "CE",
  },
  {
    value: "supply_chain",
    label: "Supply Chain",
    description: "Vận hành chuỗi cung ứng",
    accentClass:
      "from-sky-500/20 to-cyan-500/20 text-sky-600 dark:text-sky-300",
    icon: "SC",
  },
  {
    value: "hr",
    label: "HR",
    description: "Nhân sự",
    accentClass:
      "from-sky-500/20 to-cyan-500/20 text-sky-600 dark:text-sky-300",
    icon: "HR",
  },
  {
    value: "qc",
    label: "QC",
    description: "Kiểm soát chất lượng",
    accentClass:
      "from-sky-500/20 to-cyan-500/20 text-sky-600 dark:text-sky-300",
    icon: "QC",
  },

  {
    value: "ecom",
    label: "Ecom",
    description: "Vận hành sàn TMĐT",
    accentClass:
      "from-sky-500/20 to-cyan-500/20 text-sky-600 dark:text-sky-300",
    icon: "ES",
  },
  {
    value: "warehouse",
    label: "Warehouse",
    description: "Kho và xuất nhập",
    accentClass:
      "from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300",
    icon: "WH",
  },
  {
    value: "sales",
    label: "Sales",
    description: "Kinh doanh",
    accentClass:
      "from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300",
    icon: "SL",
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Truyền thông",
    accentClass:
      "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-700 dark:text-fuchsia-300",
    icon: "MK",
  },
  {
    value: "business_development",
    label: "BD",
    description: "Phát triển đối tác",
    accentClass:
      "from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300",
    icon: "BD",
  },
  {
    value: "finance",
    label: "Finance",
    description: "Kế toán",
    accentClass:
      "from-stone-400/30 to-zinc-400/30 text-stone-700 dark:text-stone-200",
    icon: "FN",
  },
  {
    value: "demo",
    label: "Demo",
    description: "Tài khoản demo",
    accentClass:
      "from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300",
    icon: "DM",
  },
];

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

function RoleCard({
  option,
  active,
  onClick,
}: {
  option: RoleOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group rounded-lg border p-3 text-left transition-all duration-200",
        active
          ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20"
          : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10",
      )}
    >
      <div
        className={clsx(
          "mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold",
          option.accentClass,
        )}
      >
        {option.icon}
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        {option.label}
      </h3>

      <p className="mt-1 text-[11px] leading-4 text-gray-500 dark:text-gray-400">
        {option.description}
      </p>
    </button>
  );
}

function RolePhase({
  selected,
  onSelect,
}: {
  selected: CreateUserPayload["role"] | null;
  onSelect: (role: CreateUserPayload["role"]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {ROLE_OPTIONS.map((option) => (
        <RoleCard
          key={option.value}
          option={option}
          active={selected === option.value}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

export function AddAccountModal() {
  const [, closeModal] = useAtom(closeModalAtom);
  const createUserMutation = useCreateUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<CreateUserPayload["role"] | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const isSubmitting = createUserMutation.isPending;
  const selectedRole = ROLE_OPTIONS.find((item) => item.value === role);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!role) {
      toast.warning("Thiếu vai trò", "Vui lòng chọn vai trò cho tài khoản.");
      return;
    }

    const payload: CreateUserPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || null,
      role,
    };

    if (!payload.name || !payload.email || !payload.password) {
      toast.warning(
        "Thiếu thông tin",
        "Vui lòng nhập đủ họ tên, email và mật khẩu.",
      );
      return;
    }

    const response = await createUserMutation.mutateAsync(payload);
    if (response.success) {
      closeModal();
    }
  };

  return (
    <div className="dashboard-theme flex w-150 max-w-full flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]">
      <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Tạo tài khoản mới
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {step === 1
              ? "Chọn vai trò trước khi nhập thông tin tài khoản."
              : `Đang tạo tài khoản cho vai trò ${selectedRole?.label || ""}.`}
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

      <div className="p-6">
        {step === 1 ? (
          <RolePhase selected={role} onSelect={setRole} />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                Vai trò đã chọn
              </p>
              <p className="mt-1 text-sm text-indigo-900 dark:text-white">
                {selectedRole?.label}
              </p>
              <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-200/80">
                {selectedRole?.description}
              </p>
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

              <div className="md:col-span-2">
                <FieldLabel required>Mật khẩu</FieldLabel>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                  placeholder="Nhập mật khẩu đăng nhập"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
        <div>
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <FiArrowLeft />
              Quay lại
            </button>
          ) : null}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Thoát
          </button>

          {step === 1 ? (
            <button
              type="button"
              onClick={() => role && setStep(2)}
              disabled={!role}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-95",
                role
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
                  : "bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-white/40",
              )}
            >
              Tiếp theo
            </button>
          ) : (
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
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
