/* eslint-disable react-hooks/set-state-in-effect */
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiChevronDown,
  FiCheck,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import { ContractHistoryPanel } from "@/components/contracts/ContractHistoryPanel";
import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { PATHS } from "@/config/paths";
import { toast } from "@/hooks/useToast";
import {
  useCreateContract,
  useContractList,
  useUpdateContract,
} from "@/hooks/data/useContractHooks";
import { useTaxPayerLookup } from "@/hooks/data/useTaxPayerHooks";
import type {
  Contract,
  CreateContractPayload,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";
import {
  buildAppendixContractPayload,
  buildPrincipleContractPayload,
  normalizePartnerCompanyInfo,
} from "./contractFormPayload";

type PartnerField = keyof PartnerCompanyInfoPayload;

type ContractFormMode = "create" | "edit";
type PartnerEntityType = "individual" | "company";
type ContractKind = "principle" | "appendix" | "service";
type AppendixProductRow = {
  id: string;
  content: string;
};

const CONTRACT_TYPE_OPTIONS: {
  value: ContractKind;
  title: string;
  description: string;
  disabled?: boolean;
}[] = [
  {
    value: "principle",
    title: "Hợp đồng nguyên tắc",
    description: "Mẫu hợp đồng bán hàng thường xuyên theo cấu trúc mới.",
  },
  {
    value: "appendix",
    title: "Phụ lục hợp đồng",
    description: "Tạo hoặc chỉnh sửa phụ lục dựa trên hợp đồng nguyên tắc đã có.",
  },
  {
    value: "service",
    title: "Hợp đồng dịch vụ",
    description: "Format đang tổng hợp, sẽ mở sau.",
    disabled: true,
  },
];

const OWNER_TEMPLATES: OwnerCompanyInfoPayload[] = [
  {
    companyCode: "TH",
    companyName: "CTY TNHH DƯỢC PHẨM TRUNG HẠNH",
    address: "2/35 Chấn Hưng, Phường Tân Hòa, Thành Phố Hồ Chí Minh",
    phone: "0983139320",
    email: "cskh@trunghanh.com",
    bankInfo: "204550429 Ngân hàng Á Châu  Chi Nhánh Bắc Hải TP HCM",
    mst: "0312717755",
    ownerName: "Bà Lê Thị Bích Hạnh",
    role: "Giám Đốc",
  },
  {
    companyCode: "PIC",
    companyName: "CTY TNHH PICARE VIỆT NAM",
    address: "2/35 Chấn Hưng, Phường Tân Hòa, Thành Phố Hồ Chí Minh",
    phone: "0918088123",
    email: "cskh@picare.vn",
    bankInfo: "204550429 Ngân hàng Á Châu  Chi Nhánh Bắc Hải TP HCM",
    mst: "0315127257",
    ownerName: "Ông Nguyễn Thành Trung",
    role: "Giám Đốc",
  },
];

const PARTNER_FIELDS: {
  key: PartnerField;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    key: "companyName",
    label: "Tên công ty",
    placeholder: "Nhập tên công ty đối tác",
  },
  {
    key: "mst",
    label: "Mã số thuế",
    placeholder: "Nhập mã số thuế",
  },
  {
    key: "address",
    label: "Địa chỉ",
    placeholder: "Nhập địa chỉ công ty",
    multiline: true,
  },
  {
    key: "phone",
    label: "Số điện thoại",
    placeholder: "Nhập số điện thoại",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "Nhập email liên hệ",
  },
  {
    key: "bankInfo",
    label: "Thông tin ngân hàng",
    placeholder: "Số tài khoản, ngân hàng, chi nhánh",
    multiline: true,
  },
  {
    key: "ownerName",
    label: "Người đại diện",
    placeholder: "Nhập tên người đại diện",
  },
  {
    key: "role",
    label: "Chức vụ",
    placeholder: "Nhập chức vụ",
  },
];

const PARTNER_DETAIL_FIELDS = PARTNER_FIELDS.filter(
  (field) => field.key !== "mst" && field.key !== "companyName",
);

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] text-black/40 dark:text-white/40">
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-5 text-sm font-medium text-[#111111] dark:text-white">
      {children}
    </h2>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "date" | "number";
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="h-11 w-full rounded-lg border border-black/15 bg-white px-4 text-sm text-[#111111] transition-all outline-none placeholder:text-black/35 hover:border-black/25 hover:bg-white focus:border-black/35 dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder:text-white/25 dark:hover:border-white/20 dark:hover:bg-transparent dark:focus:border-white/30"
    />
  );
}

function TextareaInput({
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      rows={3}
      className="w-full resize-none rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-[#111111] transition-all outline-none placeholder:text-black/35 hover:border-black/25 hover:bg-white focus:border-black/35 dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder:text-white/25 dark:hover:border-white/20 dark:hover:bg-transparent dark:focus:border-white/30"
    />
  );
}

function isEmpty(value: string) {
  return !value.trim();
}

function createAppendixProductRow(content = ""): AppendixProductRow {
  return {
    id: crypto.randomUUID(),
    content,
  };
}

