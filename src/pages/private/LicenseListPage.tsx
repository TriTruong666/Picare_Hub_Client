import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { formatPrice } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import IconAction from "@/components/custom_ui/IconAction";
import { Pagination } from "@/components/custom_ui/Pagination";
import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { useLicenses } from "@/hooks/data/useLicenseHooks";
import { PATHS } from "@/config/paths";
import type { BasePaginatedResponse } from "@/types/ApiResponse";
import type { License } from "@/types/License";

const columns = [
  { key: "customer", label: "Khách hàng", width: "w-[30%]", align: "left" },
  {
    key: "totalValue",
    label: "Tổng giá trị",
    width: "w-[20%]",
    align: "center",
  },
  { key: "cost", label: "Chi phí hàng năm", width: "w-[15%]", align: "center" },
  {
    key: "payment",
    label: "Thanh toán",
    width: "w-[15%]",
    align: "center",
  },
  { key: "actions", label: "Thao tác", width: "w-[20%]", align: "center" },
] as const;

export default function LicenseListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    data: licenses,
    isLoading,
    isError,
    refetch,
    fullResponse,
  } = useLicenses({ page, limit: pageSize });

  const pagination = (fullResponse as BasePaginatedResponse<License[]>)
    ?.pagination;

  return (
    <div className="page-layout dashboard-theme">
      {/* Header Layout aligned with StorageDashboardPage */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb
            items={[
              { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
              { label: "Bản quyền" },
              { label: "Danh sách" },
            ]}
          />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Danh sách bản quyền
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate(PATHS.DASHBOARD.LICENSE_CREATE)}
          className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
        >
          <FiPlus />
          Tạo bản quyền
        </button>
      </div>

      <div className="my-8">
        <LicenseTable
          licenses={licenses || []}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          onCreate={() => navigate(PATHS.DASHBOARD.LICENSE_CREATE)}
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

interface LicenseTableProps {
  licenses: License[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onCreate: () => void;
}

function LicenseTable({
  licenses,
  isLoading,
  isError,
  refetch,
  onCreate,
}: LicenseTableProps) {
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-white/40">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
        <p className="max-w-md text-center text-sm font-medium text-red-400">
          Đã xảy ra lỗi khi tải danh sách bản quyền
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

  if (licenses.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Danh sách trống
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
          Chưa có dữ liệu hiển thị. Bấm "Tạo bản quyền" để thêm bản ghi mới.
        </p>
        <button
          onClick={onCreate}
          className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <FiPlus className="text-lg" />
          Tạo bản quyền ngay
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
                className={`border-b border-gray-400 p-4 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:border-white/10 dark:text-gray-400 ${
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
          {licenses.map((license) => (
            <tr
              key={license.licenseId}
              className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5"
            >
              {/* Row 1: Khách hàng (customerName, phone, email) */}
              <td className="border-r border-gray-400 p-4 dark:border-white/10">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {license.customerName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {license.customerPhone || "-"}
                  </span>
                  {license.customerEmail && (
                    <span className="mt-0.5 text-xs text-gray-400 italic dark:text-white/40">
                      {license.customerEmail}
                    </span>
                  )}
                </div>
              </td>

              {/* Row 2: Tổng giá trị (Tổng price các hợp đồng) */}
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                  {formatPrice(
                    license.software?.reduce(
                      (acc, sw) => acc + Number(sw.price || 0),
                      0,
                    ) || 0,
                  )}
                </span>
              </td>

              {/* Row 3: Chi phí hàng năm */}
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                  {formatPrice(Number(license.yearlyCost || 0))}
                </span>
              </td>

              {/* Row 4: Trạng thái thanh toán */}
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <PaymentStatusBadge status={license.oncePaymentStatus} />
              </td>

              {/* Row 5: Thao tác */}
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Tooltip content="Chỉnh sửa">
                    <IconAction
                      onClick={() =>
                        navigate(
                          PATHS.DASHBOARD.LICENSE_EDIT.replace(
                            ":licenseId",
                            license.licenseId,
                          ),
                        )
                      }
                      icon={<FiEdit2 />}
                    />
                  </Tooltip>
                  <Tooltip content="Xóa">
                    <IconAction
                      onClick={() =>
                        console.log("Delete License:", license.licenseId)
                      }
                      icon={<FiTrash2 />}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    />
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return <Badge type="success" value="Đã thanh toán" />;
  }
  if (status === "partialy_paid") {
    return <Badge type="warning" value="Thanh toán một phần" />;
  }
  return <Badge type="error" value="Chưa thanh toán" />;
}
