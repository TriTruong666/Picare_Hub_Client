/* eslint-disable react-hooks/set-state-in-effect */
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { ContractDraftHistoryPanel } from "@/components/contracts/ContractDraftHistoryPanel";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { toast } from "@/hooks/useToast";
import { useCreateContract } from "@/hooks/data/useContractHooks";
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

const OWNER_TEMPLATES: OwnerCompanyInfoPayload[] = [
  {
    companyCode: "TH",
    companyName: "CTY TNHH DƯỢC PHẨM TRUNG HẠNH",
    address: "2/35 Chấn Hưng, Phường Tân Hòa, Thành Phố Hồ Chí Minh",
    phone: "0983139320",
    email: "cskh@trunghanh.com",
    bankInfo: "204550429 Ngân hàng Á Châu  Chi Nhánh Bắc Hải TP HCM",
    mst: "0319999999",
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

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] text-white/40">{children}</label>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 text-sm font-medium text-white">{children}</h2>;
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
      className="h-11 w-full rounded-lg border border-white/10 bg-transparent px-4 text-sm text-white transition-all outline-none placeholder:text-white/25 hover:border-white/20 focus:border-white/30"
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
      className="w-full resize-none rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm text-white transition-all outline-none placeholder:text-white/25 hover:border-white/20 focus:border-white/30"
    />
  );
}

function isEmpty(value: string) {
  return !value.trim();
}

export function ContractFormPage({
  mode = "create",
  initialContract,
}: {
  mode?: ContractFormMode;
  initialContract?: Contract;
}) {
  const createContractMutation = useCreateContract();
  const [selectedOwnerIndex, setSelectedOwnerIndex] = useState(0);
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

  const ownerCompanyInfo = OWNER_TEMPLATES[selectedOwnerIndex];
  const isSubmitting = createContractMutation.isPending;
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!initialContract) return;

    const ownerIndex = OWNER_TEMPLATES.findIndex(
      (template) =>
        template.companyCode === initialContract.ownerCompanyInfo.companyCode ||
        template.mst === initialContract.ownerCompanyInfo.mst,
    );

    setSelectedOwnerIndex(ownerIndex >= 0 ? ownerIndex : 0);
    setPartnerCompanyInfo(initialContract.partnerCompanyInfo);
    setContractDueDate(initialContract.contractDueDate.slice(0, 10));
    setProducts(
      initialContract.details.map((detail) => ({
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

    const missingPartnerFields = PARTNER_FIELDS.filter((field) =>
      isEmpty(partnerCompanyInfo[field.key]),
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
    partnerCompanyInfo,
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
    <main className="dashboard-theme min-h-screen bg-[#050505] text-white">
      {!isHistoryOpen ? (
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-[0_14px_34px_rgba(0,0,0,0.34)] transition duration-250 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.42)] active:translate-y-0 active:scale-95"
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
          <header className="border-b border-white/10 pb-6">
            <Link
              to={PATHS.LOGIN}
              className="group mb-5 inline-flex w-fit items-center gap-2 text-xs font-medium text-white/55 transition duration-200 ease-out hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] transition duration-200 ease-out group-hover:-translate-x-0.5 group-hover:bg-white/[0.1]">
                <FiArrowLeft />
              </span>
              <span>Quay về Hub</span>
            </Link>
            <h1 className="text-center text-2xl font-medium text-white md:text-3xl">
              {isEditMode
                ? "Chỉnh sửa hợp đồng điện tử - Picare Việt Nam"
                : "Hệ thống tạo hợp đồng điện tử - Picare Việt Nam"}
            </h1>
            {isEditMode && initialContract ? (
              <p className="mt-2 text-sm text-white/45">
                Đang chỉnh sửa bản nháp{" "}
                {initialContract.contractNumber || initialContract.contractId}
              </p>
            ) : null}
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col"
          >
            <section className="border-b border-white/10 py-6">
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

            <section className="border-b border-white/10 py-6">
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
                          ? "border-white/35 bg-white/6"
                          : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/4"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p
                            className={`text-xs ${
                              selected ? "text-white/70" : "text-white/40"
                            }`}
                          >
                            {template.companyCode}
                          </p>
                          <h3 className="mt-2 text-sm leading-5 font-medium text-white">
                            {template.companyName}
                          </h3>
                        </div>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-white/45 bg-white text-black"
                              : "border-white/15 text-transparent"
                          }`}
                        >
                          <FiCheck className="text-xs" />
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 text-xs leading-5 text-white/45">
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

            <section className="border-b border-white/10 py-6">
              <SectionTitle>Công ty đối tác</SectionTitle>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {PARTNER_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className={field.multiline ? "md:col-span-2" : ""}
                  >
                    <FieldLabel>{field.label}</FieldLabel>
                    {field.multiline ? (
                      <TextareaInput
                        id={`partner-${field.key}`}
                        value={partnerCompanyInfo[field.key]}
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
                        value={partnerCompanyInfo[field.key]}
                        onChange={(value) =>
                          updatePartnerField(field.key, value)
                        }
                        placeholder={field.placeholder}
                        required
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="border-b border-white/10 py-6">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <SectionTitle>Danh sách sản phẩm</SectionTitle>
                <button
                  type="button"
                  onClick={addProduct}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-[12px] text-white/80 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white active:translate-y-0 active:scale-[0.98]"
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
                      className="grid grid-cols-1 gap-3 border border-white/10 p-3 md:grid-cols-[1fr_180px_40px]"
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
                          className="flex h-11 w-10 items-center justify-center rounded-lg border border-white/10 bg-transparent text-white/45 transition-all hover:border-red-400/40 hover:text-red-300"
                          aria-label="Xóa sản phẩm"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">
                  Chưa có sản phẩm nào. Bấm thêm sản phẩm để bắt đầu.
                </div>
              )}
            </section>

            <div className="flex flex-col items-center gap-3 py-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex h-12 min-w-56 items-center justify-center overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_16px_45px_rgba(0,0,0,0.38)] transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_22px_60px_rgba(0,0,0,0.46)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:bg-white/45 disabled:text-black/50 disabled:shadow-none"
              >
                <span className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-black/25 to-transparent opacity-50" />
                <span className="flex items-center justify-center gap-2.5">
                  {isSubmitting ? <Spinner size="sm" color="primary" /> : null}
                  {isEditMode ? "Tạo hợp đồng từ bản nháp" : "Tạo hợp đồng"}
                </span>
              </button>

              {lastPayload ? (
                <p className="text-xs text-white/50">
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
      <ContractDraftHistoryPanel
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
