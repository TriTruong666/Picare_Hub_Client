/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState } from "react";
import { useAtom } from "jotai";
import { FiPlus, FiUserPlus } from "react-icons/fi";
import { IoMdLock, IoMdUnlock } from "react-icons/io";
import { PiExport } from "react-icons/pi";
import { formatRelativeTime } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import IconAction from "@/components/custom_ui/IconAction";
import { Pagination } from "@/components/custom_ui/Pagination";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { useUsers } from "@/hooks/data/useUserHooks";
import {
  openLockModalAtom,
  openModalAtom,
  openUnlockModalAtom,
} from "@/stores/modalStore";
import type { BasePaginatedResponse } from "@/types/ApiResponse";
import type { User } from "@/types/User";

type SortType = "" | "by_date" | "by_status";

function sortUsers(users: User[], sortType: SortType): User[] {
  const sorted = [...users];
  if (sortType === "by_date") {
    return sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  if (sortType === "by_status") {
    return sorted.sort((a, b) => {
      if (a.isOnline === b.isOnline) return 0;
      return a.isOnline ? -1 : 1;
    });
  }
  return sorted;
}

const breadcrumbItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Tai khoan", path: "/dashboard/accounts" },
  { label: "Tat ca" },
];

const columns = [
  { key: "info", label: "Thong tin ca nhan", width: "w-[30%]", align: "left" },
  { key: "phone", label: "So dien thoai", width: "w-[15%]", align: "center" },
  { key: "role", label: "Chuc vu", width: "w-[20%]", align: "center" },
  { key: "status", label: "Trang thai", width: "w-[20%]", align: "center" },
  { key: "actions", label: "Thao tac", width: "w-[15%]", align: "center" },
] as const;

export default function AccountDashboardPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortType, setSortType] = useState<SortType>("");

  const {
    data: users,
    isLoading,
    isError,
    refetch,
    fullResponse,
  } = useUsers(page, pageSize);
  const [, openModal] = useAtom(openModalAtom);

  const pagination = (fullResponse as BasePaginatedResponse<User[]>)?.pagination;

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Quan ly tai khoan
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ml-2">
            <GlassSelect
              value={sortType}
              onChange={(value) => setSortType(value as SortType)}
              placeholder="Sap xep theo"
              options={[
                { label: "Ngay", value: "by_date" },
                { label: "Trang thai", value: "by_status" },
              ]}
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
            Xuat <PiExport />
          </button>

          <button
            onClick={() => openModal("add_account")}
            className="btn-primary"
          >
            <FiUserPlus />
            Them tai khoan
          </button>
        </div>
      </div>

      <div className="my-8">
        <AccountTable
          users={users || []}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          sortType={sortType}
        />

        {pagination ? (
          <Pagination
            total={pagination.totalRecords || 0}
            page={page}
            pageSize={pagination.pageSize || 10}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  );
}

interface AccountTableProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  sortType: SortType;
}

function AccountTable({
  users,
  isLoading,
  isError,
  refetch,
  sortType,
}: AccountTableProps) {
  const [, openLockModal] = useAtom(openLockModalAtom);
  const [, openUnlockModal] = useAtom(openUnlockModalAtom);
  const [, openModal] = useAtom(openModalAtom);

  const roleLabels: Record<User["role"], string> = {
    admin: "Quan tri vien",
    ecom_lead: "Ecom Leader",
    ecom_staff: "Ecom Team",
    logistics: "Van hanh",
    warehouse: "Kho",
    default: "Nguoi dung",
  };

  const sortedUsers = useMemo(() => sortUsers(users, sortType), [users, sortType]);

  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Dang tai du lieu...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
        <p className="max-w-md text-center text-sm font-medium text-red-400">
          Da xay ra loi khi tai danh sach tai khoan
        </p>
        <button
          onClick={refetch}
          className="mt-6 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Thu lai
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Danh sach trong
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
          Chua co tai khoan nao duoc tao trong he thong
        </p>
        <button
          onClick={() => openModal("add_account")}
          className="mt-6 flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-red-600"
        >
          <FiPlus className="text-lg" />
          Them tai khoan ngay
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-400 text-left dark:border-white/10">
        <thead>
          <tr className="bg-gray-200/50 dark:bg-white/5">
            {columns.map((col, i) => (
              <th
                key={col.key}
                className={`border-b border-gray-400 p-4 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-white/10 dark:text-gray-400 ${
                  col.width ?? ""
                } ${col.align === "center" ? "text-center" : "text-left"} ${
                  i < columns.length - 1
                    ? "border-r border-gray-400 dark:border-white/10"
                    : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {sortedUsers.map((user) => (
            <tr
              key={user.userId}
              className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5"
            >
              <td className="border-r border-gray-400 p-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <AccountAvatar name={user.name} />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="text-[12px] font-semibold italic text-gray-900 dark:text-primary/90">
                      {user.email}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(user.createdAt)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <span className="text-[13px] text-gray-600 dark:text-gray-300">
                  {user.phone || "-"}
                </span>
              </td>
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <span className="text-[13px] text-gray-600 dark:text-gray-300">
                  {roleLabels[user.role]}
                </span>
              </td>
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <StatusBadge isOnline={user.isOnline} />
              </td>
              <td className="p-4 text-center">
                <Tooltip content={user.isOnline ? "Vo hieu hoa" : "Kich hoat"}>
                  <IconAction
                    onClick={() =>
                      user.isOnline
                        ? openLockModal("account", user.userId)
                        : openUnlockModal("account", user.userId)
                    }
                    danger={user.isOnline}
                    icon={
                      user.isOnline ? (
                        <IoMdLock className="text-red-400" />
                      ) : (
                        <IoMdUnlock />
                      )
                    }
                  />
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ isOnline }: { isOnline: boolean }) {
  return isOnline ? (
    <Badge type="success" value="Truc tuyen" />
  ) : (
    <Badge type="info" value="Ngoai tuyen" />
  );
}

function AccountAvatar({ name }: { name: string }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-gray-200 to-gray-100 text-sm font-semibold text-gray-700 dark:from-white/20 dark:to-white/5 dark:text-white">
        {name.charAt(0)}
      </div>
    </div>
  );
}
