import { FiDownload } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

import { formatDateTime } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { useContractDetail } from "@/hooks/data/useContractHooks";
import { toast } from "@/hooks/useToast";
import type {
  ContractDocument,
  ContractSignature,
  ContractStatus,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Bản nháp",
  unsigned: "Chờ ký",
  owner_signed: "Chủ sở hữu đã ký",
  completed: "Hoàn tất",
};

const CONTRACT_STATUS_BADGE: Record<
  ContractStatus,
  "info" | "warning" | "purple" | "success"
> = {
  draft: "info",
  unsigned: "warning",
  owner_signed: "purple",
  completed: "success",
};

const CONTRACT_TYPE_LABELS = {
  principle: "Hợp đồng nguyên tắc",
  appendix: "Phụ lục hợp đồng",
  service: "Hợp đồng dịch vụ",
  digital: "Hợp đồng điện tử",
  default: "Mặc định",
} as const;

type OrganizationCredentialLike = {
  business_license?: string | null;
  business_license_url?: string | null;
  business_license_key?: string | null;
  businessLicense?: string | null;
  businessLicenseUrl?: string | null;
  businessLicenseKey?: string | null;
  power_of_attorney_image?: string | null;
  power_of_attorney_image_url?: string | null;
  power_of_attorney_image_key?: string | null;
  powerOfAttorneyImage?: string | null;
  powerOfAttorneyImageUrl?: string | null;
  powerOfAttorneyImageKey?: string | null;
  gpd?: string | null;
  gpd_url?: string | null;
  gpd_key?: string | null;
  gpdKey?: string | null;
  gpdUrl?: string | null;
  ccddk?: string | null;
  ccddk_url?: string | null;
  ccddk_key?: string | null;
  ccddkKey?: string | null;
  ccddkUrl?: string | null;
};

function getContractFileKey(fileUrl?: string | null) {
  const value = fileUrl?.trim();
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(new URL(value).pathname.replace(/^\/+/, ""));
  } catch {
    return decodeURIComponent(
      value.replace(/^https?:\/\/[^/]+\//, "").replace(/^\/+/, ""),
    );
  }
}

function openS3Asset(source?: string | null, fallbackKey?: string | null) {
  const key = getContractFileKey(source) || fallbackKey?.trim() || "";
  if (!key) return;

  const baseUrl = import.meta.env.VITE_HUB_API_URL;
  window.open(`${baseUrl}/api/v1/s3/view/${key}`, "_blank");
}

function getSignerLabel(signerType: ContractSignature["signerType"]) {
  return signerType === "owner" ? "Bên sở hữu" : "Đối tác";
}

function getSignatureStatusLabel(status: ContractSignature["status"]) {
  return status === "signed" ? "Đã ký" : "Chờ ký";
}

function getSignatureStatusBadge(status: ContractSignature["status"]) {
  return status === "signed" ? "success" : "warning";
}

function getSignatureMethod(signature: ContractSignature) {
  if (signature.handwrittenSignatureImageUrl) {
    return "Ký tay";
  }

  if (signature.certificateSerial) {
    return "Ký số";
  }

  return "-";
}

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

