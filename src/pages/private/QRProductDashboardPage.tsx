import { useState } from "react";
import { BsQrCode } from "react-icons/bs";
import { FiEdit3, FiExternalLink, FiPlus, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { formatDate } from "@/common/format";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import IconAction from "@/components/custom_ui/IconAction";
import { Pagination } from "@/components/custom_ui/Pagination";
import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { PATHS } from "@/config/paths";
import { useProductQRList } from "@/hooks/data/useProductQRHooks";
import type { BasePaginatedResponse } from "@/types/ApiResponse";
import type { ProductQR } from "@/types/QRProduct";

const breadcrumbItems = [
  { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
  { label: "QR Sản phẩm", path: PATHS.DASHBOARD.QR_PRODUCTS },
  { label: "Tất cả" },
];

const columns = [
  {
    key: "product_info",
    label: "Thông tin sản phẩm",
    width: "w-[34%]",
    align: "left",
  },
  { key: "batch", label: "Số lô", width: "w-[16%]", align: "center" },
  {
    key: "notification",
    label: "Số công bố",
    width: "w-[18%]",
    align: "center",
  },
  { key: "spec", label: "Quy cách", width: "w-[16%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[16%]", align: "center" },
] as const;

function getProductEditPath(productId: string) {
  return PATHS.QR_PRODUCT_EDIT.replace(":productId", productId);
}

function normalizeValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : "-";
}

function formatProductDate(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return "-";

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return formatDate(parsed.toISOString());
}

function ProductQrModal({
  product,
  onClose,
}: {
  product: ProductQR;
  onClose: () => void;
}) {
  const qrImageSrc = product.qrImage || product.jsonContent.qrUrl;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Đóng modal QR"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative w-full max-w-md border border-white/10 bg-[#050505] p-6 text-white shadow-[0_32px_80px_rgba(0,0,0,0.52)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center border border-white/10 text-white/55 transition hover:border-white/20 hover:text-white"
          aria-label="Đóng"
        >
          <FiX />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mx-auto w-full max-w-[320px] border border-white/10 bg-white p-5">
            <img
              src={qrImageSrc}
              alt={product.jsonContent.productName || "QR sản phẩm"}
              className="mx-auto aspect-square w-full max-w-[280px] object-contain"
            />
          </div>

          <p className="mt-4 max-w-[320px] text-center text-xs leading-6 text-white/45">
            Đây là mã QR và link preview sản phẩm. Bạn có thể quét mã hoặc mở trực tiếp đường dẫn bên dưới.
          </p>

          <a
            href={product.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex w-full max-w-[320px] items-center justify-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <span className="truncate">{product.linkUrl}</span>
            <FiExternalLink className="shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function QRProductDashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductQR | null>(null);
  const pageSize = 10;

  const {
    data: products,
    isLoading,
    isError,
    refetch,
    fullResponse,
  } = useProductQRList({
    page,
    limit: pageSize,
    search: "",
  });

  const pagination = (fullResponse as BasePaginatedResponse<ProductQR[]>)
    ?.pagination;

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Quản lý QR sản phẩm
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate(PATHS.QR_PRODUCT_GENERATOR)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
        >
          <FiPlus />
          Tạo QR sản phẩm
        </button>
      </div>

      <div className="my-8">
        <QRProductTable
          products={products || []}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          onEdit={(product) => navigate(getProductEditPath(product.productId))}
          onShowQr={setSelectedProduct}
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

      {selectedProduct ? (
        <ProductQrModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </div>
  );
}

function QRProductTable({
  products,
  isLoading,
  isError,
  refetch,
  onEdit,
  onShowQr,
}: {
  products: ProductQR[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onEdit: (product: ProductQR) => void;
  onShowQr: (product: ProductQR) => void;
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
          Đã xảy ra lỗi khi tải danh sách QR sản phẩm
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

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Danh sách trống
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
          Hệ thống chưa có QR sản phẩm nào được tạo
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] table-fixed border-collapse border-x border-t border-gray-400 text-left dark:border-white/10">
        <thead>
          <tr className="bg-gray-200/50 dark:bg-white/5">
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
          {products.map((product) => {
            const website = product.jsonContent.website?.trim();

            return (
              <tr
                key={product.productId}
                className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5"
              >
                <td className="border-r border-gray-400 p-4 dark:border-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {normalizeValue(product.jsonContent.productName)}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <p>
                        Ngày sản xuất:{" "}
                        {formatProductDate(product.jsonContent.manufacturingDate)}
                      </p>
                      <p>
                        Hết hạn:{" "}
                        {formatProductDate(product.jsonContent.expirationDate)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                  <span className="text-[13px] text-gray-600 dark:text-gray-300">
                    {normalizeValue(product.jsonContent.batchNumber)}
                  </span>
                </td>

                <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                  <span className="text-[13px] text-gray-600 dark:text-gray-300">
                    {normalizeValue(product.jsonContent.notificationNumber)}
                  </span>
                </td>

                <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                  <span className="text-[13px] text-gray-600 dark:text-gray-300">
                    {normalizeValue(product.jsonContent.netVolume)}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip content="Chỉnh sửa">
                      <IconAction
                        icon={<FiEdit3 />}
                        onClick={() => onEdit(product)}
                      />
                    </Tooltip>

                    <Tooltip content="Xem QR">
                      <IconAction
                        icon={<BsQrCode />}
                        onClick={() => onShowQr(product)}
                      />
                    </Tooltip>

                    <Tooltip
                      content={
                        website ? "Mở website sản phẩm" : "Chưa có website"
                      }
                    >
                      <IconAction
                        icon={<FiExternalLink />}
                        onClick={() => {
                          if (website) {
                            window.open(website, "_blank", "noopener,noreferrer");
                          }
                        }}
                        disabled={!website}
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
