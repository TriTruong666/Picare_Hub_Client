import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import { FiPlus, FiSearch, FiUserPlus } from "react-icons/fi";
import { PiExport } from "react-icons/pi";
import { formatDateTime, formatRelativeTime } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { Pagination } from "@/components/custom_ui/Pagination";
import GlassSelect from "@/components/custom_ui/Select";
import { StateShell } from "@/components/custom_ui/ShellState";
import { Td, Th } from "@/components/custom_ui/Table";
import { AccountDetailDrawer } from "@/components/drawers/AccountDetailDrawer";
import { useUsers } from "@/hooks/data/useUserHooks";
import { openModalAtom, openUpdateAccountModalAtom } from "@/stores/modalStore";
import type { BasePaginatedResponse } from "@/types/ApiResponse";
import {
  ROLE_LABELS,
  USER_ROLE_OPTIONS,
  type User,
  type UserRole,
} from "@/types/User";

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
  { label: "Trang chủ", path: "/dashboard" },
  { label: "Tài khoản", path: "/dashboard/accounts" },
  { label: "Tất cả" },
];

export default function AccountDashboardPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [sortType, setSortType] = useState<SortType>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [, openModal] = useAtom(openModalAtom);
  const [, openUpdateAccountModal] = useAtom(openUpdateAccountModalAtom);

  // Debounce search input like CustomerListPage
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (nextSearch !== search) {
        setPage(1);
        setSearch(nextSearch);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [search, searchInput]);

  const {
    data: users,
    isLoading,
    isError,
    refetch,
    fullResponse,
  } = useUsers({
    page,
    limit: pageSize,
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const pagination = (fullResponse as BasePaginatedResponse<User[]>)
    ?.pagination;

  return (
    <div className="page-layout">
      {/* Page Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            Quản lý tài khoản
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-44">
            <GlassSelect
              value={sortType}
              onChange={(value) => setSortType(value as SortType)}
              placeholder="Sắp xếp theo"
              options={[
                { label: "Ngày tạo", value: "by_date" },
                { label: "Trạng thái", value: "by_status" },
              ]}
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Xuất file <PiExport />
          </button>

          <button
            type="button"
            onClick={() => openModal("add_account")}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
          >
            <FiUserPlus />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400 dark:text-white/30" />
          <input
            id="account-search"
            type="text"
            placeholder="Tìm kiếm tài khoản theo tên, email, SĐT..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pr-4 pl-9 text-[13px] text-gray-800 transition outline-none placeholder:text-gray-400 hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
          />
        </div>

        <div className="w-full sm:w-56">
          <GlassSelect
            value={roleFilter}
            onChange={(value) => {
              setPage(1);
              setRoleFilter(value as UserRole | "");
            }}
            placeholder="Tất cả vai trò"
            options={USER_ROLE_OPTIONS}
          />
        </div>
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-6"
      >
        <AccountTable
          users={users || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          sortType={sortType}
          onUserClick={(user) => setSelectedUser(user)}
        />

        {!isLoading && pagination ? (
          <Pagination
            total={pagination.totalRecords || 0}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        ) : null}
      </motion.div>

      {/* Account Detail Drawer */}
      <AccountDetailDrawer
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onEdit={(user) => openUpdateAccountModal(user)}
      />
    </div>
  );
}

interface AccountTableProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  sortType: SortType;
  onUserClick: (user: User) => void;
}

function AccountTable({
  users,
  isLoading,
  isError,
  onRetry,
  sortType,
  onUserClick,
}: AccountTableProps) {
  const [, openModal] = useAtom(openModalAtom);

  const sortedUsers = useMemo(
    () => sortUsers(users, sortType),
    [users, sortType],
  );

  if (isLoading) {
    return <AccountTableSkeleton />;
  }

  if (isError) {
    return (
      <StateShell
        title="Không thể tải danh sách tài khoản"
        message="Có lỗi xảy ra khi tải dữ liệu người dùng từ hệ thống."
        actionLabel="Thử lại"
        onAction={onRetry}
      />
    );
  }

  if (users.length === 0) {
    return (
      <StateShell
        title="Danh sách trống"
        message="Không tìm thấy tài khoản nào phù hợp với bộ lọc hiện tại."
        actionLabel="Thêm tài khoản"
        onAction={() => openModal("add_account")}
      />
    );
  }

  return (
    <div className="flex flex-col overflow-x-auto">
      <table className="w-full min-w-250 table-fixed border-collapse border-x border-t border-gray-400 text-left dark:border-white/10">
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[18%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="bg-gray-50/50 dark:bg-white/5">
            <Th>Thông tin tài khoản</Th>
            <Th className="text-center">Số điện thoại</Th>
            <Th className="text-center">Vai trò</Th>
            <Th className="text-center">Trạng thái</Th>
            <Th className="text-center" isLast>
              Ngày khởi tạo
            </Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {sortedUsers.map((user) => (
            <tr
              key={user.userId}
              onClick={() => onUserClick(user)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onUserClick(user);
                }
              }}
              tabIndex={0}
              aria-label={`Xem chi tiết tài khoản ${user.name}`}
              className="cursor-pointer transition-colors hover:bg-gray-50/70 focus:bg-gray-50/70 focus:outline-none dark:hover:bg-white/3 dark:focus:bg-white/3"
            >
              <Td>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/15 to-primary/15 text-xs font-bold text-gray-800 dark:text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="truncate font-mono text-[11px] text-gray-500 dark:text-white/50">
                      {user.email}
                    </span>
                  </div>
                </div>
              </Td>

              <Td verticalAlign="middle">
                <div className="flex min-h-10 w-full items-center justify-center text-center">
                  <span className="font-mono text-[11px] font-medium text-gray-600 dark:text-gray-400">
                    {user.phone || "-"}
                  </span>
                </div>
              </Td>

              <Td verticalAlign="middle">
                <div className="flex min-h-10 w-full items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>
              </Td>

              <Td verticalAlign="middle">
                <div className="flex min-h-10 w-full items-center justify-center text-center">
                  <Badge
                    type={user.isOnline ? "success" : "info"}
                    value={user.isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                  />
                </div>
              </Td>

              <Td verticalAlign="middle" isLast>
                <div className="flex min-h-10 w-full flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                    {formatRelativeTime(user.createdAt)}
                  </span>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountTableSkeleton() {
  return (
    <div className="flex flex-col overflow-x-auto">
      <table className="w-full min-w-250 table-fixed border-collapse border-x border-t border-gray-400 text-left dark:border-white/10">
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[18%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="bg-gray-50/50 dark:bg-white/5">
            <Th>Thông tin tài khoản</Th>
            <Th className="text-center">Số điện thoại</Th>
            <Th className="text-center">Vai trò</Th>
            <Th className="text-center">Trạng thái</Th>
            <Th className="text-center" isLast>
              Ngày khởi tạo
            </Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <Td key={cellIndex} isLast={cellIndex === 4}>
                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-white/8" />
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
