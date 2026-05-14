/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai";
import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { PiHandEyeLight } from "react-icons/pi";
import clsx from "clsx";
import { closeModalAtom } from "@/stores/modalStore";

function RoleCard({ icon, title, description, active, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group cursor-pointer rounded-lg border p-5 transition-all duration-200",
        active
          ? "border-primary bg-primary/10 shadow-primary/20 shadow-lg"
          : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10",
      )}
    >
      <div
        className={clsx(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition",
          active
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-700 group-hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:group-hover:bg-white/20",
        )}
      >
        {icon}
      </div>

      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

function RolePhase({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (role: "doctor" | "supervisor") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RoleCard
        icon={<FaUserDoctor size={28} />}
        title="Bác sĩ"
        description="Tạo tài khoản dành cho bác sĩ điều trị"
        active={selected === "doctor"}
        onClick={() => onSelect("doctor")}
      />

      <RoleCard
        icon={<PiHandEyeLight size={28} />}
        title="Kiểm định viên"
        description="Quản lý & duyệt hồ sơ bác sĩ"
        active={selected === "supervisor"}
        onClick={() => onSelect("supervisor")}
      />
    </div>
  );
}

export function AddAccountModal() {
  const [role, setRole] = useState<"doctor" | "supervisor" | null>(null);
  const [, closeModal] = useAtom(closeModalAtom);

  return (
    <div className="flex w-150 flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Tạo tài khoản mới
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        <RolePhase selected={role} onSelect={setRole} />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          Thoát
        </button>

        <button
          disabled={!role}
          className={clsx(
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            role
              ? "bg-primary text-white hover:opacity-90"
              : "bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-white/40",
          )}
        >
          Tiếp theo
        </button>
      </div>
    </div>
  );
}
