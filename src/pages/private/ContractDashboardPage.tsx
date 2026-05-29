import { useMemo, useState } from "react";
import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { formatDate } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import IconAction from "@/components/custom_ui/IconAction";
import { Pagination } from "@/components/custom_ui/Pagination";
import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { PATHS } from "@/config/paths";
import { useContractList } from "@/hooks/data/useContractHooks";
import type { Contract, ContractStatus } from "@/types/Contract";
import { IoIosInformationCircleOutline } from "react-icons/io";

const breadcrumbItems = [
  { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
  { label: "Hợp đồng", path: PATHS.DASHBOARD.CONTRACTS },
  { label: "Tất cả" },
];

const columns = [
  { key: "contract", label: "Hợp đồng", width: "w-[28%]", align: "left" },
  { key: "partner", label: "Đối tác", width: "w-[23%]", align: "left" },
  { key: "status", label: "Trạng thái", width: "w-[16%]", align: "center" },
  {
    key: "document",
    label: "File hợp đồng",
    width: "w-[17%]",
    align: "center",
  },
  { key: "actions", label: "Thao tác", width: "w-[16%]", align: "center" },
] as const;

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Bản nháp",
  unsigned: "Chờ ký",
  owner_signed: "Chủ sở hữu đã ký",
  completed: "Hoàn tất",
};

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

const CONTRACT_STATUS_BADGE: Record<
  ContractStatus,
  "info" | "warning" | "purple" | "success"
> = {
  draft: "info",
  unsigned: "warning",
  owner_signed: "purple",
  completed: "success",
};

function getContractFileKey(contractUrl?: string | null) {
  const value = contractUrl?.trim();
  if (!value) {
    return "";
  }

  try {
    return new URL(value).pathname.replace(/^\/+/, "");
  } catch {
    return value.replace(/^https?:\/\/[^/]+\//, "").replace(/^\/+/, "");
  }
}

export default function ContractDashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const params = useMemo(() => ({ page, limit: pageSize }), [page]);
  const { data, isLoading, isError, refetch, fullResponse } =
    useContractList(params);

  const contracts = data || [];
  const pagination = fullResponse?.pagination;

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Quản lý hợp đồng
          </h1>
        </div>
      </div>

      <div className="my-8">
        <ContractTable
          contracts={contracts}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          onOpenDocument={(contract) => {
            const key = getContractFileKey(contract.contractUrl);
            if (!key) {
              return;
            }

            const baseUrl = import.meta.env.VITE_HUB_API_URL;
            window.open(`${baseUrl}/api/v1/s3/view/${key}`, "_blank");
          }}
          onOpenDetail={(contract) => navigate(getPreviewPath(contract.contractId))}
        />

        {pagination ? (
          <Pagination
            total={pagination.totalRecords || 0}
            page={page}
            pageSize={pagination.pageSize || pageSize}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  );
}

function ContractTable({
  contracts,
  isLoading,
  isError,
  refetch,
  onOpenDocument,
  onOpenDetail,
}: {
  contracts: Contract[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onOpenDocument: (contract: Contract) => void;
  onOpenDetail: (contract: Contract) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
        <p className="max-w-md text-center text-sm font-medium text-red-400">
          Đã xảy ra lỗi khi tải danh sách hợp đồng
        </p>
        <button
          onClick={refetch}
          className="mt-6 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Danh sách trống
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
          Hệ thống chưa có hợp đồng nào được tạo
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] table-fixed border-collapse border-x border-t border-gray-400 text-left dark:border-white/10">
        <thead>
          <tr className="bg-gray-100/50 dark:bg-white/5">
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`border-b border-gray-400 p-4 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:border-white/10 dark:text-gray-400 ${
                  column.width
                } ${column.align === "center" ? "text-center" : "text-left"} ${
                  index < columns.length - 1
                    ? "border-r border-gray-400 dark:border-white/10"
                    : ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {contracts.map((contract) => {
            const partnerName =
              contract.partnerCompanyInfo.companyName?.trim() ||
              contract.partnerCompanyInfo.ownerName?.trim() ||
              "-";
            const hasDocument = Boolean(
              getContractFileKey(contract.contractUrl),
            );

            return (
              <tr
                key={contract.contractId}
                className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5"
              >
                <td className="border-r border-gray-400 p-4 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {contract.contractNumber || contract.contractId}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Hạn hợp đồng: {formatDate(contract.contractDueDate)}
                      </p>
                      <p className="mt-1 truncate text-[13px] text-gray-600 dark:text-gray-300">
                        {contract.ownerCompanyInfo.companyName || "-"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="border-r border-gray-400 p-4 dark:border-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {partnerName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Đối tác
                    </p>
                  </div>
                </td>

                <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                  <Badge
                    type={CONTRACT_STATUS_BADGE[contract.status]}
                    value={CONTRACT_STATUS_LABELS[contract.status]}
                  />
                </td>

                <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                  <button
                    type="button"
                    disabled={!hasDocument}
                    onClick={() => onOpenDocument(contract)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      hasDocument
                        ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
                        : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-white/10 dark:text-white/30"
                    }`}
                  >
                    Tải hợp đồng
                  </button>
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip content="Xem bản preview">
                      <IconAction
                        icon={<FiEye />}
                        onClick={() => onOpenDetail(contract)}
                      />
                    </Tooltip>
                    <Tooltip content="Chi tiết hợp đồng">
                      <IconAction
                        icon={<IoIosInformationCircleOutline />}
                        onClick={() => onOpenDetail(contract)}
                      />
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
