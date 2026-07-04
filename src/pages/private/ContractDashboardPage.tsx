import { useMemo, useState } from "react";
import { FiEye, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { formatDate } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import GlassSelect from "@/components/custom_ui/Select";
import IconAction from "@/components/custom_ui/IconAction";
import { Pagination } from "@/components/custom_ui/Pagination";
import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { PATHS } from "@/config/paths";
import { StateShell, StateLoadingContainer } from "@/components/custom_ui/ShellState";
import { useContractList } from "@/hooks/data/useContractHooks";
import type { Contract, ContractStatus, ContractType } from "@/types/Contract";
import { IoIosInformationCircleOutline } from "react-icons/io";

const breadcrumbItems = [
  { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
  { label: "Hợp đồng", path: PATHS.DASHBOARD.CONTRACTS },
  { label: "Tất cả" },
];

const columns = [
  { key: "contract", label: "Đối tác", width: "w-[40%]", align: "left" },
  { key: "status", label: "Trạng thái", width: "w-[18%]", align: "center" },
  {
    key: "document",
    label: "File hợp đồng",
    width: "w-[20%]",
    align: "center",
  },
  { key: "actions", label: "Thao tác", width: "w-[22%]", align: "center" },
] as const;

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Bản nháp",
  unsigned: "Chờ ký",
  owner_signed: "Chủ sở hữu đã ký",
  completed: "Hoàn tất",
};

const CONTRACT_STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Bản nháp", value: "draft" },
  { label: "Chờ ký", value: "unsigned" },
  { label: "Chủ sở hữu đã ký", value: "owner_signed" },
  { label: "Hoàn tất", value: "completed" },
];

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  principle: "Hợp đồng nguyên tắc",
  appendix: "Phụ lục hợp đồng",
  service: "Hợp đồng dịch vụ",
  digital: "Hợp đồng điện tử",
  default: "Mặc định",
};

const CONTRACT_TYPE_OPTIONS = [
  { label: "Tất cả loại hợp đồng", value: "" },
  { label: "Hợp đồng nguyên tắc", value: "principle" },
  { label: "Phụ lục hợp đồng", value: "appendix" },
  { label: "Hợp đồng dịch vụ", value: "service" },
  { label: "Hợp đồng điện tử", value: "digital" },
  { label: "Mặc định", value: "default" },
];

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

function getDetailPath(contractId: string) {
  return PATHS.CONTRACT_DETAIL.replace(":contractId", contractId);
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

function getContractTypeLabel(contractType: ContractType) {
  return CONTRACT_TYPE_LABELS[contractType] || "Không xác định";
}

export default function ContractDashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<ContractType | "">("");
  const pageSize = 10;

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(typeFilter ? { contractType: typeFilter } : {}),
    }),
    [page, pageSize, search, statusFilter, typeFilter],
  );
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

      <div className="mb-6 flex flex-col gap-3 xl:flex-row">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400 dark:text-white/30" />
          <input
            id="contract-search"
            type="text"
            placeholder="Tìm theo số hợp đồng, tên đối tác..."
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="h-10 w-full rounded-lg border border-gray-500 bg-white pr-4 pl-9 text-[13px] text-gray-800 placeholder:text-gray-500 outline-none transition hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
          />
        </div>
        <div className="w-full xl:w-56">
          <GlassSelect
            value={statusFilter}
            onChange={(value) => {
              setPage(1);
              setStatusFilter(value as ContractStatus | "");
            }}
            placeholder="Tất cả trạng thái"
            options={CONTRACT_STATUS_OPTIONS}
          />
        </div>
        <div className="w-full xl:w-56">
          <GlassSelect
            value={typeFilter}
            onChange={(value) => {
              setPage(1);
              setTypeFilter(value as ContractType | "");
            }}
            placeholder="Tất cả loại hợp đồng"
            options={CONTRACT_TYPE_OPTIONS}
          />
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
          onOpenPreview={(contract) =>
            navigate(getPreviewPath(contract.contractId))
          }
          onOpenDetail={(contract) => navigate(getDetailPath(contract.contractId))}
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
  onOpenPreview,
  onOpenDetail,
}: {
  contracts: Contract[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onOpenDocument: (contract: Contract) => void;
  onOpenPreview: (contract: Contract) => void;
  onOpenDetail: (contract: Contract) => void;
}) {
  if (isLoading) {
    return <StateLoadingContainer message="Đang tải dữ liệu..." />;
  }

  if (isError) {
    return (
      <StateShell
        title="Đã xảy ra lỗi"
        message="Đã xảy ra lỗi khi tải danh sách hợp đồng"
        actionLabel="Thử lại"
        onAction={refetch}
      />
    );
  }

  if (contracts.length === 0) {
    return (
      <StateShell
        title="Danh sách trống"
        message="Hệ thống chưa có hợp đồng nào được tạo"
      />
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
            const hasDocument = Boolean(
              getContractFileKey(contract.contractUrl),
            );
            const partnerName =
              contract.partnerCompanyInfo.companyName?.trim() ||
              contract.partnerCompanyInfo.ownerName?.trim() ||
              "-";
            const contractTypeLabel = getContractTypeLabel(contract.contractType);

            return (
              <tr
                key={contract.contractId}
                className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5"
              >
                <td className="border-r border-gray-400 p-4 dark:border-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {partnerName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Số hợp đồng: {contract.contractNumber || contract.contractId}
                    </p>
                    <p className="mt-1 truncate text-[13px] text-gray-600 dark:text-gray-300">
                      Loại hợp đồng: {contractTypeLabel}
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
                        onClick={() => onOpenPreview(contract)}
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
