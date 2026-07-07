import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiDownload,
  FiEdit3,
  FiFilePlus,
  FiMail,
  FiPenTool,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import ContractSigningModal from "@/components/modals/ContractSigningModal";
import { PATHS } from "@/config/paths";
import {
  useCreateDraftDownloadContract,
  useContractDetail,
  useGenerateSignLink,
} from "@/hooks/data/useContractHooks";
import { useDownloadS3Asset } from "@/hooks/data/useS3Hooks";
import { useSendEcontractMailTemplate } from "@/hooks/data/useMailHooks";
import { toast } from "@/hooks/useToast";
import type {
  Contract,
  AppendixContractDataPayload,
  AppendixContractProductPayload,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
  PrincipleContractDataPayload,
} from "@/types/Contract";
import { LIVESTREAM_APPENDIX_SECTIONS } from "./contract-form/variants/livestream-responsibility-commitment-appendix/livestreamAppendixContent";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getEditPath(contractId: string) {
  return PATHS.CONTRACT_EDIT.replace(":contractId", contractId);
}

function getS3KeyFromUrl(fileUrl?: string | null) {
  if (!fileUrl) return "";

  try {
    const url = new URL(fileUrl);
    return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    return decodeURIComponent(fileUrl.replace(/^\/+/, ""));
  }
}

function getFileNameFromS3Key(key: string, fallback: string) {
  const fileName = key.split("/").filter(Boolean).at(-1);
  return fileName || fallback;
}

function getDraftDocumentFile(contract: Contract) {
  return contract.documents?.find(
    (document) =>
      document.status === "draft" && document.version === 1 && document.fileUrl,
  );
}

function openDownloadUrl(downloadUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.target = "_blank";
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function getSignatureDisplayName(fullName?: string) {
  const normalizedName = fullName?.trim();
  if (!normalizedName) return "";

  const nameWithoutTitle = normalizedName.replace(
    /^(ong|ông|ba|bà|anh|chị|chi)\s+/i,
    "",
  );
  const lastNamePart = nameWithoutTitle.split(/\s+/).filter(Boolean).at(-1);
  if (!lastNamePart) return normalizedName;

  return `${lastNamePart.charAt(0).toLocaleUpperCase("vi-VN")}${lastNamePart
    .slice(1)
    .toLocaleLowerCase("vi-VN")}`;
}

function stripVietnameseDiacritics(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const [year, month, day] = value.split("-");
    return [day, month, year].filter(Boolean).join("/");
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getVietnameseDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "ngày ... tháng ... năm ...";
  }

  return `ngày ${String(date.getDate()).padStart(2, "0")} tháng ${String(
    date.getMonth() + 1,
  ).padStart(2, "0")} năm ${date.getFullYear()}`;
}

function getContractDisplayDate(contract: Contract) {
  return contract.createdAt || contract.updatedAt || undefined;
}

function getContractMailTypeLabel(contractType: Contract["contractType"]) {
  switch (contractType) {
    case "appendix":
      return "Phụ lục hợp đồng";
    case "livestream_responsibility_commitment":
      return "Bản cam kết livestream";
    case "livestream_responsibility_commitment_appendix":
      return "Phụ lục cam kết livestream";
    case "service":
      return "Hợp đồng dịch vụ";
    case "principle":
    default:
      return "Hợp đồng nguyên tắc";
  }
}

function getContractMailActionLabel(contractType: Contract["contractType"]) {
  switch (contractType) {
    case "appendix":
    case "livestream_responsibility_commitment_appendix":
      return "Xem phụ lục";
    case "livestream_responsibility_commitment":
      return "Xem bản cam kết";
    case "service":
      return "Xem hợp đồng dịch vụ";
    case "principle":
    default:
      return "Xem hợp đồng";
  }
}

function getPrincipleContractData(
  contract: Contract,
): PrincipleContractDataPayload {
  const data = contract.contractData ?? {};

  return {
    paymentTermDays:
      "paymentTermDays" in data && typeof data.paymentTermDays === "number"
        ? data.paymentTermDays
        : 30,
    creditLimit:
      "creditLimit" in data && typeof data.creditLimit === "number"
        ? data.creditLimit
        : null,
  };
}

function formatCreditLimit(value: number | null) {
  return value === null ? "Không áp dụng" : `${formatCurrency(value)} VND`;
}

type AppendixProductRow = {
  productName: string;
  ingredients: string;
  packaging: string;
  registrationNumber: string;
  originCountry: string;
  vatPrice: string;
  category: string;
};

type AppendixProductSource = string | AppendixContractProductPayload;

const APPENDIX_PRODUCT_LABELS: Record<keyof AppendixProductRow, string> = {
  productName: "Tên sản phẩm",
  ingredients: "Thành phần",
  packaging: "Quy cách đóng gói",
  registrationNumber: "Số đăng ký",
  originCountry: "Nước sản xuất",
  vatPrice: "Đơn giá(+VAT)",
  category: "Phân loại",
};

function normalizeAppendixLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/^[\s\-–—•]+/, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

const APPENDIX_PRODUCT_LABEL_LOOKUP: Record<string, keyof AppendixProductRow> =
  {
    ...Object.fromEntries(
      (
        Object.entries(APPENDIX_PRODUCT_LABELS) as Array<
          [keyof AppendixProductRow, string]
        >
      ).map(([key, label]) => [normalizeAppendixLabel(label), key]),
    ),
    "ten san pham": "productName",
    "thanh phan": "ingredients",
    "quy cach": "packaging",
    "quy cach dong goi": "packaging",
    "so dang ky": "registrationNumber",
    "so cong bo": "registrationNumber",
    "nuoc san xuat": "originCountry",
    "xuat xu": "originCountry",
    "don gia": "vatPrice",
    "don gia vat": "vatPrice",
    "phan loai": "category",
  };

function parseAppendixProduct(
  rawProduct: AppendixProductSource,
): AppendixProductRow {
  const row: AppendixProductRow = {
    productName: "",
    ingredients: "",
    packaging: "",
    registrationNumber: "",
    originCountry: "",
    vatPrice: "",
    category: "",
  };

  const applyRawContent = (content: string) => {
    for (const line of content.split(/\r?\n/)) {
      const [label, ...valueParts] = line.split(":");
      const normalizedLabel = normalizeAppendixLabel(label || "");
      const matchedKey = APPENDIX_PRODUCT_LABEL_LOOKUP[normalizedLabel];

      if (matchedKey) {
        row[matchedKey] = valueParts.join(":").trim();
      }
    }
  };

  if (typeof rawProduct === "string") {
    applyRawContent(rawProduct);

    if (!row.productName) {
      row.productName = rawProduct.trim();
    }

    return row;
  }

  row.productName = rawProduct.productName?.trim() || "";
  row.ingredients = rawProduct.ingredients?.trim() || "";
  row.packaging = rawProduct.packageSpecification?.trim() || "";
  row.registrationNumber = rawProduct.registrationNumber?.trim() || "";
  row.originCountry = rawProduct.origin?.trim() || "";
  row.vatPrice =
    rawProduct.unitPriceVat !== null && rawProduct.unitPriceVat !== undefined
      ? String(rawProduct.unitPriceVat).trim()
      : "";
  row.category = rawProduct.classification?.trim() || "";

  if (rawProduct.rawContent?.trim()) {
    applyRawContent(rawProduct.rawContent.trim());
  }

  if (!row.productName && rawProduct.rawContent?.trim()) {
    row.productName = rawProduct.rawContent.trim();
  }

  return row;
}

function getAppendixProducts(contract: Contract) {
  const contractData = contract.contractData as
    | AppendixContractDataPayload
    | null
    | undefined;

  const rawProducts = contractData?.products?.length
    ? contractData.products
    : (contract.products ?? []);

  return rawProducts.map(parseAppendixProduct);
}

function getAppendixPrincipleContractNumber(contract: Contract) {
  const contractData = contract.contractData as
    | AppendixContractDataPayload
    | null
    | undefined;

  return (
    contractData?.principleContractNumber || contract.principleContractNumber
  );
}

function ArticleTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
      {children}
    </h2>
  );
}

function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-[14px] leading-7 text-black/62 dark:text-white/62">
      <span className="mr-2 text-black/35 dark:text-white/35">{label}:</span>
      <strong className="font-semibold text-black/86 dark:text-white/86">
        {value || "-"}
      </strong>
    </p>
  );
}

function PartySection({
  title,
  party,
}: {
  title: string;
  party: OwnerCompanyInfoPayload | PartnerCompanyInfoPayload;
}) {
  return (
    <section className="mt-8">
      <h3 className="text-[15px] font-medium text-[#111111] uppercase dark:text-white">
        {title}
      </h3>
      <div className="mt-3 space-y-1">
        <FieldLine label="Tên công ty" value={party?.companyName || ""} />
        <FieldLine label="Địa chỉ" value={party?.address || ""} />
        <FieldLine label="Điện thoại" value={party?.phone || ""} />
        <FieldLine label="Email" value={party?.email || ""} />
        <FieldLine label="Tài khoản" value={party?.bankInfo || ""} />
        <FieldLine label="Mã số thuế" value={party?.mst || ""} />
        <FieldLine label="Đại diện" value={party.ownerName} />
        <FieldLine label="Chức vụ" value={party.role} />
      </div>
    </section>
  );
}

function ClauseList({ items }: { items: ReactNode[] }) {
  return (
    <div className="mt-4 space-y-2">
      {items.map((item, index) => (
        <p
          key={index}
          className="text-[14px] leading-7 text-black/62 dark:text-white/62"
        >
          {item}
        </p>
      ))}
    </div>
  );
}

