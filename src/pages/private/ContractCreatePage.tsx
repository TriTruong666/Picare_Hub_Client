/* eslint-disable react-hooks/set-state-in-effect */
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiSearch,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import { ContractHistoryPanel } from "@/components/contracts/ContractHistoryPanel";
import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { PATHS } from "@/config/paths";
import { toast } from "@/hooks/useToast";
import {
  useCreateContract,
  useUpdateContract,
} from "@/hooks/data/useContractHooks";
import { useTaxPayerLookup } from "@/hooks/data/useTaxPayerHooks";
import type {
  Contract,
  CreateContractPayload,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";

type PartnerField = keyof PartnerCompanyInfoPayload;

type ProductRow = {
  id: string;
  productName: string;
  price: string;
};

type ContractFormMode = "create" | "edit";
type PartnerEntityType = "individual" | "company";

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

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

export function ContractFormPage({
  mode = "create",
  initialContract,
}: {
  mode?: ContractFormMode;
  initialContract?: Contract;
}) {
  const navigate = useNavigate();
  const createContractMutation = useCreateContract();
  const updateContractMutation = useUpdateContract();
  const taxPayerLookupMutation = useTaxPayerLookup();
  const [selectedOwnerIndex, setSelectedOwnerIndex] = useState(0);
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
  const [contractDueDate, setContractDueDate] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [lastPayload, setLastPayload] = useState<CreateContractPayload | null>(
    null,
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPartnerFormVisible, setIsPartnerFormVisible] = useState(
    Boolean(initialContract),
  );
  const [taxLookupMessage, setTaxLookupMessage] = useState("");

  const ownerCompanyInfo = OWNER_TEMPLATES[selectedOwnerIndex];
  const isEditMode = mode === "edit";
  const isSubmitting = isEditMode
    ? updateContractMutation.isPending
    : createContractMutation.isPending;

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
    setContractDueDate(initialContract.contractDueDate.slice(0, 10));
    setProducts(
      (initialContract.details ?? []).map((detail) => ({
        id: detail.contractDetailId || crypto.randomUUID(),
        productName: detail.productName,
        price: String(detail.price),
      })),
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

  const updateProduct = (
    id: string,
    key: "productName" | "price",
    value: string,
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [key]: value } : product,
      ),
    );
  };

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productName: "",
        price: "",
      },
    ]);
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const validateForm = (): string | null => {
    if (isEmpty(contractDueDate)) {
      return "Vui lòng chọn ngày hết hạn hợp đồng.";
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

    if (products.length === 0) {
      return "Vui lòng thêm ít nhất một sản phẩm.";
    }

    const invalidProductIndex = products.findIndex((product) => {
      const price = Number(product.price);
      return (
        isEmpty(product.productName) ||
        isEmpty(product.price) ||
        !Number.isFinite(price) ||
        price <= 0
      );
    });

    if (invalidProductIndex >= 0) {
      return `Dòng sản phẩm ${invalidProductIndex + 1} chưa hợp lệ. Vui lòng nhập tên và giá lớn hơn 0.`;
    }

    return null;
  };

  const buildPayload = (): CreateContractPayload => ({
    ownerCompanyInfo,
    partnerCompanyInfo: {
      ...partnerCompanyInfo,
      companyName:
        partnerEntityType === "company"
          ? partnerCompanyInfo.companyName?.trim() || ""
          : null,
      mst:
        partnerEntityType === "company"
          ? partnerCompanyInfo.mst?.trim() || ""
          : null,
      address: partnerCompanyInfo.address.trim(),
      phone: partnerCompanyInfo.phone.trim(),
      email: partnerCompanyInfo.email.trim(),
      bankInfo: partnerCompanyInfo.bankInfo.trim(),
      ownerName: partnerCompanyInfo.ownerName.trim(),
      role: partnerCompanyInfo.role.trim(),
    },
    contractDueDate,
    contractType: "digital",
    details: products
      .filter((product) => product.productName.trim() && product.price.trim())
      .map((product) => ({
        productName: product.productName.trim(),
        price: Number(product.price),
      })),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      toast.error("Thiếu dữ liệu", validationError);
      return;
    }

    const payload = buildPayload();

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
            <h1 className="text-center text-2xl font-medium text-[#111111] dark:text-white md:text-3xl">
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
            <section className="border-b border-black/10 py-6 dark:border-white/10">
              <SectionTitle>Thông tin hợp đồng</SectionTitle>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FieldLabel>Ngày hết hạn</FieldLabel>
                  <TextInput
                    id="contract-due-date"
                    type="date"
                    value={contractDueDate}
                    onChange={setContractDueDate}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="border-b border-black/10 py-6 dark:border-white/10">
              <SectionTitle>Công ty chủ sở hữu</SectionTitle>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {OWNER_TEMPLATES.map((template, index) => {
                  const selected = selectedOwnerIndex === index;

                  return (
                    <motion.button
                      key={template.companyCode}
                      type="button"
                      onClick={() => setSelectedOwnerIndex(index)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 30,
                      }}
                      className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                        selected
                          ? "border-black/30 bg-black/[0.06] dark:border-white/35 dark:bg-white/6"
                          : "border-black/12 bg-white hover:border-black/22 hover:bg-white dark:border-white/10 dark:bg-white/2 dark:hover:border-white/20 dark:hover:bg-white/4"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p
                            className={`text-xs ${
                              selected ? "text-black/78 dark:text-white/70" : "text-black/52 dark:text-white/40"
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
                        onChange={(value) => updatePartnerField("mst", value)}
                        placeholder="Nhập mã số thuế đối tác"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTaxLookup}
                      disabled={taxPayerLookupMutation.isPending}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-black/12 bg-white px-4 text-[12px] font-medium text-black/78 transition hover:border-black/25 hover:text-[#111111] dark:border-white/10 dark:bg-transparent dark:text-white/75 dark:hover:border-white/25 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="mt-3 flex flex-col gap-3 text-[12px] text-black/58 dark:text-white/45 md:flex-row md:items-center md:justify-between">
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
                      Nhập mã số thuế rồi bấm kiểm tra để tự điền tên công ty và
                      địa chỉ nếu có dữ liệu.
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
                      ? PARTNER_FIELDS.filter((field) => field.key !== "mst")
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
                            value={String(partnerCompanyInfo[field.key] ?? "")}
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
                            value={String(partnerCompanyInfo[field.key] ?? "")}
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

            <section className="border-b border-black/10 py-6 dark:border-white/10">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <SectionTitle>Danh sách sản phẩm</SectionTitle>
                <button
                  type="button"
                  onClick={addProduct}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-black/[0.08] px-4 py-2 text-[12px] text-black/84 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-black/[0.12] hover:text-[#111111] dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1] dark:hover:text-white active:translate-y-0 active:scale-[0.98]"
                >
                  <FiPlus className="transition duration-200 group-hover:rotate-90" />
                  Thêm sản phẩm
                </button>
              </div>

              {products.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-1 gap-3 border border-black/12 bg-white p-3 dark:border-white/10 dark:bg-transparent md:grid-cols-[1fr_180px_40px]"
                    >
                      <div>
                        <FieldLabel>Sản phẩm {index + 1}</FieldLabel>
                        <TextInput
                          id={`product-name-${product.id}`}
                          value={product.productName}
                          onChange={(value) =>
                            updateProduct(product.id, "productName", value)
                          }
                          placeholder="Tên sản phẩm"
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel>Giá</FieldLabel>
                        <TextInput
                          id={`product-price-${product.id}`}
                          type="number"
                          value={product.price}
                          onChange={(value) =>
                            updateProduct(product.id, "price", value)
                          }
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="flex h-11 w-10 items-center justify-center rounded-lg border border-black/12 bg-white text-black/54 transition-all hover:border-red-400/40 hover:text-red-500 dark:border-white/10 dark:bg-transparent dark:text-white/45 dark:hover:text-red-300"
                          aria-label="Xóa sản phẩm"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-black/12 bg-white px-4 py-8 text-center text-sm text-black/48 dark:border-white/10 dark:bg-transparent dark:text-white/35">
                  Chưa có sản phẩm nào. Bấm thêm sản phẩm để bắt đầu.
                </div>
              )}
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
                    {isSubmitting ? <Spinner size="sm" color="black" /> : null}
                    {isEditMode ? "Chỉnh sửa" : "Tạo hợp đồng"}
                  </span>
                </button>

                {isEditMode && initialContract ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(getPreviewPath(initialContract.contractId))
                    }
                    className="inline-flex h-12 min-w-56 items-center justify-center rounded-full bg-black/[0.07] px-6 text-sm font-medium text-black/80 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-black/[0.11] hover:text-[#111111] dark:bg-white/[0.07] dark:text-white/80 dark:hover:bg-white/[0.11] dark:hover:text-white active:translate-y-0 active:scale-[0.98]"
                  >
                    Xem Preview hợp đồng
                  </button>
                ) : null}
              </div>

              {lastPayload ? (
                <p className="text-xs text-black/60 dark:text-white/50">
                  Đã gửi yêu cầu tạo hợp đồng với{" "}
                  <span className="tabular-nums">
                    {lastPayload.details.length}
                  </span>{" "}
                  sản phẩm.
                </p>
              ) : null}
            </div>
          </motion.div>
        </form>
      </div>
      <ContractHistoryPanel
        activeContractId={initialContract?.contractId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </main>
  );
}

export default function ContractCreatePage() {
  return <ContractFormPage />;
}
