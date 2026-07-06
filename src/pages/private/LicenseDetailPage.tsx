import type { ReactNode } from "react";
import { FiDownload, FiEdit2, FiExternalLink, FiServer } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

import { formatDateTime, formatPrice } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import {
  StateLoadingContainer,
  StateShell,
} from "@/components/custom_ui/ShellState";
import { PATHS } from "@/config/paths";
import { useLicenseDetail } from "@/hooks/data/useLicenseHooks";
import type {
  LicenseContract,
  LicenseTicket,
  SoftwareItem,
} from "@/types/License";

function getS3Key(fileUrl?: string | null) {
  const value = fileUrl?.trim();
  if (!value) return "";

  try {
    return decodeURIComponent(new URL(value).pathname.replace(/^\/+/, ""));
  } catch {
    return decodeURIComponent(
      value.replace(/^https?:\/\/[^/]+\//, "").replace(/^\/+/, ""),
    );
  }
}

function openS3Asset(fileUrl?: string | null) {
  const key = getS3Key(fileUrl);
  if (!key) return;
  window.open(
    `${import.meta.env.VITE_HUB_API_URL}/api/v1/s3/view/${key}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function paymentBadge(status: string) {
  if (status === "paid") {
    return <Badge type="success" value="Đã thanh toán" />;
  }
  if (status === "partialy_paid" || status === "partially_paid") {
    return <Badge type="warning" value="Thanh toán một phần" />;
  }
  return <Badge type="error" value="Chưa thanh toán" />;
}

function ticketBadge(status: string) {
  if (status === "complete" || status === "completed" || status === "closed") {
    return <Badge type="success" value="Hoàn thành" />;
  }
  if (status === "cancelled" || status === "canceled") {
    return <Badge type="error" value="Đã hủy" />;
  }
  return <Badge type="warning" value="Đang xử lý" />;
}

export default function LicenseDetailPage() {
  const { licenseId = "" } = useParams<{ licenseId: string }>();
  const {
    data: license,
    isLoading,
    isError,
    refetch,
  } = useLicenseDetail(licenseId);

  if (isLoading) {
    return (
      <div className="page-layout dashboard-theme">
        <StateLoadingContainer message="Đang tải chi tiết bản quyền…" />
      </div>
    );
  }

  if (isError || !license) {
    return (
      <div className="page-layout dashboard-theme">
        <StateShell
          title="Đã xảy ra lỗi"
          message="Không thể tải chi tiết bản quyền từ hệ thống"
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const editPath = PATHS.DASHBOARD.LICENSE_EDIT.replace(
    ":licenseId",
    license.licenseId,
  );
  const softwareTotal = license.software.reduce(
    (total, software) => total + Number(software.price || 0),
    0,
  );

  return (
    <div className="page-layout dashboard-theme">
      <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <Breadcrumb
            items={[
              { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
              { label: "Bản quyền", path: PATHS.DASHBOARD.LICENSE_LIST },
              { label: license.customerName || license.licenseId },
            ]}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl dark:text-white">
              {license.customerName || "Chi tiết bản quyền"}
            </h1>
            {paymentBadge(license.oncePaymentStatus)}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-white/40">
            Mã bản quyền: {license.licenseKey || license.licenseId}
          </p>
        </div>

        <Link
          to={editPath}
          className="inline-flex h-9 w-fit items-center justify-center gap-1.5 border border-gray-300 px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
        >
          <FiEdit2 />
          Chỉnh sửa
        </Link>
      </header>

      <div className="space-y-4">
        <SectionBlock title="Thông tin bản quyền">
          <InfoGrid
            rows={[
              ["Mã bản quyền", license.licenseKey || license.licenseId],
              ["Trạng thái thanh toán", paymentBadge(license.oncePaymentStatus)],
              ["Tổng giá trị phần mềm", formatPrice(softwareTotal)],
              ["Chi phí hàng năm", formatPrice(Number(license.yearlyCost || 0))],
              ["Ngày tạo", formatDateTime(license.createdAt)],
              ["Cập nhật gần nhất", formatDateTime(license.updatedAt)],
            ]}
          />
        </SectionBlock>

        <SectionBlock title="Thông tin khách hàng">
          <InfoGrid
            rows={[
              ["Tên khách hàng", license.customerName || "-"],
              ["Số điện thoại", license.customerPhone || "-"],
              ["Email", license.customerEmail || "-"],
              ["Ghi chú", license.note || "-"],
            ]}
          />
        </SectionBlock>

        <SectionBlock title={`Hợp đồng liên quan (${license.licenseContract.length})`}>
          <ContractTable contracts={license.licenseContract} />
        </SectionBlock>

        <SectionBlock title={`Phần mềm kích hoạt (${license.software.length})`}>
          <SoftwareList software={license.software} />
        </SectionBlock>

        <SectionBlock title={`Yêu cầu hỗ trợ (${license.tickets.length})`}>
          <TicketTable tickets={license.tickets} />
        </SectionBlock>
      </div>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-gray-400 dark:border-white/10">
      <div className="border-b border-gray-400 bg-gray-100/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="text-xs font-semibold text-gray-700 dark:text-white/80">
          {title}
        </h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

function InfoGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="divide-y divide-gray-400 border border-gray-400 dark:divide-white/10 dark:border-white/10">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-1 gap-1.5 px-3 py-2.5 md:grid-cols-[170px_1fr]"
        >
          <p className="text-[11px] text-gray-500 dark:text-white/40">{label}</p>
          <div className="text-xs text-gray-800 dark:text-white/80">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ContractTable({ contracts }: { contracts: LicenseContract[] }) {
  if (!contracts.length) {
    return <EmptyText>Chưa có hợp đồng nào được đính kèm.</EmptyText>;
  }

  return (
    <div className="divide-y divide-gray-400 border border-gray-400 dark:divide-white/10 dark:border-white/10">
      {contracts.map((contract, index) => (
        <div
          key={`${contract.url}-${index}`}
          className="grid gap-2 px-3 py-2.5 md:grid-cols-[1fr_120px] md:items-center"
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
              {contract.name || `Hợp đồng ${index + 1}`}
            </p>
            <p className="mt-1 truncate text-[11px] text-gray-500 dark:text-white/35">
              {contract.url || "Chưa có tệp"}
            </p>
          </div>
          <button
            type="button"
            disabled={!contract.url}
            onClick={() => openS3Asset(contract.url)}
            className="inline-flex h-8 items-center justify-center gap-1.5 border border-gray-300 px-3 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            <FiDownload /> Xem file
          </button>
        </div>
      ))}
    </div>
  );
}

function SoftwareList({ software }: { software: SoftwareItem[] }) {
  if (!software.length) {
    return <EmptyText>Chưa có phần mềm nào được kích hoạt.</EmptyText>;
  }

  return (
    <div className="divide-y divide-gray-400 border border-gray-400 dark:divide-white/10 dark:border-white/10">
      {software.map((item, index) => (
        <article key={item.id || `${item.softwareId}-${index}`} className="p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <FiServer className="text-gray-400" />
                <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                  {item.name || item.softwareId}
                </h3>
                <Badge type={item.status === "active" ? "success" : "info"} value={item.status === "active" ? "Đang hoạt động" : item.status || "Không xác định"} />
                <Badge type="indigo" value={item.type === "server" ? "Server" : "Client"} />
              </div>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-white/40">
                ID: {item.softwareId || "-"}
              </p>
            </div>
            <p className="text-xs font-semibold text-gray-800 tabular-nums dark:text-white/80">
              {formatPrice(Number(item.price || 0))}
            </p>
          </div>

          <div className="mt-4 grid gap-3 border-t border-gray-200 pt-3 sm:grid-cols-2 dark:border-white/[0.07]">
            <DetailCell label="Domain">
              {item.domain ? (
                <a href={/^https?:\/\//.test(item.domain) ? item.domain : `https://${item.domain}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-indigo-500">
                  {item.domain} <FiExternalLink />
                </a>
              ) : "-"}
            </DetailCell>
            <DetailCell label="Kết nối Picare">
              <span className={item.isConnectPicare ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-white/40"}>
                {item.isConnectPicare ? "Đã kết nối" : "Chưa kết nối"}
              </span>
            </DetailCell>
          </div>

          {item.serverConfig?.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-white/[0.07]">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/30">
                Cấu hình dịch vụ
              </p>
              <div className="flex flex-wrap gap-2">
                {item.serverConfig.map((config) => (
                  <span key={config.name} className="inline-flex items-center gap-1.5 border border-gray-300 px-2.5 py-1 text-[10px] text-gray-600 dark:border-white/10 dark:text-white/60">
                    <span className={`size-1.5 rounded-full ${config.active ? "bg-emerald-400" : "bg-zinc-500"}`} />
                    {config.name || "Chưa đặt tên"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.note && (
            <p className="mt-3 text-[11px] leading-5 text-gray-500 dark:text-white/40">
              {item.note}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function TicketTable({ tickets }: { tickets: LicenseTicket[] }) {
  if (!tickets.length) {
    return <EmptyText>Chưa có yêu cầu hỗ trợ nào.</EmptyText>;
  }

  return (
    <div className="overflow-x-auto border border-gray-400 dark:border-white/10">
      <table className="w-full min-w-180 border-collapse text-left">
        <thead className="bg-gray-100/40 dark:bg-white/[0.03]">
          <tr>
            {[
              "Tiêu đề",
              "Nội dung",
              "Trạng thái",
              "Ngày tạo",
            ].map((label) => (
              <th key={label} className="border-b border-gray-400 px-3 py-2.5 text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-white/40">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-3 py-2.5 text-xs font-medium text-gray-900 dark:text-white">{ticket.title || "-"}</td>
              <td className="max-w-sm px-3 py-2.5 text-xs text-gray-600 dark:text-white/60">{ticket.message || "-"}</td>
              <td className="px-3 py-2.5">{ticketBadge(ticket.status)}</td>
              <td className="px-3 py-2.5 text-xs text-gray-600 tabular-nums dark:text-white/60">{formatDateTime(ticket.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/30">{label}</p>
      <div className="mt-1 text-[11px] text-gray-700 dark:text-white/60">{children}</div>
    </div>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-xs text-gray-500 dark:text-white/40">{children}</p>;
}