function AnimatedSignature({
  name,
  shouldAnimate,
  revealKey,
}: {
  name: string;
  shouldAnimate: boolean;
  revealKey?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const canAnimate = shouldAnimate && !prefersReducedMotion;
  const signatureFontFamily =
    '"Allura", "Sriracha", "Segoe Script", "Snell Roundhand", cursive';
  const displayName = stripVietnameseDiacritics(name);

  return (
    <div className="relative mx-auto flex h-36 w-full max-w-[300px] items-center justify-center overflow-hidden">
      <motion.svg
        viewBox="0 0 300 120"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-black/70 dark:text-white/80"
      >
        <motion.path
          d="M42 86 C88 84, 126 84, 184 84 S230 84, 258 84"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={canAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.svg>

      <motion.div
        key={`${name}-${revealKey ?? 0}-${shouldAnimate ? "animated" : "static"}`}
        initial={
          canAnimate
            ? {
                opacity: 0,
                y: 12,
                scale: 0.98,
                rotate: -2,
                filter: "blur(7px)",
              }
            : false
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.62,
          delay: canAnimate ? 0.42 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 text-[58px] leading-none text-[#111111] drop-shadow-[0_0_18px_rgba(0,0,0,0.08)] select-none dark:text-white dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.14)]"
        style={{
          fontFamily: signatureFontFamily,
          fontWeight: 300,
        }}
      >
        {displayName}
      </motion.div>
    </div>
  );
}

function SignatureBlock({
  title,
  name,
  isSigned,
  shouldAnimate,
  revealKey,
  signatureRef,
}: {
  title: string;
  name: string;
  isSigned?: boolean;
  shouldAnimate?: boolean;
  revealKey?: number;
  signatureRef?: React.Ref<HTMLDivElement>;
}) {
  const signatureName = getSignatureDisplayName(name);
  return (
    <div ref={signatureRef} className="relative text-center">
      <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
        {title}
      </p>
      <p className="mt-2 text-[12px] text-black/35 dark:text-white/35">
        Ký, đóng dấu, ghi rõ họ và tên
      </p>
      {isSigned && signatureName ? (
        <AnimatedSignature
          name={signatureName}
          shouldAnimate={Boolean(shouldAnimate)}
          revealKey={revealKey}
        />
      ) : (
        <div className="h-32" />
      )}

      {isSigned ? (
        <motion.p
          initial={shouldAnimate ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: shouldAnimate ? 1.05 : 0 }}
          className="mb-2 text-[11px] font-medium tracking-[0.16em] text-emerald-200/80 uppercase"
        >
          Đã ký
        </motion.p>
      ) : null}
      <p className="text-[14px] font-medium text-[#111111] uppercase dark:text-white">
        {name}
      </p>
    </div>
  );
}

type PartnerMailForm = {
  to: string;
  subject: string;
  title: string;
  intro: string;
  message: string;
  replyTo: string;
  actionLabel: string;
};

function createPartnerMailForm(contract: Contract): PartnerMailForm {
  const partner = contract.partnerCompanyInfo;
  const personal = contract.personalInfo;
  const owner = contract.ownerCompanyInfo;
  const contractTypeLabel = getContractMailTypeLabel(contract.contractType);
  const contractReference = contract.contractNumber || contract.contractId;
  const recipientName =
    personal?.fullName ||
    partner?.companyName ||
    partner?.ownerName ||
    "Quý đối tác";
  const contractTypeNumberLabel =
    contract.contractType === "appendix"
      ? getAppendixPrincipleContractNumber(contract) || "không xác định"
      : contractReference;
  const appendixProducts = getAppendixProducts(contract);
  const appendixProductNames = appendixProducts
    .map((product) => product.productName.trim())
    .filter(Boolean)
    .slice(0, 5);

  let messageLines: string[] = [];

  switch (contract.contractType) {
    case "appendix":
      messageLines = [
        `${owner.companyName} đã hoàn tất xử lý phụ lục hợp đồng số ${contractReference}.`,
        `Phụ lục này được đính kèm theo Hợp đồng nguyên tắc số ${contractTypeNumberLabel}.`,
        appendixProductNames.length
          ? `Danh sách sản phẩm hiện có trong phụ lục gồm: ${appendixProductNames.join(", ")}.`
          : "Phụ lục hiện đã có dữ liệu sản phẩm và có thể đối chiếu trực tiếp trên hệ thống.",
        "Vui lòng rà soát kỹ thông tin công ty, danh mục sản phẩm, đơn giá (+VAT), quy cách đóng gói và các điều khoản liên quan trước khi ký xác nhận.",
        "Nếu cần điều chỉnh nội dung, vui lòng phản hồi trực tiếp email này để bộ phận phụ trách cập nhật trước khi chốt hồ sơ.",
      ];
      break;
    case "livestream_responsibility_commitment":
      messageLines = [
        `${owner.companyName} đã hoàn tất ký số cho Bản cam kết trách nhiệm hoạt động Livestream số ${contractReference}.`,
        "Vui lòng kiểm tra lại đầy đủ thông tin cá nhân, phạm vi trách nhiệm, chuẩn mực phát ngôn, nghĩa vụ tuân thủ và trách nhiệm bồi thường trước khi xác nhận ký.",
        "Đây là tài liệu ràng buộc trách nhiệm trong quá trình thực hiện Livestream dưới danh nghĩa công ty.",
        "Nếu cần làm rõ nội dung trước khi ký, vui lòng phản hồi trực tiếp email này để được hỗ trợ.",
      ];
      break;
    case "livestream_responsibility_commitment_appendix":
      messageLines = [
        `${owner.companyName} đã hoàn tất xử lý Phụ lục cam kết Livestream số ${contractReference}.`,
        "Phụ lục này quy định danh mục nội dung, từ khóa và cách diễn đạt không được sử dụng trong hoạt động Livestream.",
        "Vui lòng rà soát kỹ toàn bộ danh mục blacklist keywords và các nguyên tắc áp dụng trước khi ký xác nhận.",
        "Nếu cần cập nhật hoặc giải thích thêm nội dung, vui lòng phản hồi trực tiếp email này để bộ phận phụ trách xử lý.",
      ];
      break;
    case "service":
      messageLines = [
        `${owner.companyName} đã hoàn tất ký số cho Hợp đồng dịch vụ số ${contractReference}.`,
        "Vui lòng kiểm tra lại phạm vi dịch vụ, nội dung triển khai, điều kiện thanh toán và các thông tin pháp lý liên quan trước khi ký xác nhận.",
        "Nếu cần điều chỉnh nội dung, vui lòng phản hồi trực tiếp email này để được hỗ trợ.",
      ];
      break;
    case "principle":
    default:
      messageLines = [
        `${owner.companyName} đã hoàn tất ký số cho Hợp đồng nguyên tắc số ${contractReference}.`,
        "Vui lòng rà soát lại toàn bộ điều khoản hợp tác, phương thức giao dịch, thời hạn thanh toán, hạn mức công nợ và các thông tin pháp lý của hai bên trước khi ký.",
        "Trong trường hợp cần xác nhận thêm nội dung nào trước khi ký, vui lòng phản hồi trực tiếp email này để chúng tôi hỗ trợ ngay.",
        "Sau khi hoàn tất thao tác ký, hệ thống sẽ tự động cập nhật trạng thái và đồng bộ sang bước xử lý tiếp theo.",
      ];
      break;
  }

  return {
    to: personal?.email || partner?.email || "",
    subject: `[${contractTypeLabel}] ${contractReference} đã sẵn sàng để xem và ký`,
    title: `Thông báo ${contractTypeLabel}`,
    intro: `Kính gửi ${recipientName},`,
    message: messageLines.join("\n"),
    replyTo: owner.email || "",
    actionLabel: getContractMailActionLabel(contract.contractType),
  };
}

function SendPartnerMailModal({
  contract,
  isOpen,
  onClose,
  form,
  isSending,
  onUpdateField,
  onSend,
}: {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  form: PartnerMailForm;
  isSending: boolean;
  onUpdateField: (field: keyof PartnerMailForm, value: string) => void;
  onSend: () => void | Promise<void>;
}) {
  const mailTypeLabel = getContractMailTypeLabel(contract.contractType);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSending && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="dashboard-theme contract-surface relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-white/10 bg-white/[0.04] p-6">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Gửi mail {mailTypeLabel.toLowerCase()}
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Kiểm tra nội dung trước khi gửi mail cho đối tác để tiếp tục
                  quy trình ký và xử lý {mailTypeLabel.toLowerCase()}.
                </p>
              </div>

              <button
                type="button"
                disabled={isSending}
                onClick={onClose}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Email đối tác
                </span>
                <input
                  type="email"
                  value={form.to}
                  disabled={isSending}
                  onChange={(event) => onUpdateField("to", event.target.value)}
                  className="h-10 w-full border-b border-white/10 bg-transparent text-sm text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Tiêu đề
                </span>
                <input
                  value={form.subject}
                  disabled={isSending}
                  onChange={(event) =>
                    onUpdateField("subject", event.target.value)
                  }
                  className="h-10 w-full border-b border-white/10 bg-transparent text-sm text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Lời mở đầu
                </span>
                <input
                  value={form.intro}
                  disabled={isSending}
                  onChange={(event) =>
                    onUpdateField("intro", event.target.value)
                  }
                  className="h-10 w-full border-b border-white/10 bg-transparent text-sm text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Nội dung
                </span>
                <textarea
                  value={form.message}
                  disabled={isSending}
                  rows={5}
                  onChange={(event) =>
                    onUpdateField("message", event.target.value)
                  }
                  className="w-full resize-none border-b border-white/10 bg-transparent py-2 text-sm leading-6 text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.04] p-6">
              <button
                type="button"
                disabled={isSending}
                onClick={onClose}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-white/75 transition hover:bg-[rgba(255,255,255,0.14)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[rgba(255,255,255,0.08)] dark:hover:bg-[rgba(255,255,255,0.16)]"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={onSend}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? <Spinner size="sm" /> : <FiMail size={14} />}
                Gửi mail
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function SendPartnerMailModalController({
  contract,
  isOpen,
  onClose,
}: {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
}) {
  const generateSignLinkMutation = useGenerateSignLink();
  const sendMailMutation = useSendEcontractMailTemplate();

  const [form, setForm] = useState<PartnerMailForm>(() =>
    createPartnerMailForm(contract),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForm(createPartnerMailForm(contract));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [contract, isOpen]);

  const updateField = (field: keyof PartnerMailForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSend = async () => {
    const normalizedTo = form.to.trim();
    const normalizedSubject = form.subject.trim();

    if (!normalizedTo || !normalizedSubject) {
      toast.error(
        "Thiếu thông tin gửi mail",
        "Vui lòng kiểm tra email đối tác và tiêu đề.",
      );
      return;
    }

    const signLinkResponse = await generateSignLinkMutation.mutateAsync(
      contract.contractId,
    );

    if (!signLinkResponse.success || !signLinkResponse.data?.signingUrl) {
      return;
    }

    const isDev = import.meta.env.DEV;
    const response = await sendMailMutation.mutateAsync({
      smtpUser: isDev ? "tritruonghoang3@gmail.com" : "econtract@picare.vn",
      mailFrom: isDev ? "tritruonghoang3@gmail.com" : "econtract@picare.vn",
      mailFromName: isDev ? "Picare Dev" : "Picare E-Contract",
      to: normalizedTo,
      subject: normalizedSubject,
      title: form.title.trim() || normalizedSubject,
      intro: form.intro.trim(),
      bodyLines: form.message
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      actionLabel: form.actionLabel,
      actionUrl: signLinkResponse.data.signingUrl,
      footer:
        "Email này được gửi tự động từ hệ thống của công ty Picare Việt Nam. Vui lòng không chia sẻ đường dẫn nếu không có thẩm quyền.",
      replyTo: form.replyTo.trim() || contract.ownerCompanyInfo.email || "",
    });

    if (response.success) {
      onClose();
    }
  };

  return (
    <SendPartnerMailModal
      contract={contract}
      isOpen={isOpen}
      onClose={onClose}
      form={form}
      isSending={
        sendMailMutation.isPending || generateSignLinkMutation.isPending
      }
      onUpdateField={updateField}
      onSend={handleSend}
    />
  );
}

function ContractDocument({
  contract,
  ownerSignatureRef,
  ownerSignatureRevealKey,
  partnerSignatureRef,
  partnerSignatureRevealKey,
}: {
  contract: Contract;
  ownerSignatureRef?: React.Ref<HTMLDivElement>;
  ownerSignatureRevealKey?: number;
  partnerSignatureRef?: React.Ref<HTMLDivElement>;
  partnerSignatureRevealKey?: number;
}) {
  const owner = contract.ownerCompanyInfo;
  const partner = contract.partnerCompanyInfo;
  const contractData = getPrincipleContractData(contract);
  const todayDate = getVietnameseDate(getContractDisplayDate(contract));
  const creditLimit = formatCreditLimit(contractData.creditLimit);
  const contractNumber = contract.contractNumber;
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-5xl pb-24"
    >
      <header className="grid gap-8 border-b border-black/10 pb-10 md:grid-cols-[1fr_1.15fr] dark:border-white/10">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            {owner.companyName}
          </p>
          <p className="mt-3 text-[13px] text-black/35 dark:text-white/35">
            Số:{" "}
            <strong className="font-semibold text-black/72 dark:text-white/72">
              {contractNumber}
            </strong>
          </p>
        </div>
        <div className="text-left md:text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            Cộng hòa xã hội chủ nghĩa Việt Nam
          </p>
          <p className="mt-1 text-[13px] text-black/62 dark:text-white/62">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>
      </header>

      <section className="pt-14 text-center">
        <p className="text-[13px] text-black/35 dark:text-white/35">
          Hôm nay,{" "}
          <strong className="font-semibold text-black/72 dark:text-white/72">
            {todayDate}
          </strong>
        </p>
        <h1 className="mt-7 text-4xl font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
          Hợp đồng nguyên tắc
        </h1>
        <p className="mt-3 text-[15px] text-black/62 dark:text-white/62">
          Số{" "}
          <strong className="font-semibold text-black/82 dark:text-white/82">
            {contractNumber}
          </strong>
        </p>
        <p className="mt-1 text-[13px] text-black/35 dark:text-white/35">
          Về việc: Bán hàng
        </p>
      </section>

      <section className="mt-14">
        <ArticleTitle>Căn cứ ký kết</ArticleTitle>
        <ClauseList
          items={[
            "Căn cứ Bộ Luật Dân sự số 91/2015/QH13 ngày 24/11/2015 của Quốc hội nước CHXHCN Việt Nam;",
            "Căn cứ Luật Thương Mại số 36/2005/QH ngày 14/06/2005 của Quốc hội nước CHXHCN Việt Nam;",
            "Căn cứ vào khả năng và nhu cầu của hai bên.",
          ]}
        />
      </section>

      <p className="mt-10 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Hôm nay,{" "}
        <strong className="font-semibold text-black/82 dark:text-white/82">
          {todayDate}
        </strong>{" "}
        tại văn phòng công ty chúng tôi gồm có:
      </p>

      <PartySection
        title={`Công ty bán (Bên A): ${owner.companyName}`}
        party={owner}
      />
      <p className="mt-3 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Sau đây gọi tắt là Bên A.
      </p>
      <PartySection
        title={`Công ty mua (Bên B): ${partner.companyName || partner.ownerName}`}
        party={partner}
      />
      <p className="mt-3 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Sau đây gọi tắt là Bên B. Bên Mua, Bên Bán sau đây gọi riêng là “Bên” và
        gọi chung là “Hai Bên”.
      </p>
      <p className="mt-3 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Hai bên cùng thỏa thuận và ký kết Hợp đồng mua bán hàng hóa thường xuyên
        (sau đây gọi tắt là “Hợp đồng”) như sau:
      </p>

      <section>
        <ArticleTitle>Điều 1: Các điều khoản chung</ArticleTitle>
        <ClauseList
          items={[
            <>
              1.1 Hợp đồng Nguyên tắc này là cơ sở để hai Bên thực hiện việc mua
              bán hàng hóa thường xuyên.
            </>,
            <>
              1.2 Căn cứ vào Hợp đồng này, hai Bên sẽ ký Đơn đặt hàng (Bằng văn
              bản và/hoặc thư điện tử) đối với từng lô hàng cụ thể. Chi tiết
              hàng hóa, chất lượng, số lượng, giá cả, giao hàng và các điều
              khoản khác (nếu có) sẽ được chỉ rõ trong các Đơn đặt hàng tương
              ứng.
            </>,
            <>
              1.3 Trong trường hợp hai Bên có giao dịch mua bán mà nội dung thỏa
              thuận giữa hai Bên có các điều kiện thỏa thuận bổ sung và chi tiết
              hơn so với nội dung Hợp đồng này, hoặc do hai Bên thống nhất, thỏa
              thuận thì hai Bên sẽ ký Phụ Lục Hợp Đồng để thực hiện giao dịch.
              Trong trường hợp đó, Hợp đồng mua bán sẽ được ưu tiên áp dụng nếu
              có điều khoản trái với Hợp đồng này.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 2: Hàng hóa</ArticleTitle>
        <ClauseList
          items={[
            <>
              2.1 Hàng hóa do Bên Bán cung cấp phải là các sản phẩm đủ điều kiện
              lưu thông trên thị trường và đạt các yêu cầu cụ thể như sau:
            </>,
            <>
              2.2.1. Đúng chủng loại, chất lượng theo tiêu chuẩn của nhà sản
              xuất, phù hợp với tiêu chuẩn đã đăng ký hoặc công bố với cơ quan
              quản lý nhà nước theo quy định pháp luật hiện hành. Bên Bán tự
              chịu trách nhiệm đối với nội dung này, bất cứ khi nào Bên Mua/
              khách hàng của Bên Mua phát hiện sản phẩm không đạt tiêu chuẩn
              chất lượng theo quy định tại điểm này thì Bên Mua có quyền trả
              hàng, Bên Bán có nghĩa vụ hoàn tiền và chịu phạt vi phạm, bồi
              thường thiệt hại theo thỏa thuận tại Hợp đồng này hoặc quy định
              pháp luật hiện hành nếu Hợp đồng này chưa có thỏa thuận.
            </>,
            <>
              2.2.2. Quy cách đóng gói, bảo quản theo đúng tiêu chuẩn nhà sản
              xuất.
            </>,
            <>
              2.2.3. Không móp méo, biến dạng vỏ hộp; màu sắc trên vỏ hộp sắc
              nét không có dấu hiệu bạc/ phai màu.
            </>,
            <>
              2.2.4. Sản phẩm có dán nhãn/ nhãn phụ theo quy định pháp luật hiện
              hành.
            </>,
            <>2.2.5. Được nhập khẩu hợp pháp.</>,
            <>
              2.2.6. Date sản phẩm từ ngày sản xuất cho đến ngày Bên Mua nhập
              hàng HSD còn lại: - Đối với thuốc: không ít hơn 12 tháng.
            </>,
            <>2.2.7. Các tiêu chuẩn khác theo quy định pháp luật hiện hành.</>,
            <>
              2.2.8. Chi tiết về hàng hóa sẽ được các Bên chỉ rõ trong các Đơn
              đặt hàng.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>
          Điều 3: Phương thức đặt hàng và giao nhận hàng hóa
        </ArticleTitle>
        <ClauseList
          items={[
            <>3.1 Quy trình đặt hàng:</>,
            <>
              - Khi có nhu cầu đặt hàng, Bên Mua gửi Đơn đặt hàng cho Bên Bán
              bằng một trong các hình thức: (1) Gửi email từ địa chỉ mail được
              chỉ định sẵn trong Hợp đồng này đại diện cho Bên Mua để thực hiện
              việc đặt hàng, nội dung trên body mail phải đầy đủ các thông tin
              theo Mẫu Đơn Đặt hàng, hoặc; (2) gửi bản gốc Đơn Đặt hàng có chữ
              ký, đóng dấu của người đại diện (Đại diện theo pháp luật, đại diện
              theo ủy quyền, người được Bên Mua chỉ định bằng văn bản có thẩm
              quyền thực hiện việc đặt hàng theo Hợp đồng này).
            </>,
            <>
              - Trong khoảng thời gian 01 ngày làm việc kể từ khi nhận được Đơn
              đặt hàng của Bên Mua, Bên Bán có trách nhiệm xác nhận đồng ý/
              không đồng ý giao hàng theo Đơn đặt hàng; xác nhận thời gian giao
              hàng cụ thể.
            </>,
            <>
              3.2 Người được chỉ định đại diện giao dịch của các Bên: Thông tin
              được báo trước khi Bên Bán giao hàng cho Bên mua.
            </>,
            <>
              3.3 Địa điểm nhận hàng: Được chỉ định cụ thể trong Đơn Đặt hàng.
            </>,
            <>
              3.4 Đại diện giao, nhận hàng hóa: Người đại diện nhận hàng của Bên
              Mua sẽ được chỉ định cụ thể trong từng Đơn Đặt hàng. Hàng hóa được
              coi là đã giao khi có chữ ký của người nhận hàng được Bên B chỉ
              định trên Biên bản bàn giao.
            </>,
            <>3.5 Phương thức giao hàng:</>,
            <>
              - Thời điểm giao hàng: được hai bên thống nhất cụ thể tại từng Đơn
              Đặt hàng.
            </>,
            <>
              - Hàng hóa có thể giao một lần hay nhiều lần tùy theo hai Bên thỏa
              thuận cụ thể trong từng Đơn Đặt hàng.
            </>,
            <>
              - Tại thời điểm giao hàng, Bên Mua kiểm tra hàng hóa và có quyền
              từ chối nhận hàng nếu sản phẩm không đạt chất lượng theo quy định
              tại Khoản 2.1 Điều 2 Hợp đồng này. Nếu Bên Mua chấp nhận một phần
              trong tổng số hàng hóa được giao thì Hai Bên sẽ lập Biên bản bàn
              giao số hàng thực nhận.
            </>,
            <>3.6 Chứng từ giao hàng gồm có:</>,
            <>
              Hóa đơn bán hàng hợp lệ. Thông tin viết hóa đơn: Tên Công ty:{" "}
              {partner.companyName || partner.ownerName}; MST: {partner.mst};
              Địa chỉ: {partner.address};
            </>,
            <>
              Biên bản giao nhận hàng hóa đối với trường hợp giao hàng trực
              tiếp. Trường hợp giao hàng qua nhà vận chuyển thì bill vận chuyển
              ghi rõ số kiện, trọng lượng và còn dấu niêm phong của Bên Bán, có
              danh mục hàng hóa, số lượng từng loại hàng được đóng trong từng
              kiện hàng.
            </>,
            <>
              - Đơn đặt hàng đã được xác nhận theo Quy trình đặt hàng thỏa thuận
              tại Điều này.
            </>,
            <>
              - Phiếu kiểm nghiệm, giấy phép lưu hành, giấy phép nhập khẩu (đối
              với hàng nhập khẩu), các giấy tờ chứng minh nguồn gốc xuất xứ hàng
              hóa theo quy định pháp luật.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 4: Giá cả và phương thức thanh toán</ArticleTitle>
        <ClauseList
          items={[
            <>4.1 Giá bán:</>,
            <>
              - Bảng giá chi tiết và chương trình hợp tác đính kèm tại Phụ lục
              kèm theo.
            </>,
            <>
              - Giá bán hàng hóa là giá Bên Bán niêm yết tùy từng thời điểm và
              có hiệu lực áp dụng vào thời điểm Bên Mua đặt hàng.
            </>,
            <>
              - Trường hợp có điều chỉnh giá bán, Bên Bán cung cấp cho Bên Mua
              văn bản thông báo điều chỉnh giá bán trước thời điểm thay đổi giá
              ít nhất 03 ngày làm việc.
            </>,
            <>
              4.2 Thời hạn thanh toán:{" "}
              <strong className="font-semibold text-black/82 dark:text-white/82">
                {contractData.paymentTermDays}
              </strong>{" "}
              ngày kể từ ngày Bên Bán hoàn thành việc giao hàng và cung cấp đầy
              đủ chứng từ giao hàng theo quy định tại Khoản 3.6 Điều 3 Hợp đồng
              này. Trường hợp ngày thanh toán rơi vào ngày thứ 7, Chủ nhật hoặc
              ngày Lễ, Tết theo quy định của nhà nước thì ngày thanh toán được
              dời vào ngày làm việc kế tiếp.
            </>,
            <>
              4.3 Hạn mức công nợ:{" "}
              <strong className="font-semibold text-black/82 dark:text-white/82">
                {creditLimit}
              </strong>
              .
            </>,
            <>
              4.4 Hình thức thanh toán: thanh toán bằng tiền VND bằng hình thức
              chuyển khoản/ tiền mặt. Trường hợp nhận bằng tiền mặt, người nhận
              phải có giấy ủy quyền của bên Bán.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 5: Trách nhiệm của các bên</ArticleTitle>
        <ClauseList
          items={[
            <>5.1 Bên Bán:</>,
            <>
              Ngoài các quyền, nghĩa vụ đã thỏa thuận tại Hợp đồng này, Bên Bán
              có các nghĩa vụ như sau:
            </>,
            <>
              5.1.1 Cung cấp đầy đủ thông tin về sản phẩm cho bên mua: Danh mục,
              Thông tin sản phẩm, hàm lượng, Catalogue, giá cả, chương trình bán
              hàng, chương trình hỗ trợ, tổ chức đào tạo, giới thiệu sản phẩm
              mới…
            </>,
            <>
              5.1.2 Bằng chi phí của mình thực hiện thu hồi đối với các sản phẩm
              có lỗi nhà sản xuất hoặc theo yêu cầu của cơ quan quản lý nhà nước
              hoặc sản phẩm có các biến cố bất lợi tới sức khỏe người tiêu dùng
              và bồi thường thiệt hại (nếu có) gây ra cho Bên Mua, khách hàng
              của Bên Mua.
            </>,
            <>
              5.1.3 Hỗ trợ tìm hiểu thị trường, xúc tiến thương mại, quảng bá
              sản phẩm;
            </>,
            <>
              5.1.4 Không chuyển nhượng Hợp đồng cho bên thứ ba khi chưa có sự
              đồng ý bằng văn bản của Bên Mua.
            </>,
            <>
              5.1.5 Trường hợp (i) có khiếu nại khách hàng hoặc (ii) có phản ánh
              của khách hàng về các biến cố bất lợi tới sức khỏe người tiêu dùng
              khi sử dụng sản phẩm hoặc (iii) để bổ sung thông tin tài liệu cho
              hoạt động thanh kiểm tra của cơ quan nhà nước, Bên Bán phải cung
              cấp các thông tin, tài liệu do Bên Mua yêu cầu trong vòng 24h kể
              từ thời điểm nhận được yêu cầu từ Bên Mua.
            </>,
            <>5.1.6 Các quyền, nghĩa vụ khác theo quy định pháp luật.</>,
            <>5.2 Bên Mua:</>,
            <>
              Ngoài các quyền, nghĩa vụ đã thỏa thuận tại Hợp đồng này, Bên Mua
              có các nghĩa vụ như sau:
            </>,
            <>
              5.2.1 Đảm bảo thanh toán đúng thời hạn đã thỏa thuận theo điều 4.2
              trong Hợp đồng này.
            </>,
            <>
              5.2.2 Bố trí nhận hàng và cử người kiểm tra hàng hóa có thẩm quyền
              theo sự công của bên Mua ký biên bản nhận hàng hóa đúng thời gian
              thỏa thuận giao hàng với Bên Bán.
            </>,
            <>
              5.2.3 Thực hiện nghiêm chỉnh các qui định của Pháp luật Việt Nam
              về quản lý và lưu thông hàng hóa.
            </>,
            <>
              5.2.4 Đảm bảo tuân thủ việc bảo quản hàng hóa theo hướng dẫn và
              các tiêu chuẩn phù hợp để tránh tình trạng hàng hóa bị biến đổi về
              chất lượng do bảo quản không phù hợp;
            </>,
            <>5.2.5 Các quyền, nghĩa vụ khác theo quy định pháp luật.</>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>
          Điều 6: Cung cấp và trao đổi thông tin giữa hai bên
        </ArticleTitle>
        <ClauseList
          items={[
            <>
              6.1 Hai bên thống nhất trao đổi thông tin thông qua các Đại diện
              liên lạc. Trong trường hợp nhân viên được ủy quyền giao dịch được
              ghi trên không được quyền tiếp tục đại diện trong việc giao dịch
              với Bên kia, hai bên cần có thông báo kịp thời, chính thức bằng
              văn bản/email/fax, gửi người đại diện liên lạc bên kia ngay lập
              tức và phải được đại diện liên lạc Bên kia xác nhận đã nhận được
              thông báo đó, nếu không, Bên gây thiệt hại phải chịu hoàn toàn
              trách nhiệm bồi hoàn chi phí thiệt hại cho Bên kia do việc chậm
              thông báo trên gây ra.
            </>,
            <>
              6.2 Trong trường hợp có sự thay đổi về những thông tin liên quan
              đến quá trình giao dịch giữa hai Bên như: thay đổi trụ sở làm
              việc, thay đổi mã số thuế, thay đổi tài khoản…vv hai Bên phải có
              trách nhiệm thông báo bằng văn bản cho nhau trước khi phát sinh
              việc mua bán mới.
            </>,
            <>
              6.3 Nếu bên nào muốn thay đổi các nội dung trong hợp đồng phải
              thông báo cho bên còn lại bằng văn bản và Hai Bên tiến hành thương
              thảo để ký kết Phụ lục Hợp đồng.
            </>,
            <>
              6.4 Hai bên có trách nhiệm liên lạc kịp thời khi xảy ra các tình
              huống phát sinh trong quá trình giao hàng, vận hành (ví dụ hết
              hàng, hàng không thể giao kịp, thay đổi chất lượng sản phẩm,…) để
              kịp thời giải quyết tránh các thiệt hại cho đôi bên. Trường hợp
              xảy ra thiệt hại, bên chậm thông báo sẽ chịu hoàn toàn trách nhiệm
              bồi thường cho phía bên kia.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>
          Điều 7: Bồi thường thiệt hại và phạt vi phạm hợp đồng
        </ArticleTitle>
        <ClauseList
          items={[
            <>7.1. Phạt vi phạm:</>,
            <>
              7.1.1. Bên Mua chịu phạt vi phạm trong trường hợp thanh toán tiền
              hàng không đúng thời hạn quy định tại Hợp đồng này, tính từ thời
              điểm quá hạn thanh toán Bên mua phải chịu mức phạt vi phạm tương
              đương 8% giá trị đơn hàng, đồng thời phải chịu mức lãi suất chậm
              trả cho Bên Bán theo mức lãi suất của Ngân hàng mà Bên Bán có tài
              khoản tại hợp đồng này theo mức lãi suất tại thời điểm vi phạm và
              các khoản bồi thường thiệt hại khác nếu có.
            </>,
            <>
              7.1.2. Bên Bán chịu phạt vi phạm trong trường hợp: - Hàng hóa
              không đúng chất lượng quy định tại Điểm 2.1.1 Khoản 2.1 Điều 2 Hợp
              đồng này. - Mức phạt vi phạm tương đương 8%/ giá trị đơn hàng.
              Ngoài chịu phạt vi phạm hợp đồng, Bên Mua được quyền trả lại hàng
              và yêu cầu Bên Bán bồi thường thiệt hại theo khoản 7.2 dưới đây.
            </>,
            <>
              7.2. Bồi thường thiệt hại: - Nguyên tắc bồi thường: các thiệt hại
              thực tế, trực tiếp phát sinh do hành vi trái pháp luật của Một Bên
              gây thiệt hại cho Bên kia sẽ phải được bên vi phạm bồi thường toàn
              bộ, kịp thời cho Bên bị vi phạm. - Bên Bán có nghĩa vụ bồi thường
              các thiệt hại (nếu có) do lỗi của Bên Bán bao gồm nhưng không giới
              hạn ở một số lỗi: sản phẩm không được công bố/đăng ký theo quy
              định pháp luật; công bố/đăng ký hết hạn; sản phẩm là hàng giả,
              hàng nhái, hàng kém chất lượng; sản phẩm không được dán tem nhãn
              theo đúng quy định pháp luật hiện hành, .....Mức bồi thường trong
              trường hợp này là toàn bộ số tiền phạt vi phạm từ cơ quan nhà
              nước, thiệt hại tiền hàng do hàng hóa bị thu hồi, chi phí thẩm
              định, chi phí tiêu hủy,...
            </>,
            <>
              7.3 Miễn phạt vi phạm hợp đồng: 1. Bên vi phạm hợp đồng được miễn
              trách nhiệm trong các trường hợp sau đây: a) Xảy ra trường hợp
              miễn trách nhiệm mà các bên đã thoả thuận; b) Xảy ra sự kiện bất
              khả kháng; c) Hành vi vi phạm của một bên hoàn toàn do lỗi của bên
              kia; d) Hành vi vi phạm của một bên do thực hiện quyết định của cơ
              quan quản lý nhà nước có thẩm quyền mà các bên không thể biết được
              vào thời điểm giao kết hợp đồng. 2. Bên vi phạm hợp đồng có nghĩa
              vụ chứng minh các trường hợp miễn trách nhiệm.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 8: Bảo mật thông tin</ArticleTitle>
        <ClauseList
          items={[
            <>
              8.1. Mỗi Bên sẽ giữ bí mật nghiêm ngặt mọi thông tin có được trong
              quá trình ký kết và thực hiện Hợp đồng này và các Phụ lục Hợp
              đồng, Hợp đồng mua bán (nếu có) được ký kết giữa hai Bên. Không
              Bên nào được tiết lộ thông tin đó cho bất kỳ người nào ngoài những
              nhân viên và người lao động của mình, và việc tiết lộ như vậy cho
              các nhân viên hoặc người lao động sẽ chỉ được thực hiện trong phạm
              vi cần thiết với mục đích để thực hiện Hợp đồng này, người được
              tiết lộ phải được biết và tuân thủ nghĩa vụ bảo mật thông tin Hai
              Bên đã thỏa thuận.
            </>,
            <>
              8.2. Những quy định trên sẽ vẫn được áp dụng kể cả khi Hợp Đồng
              này đã kết thúc hoặc chấm dứt trong thời hạn 01 (một) năm kể từ
              khi chấm dứt Hợp đồng này.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 9: Chống tham nhũng</ArticleTitle>
        <ClauseList
          items={[
            <>
              9.1. Bên Bán không được bằng bất kỳ hình thức nào trao cho nhân
              viên của Bên Mua các lợi ích bằng tiền hoặc/và hiện vật như tặng
              quà, thưởng tiền, trích phần trăm hoa hồng, cho nhân viên nâng giá
              để hưởng chênh lệch hoặc các hành vi có tính chất tương tự mà
              không có sự đồng ý bằng văn bản của Bên Mua. Bên Mua được quyền
              chấm dứt hợp đồng này nếu Bên Bán vi phạm cam kết này và đồng thời
              Bên Bán sẽ phải bồi thường cho Bên Mua tương đương số tiền mà Bên
              Bán đã chi trả cho nhân viên của Bên Mua.
            </>,
            <>
              9.2. Bên Bán cam kết rằng, nếu biết việc nhân viên của Bên Mua có
              các hành vi đề nghị việc được hưởng tiền/ lợi ích vật chất như đã
              nêu ở trên thì thông báo cho Bên Mua theo thông tin sau: - Họ tên:{" "}
              {partner.ownerName} Chức vụ: {partner.role} - Điện thoại:{" "}
              {partner.phone} - Email: {partner.email}
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 10: Chấm dứt hợp đồng</ArticleTitle>
        <ClauseList
          items={[
            <>Hợp đồng này chấm dứt trong các trường hợp sau:</>,
            <>10.1. Hợp đồng hết hạn mà Hai Bên không có nhu cầu gia hạn.</>,
            <>10.2. Do hai Bên thỏa thuận chấm dứt Hợp đồng bằng văn bản.</>,
            <>
              10.3. Do một Bên đơn phương chấm dứt hợp đồng. Một Bên được đơn
              phương chấm dứt hợp đồng trong các trường hợp sau:
            </>,
            <>
              10.3.1. Nếu một trong hai Bên vi phạm các quy định trong hợp đồng
              và/hoặc các quy định của pháp luật, Bên vi phạm phải khắc phục các
              thiệt hại (nếu có) trong vòng 10 (mười) ngày kể từ ngày nhận thông
              báo yêu cầu của phía Bên bị vi phạm. Nếu quá thời gian khắc phục
              nêu trên mà các vi phạm vẫn chưa được khắc phục, Bên bị vi phạm có
              quyền đơn phương chấm dứt hợp đồng theo quy định của pháp luật và
              Bên vi phạm có nghĩa vụ bồi thường toàn bộ các thiệt hại theo quy
              định của pháp luật.
            </>,
            <>
              10.3.2. Trừ trường hợp quy định tại điểm 10.3.1. nêu trên, nếu một
              Bên muốn chấm dứt hợp đồng trước thời hạn thì phải thông báo trước
              bằng văn bản cho Bên còn lại trước 30 (ba mươi) ngày.
            </>,
            <>
              10.4. Trong mọi trường hợp chấm dứt hợp đồng trước thời hạn, Hai
              Bên phải thực hiện thực hiện đầy đủ các nghĩa vụ quy định trong
              Hợp đồng cho các giao dịch đã thực hiện trước đó. Hợp đồng chỉ
              được chấm dứt khi Hai Bên hoàn thành quyết toán hàng hóa và công
              nợ và người đại diện có thẩm quyền của hai Bên ký và đóng dấu biên
              bản thanh lý hợp đồng.
            </>,
            <>
              10.5. Bên nào đơn phương chấm dứt hợp đồng trái các quy định tại
              Hợp đồng này và/hoặc trái pháp luật thì phải có nghĩa vụ bồi
              thường cho Bên còn lại toàn bộ các thiệt hại cho Bên kia theo quy
              định của pháp luật.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 11: Cam kết chung</ArticleTitle>
        <ClauseList
          items={[
            <>
              11.1. Hai bên cam kết thực hiện đúng những điều ghi trên Hợp đồng
              này. Nếu một trong hai bên cố ý vi phạm các điều khoản của Hợp
              đồng này sẽ phải chịu trách nhiệm tài sản về các hành vi vi phạm
              đó.
            </>,
            <>
              11.2. Trong trường hợp xảy ra tranh chấp, hai bên cùng nhau bàn
              bạc các biện pháp giải quyết trên tinh thần hòa giải, có thiện chí
              và hợp tác. Nếu vẫn không thống nhất cách giải quyết thì hai Bên
              sẽ đưa vụ việc ra Tòa án có thẩm quyền giải quyết.
            </>,
            <>
              11.3. Hợp đồng nguyên tắc này có giá trị 12 tháng kể từ ngày ký
              kết. Hết thời hạn trên, nếu hai Bên không có ý kiến gì thì Hợp
              đồng được tự động gia hạn thêm 12 tháng tiếp theo và tối đa không
              quá 2 năm tính từ ngày ký Hợp đồng này.
            </>,
            <>
              11.4. Các Đơn đặt hàng cũng như các sửa đổi, bổ sung được coi như
              các phụ lục và là một phần không thể tách rời của Hợp đồng này.
            </>,
            <>
              Hợp đồng Nguyên tắc bán hàng này được lập thành 04 bản, mỗi bên
              giữ 02 bản có giá trị pháp lý như nhau. Hợp đồng có hiệu lực kể từ
              ngày ký.
            </>,
          ]}
        />
      </section>

      <section className="mt-20 grid gap-12 border-t border-black/10 pt-12 md:grid-cols-2 dark:border-white/10">
        <SignatureBlock
          title="Đại diện Bên A"
          name={owner.ownerName}
          isSigned={hasOwnerSigned || Boolean(ownerSignatureRevealKey)}
          shouldAnimate={Boolean(ownerSignatureRevealKey)}
          revealKey={ownerSignatureRevealKey}
          signatureRef={ownerSignatureRef}
        />
        <SignatureBlock
          title="Đại diện Bên B"
          name={partner.ownerName}
          isSigned={hasPartnerSigned || Boolean(partnerSignatureRevealKey)}
          shouldAnimate={Boolean(partnerSignatureRevealKey)}
          revealKey={partnerSignatureRevealKey}
          signatureRef={partnerSignatureRef}
        />
      </section>
    </motion.article>
  );
}

function LivestreamResponsibilityCommitmentDocument({
  contract,
  ownerSignatureRef,
  ownerSignatureRevealKey,
  partnerSignatureRef,
  partnerSignatureRevealKey,
}: {
  contract: Contract;
  ownerSignatureRef?: React.Ref<HTMLDivElement>;
  ownerSignatureRevealKey?: number;
  partnerSignatureRef?: React.Ref<HTMLDivElement>;
  partnerSignatureRevealKey?: number;
}) {
  const owner = contract.ownerCompanyInfo;
  const personal = contract.personalInfo;
  const todayDate = getVietnameseDate(getContractDisplayDate(contract));
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";
  const strong = (value?: string | null) => (
    <strong className="font-semibold text-black/86 dark:text-white/86">
      {value || "..."}
    </strong>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-5xl pb-24"
    >
      <header className="grid gap-8 border-b border-black/10 pb-10 md:grid-cols-[1fr_1.15fr] dark:border-white/10">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            {owner.companyName}
          </p>
          <p className="mt-3 text-[13px] text-black/35 dark:text-white/35">
            Số: {strong(contract.contractNumber || contract.contractId)}
          </p>
        </div>
        <div className="text-left md:text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            Cộng hòa xã hội chủ nghĩa Việt Nam
          </p>
          <p className="mt-1 text-[13px] text-black/62 dark:text-white/62">
            Độc lập – Tự do – Hạnh phúc
          </p>
        </div>
      </header>

      <section className="pt-14 text-center">
        <p className="text-[13px] font-semibold text-black/86 dark:text-white/86">
          TP.HCM, {todayDate}
        </p>
        <h1 className="mx-auto mt-7 max-w-3xl text-3xl leading-tight font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
          Bản cam kết trách nhiệm và xác nhận tuân thủ quy định hoạt động
          Livestream
        </h1>
      </section>

      <section className="mt-14">
        <ArticleTitle>Căn cứ lập cam kết</ArticleTitle>
        <ClauseList
          items={[
            "Căn cứ Bộ luật Lao động số 45/2019/QH14 và các văn bản hướng dẫn thi hành;",
            "Căn cứ Luật Thương mại điện tử có hiệu lực từ ngày 01/07/2026;",
            "Căn cứ Luật Quảng cáo và các văn bản hướng dẫn thi hành;",
            "Căn cứ quy định của pháp luật về quản lý mỹ phẩm;",
            `Căn cứ Nội quy lao động và các quy định nội bộ của ${owner.companyName}.`,
          ]}
        />
      </section>

      <p className="mt-10 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Hôm nay, {strong(todayDate)}, tại văn phòng Công ty, chúng tôi gồm:
      </p>
      <section className="mt-8 text-[14px] leading-7 text-black/62 dark:text-white/62">
        <h2 className="font-semibold text-black/86 uppercase dark:text-white/86">
          Bên A: {owner.companyName} (Sau đây gọi là “Công ty”)
        </h2>
        <p>Tên công ty: {strong(owner.companyName)}</p>
        <p>Mã số thuế: {strong(owner.mst)}</p>
        <p>Địa chỉ: {strong(owner.address)}</p>
        <p>
          Người đại diện: {strong(owner.ownerName)} – {strong(owner.role)}
        </p>
      </section>
      <section className="mt-8 text-[14px] leading-7 text-black/62 dark:text-white/62">
        <h2 className="font-semibold text-black/86 uppercase dark:text-white/86">
          Bên B: Người lao động/Nhân viên Livestream (Người cam kết)
        </h2>
        <p>Họ tên: {strong(personal?.fullName)}</p>
        <p>
          Sinh ngày:{" "}
          {strong(
            personal?.dateOfBirth ? formatDate(personal.dateOfBirth) : "",
          )}
        </p>
        <p>
          Chức vụ: {strong(personal?.position)} · Phòng ban:{" "}
          {strong(personal?.department)}
        </p>
        <p>Email: {strong(personal?.email)}</p>
        <p>Thường trú: {strong(personal?.permanentAddress)}</p>
        <p>
          Số CCCD: {strong(personal?.citizenId)} · cấp ngày:{" "}
          {strong(
            personal?.citizenIdIssuedDate
              ? formatDate(personal.citizenIdIssuedDate)
              : "",
          )}{" "}
          · tại: {strong(personal?.citizenIdIssuedPlace)}
        </p>
      </section>

      <p className="mt-8 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Bên B tự nguyện lập và ký bản cam kết này với Bên A nhằm đảm bảo tính
        tuân thủ pháp luật và bảo vệ hình ảnh thương hiệu của Công ty trong quá
        trình thực hiện Livestream bán hàng, cụ thể như sau:
      </p>

      <section>
        <ArticleTitle>
          Điều 1: Phạm vi và nội dung phát ngôn về sản phẩm
        </ArticleTitle>
        <ClauseList
          items={[
            "Tuân thủ đúng hồ sơ công bố: Chỉ giới thiệu, tư vấn và mô tả công dụng của mỹ phẩm đúng theo tài liệu, kịch bản và phiếu công bố sản phẩm do Bên A cung cấp.",
            "Không sử dụng ngôn từ cấm: Tuyệt đối không dùng từ ngữ, hình ảnh, âm thanh, ký hiệu hoặc cách diễn đạt khiến khách hàng hiểu mỹ phẩm là thuốc hoặc có tác dụng điều trị bệnh; không dùng các từ “Đặc trị”, “Trị dứt điểm”, “Cam kết khỏi bệnh 100%”, “Thuốc”, “Chữa bệnh”, “Thần dược” hoặc nội dung thổi phồng công dụng.",
            "Không tự ý sáng tạo công dụng, thành phần hoặc tính năng của sản phẩm khi chưa được Bộ phận Chuyên môn/Quản lý của Bên A phê duyệt bằng văn bản.",
          ]}
        />
      </section>
      <section>
        <ArticleTitle>
          Điều 2: Chuẩn mực ngôn từ và hành vi trên nền tảng
        </ArticleTitle>
        <ClauseList
          items={[
            "Sử dụng ngôn từ lịch sự, văn minh; không chửi thề, nói bậy, dùng từ thô tục, nhục mạ, phân biệt vùng miền, giới tính, tôn giáo hoặc vi phạm thuần phong mỹ tục Việt Nam.",
            "Tuân thủ tuyệt đối chính sách của các nền tảng Livestream như TikTok, Shopee, Facebook; không có hành vi hở hang, bạo lực hoặc xúi giục vi phạm pháp luật.",
            "Cạnh tranh lành mạnh: Không nhắc tên, bôi nhọ, chê bai hoặc so sánh trực tiếp đối thủ; không tự ý thay đổi giá, voucher, khuyến mại, xuất xứ, chính sách đổi trả hoặc bảo hành khi chưa được Công ty phê duyệt.",
          ]}
        />
      </section>
      <section>
        <ArticleTitle>
          Điều 3: Xử lý vi phạm và trách nhiệm bồi thường
        </ArticleTitle>
        <ClauseList
          items={[
            "Bên B hiểu mọi phát ngôn trên Livestream đều đại diện cho hình ảnh Bên A và phải chịu trách nhiệm cá nhân đối với án phạt hành chính hoặc hình phạt từ nền tảng do hành vi của mình gây ra.",
            "Nếu vi phạm làm kênh hoặc tài khoản của Bên A bị khóa, bóp tương tác, đánh gậy hoặc khóa vĩnh viễn, Bên B có trách nhiệm bồi thường toàn bộ thiệt hại về doanh thu và chi phí xây dựng kênh theo thiệt hại thực tế.",
            "Bên B bồi thường 100% các khoản tiền phạt mà Bên A phải nộp cho cơ quan nhà nước do lỗi phát ngôn sai sự thật của Bên B.",
            "Tùy mức độ vi phạm, Nhân viên có thể bị xử lý kỷ luật lao động đến mức sa thải và phải bồi thường toàn bộ thiệt hại theo quy định pháp luật.",
          ]}
        />
      </section>
      <section>
        <ArticleTitle>Điều 4: Điều khoản chung</ArticleTitle>
        <ClauseList
          items={[
            "Bên B đã đọc, hiểu rõ nội dung cam kết và sẽ không thắc mắc, khiếu nại về sau.",
            "Cam kết này thay thế mọi trao đổi, đồng ý bằng miệng và thông báo bằng văn bản trước đây liên quan đến chủ đề này.",
            "Cam kết có hiệu lực từ ngày ký và trong suốt quá trình làm việc. Nghĩa vụ bảo mật và bồi thường thiệt hại vẫn được thực hiện sau khi chấm dứt hợp đồng lao động theo pháp luật và thỏa thuận giữa hai bên.",
            "Cam kết được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.",
          ]}
        />
      </section>

      <section className="mt-20 grid gap-12 border-t border-black/10 pt-12 md:grid-cols-2 dark:border-white/10">
        <SignatureBlock
          title="Người cam kết"
          name={personal?.fullName || ""}
          isSigned={hasPartnerSigned || Boolean(partnerSignatureRevealKey)}
          shouldAnimate={Boolean(partnerSignatureRevealKey)}
          revealKey={partnerSignatureRevealKey}
          signatureRef={partnerSignatureRef}
        />
        <SignatureBlock
          title="Đại diện công ty"
          name={owner.ownerName}
          isSigned={hasOwnerSigned || Boolean(ownerSignatureRevealKey)}
          shouldAnimate={Boolean(ownerSignatureRevealKey)}
          revealKey={ownerSignatureRevealKey}
          signatureRef={ownerSignatureRef}
        />
      </section>
    </motion.article>
  );
}

function LivestreamResponsibilityCommitmentAppendixDocument({
  contract,
  ownerSignatureRef,
  ownerSignatureRevealKey,
  partnerSignatureRef,
  partnerSignatureRevealKey,
}: {
  contract: Contract;
  ownerSignatureRef?: React.Ref<HTMLDivElement>;
  ownerSignatureRevealKey?: number;
  partnerSignatureRef?: React.Ref<HTMLDivElement>;
  partnerSignatureRevealKey?: number;
}) {
  const owner = contract.ownerCompanyInfo;
  const personal = contract.personalInfo;
  const contractDate = getVietnameseDate(getContractDisplayDate(contract));
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-5xl pb-24"
    >
      <header className="grid gap-8 border-b border-black/10 pb-10 md:grid-cols-[1fr_1.15fr] dark:border-white/10">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            {owner.companyName}
          </p>
          <p className="mt-3 text-[13px] text-black/35 dark:text-white/35">
            Số:{" "}
            <strong className="font-semibold text-black/72 dark:text-white/72">
              {contract.contractNumber || contract.contractId}
            </strong>
          </p>
        </div>
        <div className="text-left md:text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            Cộng hòa xã hội chủ nghĩa Việt Nam
          </p>
          <p className="mt-1 text-[13px] text-black/62 dark:text-white/62">
            Độc lập – Tự do – Hạnh phúc
          </p>
        </div>
      </header>
      <section className="pt-14 text-center">
        <p className="text-[13px] text-black/35 dark:text-white/35">
          TP.HCM,{" "}
          <strong className="font-semibold text-black/72 dark:text-white/72">
            {contractDate}
          </strong>
        </p>
        <h1 className="mx-auto mt-7 max-w-3xl text-3xl leading-tight font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
          Phụ lục bản cam kết trách nhiệm và xác nhận tuân thủ quy định hoạt
          động Livestream
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-[14px] leading-7 text-black/55 italic dark:text-white/55">
          Phụ lục này là văn bản không thể tách rời của Bản cam kết trách nhiệm
          và xác nhận tuân thủ quy định hoạt động Livestream.
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-[14px] leading-7 text-black/62 dark:text-white/62">
          Áp dụng cho người cam kết:{" "}
          <strong className="font-semibold text-black/86 dark:text-white/86">
            {personal?.fullName || "..."}
          </strong>
        </p>
      </section>
      <section>
        <ArticleTitle>I. Nguyên tắc áp dụng</ArticleTitle>
        <ClauseList
          items={[
            "Danh mục này quy định các từ khóa, cụm từ và nội dung không được sử dụng khi Livestream, quay video, đăng bài viết, trả lời bình luận, nhắn tin với khách hàng hoặc thực hiện hoạt động truyền thông dưới danh nghĩa Công ty.",
            "Danh mục được xây dựng trên cơ sở pháp luật Việt Nam, quy định chuyên ngành về quảng cáo, mỹ phẩm, thương mại điện tử, chính sách nền tảng mạng xã hội và quy định nội bộ của Công ty.",
            "Danh mục mang tính hướng dẫn tuân thủ, không giới hạn trách nhiệm của Nhân viên đối với hành vi vi phạm chưa được liệt kê; mọi cách diễn đạt có ý nghĩa tương tự hoặc làm khách hàng hiểu theo nội dung bị cấm đều được xem là vi phạm.",
          ]}
        />
      </section>
      {LIVESTREAM_APPENDIX_SECTIONS.map((section) => (
        <section key={section.title}>
          <ArticleTitle>{section.title}</ArticleTitle>
          <p className="mt-4 text-[14px] leading-7 text-black/62 dark:text-white/62">
            {section.intro}
          </p>
          <ClauseList items={[...section.items]} />
        </section>
      ))}
      <section>
        <ArticleTitle>X. Quy định áp dụng</ArticleTitle>
        <ClauseList
          items={[
            "Nhân viên xác nhận đã được Công ty phổ biến và hướng dẫn đầy đủ Danh mục từ khóa cấm (Blacklist Keywords) này và cam kết tuân thủ trong toàn bộ hoạt động truyền thông dưới danh nghĩa Công ty.",
            "Danh mục này là Phụ lục không tách rời của Bản cam kết trách nhiệm và có giá trị áp dụng như Bản cam kết.",
            "Khi pháp luật, chính sách nền tảng hoặc quy định nội bộ thay đổi, Công ty có quyền sửa đổi, bổ sung Danh mục mà không phải ký lại Bản cam kết. Kể từ thời điểm được thông báo, Nhân viên có trách nhiệm nghiên cứu và tuân thủ đầy đủ nội dung cập nhật.",
          ]}
        />
      </section>
      <section className="mt-20 grid gap-12 border-t border-black/10 pt-12 md:grid-cols-2 dark:border-white/10">
        <SignatureBlock
          title="Người cam kết"
          name={personal?.fullName || ""}
          isSigned={hasPartnerSigned || Boolean(partnerSignatureRevealKey)}
          shouldAnimate={Boolean(partnerSignatureRevealKey)}
          revealKey={partnerSignatureRevealKey}
          signatureRef={partnerSignatureRef}
        />
        <SignatureBlock
          title="Đại diện công ty"
          name={owner.ownerName}
          isSigned={hasOwnerSigned || Boolean(ownerSignatureRevealKey)}
          shouldAnimate={Boolean(ownerSignatureRevealKey)}
          revealKey={ownerSignatureRevealKey}
          signatureRef={ownerSignatureRef}
        />
      </section>
    </motion.article>
  );
}

function AppendixContractDocument({
  contract,
  ownerSignatureRef,
  ownerSignatureRevealKey,
  partnerSignatureRef,
  partnerSignatureRevealKey,
}: {
  contract: Contract;
  ownerSignatureRef?: React.Ref<HTMLDivElement>;
  ownerSignatureRevealKey?: number;
  partnerSignatureRef?: React.Ref<HTMLDivElement>;
  partnerSignatureRevealKey?: number;
}) {
  const owner = contract.ownerCompanyInfo;
  const partner = contract.partnerCompanyInfo;
  const contractDate = getContractDisplayDate(contract);
  const todayDate = getVietnameseDate(contractDate);
  const shortTodayDate = formatDate(contractDate);
  const products = getAppendixProducts(contract);
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-5xl pb-24"
    >
      <header className="grid gap-8 border-b border-black/10 pb-10 md:grid-cols-[1fr_1.15fr] dark:border-white/10">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            {owner.companyName}
          </p>
          <p className="mt-3 text-[13px] text-black/35 dark:text-white/35">
            Số:{" "}
            <strong className="font-semibold text-black/72 dark:text-white/72">
              {contract.contractNumber || contract.contractId}
            </strong>
          </p>
        </div>
        <div className="text-left md:text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            Cộng hòa xã hội chủ nghĩa Việt Nam
          </p>
          <p className="mt-1 text-[13px] text-black/62 dark:text-white/62">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>
      </header>

      <section className="pt-14 text-center">
        <p className="text-[13px] text-black/35 dark:text-white/35">
          Hôm nay,{" "}
          <strong className="font-semibold text-black/72 dark:text-white/72">
            {todayDate}
          </strong>
        </p>
        <h1 className="mt-7 text-4xl font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
          Phụ lục hợp đồng
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-7 text-black/62 dark:text-white/62">
          Đính kèm Hợp đồng nguyên tắc số:{" "}
          <strong className="font-semibold text-black/86 dark:text-white/86">
            {getAppendixPrincipleContractNumber(contract) || "..."}
          </strong>{" "}
        </p>
      </section>

      <p className="mt-10 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Hôm nay,{" "}
        <strong className="font-semibold text-black/82 dark:text-white/82">
          {shortTodayDate || "..."}
        </strong>{" "}
        tại văn phòng công ty chúng tôi gồm có:
      </p>

      <PartySection
        title={`Công ty bán (Bên A): ${owner.companyName}`}
        party={owner}
      />
      <p className="mt-3 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Sau đây gọi tắt là Bên A
      </p>
      <PartySection
        title={`Công ty mua (Bên B): ${partner.companyName || partner.ownerName}`}
        party={partner}
      />
      <p className="mt-3 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Sau đây gọi tắt là Bên B
      </p>

      <section>
        <ArticleTitle>Nội dung phụ lục</ArticleTitle>
        <ClauseList
          items={[
            <>Hai bên đồng ý ký kết Phụ lục với các điều khoản sau:</>,
            <>
              Bảng giá: Bên B được hưởng các chính sách, chương trình hợp tác
              theo bảng liệt kê chi tiết (Giá và các chính sách, chương trình
              hợp tác đã bao gồm thuế GTGT). Mức chiết khấu này sẽ là căn cứ để
              Bên A xuất hóa đơn GTGT cho Bên B khi xuất bán hàng hóa. Khi bảng
              giá thay đổi đã được hai Bên thống nhất qua thư điện tử (email).
              Bên A cung cấp cho Bên B bảng giá mới trước 30 (ba mươi) ngày
              trước khi áp dụng.
            </>,
            <>
              Lưu ý: Thuế suất thuế GTGT của sản phẩm sẽ thay đổi tùy từng thời
              điểm. phù hợp theo quy định của pháp luật hiện hành.
            </>,
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Bảng sản phẩm</ArticleTitle>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-y border-black/15 bg-black/[0.035] text-black/70 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/70">
                <th className="w-12 px-3 py-3 font-medium">STT</th>
                {Object.values(APPENDIX_PRODUCT_LABELS).map((label) => (
                  <th key={label} className="px-3 py-3 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr
                    key={`${product.productName}-${index}`}
                    className="border-b border-black/10 text-black/62 dark:border-white/10 dark:text-white/62"
                  >
                    <td className="px-3 py-3 align-top tabular-nums">
                      {index + 1}
                    </td>
                    {(
                      Object.keys(APPENDIX_PRODUCT_LABELS) as Array<
                        keyof AppendixProductRow
                      >
                    ).map((key) => (
                      <td key={key} className="px-3 py-3 align-top">
                        <strong className="font-semibold text-black/86 dark:text-white/86">
                          {product[key] || "-"}
                        </strong>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-black/45 dark:text-white/45"
                  >
                    Chưa có sản phẩm trong phụ lục.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-20 grid gap-12 border-t border-black/10 pt-12 md:grid-cols-2 dark:border-white/10">
        <SignatureBlock
          title="Đại diện Bên A"
          name={owner.ownerName}
          isSigned={hasOwnerSigned || Boolean(ownerSignatureRevealKey)}
          shouldAnimate={Boolean(ownerSignatureRevealKey)}
          revealKey={ownerSignatureRevealKey}
          signatureRef={ownerSignatureRef}
        />
        <SignatureBlock
          title="Đại diện Bên B"
          name={partner.ownerName}
          isSigned={hasPartnerSigned || Boolean(partnerSignatureRevealKey)}
          shouldAnimate={Boolean(partnerSignatureRevealKey)}
          revealKey={partnerSignatureRevealKey}
          signatureRef={partnerSignatureRef}
        />
      </section>
    </motion.article>
  );
}

function DockButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="contract-dock-button group flex h-12 w-12 items-center justify-center rounded-full transition duration-250 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        aria-label={label}
      >
        <span className="text-[18px] transition duration-250 ease-out group-hover:scale-105">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}

function ContractActionDock({
  contract,
  onSigned,
}: {
  contract: Contract;
  onSigned: () => void;
}) {
  const navigate = useNavigate();
  const downloadMutation = useDownloadS3Asset();
  const draftDownloadMutation = useCreateDraftDownloadContract();
  const [signingContract, setSigningContract] = useState<Contract | null>(null);
  const [isSendMailOpen, setIsSendMailOpen] = useState(false);
  const canSignContract =
    contract.status === "draft" || contract.status === "unsigned";
  const canSendPartnerMail = contract.status === "owner_signed";
  const canCreatePrincipleContract =
    contract.contractType === "principle" &&
    (contract.status === "owner_signed" || contract.status === "completed");

  const handleDownloadDraftContract = async () => {
    const draftDocument = getDraftDocumentFile(contract);
    const draftDocumentKey = getS3KeyFromUrl(draftDocument?.fileUrl);

    if (draftDocumentKey) {
      downloadMutation.mutate({
        key: draftDocumentKey,
        originalName: getFileNameFromS3Key(
          draftDocumentKey,
          `${contract.contractNumber || contract.contractId}-draft.pdf`,
        ),
      });
      return;
    }

    const response = await draftDownloadMutation
      .mutateAsync(contract.contractId)
      .catch(() => null);

    if (!response?.success || !response.data?.downloadUrl) {
      return;
    }

    openDownloadUrl(response.data.downloadUrl, response.data.fileName);
  };

  const handleDownloadContract = async () => {
    if (contract.status === "draft") {
      await handleDownloadDraftContract();
      return;
    }

    const key = getS3KeyFromUrl(contract.contractUrl);

    if (!key) {
      toast.error(
        "Không thể tải hợp đồng",
        "Hợp đồng chưa có đường dẫn tập tin để tải xuống.",
      );
      return;
    }

    downloadMutation.mutate({
      key,
      originalName: getFileNameFromS3Key(
        key,
        `${contract.contractNumber || contract.contractId}.pdf`,
      ),
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="contract-dock fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border p-2 backdrop-blur-xl"
      >
        {canSignContract ? (
          <DockButton
            label="Ký hợp đồng"
            icon={<FiPenTool />}
            onClick={() => setSigningContract(contract)}
          />
        ) : null}
        {contract.status === "draft" ? (
          <DockButton
            label="Chỉnh sửa hợp đồng"
            icon={<FiEdit3 />}
            onClick={() => navigate(getEditPath(contract.contractId))}
          />
        ) : null}
        <DockButton
          label={
            contract.status === "draft" ? "Tải hợp đồng nháp" : "Tải hợp đồng"
          }
          icon={<FiDownload />}
          onClick={handleDownloadContract}
          disabled={
            downloadMutation.isPending || draftDownloadMutation.isPending
          }
        />
        {canCreatePrincipleContract ? (
          <DockButton
            label="Tạo phụ lục hợp đồng"
            icon={<FiFilePlus />}
            onClick={() =>
              navigate(PATHS.CONTRACT_CREATE, {
                state: { contractType: "appendix" },
              })
            }
          />
        ) : null}
        {canSendPartnerMail ? (
          <DockButton
            label="Gửi mail cho đối tác"
            icon={<FiMail />}
            onClick={() => setIsSendMailOpen(true)}
          />
        ) : null}
      </motion.div>

      <ContractSigningModal
        contract={signingContract}
        onClose={() => setSigningContract(null)}
        onSigned={onSigned}
      />

      <SendPartnerMailModalController
        contract={contract}
        isOpen={isSendMailOpen}
        onClose={() => setIsSendMailOpen(false)}
      />
    </>
  );
}

function ContractPreviewPageShell({
  contract,
  onSigned,
}: {
  contract: Contract;
  onSigned: () => void;
}) {
  const ownerSignatureRef = useRef<HTMLDivElement>(null);
  const partnerSignatureRef = useRef<HTMLDivElement>(null);
  const [ownerSignatureRevealKey, setOwnerSignatureRevealKey] = useState(0);
  const [partnerSignatureRevealKey, setPartnerSignatureRevealKey] = useState(0);
  const previousStatusRef = useRef<string>(null);

  useEffect(() => {
    if (!ownerSignatureRevealKey) return;

    const frameId = window.requestAnimationFrame(() => {
      ownerSignatureRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [ownerSignatureRevealKey]);

  useEffect(() => {
    if (!partnerSignatureRevealKey) return;

    const frameId = window.requestAnimationFrame(() => {
      partnerSignatureRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [partnerSignatureRevealKey]);

  useEffect(() => {
    if (!contract) return;

    if (
      previousStatusRef.current &&
      previousStatusRef.current !== "completed" &&
      contract.status === "completed"
    ) {
      setPartnerSignatureRevealKey((current) => current + 1);
    }

    previousStatusRef.current = contract.status;
  }, [contract]);

  const handleSigned = () => {
    onSigned();
    setOwnerSignatureRevealKey((current) => current + 1);
  };

  return (
    <main className="dashboard-theme min-h-screen bg-[#f6f1e8] px-5 py-10 text-[#111111] md:px-8 dark:bg-black dark:text-white">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {contract.contractType ===
      "livestream_responsibility_commitment_appendix" ? (
        <LivestreamResponsibilityCommitmentAppendixDocument
          contract={contract}
          ownerSignatureRef={ownerSignatureRef}
          ownerSignatureRevealKey={ownerSignatureRevealKey}
          partnerSignatureRef={partnerSignatureRef}
          partnerSignatureRevealKey={partnerSignatureRevealKey}
        />
      ) : contract.contractType === "livestream_responsibility_commitment" ? (
        <LivestreamResponsibilityCommitmentDocument
          contract={contract}
          ownerSignatureRef={ownerSignatureRef}
          ownerSignatureRevealKey={ownerSignatureRevealKey}
          partnerSignatureRef={partnerSignatureRef}
          partnerSignatureRevealKey={partnerSignatureRevealKey}
        />
      ) : contract.contractType === "appendix" ? (
        <AppendixContractDocument
          contract={contract}
          ownerSignatureRef={ownerSignatureRef}
          ownerSignatureRevealKey={ownerSignatureRevealKey}
          partnerSignatureRef={partnerSignatureRef}
          partnerSignatureRevealKey={partnerSignatureRevealKey}
        />
      ) : (
        <ContractDocument
          contract={contract}
          ownerSignatureRef={ownerSignatureRef}
          ownerSignatureRevealKey={ownerSignatureRevealKey}
          partnerSignatureRef={partnerSignatureRef}
          partnerSignatureRevealKey={partnerSignatureRevealKey}
        />
      )}
      <ContractActionDock contract={contract} onSigned={handleSigned} />
    </main>
  );
}

function ContractPreviewPageData() {
  const { contractId = "" } = useParams();
  const {
    data: contract,
    isLoading,
    isError,
    refetch,
  } = useContractDetail(contractId);

  if (isLoading) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="white" />
          <p className="text-sm text-black/45 dark:text-white/45">
            Đang tải hợp đồng...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Không tải được hợp đồng</h1>
          <p className="mt-3 text-sm leading-6 text-black/45 dark:text-white/45">
            Vui lòng kiểm tra lại mã hợp đồng hoặc thử tải lại trang.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-black/15 px-5 py-2 text-sm text-black/80 transition hover:border-black/30 hover:text-[#111111] dark:border-white/15 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <ContractPreviewPageShell
      contract={contract}
      onSigned={() => void refetch()}
    />
  );
}

export default function ContractPreviewPage() {
  return <ContractPreviewPageData />;
}
