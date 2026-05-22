import { FormEvent, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useCreateContract } from "@/hooks/data/useContractHooks";
import type {
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

const INITIAL_PARTNER: PartnerCompanyInfoPayload = {
  companyName: "CÔNG TY CỔ PHẦN NHÀ THUỐC MINH AN",
  address: "15 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP Hồ Chí Minh",
  phone: "02839998888",
  email: "purchase@minhan-pharma.vn",
  bankInfo: "987654321 Ngân hàng VietTest - Chi nhánh Sài Gòn",
  mst: "0308888888",
  ownerName: "Bà Trần Thị Minh An",
  role: "Giám đốc mua hàng",
};

const INITIAL_PRODUCTS: ProductRow[] = [
  {
    id: crypto.randomUUID(),
    productName: "Gel rửa tay khô Picare SafeClean 500ml",
    price: "125000",
  },
  {
    id: crypto.randomUUID(),
    productName: "Dung dịch sát khuẩn bề mặt MediShield 1L",
    price: "189000",
  },
  {
    id: crypto.randomUUID(),
    productName: "Khẩu trang y tế 4 lớp HealthMask Pro hộp 50 cái",
    price: "72000",
  },
  {
    id: crypto.randomUUID(),
    productName: "Viên bổ sung vitamin C Zinc Plus lọ 60 viên",
    price: "145500",
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

export default function ContractCreatePage() {
  const createContractMutation = useCreateContract();
  const [selectedOwnerIndex, setSelectedOwnerIndex] = useState(0);
  const [partnerCompanyInfo, setPartnerCompanyInfo] =
    useState<PartnerCompanyInfoPayload>(INITIAL_PARTNER);
  const [contractDueDate, setContractDueDate] = useState("2028-06-30");
  const [contractUrl, setContractUrl] = useState(
    "https://example.com/contracts/minh-an-test-contract.pdf",
  );
  const [products, setProducts] = useState<ProductRow[]>(INITIAL_PRODUCTS);
  const [lastPayload, setLastPayload] = useState<CreateContractPayload | null>(
    null,
  );

  const ownerCompanyInfo = OWNER_TEMPLATES[selectedOwnerIndex];
  const isSubmitting = createContractMutation.isPending;

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

  const buildPayload = (): CreateContractPayload => ({
    ownerCompanyInfo,
    partnerCompanyInfo,
    contractDueDate,
    contractType: "digital",
    contractUrl,
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

    const payload = buildPayload();
    const response = await createContractMutation.mutateAsync(payload);

    if (response.success) {
      setLastPayload(payload);
    }
  };

  return (
    <main className="dashboard-theme min-h-screen bg-[#050505] text-white">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-5xl flex-col px-5 py-6 md:px-8 lg:px-10"
      >
        <header className="border-b border-white/10 pb-6 text-center">
          <h1 className="text-2xl font-medium text-white md:text-3xl">
            Hệ thống tạo hợp đồng điện tử - Picare Việt Nam
          </h1>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col"
        >
          <section className="border-b border-white/10 py-6">
            <SectionTitle>Thông tin hợp đồng</SectionTitle>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <div>
                <FieldLabel>URL hợp đồng</FieldLabel>
                <TextInput
                  id="contract-url"
                  type="url"
                  value={contractUrl}
                  onChange={setContractUrl}
                  placeholder="https://example.com/contracts/file.pdf"
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
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                      selected
                        ? "border-white/35 bg-white/[0.06]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
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
                      onChange={(value) => updatePartnerField(field.key, value)}
                      placeholder={field.placeholder}
                      required
                    />
                  ) : (
                    <TextInput
                      id={`partner-${field.key}`}
                      type={field.key === "email" ? "email" : "text"}
                      value={partnerCompanyInfo[field.key]}
                      onChange={(value) => updatePartnerField(field.key, value)}
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
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 text-sm text-white/80 transition-all hover:border-white/20 hover:text-white"
              >
                <FiPlus />
                Thêm sản phẩm
              </button>
            </div>

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
                      disabled={products.length === 1}
                      className="flex h-11 w-10 items-center justify-center rounded-lg border border-white/10 bg-transparent text-white/45 transition-all hover:border-red-400/40 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30"
                      aria-label="Xóa sản phẩm"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col items-center gap-3 py-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 min-w-44 items-center justify-center rounded-lg border border-white/15 bg-transparent px-5 text-sm text-white/85 transition-all hover:border-white/30 hover:text-white active:scale-95 disabled:pointer-events-none disabled:text-white/35"
            >
              {isSubmitting ? <Spinner size="sm" color="white" /> : null}
              Tạo hợp đồng
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
    </main>
  );
}