function formatAppendixProductContent(
  product: string | AppendixContractProductPayload,
) {
  if (typeof product === "string") {
    return product;
  }

  if (product.rawContent?.trim()) {
    return product.rawContent.trim();
  }

  const lines = [
    product.productName ? `Tên sản phẩm: ${product.productName}` : "",
    product.ingredients ? `Thành phần: ${product.ingredients}` : "",
    product.packageSpecification
      ? `Quy cách đóng gói: ${product.packageSpecification}`
      : "",
    product.registrationNumber
      ? `Số đăng ký: ${product.registrationNumber}`
      : "",
    product.origin ? `Nước sản xuất: ${product.origin}` : "",
    product.unitPriceVat !== null && product.unitPriceVat !== undefined
      ? `Đơn giá(+VAT): ${product.unitPriceVat}`
      : "",
    product.classification ? `Phân loại: ${product.classification}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function formatDate(value?: string | null) {
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

function normalizeEditorText(html: string) {
  if (!html.trim()) return "";

  const withLineBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ");

  if (typeof window === "undefined") {
    return withLineBreaks.replace(/<[^>]+>/g, "").trim();
  }

  const element = document.createElement("div");
  element.innerHTML = withLineBreaks;
  return (element.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

function AppendixProductEditor({
  product,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  product: AppendixProductRow;
  index: number;
  canRemove: boolean;
  onChange: (id: string, content: string) => void;
  onRemove: (id: string) => void;
}) {
  const handleChange = useCallback(
    ({ html }: { html: string }) => {
      onChange(product.id, normalizeEditorText(html));
    },
    [onChange, product.id],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-black/12 bg-white dark:border-white/10 dark:bg-white/2">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
        <p className="text-sm font-medium text-[#111111] dark:text-white">
          Sản phẩm {index + 1}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/12 text-black/60 transition hover:border-black/25 hover:text-[#111111] dark:border-white/10 dark:text-white/60 dark:hover:border-white/25 dark:hover:text-white"
            aria-label={`Xóa sản phẩm ${index + 1}`}
          >
            <FiTrash2 />
          </button>
        ) : null}
      </div>
      <SimpleEditor
        key={product.id}
        content={product.content}
        placeholder="Tên sản phẩm, thành phần, quy cách đóng gói, số đăng ký, nước sản xuất, đơn giá, phân loại..."
        showThemeToggle={false}
        wrapperClassName="min-h-[280px] bg-white dark:bg-[#050505]"
        contentClassName="min-h-[220px]"
        editorClassName="min-h-[220px]"
        onChange={handleChange}
      />
    </div>
  );
}

function PrincipleContractSelect({
  contracts,
  selectedContractId,
  isLoading,
  onChange,
}: {
  contracts: Contract[];
  selectedContractId: string;
  isLoading: boolean;
  onChange: (contractId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedContract = contracts.find(
    (contract) =>
      contract.contractId === selectedContractId ||
      contract.contractNumber === selectedContractId,
  );
  const isEmpty = !isLoading && contracts.length === 0;

  useEffect(() => {
    if (isOpen && isEmpty) {
      setIsOpen(false);
    }
  }, [isEmpty, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={isLoading || isEmpty}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen
            ? "border-black/30 bg-white shadow-[0_16px_35px_rgba(0,0,0,0.08)] dark:border-white/25 dark:bg-white/6"
            : "border-black/12 bg-white hover:border-black/22 dark:border-white/10 dark:bg-white/2 dark:hover:border-white/20"
        }`}
      >
        <span className="min-w-0">
          {selectedContract ? (
            <>
              <span className="block truncate text-sm font-semibold text-[#111111] dark:text-white">
                {selectedContract.contractNumber || selectedContract.contractId}
              </span>
              <span className="mt-1 block truncate text-xs text-black/52 dark:text-white/45">
                {selectedContract.partnerCompanyInfo.companyName ||
                  selectedContract.partnerCompanyInfo.ownerName}{" "}
                · {formatDate(selectedContract.createdAt) || "Chưa có ngày"}
              </span>
            </>
          ) : (
            <>
              <span className="block text-sm font-medium text-[#111111] dark:text-white">
                {isLoading
                  ? "Đang tải danh sách hợp đồng..."
                  : isEmpty
                    ? "Không có hợp đồng nguyên tắc phù hợp"
                    : "Chọn hợp đồng nguyên tắc"}
              </span>
              <span className="mt-1 block text-xs text-black/48 dark:text-white/38">
                {isLoading
                  ? "Đang lấy dữ liệu từ hệ thống, vui lòng chờ."
                  : isEmpty
                    ? "Cần có hợp đồng trạng thái phù hợp để tạo hoặc chỉnh sửa phụ lục."
                    : "Menu sẽ hiển thị số hợp đồng, trạng thái và thông tin đối tác."}
              </span>
            </>
          )}
        </span>
        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-black/45 transition-transform duration-300 dark:text-white/45 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#050505] text-white shadow-[0_24px_60px_rgba(0,0,0,0.46)]">
          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-2 p-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-white/8" />
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="h-3 animate-pulse rounded bg-white/8" />
                      <div className="h-3 animate-pulse rounded bg-white/8" />
                      <div className="h-3 animate-pulse rounded bg-white/8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40">
                  <FiSearch />
                </div>
                <p className="text-sm font-medium text-white">
                  Không tìm thấy hợp đồng nguyên tắc
                </p>
                <p className="max-w-xs text-xs leading-6 text-white/45">
                  Danh sách hiện tại chưa có hợp đồng phù hợp để tạo phụ lục.
                </p>
              </div>
            ) : (
              contracts.map((contract) => {
                const active =
                  contract.contractId === selectedContractId ||
                  contract.contractNumber === selectedContractId;

                return (
                  <button
                    key={contract.contractId}
                    type="button"
                    onClick={() => {
                      onChange(contract.contractId);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-all duration-300 ${
                      active
                        ? "border-white/15 bg-white/[0.06]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.045]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {contract.contractNumber || contract.contractId}
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs text-white/48">
                          {contract.partnerCompanyInfo.companyName ||
                            contract.partnerCompanyInfo.ownerName}
                        </p>
                      </div>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-white/35 bg-white text-black"
                            : "border-white/12 text-transparent"
                        }`}
                      >
                        <FiCheck className="text-xs" />
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-white/42 sm:grid-cols-3">
                      <span>
                        Ngày tạo:{" "}
                        <strong className="font-semibold text-white">
                          {formatDate(contract.createdAt) || "Chưa có ngày"}
                        </strong>
                      </span>
                      <span>
                        MST:{" "}
                        <strong className="font-semibold text-white">
                          {contract.partnerCompanyInfo.mst || "Không có"}
                        </strong>
                      </span>
                      <span>
                        Trạng thái:{" "}
                        <strong className="font-semibold text-white">
                          {contract.status}
                        </strong>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function findOwnerTemplateIndex(contract?: Contract) {
  if (!contract) return -1;

  return OWNER_TEMPLATES.findIndex(
    (template) =>
      template.companyCode === contract.ownerCompanyInfo.companyCode ||
      template.mst === contract.ownerCompanyInfo.mst,
  );
}

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

function getContractPreviewUrl(contractId: string) {
  if (typeof window === "undefined") {
    return getPreviewPath(contractId);
  }

  return new URL(getPreviewPath(contractId), window.location.origin).toString();
}

function getContractQrImageSrc(previewUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(previewUrl)}`;
}

function ContractPreviewQrModal({
  contractId,
  contractLabel,
  onClose,
}: {
  contractId: string;
  contractLabel: string;
  onClose: () => void;
}) {
  const previewUrl = getContractPreviewUrl(contractId);
  const qrImageSrc = getContractQrImageSrc(previewUrl);

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
              alt={contractLabel || "QR hợp đồng"}
              className="mx-auto aspect-square w-full max-w-[280px] object-contain"
            />
          </div>

          <p className="mt-4 max-w-[320px] text-center text-xs leading-6 text-white/45">
            Đây là mã QR và link preview hợp đồng hiện tại. Bạn có thể quét mã
            hoặc mở trực tiếp đường dẫn bên dưới.
          </p>

          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex w-full max-w-[320px] items-center justify-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <span className="truncate">{previewUrl}</span>
            <FiExternalLink className="shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function ContractFormPage({
  mode = "create",
  initialContract,
  showQrButton = true,
}: {
  mode?: ContractFormMode;
  initialContract?: Contract;
  showQrButton?: boolean;
}) {
  const navigate = useNavigate();
  const createContractMutation = useCreateContract();
  const updateContractMutation = useUpdateContract();
  const taxPayerLookupMutation = useTaxPayerLookup();
  const { data: unsignedContracts = [], isLoading: isLoadingUnsignedContracts } =
    useContractList({
      page: 1,
      limit: 100,
      status: "unsigned",
    });
  const {
    data: ownerSignedContracts = [],
    isLoading: isLoadingOwnerSignedContracts,
  } = useContractList({
    page: 1,
    limit: 100,
    status: "owner_signed",
  });
  const { data: completedContracts = [], isLoading: isLoadingCompletedContracts } =
    useContractList({
      page: 1,
      limit: 100,
      status: "completed",
    });
  const [selectedContractType, setSelectedContractType] =
    useState<ContractKind | null>(
      initialContract?.contractType === "appendix"
        ? "appendix"
        : initialContract
          ? "principle"
          : null,
    );
  const [selectedOwnerIndex, setSelectedOwnerIndex] = useState(0);
  const [selectedPrincipleContractId, setSelectedPrincipleContractId] =
    useState("");
  const [partnerEntityType, setPartnerEntityType] =
    useState<PartnerEntityType>("company");
  const [partnerCompanyInfo, setPartnerCompanyInfo] =
    useState<PartnerCompanyInfoPayload>({
      companyName: "",
      address: "",
      phone: "",
      email: "",
      bankInfo: "",
      mst: "",
      ownerName: "",
      role: "",
    });
  const [paymentTermDays, setPaymentTermDays] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [appendixProducts, setAppendixProducts] = useState<
    AppendixProductRow[]
  >([createAppendixProductRow()]);
  const [lastPayload, setLastPayload] = useState<CreateContractPayload | null>(
    null,
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPartnerFormVisible, setIsPartnerFormVisible] = useState(
    Boolean(initialContract),
  );
  const [taxLookupMessage, setTaxLookupMessage] = useState("");
  const [isContractQrModalOpen, setIsContractQrModalOpen] = useState(false);

  const ownerCompanyInfo = OWNER_TEMPLATES[selectedOwnerIndex];
  const principleContracts = [
    ...unsignedContracts,
    ...ownerSignedContracts,
    ...completedContracts,
  ].filter(
    (contract, index, list) =>
      list.findIndex((item) => item.contractId === contract.contractId) ===
      index,
  );
  const principleContractOptions = principleContracts;
  const selectedPrincipleContract = principleContractOptions.find(
    (contract) =>
      contract.contractId === selectedPrincipleContractId ||
      contract.contractNumber === selectedPrincipleContractId,
  );
  const isEditMode = mode === "edit";
  const isSubmitting = isEditMode
    ? updateContractMutation.isPending
    : createContractMutation.isPending;
  const isLoadingContracts =
    isLoadingUnsignedContracts ||
    isLoadingOwnerSignedContracts ||
    isLoadingCompletedContracts;

  useEffect(() => {
    if (!initialContract) return;

    const ownerIndex = OWNER_TEMPLATES.findIndex(
      (template) =>
        template.companyCode === initialContract.ownerCompanyInfo.companyCode ||
        template.mst === initialContract.ownerCompanyInfo.mst,
    );

    setSelectedOwnerIndex(ownerIndex >= 0 ? ownerIndex : 0);
    setPartnerCompanyInfo(initialContract.partnerCompanyInfo);
    setPartnerEntityType(
      initialContract.partnerCompanyInfo.mst ||
        initialContract.partnerCompanyInfo.companyName
        ? "company"
        : "individual",
    );
    setIsPartnerFormVisible(true);
    setTaxLookupMessage("");
    setSelectedContractType(
      initialContract.contractType === "appendix" ? "appendix" : "principle",
    );

    if (initialContract.contractType === "appendix") {
      const contractData = initialContract.contractData as
        | AppendixContractDataPayload
        | null
        | undefined;
      const appendixProducts = contractData?.products?.length
        ? contractData.products
        : initialContract.products ?? [];

      setSelectedPrincipleContractId(
        contractData?.principleContractNumber ||
          initialContract.principleContractNumber ||
          "",
      );
      const selectedOwnerTemplateIndex =
        findOwnerTemplateIndex(initialContract);
      if (selectedOwnerTemplateIndex >= 0) {
        setSelectedOwnerIndex(selectedOwnerTemplateIndex);
      }
      setAppendixProducts(
        appendixProducts.length
          ? appendixProducts.map((product) =>
              createAppendixProductRow(formatAppendixProductContent(product)),
            )
          : [createAppendixProductRow()],
      );
      setPaymentTermDays("");
      setCreditLimit("");
      return;
    }

    const principleData = initialContract.contractData as any;

    setPaymentTermDays(
      principleData?.paymentTermDays != null
        ? String(principleData.paymentTermDays)
        : "",
    );
    setCreditLimit(
      principleData?.creditLimit != null
        ? String(principleData.creditLimit)
        : "",
    );
  }, [initialContract]);

  const updatePartnerField = (key: PartnerField, value: string) => {
    setPartnerCompanyInfo((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "mst") {
      setTaxLookupMessage("");
      if (!isEditMode) {
        setIsPartnerFormVisible(false);
      }
    }
  };

  const handleTaxLookup = async () => {
    const mst = (partnerCompanyInfo.mst ?? "").trim();

    if (!mst) {
      toast.error("Thiếu mã số thuế", "Vui lòng nhập mã số thuế đối tác.");
      return;
    }

    try {
      const taxPayer = await taxPayerLookupMutation.mutateAsync(mst);

      if (!taxPayer?.taxID) {
        setTaxLookupMessage("Không tìm thấy mã số thuế này.");
        return;
      }

      if (taxPayer.status !== "NNT đang hoạt động") {
        toast.error(
          "Mã số thuế không hoạt động",
          `Trạng thái hiện tại: ${taxPayer.status || "Không xác định"}. Vui lòng kiểm tra lại hoặc nhập mã số thuế khác.`,
        );
        setTaxLookupMessage(
          "Mã số thuế này không ở trạng thái đang hoạt động.",
        );
        setIsPartnerFormVisible(false);
        return;
      }

      setPartnerCompanyInfo((prev) => ({
        ...prev,
        mst: taxPayer.taxID || mst,
        companyName: taxPayer.name || prev.companyName,
        address: taxPayer.address || prev.address,
      }));
      setTaxLookupMessage(
        "Đã tìm thấy thông tin doanh nghiệp. Vui lòng bổ sung các thông tin còn thiếu.",
      );
      setIsPartnerFormVisible(true);
    } catch {
      setTaxLookupMessage(
        "Không tìm thấy mã số thuế này. Bạn có thể nhập thông tin đối tác thủ công.",
      );
    }
  };

  const handleManualPartnerInput = () => {
    setTaxLookupMessage("Đang nhập thông tin đối tác thủ công.");
    setIsPartnerFormVisible(true);
  };

  const handlePartnerEntityTypeChange = (type: PartnerEntityType) => {
    setPartnerEntityType(type);
    setTaxLookupMessage("");

    if (type === "individual") {
      setIsPartnerFormVisible(true);
      setPartnerCompanyInfo((prev) => ({
        ...prev,
        companyName: "",
        mst: "",
      }));
      return;
    }

    setIsPartnerFormVisible(isEditMode);
  };

  const handleContractTypeSelect = (type: ContractKind) => {
    setSelectedContractType(type);
    setTaxLookupMessage("");

    if (type === "appendix") {
      setPartnerEntityType("company");
      setIsPartnerFormVisible(false);
      return;
    }

    setSelectedPrincipleContractId("");
    setAppendixProducts([createAppendixProductRow()]);
    setIsPartnerFormVisible(isEditMode);
  };

  const handlePrincipleContractSelect = (contractId: string) => {
    setSelectedPrincipleContractId(contractId);
    const contract = principleContractOptions.find(
      (item) =>
        item.contractId === contractId || item.contractNumber === contractId,
    );

    if (!contract) {
      setIsPartnerFormVisible(false);
      return;
    }

    const ownerTemplateIndex = findOwnerTemplateIndex(contract);
    if (ownerTemplateIndex >= 0) {
      setSelectedOwnerIndex(ownerTemplateIndex);
    }
    setPartnerEntityType("company");
    setPartnerCompanyInfo(contract.partnerCompanyInfo);
    setIsPartnerFormVisible(true);
  };

  const updateAppendixProduct = useCallback((id: string, content: string) => {
    setAppendixProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, content } : product,
      ),
    );
  }, []);

  const addAppendixProduct = useCallback(() => {
    setAppendixProducts((current) => [...current, createAppendixProductRow()]);
  }, []);

  const removeAppendixProduct = useCallback((id: string) => {
    setAppendixProducts((current) =>
      current.length > 1
        ? current.filter((product) => product.id !== id)
        : current,
    );
  }, []);

  const validateForm = (): string | null => {
    if (!selectedContractType) {
      return "Vui lòng chọn loại hợp đồng.";
    }

    if (selectedContractType === "service") {
      return "Loại hợp đồng này chưa sẵn sàng để tạo.";
    }

    if (selectedContractType === "appendix") {
      if (!selectedPrincipleContract) {
        return "Vui lòng chọn hợp đồng nguyên tắc đã hoàn tất.";
      }

      const productContents = appendixProducts
        .map((product) => product.content.trim())
        .filter(Boolean);

      if (productContents.length === 0) {
        return "Vui lòng nhập ít nhất một sản phẩm cho phụ lục hợp đồng.";
      }

      return null;
    }

    const parsedPaymentTermDays = Number(paymentTermDays);
    if (
      isEmpty(paymentTermDays) ||
      !Number.isInteger(parsedPaymentTermDays) ||
      parsedPaymentTermDays <= 0
    ) {
      return "Vui lòng nhập thời hạn thanh toán là số ngày lớn hơn 0.";
    }

    const requiredPartnerFields =
      partnerEntityType === "company" ? PARTNER_FIELDS : PARTNER_DETAIL_FIELDS;
    const missingPartnerFields = requiredPartnerFields.filter((field) =>
      isEmpty(String(partnerCompanyInfo[field.key] ?? "")),
    );

    if (missingPartnerFields.length > 0) {
      return `Vui lòng nhập đầy đủ thông tin đối tác: ${missingPartnerFields
        .map((field) => field.label.toLowerCase())
        .join(", ")}.`;
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      toast.error("Thiếu dữ liệu", validationError);
      return;
    }

    const payload =
      selectedContractType === "appendix" && selectedPrincipleContract
        ? buildAppendixContractPayload({
            ownerCompanyInfo,
            partnerCompanyInfo: normalizePartnerCompanyInfo(
              partnerCompanyInfo,
              partnerEntityType,
            ),
            contractDueDate: initialContract?.contractDueDate ?? null,
            principleContract: selectedPrincipleContract,
            principleContractSignedDate:
              initialContract?.principleContractSignedDate ?? null,
            products: appendixProducts.map((product) => product.content.trim()),
          })
        : buildPrincipleContractPayload({
            ownerCompanyInfo,
            partnerCompanyInfo: normalizePartnerCompanyInfo(
              partnerCompanyInfo,
              partnerEntityType,
            ),
            contractDueDate: initialContract?.contractDueDate ?? null,
            paymentTermDays,
            creditLimit,
          });

    if (isEditMode && initialContract) {
      const response = await updateContractMutation.mutateAsync({
        contractId: initialContract.contractId,
        data: payload,
      });

      if (!response.success) {
        return;
      }

      navigate(getPreviewPath(initialContract.contractId));
      return;
    }

    const response = await createContractMutation.mutateAsync(payload);

    if (!response.success) {
      return;
    }

    const previewUrl = response.data?.previewUrl;
    if (!previewUrl) {
      toast.error("Thiếu dữ liệu phản hồi", "API không trả về `previewUrl`.");
      return;
    }

    setLastPayload(payload);
    window.location.assign(previewUrl);
  };

  return (
    <main className="dashboard-theme min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
      {!isHistoryOpen ? (
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#111111] shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition duration-250 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-95 dark:border-white/10 dark:bg-white dark:text-black dark:shadow-[0_14px_34px_rgba(0,0,0,0.34)] dark:hover:shadow-[0_18px_44px_rgba(0,0,0,0.42)]"
          aria-label="Mở lịch sử hợp đồng"
        >
          <FiClock />
        </button>
      ) : null}

      <div
        className={`mx-auto w-full max-w-5xl px-5 py-6 transition-all duration-300 md:px-8 lg:px-10 ${
          isHistoryOpen ? "lg:max-w-4xl lg:-translate-x-48" : ""
        }`}
      >
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-col">
          <header className="relative border-b border-black/10 pb-6 dark:border-white/10">
            <Link
              to={PATHS.LOGIN}
              className="group mb-5 inline-flex w-fit items-center gap-2 text-xs font-medium text-black/55 transition duration-200 ease-out hover:text-[#111111] dark:text-white/55 dark:hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] transition duration-200 ease-out group-hover:-translate-x-0.5 group-hover:bg-black/[0.08] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.1]">
                <FiArrowLeft />
              </span>
              <span>Quay về Hub</span>
            </Link>
            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
            <h1 className="text-center text-2xl font-medium text-[#111111] md:text-3xl dark:text-white">
              {isEditMode
                ? `Hợp đồng số ${initialContract?.contractNumber || initialContract?.contractId}`
                : "Hệ thống tạo hợp đồng điện tử - Picare Việt Nam"}
            </h1>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col"
          >
            {!isEditMode ? (
              <section className="border-b border-black/10 py-6 dark:border-white/10">
                <SectionTitle>Chọn loại hợp đồng</SectionTitle>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {CONTRACT_TYPE_OPTIONS.map((option) => {
                    const selected = selectedContractType === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        disabled={option.disabled}
                        onClick={() => handleContractTypeSelect(option.value)}
                        whileHover={option.disabled ? undefined : { y: -3 }}
                        whileTap={option.disabled ? undefined : { scale: 0.99 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 30,
                        }}
                        className={`relative rounded-xl border p-5 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                          selected
                            ? "border-black/30 bg-black/[0.06] dark:border-white/35 dark:bg-white/6"
                            : "border-black/12 bg-white hover:border-black/22 hover:bg-white dark:border-white/10 dark:bg-white/2 dark:hover:border-white/20 dark:hover:bg-white/4"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-black/[0.04] text-black/62 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/62">
                              <FiFileText />
                            </span>
                            <div>
                              <h3 className="text-sm font-medium text-[#111111] dark:text-white">
                                {option.title}
                              </h3>
                              <p className="mt-2 text-xs leading-5 text-black/58 dark:text-white/45">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-black/35 bg-[#111111] text-white dark:border-white/45 dark:bg-white dark:text-black"
                                : "border-black/15 text-transparent dark:border-white/15"
                            }`}
                          >
                            <FiCheck className="text-xs" />
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {selectedContractType === "principle" ? (
              <>
                <section className="border-b border-black/10 py-6 dark:border-white/10">
                  <SectionTitle>Thông tin hợp đồng</SectionTitle>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Thời hạn thanh toán (ngày)</FieldLabel>
                      <TextInput
                        id="payment-term-days"
                        type="number"
                        value={paymentTermDays}
                        onChange={setPaymentTermDays}
                        placeholder="30"
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel>Hạn mức công nợ</FieldLabel>
                      <TextInput
                        id="credit-limit"
                        type="text"
                        value={creditLimit}
                        onChange={setCreditLimit}
                        placeholder="Để trống nếu không áp dụng"
                      />
                    </div>
                  </div>
                </section>

                {selectedPrincipleContract ? (
                  <section className="border-b border-black/10 py-6 dark:border-white/10">
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <SectionTitle>Công ty chủ sở hữu</SectionTitle>
                      <span className="text-[11px] font-medium tracking-[0.08em] text-black/45 uppercase dark:text-white/35">
                        Chỉ xem
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {OWNER_TEMPLATES.map((template, index) => {
                        const selected = selectedOwnerIndex === index;

                        return (
                          <motion.button
                            key={template.companyCode}
                            type="button"
                            disabled
                            whileHover={undefined}
                            whileTap={undefined}
                            className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                              selected
                                ? "cursor-default border-black/30 bg-black/[0.06] opacity-100 dark:border-white/35 dark:bg-white/6"
                                : "cursor-default border-black/12 bg-white opacity-75 dark:border-white/10 dark:bg-white/2"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p
                                  className={`text-xs ${
                                    selected
                                      ? "text-black/78 dark:text-white/70"
                                      : "text-black/52 dark:text-white/40"
                                  }`}
                                >
                                  {template.companyCode}
                                </p>
                                <h3 className="mt-2 text-sm leading-5 font-medium text-[#111111] dark:text-white">
                                  {template.companyName}
                                </h3>
                              </div>
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-black/35 bg-[#111111] text-white dark:border-white/45 dark:bg-white dark:text-black"
                                    : "border-black/15 text-transparent dark:border-white/15"
                                }`}
                              >
                                <FiCheck className="text-xs" />
                              </span>
                            </div>
                            <div className="mt-4 space-y-2 text-xs leading-5 text-black/58 dark:text-white/45">
                              <p>{template.address}</p>
                              <p>
                                {template.ownerName} · {template.role}
                              </p>
                              <p className="tabular-nums">
                                {template.phone} · {template.email}
                              </p>
                              <p>MST: {template.mst}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                <section className="border-b border-black/10 py-6 dark:border-white/10">
                  <SectionTitle>Công ty đối tác</SectionTitle>

                  <div className="space-y-5">
                    <div>
                      <FieldLabel>Loại đối tác</FieldLabel>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {[
                          {
                            value: "individual" as const,
                            title: "Cá nhân",
                            description: "Không cần nhập MST và tên công ty.",
                          },
                          {
                            value: "company" as const,
                            title: "Công ty",
                            description:
                              "Có bước nhập MST và kiểm tra thông tin doanh nghiệp.",
                          },
                        ].map((option) => {
                          const selected = partnerEntityType === option.value;

                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handlePartnerEntityTypeChange(option.value)
                              }
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 30,
                              }}
                              className={`rounded-xl border p-4 text-left transition-all duration-300 ${
                                selected
                                  ? "border-black/30 bg-black/[0.06] dark:border-white/35 dark:bg-white/6"
                                  : "border-black/12 bg-white hover:border-black/22 hover:bg-white dark:border-white/10 dark:bg-white/2 dark:hover:border-white/20 dark:hover:bg-white/4"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-[#111111] dark:text-white">
                                    {option.title}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-black/58 dark:text-white/45">
                                    {option.description}
                                  </p>
                                </div>
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                    selected
                                      ? "border-black/35 bg-[#111111] text-white dark:border-white/45 dark:bg-white dark:text-black"
                                      : "border-black/15 text-transparent dark:border-white/15"
                                  }`}
                                >
                                  <FiCheck className="text-xs" />
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {partnerEntityType === "company" ? (
                      <div>
                        <FieldLabel>Mã số thuế</FieldLabel>
                        <div className="flex flex-col gap-3 md:flex-row">
                          <div className="min-w-0 flex-1">
                            <TextInput
                              id="partner-mst"
                              value={partnerCompanyInfo.mst ?? ""}
                              onChange={(value) =>
                                updatePartnerField("mst", value)
                              }
                              placeholder="Nhập mã số thuế đối tác"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleTaxLookup}
                            disabled={taxPayerLookupMutation.isPending}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-black/12 bg-white px-4 text-[12px] font-medium text-black/78 transition hover:border-black/25 hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-white/75 dark:hover:border-white/25 dark:hover:text-white"
                          >
                            {taxPayerLookupMutation.isPending ? (
                              <Spinner size="sm" />
                            ) : (
                              <FiSearch />
                            )}
                            Kiểm tra
                          </button>
                        </div>

                        {taxLookupMessage ? (
                          <div className="mt-3 flex flex-col gap-3 text-[12px] text-black/58 md:flex-row md:items-center md:justify-between dark:text-white/45">
                            <p>{taxLookupMessage}</p>
                            {!isPartnerFormVisible ? (
                              <button
                                type="button"
                                onClick={handleManualPartnerInput}
                                className="w-fit rounded-lg border border-black/12 bg-white px-4 py-2 text-xs font-medium text-black/74 transition hover:border-black/25 hover:text-[#111111] dark:border-white/10 dark:bg-transparent dark:text-white/70 dark:hover:border-white/25 dark:hover:text-white"
                              >
                                Nhập tay
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <p className="mt-3 text-[12px] text-black/48 dark:text-white/35">
                            Nhập mã số thuế rồi bấm kiểm tra để tự điền tên công
                            ty và địa chỉ nếu có dữ liệu.
                          </p>
                        )}
                      </div>
                    ) : null}

                    {isPartnerFormVisible ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        {(partnerEntityType === "company"
                          ? PARTNER_FIELDS.filter(
                              (field) => field.key !== "mst",
                            )
                          : PARTNER_DETAIL_FIELDS
                        ).map((field) => (
                          <div
                            key={field.key}
                            className={field.multiline ? "md:col-span-2" : ""}
                          >
                            <FieldLabel>{field.label}</FieldLabel>
                            {field.multiline ? (
                              <TextareaInput
                                id={`partner-${field.key}`}
                                value={String(
                                  partnerCompanyInfo[field.key] ?? "",
                                )}
                                onChange={(value) =>
                                  updatePartnerField(field.key, value)
                                }
                                placeholder={field.placeholder}
                                required
                              />
                            ) : (
                              <TextInput
                                id={`partner-${field.key}`}
                                type={field.key === "email" ? "email" : "text"}
                                value={String(
                                  partnerCompanyInfo[field.key] ?? "",
                                )}
                                onChange={(value) =>
                                  updatePartnerField(field.key, value)
                                }
                                placeholder={field.placeholder}
                                required
                              />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    ) : null}
                  </div>
                </section>

                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative inline-flex h-12 min-w-56 items-center justify-center overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_16px_45px_rgba(0,0,0,0.38)] transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_22px_60px_rgba(0,0,0,0.46)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:bg-white/45 disabled:text-black/50 disabled:shadow-none"
                    >
                      <span className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-black/25 to-transparent opacity-50" />
                      <span className="flex items-center justify-center gap-2.5">
                        {isSubmitting ? (
                          <Spinner size="sm" color="black" />
                        ) : null}
                        {isEditMode ? "Cập nhật" : "Tạo hợp đồng"}
                      </span>
                    </button>

                    {isEditMode && initialContract && showQrButton ? (
                      <button
                        type="button"
                        onClick={() => setIsContractQrModalOpen(true)}
                        className="inline-flex h-12 min-w-56 items-center justify-center rounded-full bg-black/[0.07] px-6 text-sm font-medium text-black/80 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-black/[0.11] hover:text-[#111111] active:translate-y-0 active:scale-[0.98] dark:bg-white/[0.07] dark:text-white/80 dark:hover:bg-white/[0.11] dark:hover:text-white"
                      >
                        Xem QR
                      </button>
                    ) : null}

                    {isEditMode && initialContract ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(getPreviewPath(initialContract.contractId))
                        }
                        className="inline-flex h-12 min-w-56 items-center justify-center rounded-full bg-black/[0.07] px-6 text-sm font-medium text-black/80 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-black/[0.11] hover:text-[#111111] active:translate-y-0 active:scale-[0.98] dark:bg-white/[0.07] dark:text-white/80 dark:hover:bg-white/[0.11] dark:hover:text-white"
                      >
                        Xem Preview hợp đồng
                      </button>
                    ) : null}
                  </div>

                  {lastPayload?.contractType === "principle" ? (
                    <p className="text-xs text-black/60 dark:text-white/50">
                      Đã gửi yêu cầu tạo hợp đồng nguyên tắc, thời hạn thanh
                      toán{" "}
                      <span className="tabular-nums">
                        {lastPayload.contractData.paymentTermDays}
                      </span>{" "}
                      ngày.
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
            {selectedContractType === "appendix" ? (
              <>
                <section className="border-b border-black/10 py-6 dark:border-white/10">
                  <SectionTitle>Hợp đồng nguyên tắc</SectionTitle>

                  <div className="space-y-4">
                    <div>
                      <FieldLabel>Chọn hợp đồng</FieldLabel>
                      <PrincipleContractSelect
                        contracts={principleContractOptions}
                        selectedContractId={selectedPrincipleContractId}
                        isLoading={isLoadingContracts}
                        onChange={handlePrincipleContractSelect}
                      />
                    </div>

                    {selectedPrincipleContract ? (
                      <div className="grid grid-cols-1 gap-3 rounded-xl border border-black/12 bg-white p-4 text-sm md:grid-cols-2 dark:border-white/10 dark:bg-white/2">
                        <div>
                          <p className="text-[11px] text-black/40 dark:text-white/40">
                            Số hợp đồng nguyên tắc
                          </p>
                          <p className="mt-1 font-semibold text-[#111111] dark:text-white">
                            {selectedPrincipleContract.contractNumber ||
                              selectedPrincipleContract.contractId}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-black/40 dark:text-white/40">
                            Ngày tạo
                          </p>
                          <p className="mt-1 font-semibold text-[#111111] dark:text-white">
                            {formatDate(selectedPrincipleContract.createdAt) ||
                              "Không có"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-black/40 dark:text-white/40">
                            Đối tác
                          </p>
                          <p className="mt-1 font-semibold text-[#111111] dark:text-white">
                            {selectedPrincipleContract.partnerCompanyInfo
                              .companyName ||
                              selectedPrincipleContract.partnerCompanyInfo
                                .ownerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-black/40 dark:text-white/40">
                            Mã số thuế
                          </p>
                          <p className="mt-1 font-semibold text-[#111111] dark:text-white">
                            {selectedPrincipleContract.partnerCompanyInfo.mst ||
                              "Không có"}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>

                {selectedPrincipleContract ? (
                  <section className="border-b border-black/10 py-6 dark:border-white/10">
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <SectionTitle>Công ty chủ sở hữu</SectionTitle>
                      <span className="text-[11px] font-medium tracking-[0.08em] text-black/45 uppercase dark:text-white/35">
                        Chỉ xem
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {OWNER_TEMPLATES.map((template, index) => {
                        const selected = selectedOwnerIndex === index;

                        return (
                          <motion.button
                            key={template.companyCode}
                            type="button"
                            disabled
                            whileHover={undefined}
                            whileTap={undefined}
                            className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                              selected
                                ? "cursor-default border-black/30 bg-black/[0.06] opacity-100 dark:border-white/35 dark:bg-white/6"
                                : "cursor-default border-black/12 bg-white opacity-75 dark:border-white/10 dark:bg-white/2"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p
                                  className={`text-xs ${
                                    selected
                                      ? "text-black/78 dark:text-white/70"
                                      : "text-black/52 dark:text-white/40"
                                  }`}
                                >
                                  {template.companyCode}
                                </p>
                                <h3 className="mt-2 text-sm leading-5 font-medium text-[#111111] dark:text-white">
                                  {template.companyName}
                                </h3>
                              </div>
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-black/35 bg-[#111111] text-white dark:border-white/45 dark:bg-white dark:text-black"
                                    : "border-black/15 text-transparent dark:border-white/15"
                                }`}
                              >
                                <FiCheck className="text-xs" />
                              </span>
                            </div>
                            <div className="mt-4 space-y-2 text-xs leading-5 text-black/58 dark:text-white/45">
                              <p>{template.address}</p>
                              <p>
                                {template.ownerName} · {template.role}
                              </p>
                              <p className="tabular-nums">
                                {template.phone} · {template.email}
                              </p>
                              <p>MST: {template.mst}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {selectedPrincipleContract ? (
                  <section className="border-b border-black/10 py-6 dark:border-white/10">
                    <SectionTitle>Công ty đối tác</SectionTitle>
                    <div className="grid grid-cols-1 gap-3 rounded-xl border border-black/12 bg-white p-4 text-sm md:grid-cols-2 dark:border-white/10 dark:bg-white/2">
                      {PARTNER_FIELDS.map((field) => (
                        <div
                          key={field.key}
                          className={field.multiline ? "md:col-span-2" : ""}
                        >
                          <p className="text-[11px] text-black/40 dark:text-white/40">
                            {field.label}
                          </p>
                          <p className="mt-1 font-semibold whitespace-pre-line text-[#111111] dark:text-white">
                            {String(
                              selectedPrincipleContract.partnerCompanyInfo[
                                field.key
                              ] || "Không có",
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="border-b border-black/10 py-6 dark:border-white/10">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SectionTitle>Sản phẩm trong phụ lục</SectionTitle>
                    <button
                      type="button"
                      onClick={addAppendixProduct}
                      className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-black/12 bg-white px-4 text-xs font-medium text-black/75 transition hover:border-black/25 hover:text-[#111111] dark:border-white/10 dark:bg-transparent dark:text-white/70 dark:hover:border-white/25 dark:hover:text-white"
                    >
                      <FiPlus />
                      Thêm sản phẩm
                    </button>
                  </div>

                  <div className="space-y-4">
                    {appendixProducts.map((product, index) => (
                      <AppendixProductEditor
                        key={product.id}
                        product={product}
                        index={index}
                        canRemove={appendixProducts.length > 1}
                        onChange={updateAppendixProduct}
                        onRemove={removeAppendixProduct}
                      />
                    ))}
                  </div>
                </section>

                <div className="flex flex-col items-center gap-3 py-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex h-12 min-w-56 items-center justify-center overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_16px_45px_rgba(0,0,0,0.38)] transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_22px_60px_rgba(0,0,0,0.46)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:bg-white/45 disabled:text-black/50 disabled:shadow-none"
                  >
                    <span className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-black/25 to-transparent opacity-50" />
                    <span className="flex items-center justify-center gap-2.5">
                      {isSubmitting ? (
                        <Spinner size="sm" color="black" />
                      ) : null}
                      {isEditMode ? "Cập nhật phụ lục" : "Tạo phụ lục"}
                    </span>
                  </button>

                  {lastPayload?.contractType === "appendix" ? (
                    <p className="text-xs text-black/60 dark:text-white/50">
                      Đã gửi yêu cầu{" "}
                      {isEditMode ? "cập nhật phụ lục" : "tạo phụ lục"} với{" "}
                      <span className="tabular-nums">
                        {lastPayload.products.length}
                      </span>{" "}
                      sản phẩm.
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </motion.div>
        </form>
      </div>
      <ContractHistoryPanel
        activeContractId={initialContract?.contractId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
      {isEditMode &&
      initialContract &&
      showQrButton &&
      isContractQrModalOpen ? (
        <ContractPreviewQrModal
          contractId={initialContract.contractId}
          contractLabel={
            initialContract.contractNumber || initialContract.contractId
          }
          onClose={() => setIsContractQrModalOpen(false)}
        />
      ) : null}
    </main>
  );
}

export default function ContractCreatePage() {
  return <ContractFormPage />;
}