function getRecordValue(
  source: Record<string, unknown> | undefined,
  keys: string[],
) {
  if (!source) return null;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function getOrganizationCredentialData(raw: unknown) {
  const source =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : undefined;

  return {
    businessLicenseUrl: getRecordValue(source, [
      "business_license",
      "business_license_url",
      "businessLicense",
      "businessLicenseUrl",
    ]),
    businessLicenseKey: getRecordValue(source, [
      "business_license_key",
      "businessLicenseKey",
    ]),
    powerOfAttorneyUrl: getRecordValue(source, [
      "power_of_attorney_image",
      "power_of_attorney_image_url",
      "powerOfAttorneyImage",
      "powerOfAttorneyImageUrl",
    ]),
    powerOfAttorneyKey: getRecordValue(source, [
      "power_of_attorney_image_key",
      "powerOfAttorneyImageKey",
    ]),
    gpdUrl: getRecordValue(source, ["gpd", "gpd_url", "gpdUrl"]),
    gpdKey: getRecordValue(source, ["gpd_key", "gpdKey"]),
    ccddkUrl: getRecordValue(source, ["ccddk", "ccddk_url", "ccddkUrl"]),
    ccddkKey: getRecordValue(source, ["ccddk_key", "ccddkKey"]),
  };
}

function getContractTypeLabel(contractType: keyof typeof CONTRACT_TYPE_LABELS) {
  return CONTRACT_TYPE_LABELS[contractType] || "Không xác định";
}

export default function ContractDetailDashboardPage() {
  const { contractId = "" } = useParams();
  const {
    data: contract,
    isLoading,
    isError,
    refetch,
  } = useContractDetail(contractId);

  if (isLoading) {
    return (
      <div className="page-layout flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="page-layout">
        <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
          <p className="max-w-md text-center text-sm font-medium text-red-400">
            Không thể tải chi tiết hợp đồng
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
    { label: "Hợp đồng", path: PATHS.DASHBOARD.CONTRACTS },
    { label: contract.contractNumber || contract.contractId },
  ];
  const contractFileKey = getContractFileKey(contract.contractUrl);
  const organizationCredential = getOrganizationCredentialData(
    contract.organizationCredential as OrganizationCredentialLike | null,
  );

  return (
    <div className="page-layout">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl dark:text-white">
              {contract.contractNumber || contract.contractId}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={getPreviewPath(contract.contractId)}
            className="inline-flex h-9 items-center justify-center border border-gray-300 px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            Xem preview
          </Link>
          <button
            type="button"
            onClick={() =>
              toast.info(
                "Chưa kết nối gửi mail",
                "Nút gửi mail đối tác hiện mới là giao diện, chưa nối API.",
              )
            }
            className="inline-flex h-9 items-center justify-center border border-gray-300 px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            Gửi mail đối tác
          </button>
          <button
            type="button"
            onClick={() => openS3Asset(contract.contractUrl, contractFileKey)}
            disabled={!contractFileKey}
            className={`inline-flex h-9 items-center justify-center gap-1.5 border px-4 text-xs font-medium transition ${
              contractFileKey
                ? "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                : "cursor-not-allowed border-gray-200 text-gray-400 dark:border-white/10 dark:text-white/30"
            }`}
          >
            <FiDownload />
            Tải hợp đồng
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SectionBlock title="Thông tin hợp đồng">
          <InfoGrid
            rows={[
              //   ["Mã hợp đồng", contract.contractId],
              [
                "Trạng thái",
                <Badge
                  type={CONTRACT_STATUS_BADGE[contract.status]}
                  value={CONTRACT_STATUS_LABELS[contract.status]}
                />,
              ],
              ["Số hợp đồng", contract.contractNumber || "-"],
              ["Loại hợp đồng", getContractTypeLabel(contract.contractType)],
              ["Tạo lúc", formatDateTime(contract.createdAt)],
              ["Cập nhật", formatDateTime(contract.updatedAt)],
            ]}
          />
        </SectionBlock>

        <SectionBlock title="Thông tin 2 bên">
          <div className="grid gap-0 md:grid-cols-2">
            <PartyPanel title="Bên sở hữu" party={contract.ownerCompanyInfo} />
            <PartyPanel title="Đối tác" party={contract.partnerCompanyInfo} />
          </div>
        </SectionBlock>

        <SectionBlock title="Tệp hợp đồng">
          <div className="space-y-3">
            <FileActionRow
              label="Tệp hợp đồng chính"
              //   value={contract.contractNumber || "Hợp đồng"}
              hasFile={Boolean(contractFileKey)}
              onView={() => openS3Asset(contract.contractUrl, contractFileKey)}
            />
            <DocumentsTable documents={contract.documents || []} />
          </div>
        </SectionBlock>

        <SectionBlock title="Tiến độ chữ ký">
          <SignaturesTable signatures={contract.signatures || []} />
        </SectionBlock>

        <SectionBlock title="Xác thực tổ chức/cá nhân">
          {contract.individualCredential ? (
            <CredentialTable
              title="Xác thực cá nhân"
              rows={[
                {
                  label: "CMND Số",
                  value: contract.individualCredential?.credentialId || "-",
                },
                {
                  label: "CCCD mặt trước",
                  value:
                    contract.individualCredential
                      ?.first_identification_image_key || "Đã tải lên",
                  hasFile: Boolean(
                    contract.individualCredential?.first_identification_image ||
                    contract.individualCredential
                      ?.first_identification_image_key,
                  ),
                  onView: () =>
                    openS3Asset(
                      contract.individualCredential?.first_identification_image,
                      contract.individualCredential
                        ?.first_identification_image_key,
                    ),
                },
                {
                  label: "CCCD mặt sau",
                  value:
                    contract.individualCredential
                      ?.second_identification_image_key || "Đã tải lên",
                  hasFile: Boolean(
                    contract.individualCredential
                      ?.second_identification_image ||
                    contract.individualCredential
                      ?.second_identification_image_key,
                  ),
                  onView: () =>
                    openS3Asset(
                      contract.individualCredential
                        ?.second_identification_image,
                      contract.individualCredential
                        ?.second_identification_image_key,
                    ),
                },
              ]}
            />
          ) : contract.organizationCredential ? (
            <CredentialTable
              title="Xác thực tổ chức"
              rows={[
                {
                  label: "Giấy phép kinh doanh",
                  value:
                    organizationCredential.businessLicenseKey ||
                    organizationCredential.businessLicenseUrl ||
                    "Đã tải lên",
                  hasFile: Boolean(
                    organizationCredential.businessLicenseUrl ||
                    organizationCredential.businessLicenseKey,
                  ),
                  onView: () =>
                    openS3Asset(
                      organizationCredential.businessLicenseUrl,
                      organizationCredential.businessLicenseKey,
                    ),
                },
                {
                  label: "Giấy uỷ quyền",
                  value:
                    organizationCredential.powerOfAttorneyKey ||
                    organizationCredential.powerOfAttorneyUrl ||
                    "-",
                  hasFile: Boolean(
                    organizationCredential.powerOfAttorneyUrl ||
                    organizationCredential.powerOfAttorneyKey,
                  ),
                  onView: () =>
                    openS3Asset(
                      organizationCredential.powerOfAttorneyUrl,
                      organizationCredential.powerOfAttorneyKey,
                    ),
                },
                {
                  label: "GPD",
                  value:
                    organizationCredential.gpdKey ||
                    organizationCredential.gpdUrl ||
                    "Đã tải lên",
                  hasFile: Boolean(
                    organizationCredential.gpdUrl || organizationCredential.gpdKey,
                  ),
                  onView: () =>
                    openS3Asset(
                      organizationCredential.gpdUrl,
                      organizationCredential.gpdKey,
                    ),
                },
                {
                  label: "CCDDK",
                  value:
                    organizationCredential.ccddkKey ||
                    organizationCredential.ccddkUrl ||
                    "Đã tải lên",
                  hasFile: Boolean(
                    organizationCredential.ccddkUrl ||
                    organizationCredential.ccddkKey,
                  ),
                  onView: () =>
                    openS3Asset(
                      organizationCredential.ccddkUrl,
                      organizationCredential.ccddkKey,
                    ),
                },
              ]}
            />
          ) : (
            <p className="text-xs text-gray-500 dark:text-white/50">
              Chưa có dữ liệu xác thực cho hợp đồng này.
            </p>
          )}
        </SectionBlock>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

function InfoGrid({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <div className="divide-y divide-gray-400 border border-gray-400 dark:divide-white/10 dark:border-white/10">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-1 gap-1.5 px-3 py-2.5 md:grid-cols-[150px_1fr]"
        >
          <p className="text-[11px] text-gray-500 dark:text-white/40">
            {label}
          </p>
          <div className="text-xs text-gray-800 dark:text-white/80">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function PartyPanel({
  title,
  party,
}: {
  title: string;
  party: OwnerCompanyInfoPayload | PartnerCompanyInfoPayload;
}) {
  return (
    <div className="border-t border-gray-400 first:border-t-0 md:border-t-0 md:first:border-r dark:border-white/10">
      <div className="border-b border-gray-400 px-3 py-2.5 dark:border-white/10">
        <p className="text-xs font-semibold text-gray-900 dark:text-white">
          {title}
        </p>
      </div>
      <div className="divide-y divide-gray-400 dark:divide-white/10">
        <PartyRow label="Tên công ty" value={party.companyName || "-"} />
        <PartyRow label="Địa chỉ" value={party.address || "-"} />
        <PartyRow label="Điện thoại" value={party.phone || "-"} />
        <PartyRow label="Email" value={party.email || "-"} />
        <PartyRow label="Tài khoản" value={party.bankInfo || "-"} />
        <PartyRow label="Mã số thuế" value={party.mst || "-"} />
        <PartyRow label="Đại diện" value={party.ownerName || "-"} />
        <PartyRow label="Chức vụ" value={party.role || "-"} />
      </div>
    </div>
  );
}

function PartyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-h-10 grid-cols-[120px_1fr] items-center gap-2 px-3 py-2.5">
      <p className="text-[11px] text-gray-500 dark:text-white/40">{label}</p>
      <p className="text-xs text-gray-800 dark:text-white/80">{value}</p>
    </div>
  );
}

function FileActionRow({
  label,
  value,
  hasFile,
  onView,
}: {
  label: string;
  value?: string;
  hasFile: boolean;
  onView: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border border-gray-400 px-3 py-2.5 md:grid-cols-[180px_1fr_96px] md:items-center dark:border-white/10">
      <p className="text-[11px] text-gray-500 dark:text-white/40">{label}</p>
      <p className="truncate text-xs text-gray-800 dark:text-white/80">
        {value}
      </p>
      <div className="flex justify-start md:justify-end">
        {hasFile ? (
          <button
            type="button"
            onClick={onView}
            className="inline-flex h-8 items-center gap-1.5 border border-gray-300 px-3 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            <FiDownload />
            Xem file
          </button>
        ) : (
          <span className="text-[11px] text-gray-400 dark:text-white/30">
            Chưa có file
          </span>
        )}
      </div>
    </div>
  );
}

function CredentialTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    label: string;
    value: string;
    hasFile?: boolean;
    onView?: () => void;
  }>;
}) {
  return (
    <div className="border border-gray-400 dark:border-white/10">
      <div className="border-b border-gray-400 px-3 py-2.5 dark:border-white/10">
        <p className="text-xs font-semibold text-gray-900 dark:text-white">
          {title}
        </p>
      </div>
      <div className="divide-y divide-gray-400 dark:divide-white/10">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-2 px-3 py-2.5 md:grid-cols-[170px_1fr_96px] md:items-center"
          >
            <p className="text-[11px] text-gray-500 dark:text-white/40">
              {row.label}
            </p>
            <p className="truncate text-xs text-gray-800 dark:text-white/80">
              {row.value || "Chưa có file"}
            </p>
            <div className="flex justify-start md:justify-end">
              {row.hasFile && row.onView ? (
                <button
                  type="button"
                  onClick={row.onView}
                  className="inline-flex h-8 items-center gap-1.5 border border-gray-300 px-3 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                >
                  <FiDownload />
                  Xem file
                </button>
              ) : (
                <span className="text-[11px] text-gray-400 dark:text-white/30">
                  -
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsTable({ documents }: { documents: ContractDocument[] }) {
  if (documents.length === 0) {
    return (
      <p className="text-xs text-gray-500 dark:text-white/50">
        Chưa có version tài liệu nào trong hợp đồng này.
      </p>
    );
  }

  return (
    <div className="border border-gray-400 dark:border-white/10">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-gray-400 bg-gray-100/40 dark:border-white/10 dark:bg-white/[0.03]">
            <th className="w-20 border-r border-gray-400 px-3 py-2.5 text-left text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-white/40">
              Version
            </th>
            <th className="border-r border-gray-400 px-3 py-2.5 text-left text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-white/40">
              Ngày tạo
            </th>
            <th className="w-28 px-3 py-2.5 text-center text-[11px] font-medium text-gray-500 dark:text-white/40">
              Tệp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {documents.map((document) => (
            <tr key={document.contractDocumentId}>
              <td className="border-r border-gray-400 px-3 py-2.5 text-xs font-semibold text-gray-900 dark:border-white/10 dark:text-white">
                v{document.version}
              </td>
              <td className="border-r border-gray-400 px-3 py-2.5 text-xs text-gray-700 dark:border-white/10 dark:text-white/70">
                {formatDateTime(document.createdAt)}
              </td>
              <td className="px-3 py-2.5 text-center">
                <button
                  type="button"
                  onClick={() => openS3Asset(document.fileUrl)}
                  className="inline-flex h-8 items-center gap-1.5 border border-gray-300 px-3 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                >
                  <FiDownload />
                  Xem file
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignaturesTable({ signatures }: { signatures: ContractSignature[] }) {
  if (signatures.length === 0) {
    return (
      <p className="text-xs text-gray-500 dark:text-white/50">
        Hợp đồng này chưa phát sinh phiên chữ ký nào.
      </p>
    );
  }

  return (
    <div className="border border-gray-400 dark:border-white/10">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-gray-400 bg-gray-100/40 dark:border-white/10 dark:bg-white/[0.03]">
            <th className="w-72 border-r border-gray-400 px-3 py-2.5 text-left text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-white/40">
              Người ký
            </th>
            <th className="border-r border-gray-400 px-3 py-2.5 text-left text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-white/40">
              Email
            </th>
            <th className="w-36 border-r border-gray-400 px-3 py-2.5 text-center text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-white/40">
              Loại ký
            </th>
            <th className="w-36 border-r border-gray-400 px-3 py-2.5 text-center text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-white/40">
              Trạng thái
            </th>
            <th className="w-60 px-3 py-2.5 text-left text-[11px] font-medium text-gray-500 dark:text-white/40">
              Ký lúc
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {signatures.map((signature) => (
            <tr key={signature.contractSignatureId}>
              <td className="border-r border-gray-400 px-3 py-2.5 dark:border-white/10">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {signature.signerName || getSignerLabel(signature.signerType)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-white/40">
                  {getSignerLabel(signature.signerType)}
                </p>
              </td>
              <td className="border-r border-gray-400 px-3 py-2.5 text-xs text-gray-700 dark:border-white/10 dark:text-white/70">
                {signature.signerEmail || "-"}
              </td>
              <td className="border-r border-gray-400 px-3 py-2.5 text-center text-xs text-gray-700 dark:border-white/10 dark:text-white/70">
                {getSignatureMethod(signature)}
              </td>
              <td className="border-r border-gray-400 px-3 py-2.5 text-center dark:border-white/10">
                <Badge
                  type={getSignatureStatusBadge(signature.status)}
                  value={getSignatureStatusLabel(signature.status)}
                />
              </td>
              <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-white/70">
                {signature.signedAt ? formatDateTime(signature.signedAt) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
