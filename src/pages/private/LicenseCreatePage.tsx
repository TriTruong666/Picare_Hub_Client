import type { ChangeEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
  FiFileText,
  FiCheck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { useCreateLicense } from "@/hooks/data/useLicenseHooks";
import { useUploadS3Asset } from "@/hooks/data/useS3Hooks";
import type { SoftwareItem, SoftwareServerConfig } from "@/types/License";
import { toast } from "@/hooks/useToast";
import { formatFileSize } from "@/common/format";

const CONTRACT_FILE_FOLDER = "contracts";

const SOFTWARE_TYPE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "server", label: "Server" },
];

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Không thể đọc file"));
    };

    reader.onerror = () =>
      reject(reader.error ?? new Error("Đọc file thất bại"));
    reader.readAsDataURL(file);
  });
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-white/40">
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  id: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="placeholder:text-gray-455 hover:border-gray-405 h-10 w-full rounded-lg border border-gray-300 bg-white px-4 text-xs text-gray-700 transition-all outline-none hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
    />
  );
}

function TextareaInput({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="placeholder:text-gray-455 hover:border-gray-405 w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-700 transition-all outline-none hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
    />
  );
}

function Switch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full p-0.5 focus:outline-none ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      animate={{
        backgroundColor: checked ? "#22c55e" : "rgba(120, 120, 120, 0.2)",
      }}
      transition={{ duration: 0.18 }}
    >
      <motion.span
        layout
        className="pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0"
        animate={{
          x: checked ? 18 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </motion.button>
  );
}

interface LocalContractItem {
  id: string;
  name: string;
  file: File | null;
  url: string;
}

function ContractItemRow({
  c,
  idx,
  isSaving,
  onUpdate,
  onRemove,
}: {
  c: LocalContractItem;
  idx: number;
  isSaving: boolean;
  onUpdate: (id: string, key: keyof LocalContractItem, val: any) => void;
  onRemove: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (c.url) {
      toast.error("Lỗi", "Không thể vừa chèn link vừa upload file.");
      return;
    }
    onUpdate(c.id, "file", f);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (c.url) {
        toast.error("Lỗi", "Không thể vừa chèn link vừa upload file.");
        return;
      }
      onUpdate(c.id, "file", f);
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(c.id, "file", null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="relative flex flex-col gap-4 rounded-xl border border-gray-300 bg-white p-6 dark:border-white/10 dark:bg-white/5"
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onRemove(c.id)}
        disabled={isSaving}
        className="absolute top-2 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/10 text-red-500 transition-all hover:bg-red-500/10 dark:text-red-400"
      >
        <FiTrash2 className="text-sm" />
      </motion.button>

      <div className="w-full">
        <FieldLabel>Tên hợp đồng #{idx + 1}</FieldLabel>
        <TextInput
          id={`contract-name-${c.id}`}
          value={c.name}
          onChange={(v) => onUpdate(c.id, "name", v)}
          placeholder="Ví dụ: Hop dong Happycare 2026"
          disabled={isSaving}
        />
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {/* Upload zone */}
        <div>
          <FieldLabel>File đính kèm</FieldLabel>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            disabled={isSaving}
          />

          <motion.div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            whileHover={!isSaving ? { borderColor: "rgba(99, 102, 241, 0.5)", translateY: -1 } : {}}
            onClick={() => !isSaving && fileInputRef.current?.click()}
            className={`group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-220 ${
              isDragActive
                ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/5 dark:bg-indigo-500/10"
                : c.file
                ? "border-indigo-500/30 bg-indigo-500/3 dark:bg-indigo-500/5"
                : "border-gray-300 bg-gray-50/50 hover:bg-white dark:border-white/10 dark:bg-white/2 dark:hover:bg-white/5"
            } ${isSaving ? "pointer-events-none opacity-60" : ""}`}
          >
            <AnimatePresence mode="wait">
              {c.file ? (
                <motion.div
                  key="file-attached"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-4 text-center"
                >
                  <FiFileText className="mb-2 text-3xl text-indigo-500" />
                  <span className="max-w-[320px] truncate text-xs font-normal text-gray-700 dark:text-white/60">
                    {c.file.name} ({formatFileSize(c.file.size)})
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Sẵn sàng tải lên
                  </span>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFile}
                    className="text-red-555 mt-2.5 flex items-center gap-1 rounded bg-red-500/10 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20"
                  >
                    <FiX /> Gỡ file
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-500 dark:text-white/20"
                >
                  <FiUpload className="mb-2 text-3xl" />
                  <span className="text-xs font-medium">
                    Kéo thả hoặc chọn file tài liệu hợp đồng
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Direct URL field */}
        <div>
          <FieldLabel>Hoặc chèn link hợp đồng trực tiếp</FieldLabel>
          <TextInput
            id={`contract-url-${c.id}`}
            value={c.url}
            onChange={(v) => {
              if (v && c.file) {
                toast.error("Lỗi", "Không thể vừa chèn link vừa upload file.");
                return;
              }
              onUpdate(c.id, "url", v);
            }}
            placeholder="https://example.com/contracts/..."
            disabled={isSaving}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function LicenseCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateLicense();
  const uploadMutation = useUploadS3Asset({ showSuccessToast: false });

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [yearlyCost, setYearlyCost] = useState(0);
  const [note, setNote] = useState("");

  // Contract list state (supports multiple uploads/inputs)
  const [contracts, setContracts] = useState<LocalContractItem[]>([
    { id: "init-1", name: "", file: null, url: "" },
  ]);

  // Software items state
  const [softwares, setSoftwares] = useState<SoftwareItem[]>([]);

  const handleAddContractItem = () => {
    setContracts([
      ...contracts,
      { id: Math.random().toString(), name: "", file: null, url: "" },
    ]);
  };

  const handleRemoveContractItem = (id: string) => {
    setContracts(contracts.filter((c) => c.id !== id));
  };

  const handleUpdateContractItem = (
    id: string,
    key: keyof LocalContractItem,
    val: any,
  ) => {
    setContracts(
      contracts.map((c) => (c.id === id ? { ...c, [key]: val } : c)),
    );
  };

  const handleAddSoftware = () => {
    const newItem: SoftwareItem = {
      name: "",
      price: 0,
      status: "active",
      domain: "",
      type: "client",
      serverConfig: [],
      note: "",
    };
    setSoftwares([...softwares, newItem]);
  };

  const handleUpdateSoftware = (
    index: number,
    key: keyof SoftwareItem,
    val: any,
  ) => {
    const updated = [...softwares];
    // If software type changes away from server, clear config
    if (key === "type" && val !== "server") {
      updated[index] = {
        ...updated[index],
        type: val,
        serverConfig: [],
      };
    } else {
      updated[index] = {
        ...updated[index],
        [key]: val,
      };
    }
    setSoftwares(updated);
  };

  // Add a server config entry for a software item
  const handleAddServerConfig = (swIdx: number) => {
    const updated = [...softwares];
    updated[swIdx].serverConfig = [
      ...updated[swIdx].serverConfig,
      { name: "", active: false },
    ];
    setSoftwares(updated);
  };

  // Update a server config entry field
  const handleUpdateServerConfigField = (
    swIdx: number,
    cfgIdx: number,
    key: keyof SoftwareServerConfig,
    val: any,
  ) => {
    const updated = [...softwares];
    const updatedCfg = [...updated[swIdx].serverConfig];
    updatedCfg[cfgIdx] = {
      ...updatedCfg[cfgIdx],
      [key]: val,
    };
    updated[swIdx].serverConfig = updatedCfg;
    setSoftwares(updated);
  };

  // Remove a server config entry
  const handleRemoveServerConfig = (swIdx: number, cfgIdx: number) => {
    const updated = [...softwares];
    updated[swIdx].serverConfig = updated[swIdx].serverConfig.filter(
      (_, i) => i !== cfgIdx,
    );
    setSoftwares(updated);
  };

  const handleRemoveSoftware = (index: number) => {
    setSoftwares(softwares.filter((_, i) => i !== index));
  };

  const uploadFileIfNeeded = async (file: File | null, fallbackUrl: string) => {
    if (!file) return fallbackUrl;

    const base64File = await fileToBase64(file);
    const response = await uploadMutation.mutateAsync({
      file: base64File,
      folder: CONTRACT_FILE_FOLDER,
      description: `Contract file - ${file.name}`,
      visibility: "public",
    });

    if (!response.success || !response.data?.url) {
      throw new Error(response.message ?? "Upload tài liệu hợp đồng thất bại");
    }

    return response.data.url;
  };

  const handleSave = async () => {
    if (createMutation.isPending || uploadMutation.isPending) return;

    if (!customerName) {
      toast.error("Lỗi", "Vui lòng nhập tên khách hàng");
      return;
    }

    try {
      // Upload contract files on form submit
      const processedContracts = await Promise.all(
        contracts.map(async (c) => {
          const finalUrl = await uploadFileIfNeeded(c.file, c.url);
          return {
            name: c.name || c.file?.name || "Hợp đồng không tên",
            url: finalUrl,
          };
        }),
      );

      const response = await createMutation.mutateAsync({
        customerName,
        customerPhone,
        customerEmail,
        yearlyCost,
        oncePaymentStatus: "paid",
        licenseContract: processedContracts,
        note,
        software: softwares,
      });

      if (response.success) {
        navigate(PATHS.DASHBOARD.LICENSE_LIST);
      }
    } catch (err: any) {
      toast.error("Lỗi", err.message || "Đã xảy ra lỗi");
    }
  };

  const isSaving = createMutation.isPending || uploadMutation.isPending;

  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-8 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Bản quyền", path: PATHS.DASHBOARD.LICENSE_LIST },
            { label: "Tạo bản quyền" },
          ]}
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(PATHS.DASHBOARD.LICENSE_LIST)}
              className="text-gray-655 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white transition-all hover:border-gray-400 hover:bg-gray-55 hover:text-gray-909 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <FiArrowLeft className="text-sm" />
            </motion.button>
            <div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Tạo bản quyền
              </h1>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-white/30">
                Thêm bản quyền sử dụng phần mềm và cấu hình liên kết
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="hover:bg-indigo-550 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Spinner size="sm" /> : <FiSave className="text-sm" />}
            Tạo bản quyền
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Thông tin khách hàng */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <h2 className="text-gray-955 mb-5 text-sm font-medium dark:text-white/80">
              Thông tin khách hàng
            </h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Tên khách hàng</FieldLabel>
                  <TextInput
                    id="customer-name"
                    value={customerName}
                    onChange={setCustomerName}
                    placeholder="Tên hiển thị hoặc doanh nghiệp"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <FieldLabel>Số điện thoại</FieldLabel>
                  <TextInput
                    id="customer-phone"
                    value={customerPhone}
                    onChange={setCustomerPhone}
                    placeholder="Số điện thoại liên hệ"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Email khách hàng</FieldLabel>
                <TextInput
                  id="customer-email"
                  value={customerEmail}
                  onChange={setCustomerEmail}
                  placeholder="user@example.com"
                  type="email"
                  disabled={isSaving}
                />
              </div>
              <div>
                <FieldLabel>Ghi chú</FieldLabel>
                <TextareaInput
                  id="note"
                  value={note}
                  onChange={setNote}
                  placeholder="Ghi chú thêm về khách hàng hoặc điều khoản..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>
            </div>
          </section>

          {/* Hợp đồng liên quan */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-gray-955 text-sm font-medium dark:text-white/80">
                Hợp đồng liên quan ({contracts.length})
              </h2>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddContractItem}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-500/10 dark:text-indigo-400"
              >
                <FiPlus className="text-xs" /> Thêm hợp đồng
              </motion.button>
            </div>

            <div className="flex flex-col gap-6">
              <AnimatePresence initial={false}>
                {contracts.map((c, idx) => (
                  <ContractItemRow
                    key={c.id}
                    c={c}
                    idx={idx}
                    isSaving={isSaving}
                    onUpdate={handleUpdateContractItem}
                    onRemove={handleRemoveContractItem}
                  />
                ))}
              </AnimatePresence>

              {contracts.length === 0 && (
                <div className="flex items-center justify-center py-10 text-xs text-gray-400 dark:text-white/20">
                  Bấm "Thêm hợp đồng" để bắt đầu đính kèm hợp đồng.
                </div>
              )}
            </div>
          </section>

          {/* Phần mềm */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-gray-955 text-sm font-medium dark:text-white/80">
                Danh sách phần mềm kích hoạt
              </h2>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSoftware}
                className="text-indigo-755 flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-xs font-medium transition hover:bg-indigo-500/10 dark:text-indigo-400"
                disabled={isSaving}
              >
                <FiPlus className="text-xs" /> Thêm phần mềm
              </motion.button>
            </div>

            <div className="flex flex-col gap-5">
              {softwares.map((sw, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col gap-4 rounded-xl border border-gray-300 bg-white p-6 dark:border-white/10 dark:bg-white/5"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveSoftware(idx)}
                    disabled={isSaving}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/10 text-red-500 transition-all hover:bg-red-500/10 dark:text-red-400"
                  >
                    <FiTrash2 className="text-sm" />
                  </motion.button>

                  <h3 className="text-indigo-550 dark:text-indigo-455 text-xs font-medium tracking-wider uppercase">
                    Phần mềm #{idx + 1}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Tên phần mềm</FieldLabel>
                      <TextInput
                        id={`sw-name-${idx}`}
                        value={sw.name}
                        onChange={(v) => handleUpdateSoftware(idx, "name", v)}
                        placeholder="Ví dụ: Happycare App"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <FieldLabel>Giá tiền (VND)</FieldLabel>
                      <TextInput
                        id={`sw-price-${idx}`}
                        value={sw.price}
                        onChange={(v) =>
                          handleUpdateSoftware(idx, "price", parseFloat(v) || 0)
                        }
                        placeholder="5000000"
                        type="number"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Domain</FieldLabel>
                      <TextInput
                        id={`sw-domain-${idx}`}
                        value={sw.domain}
                        onChange={(v) => handleUpdateSoftware(idx, "domain", v)}
                        placeholder="sub.happycare.vn"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <FieldLabel>Loại Client</FieldLabel>
                      <GlassSelect
                        value={sw.type}
                        onChange={(val) =>
                          handleUpdateSoftware(idx, "type", val)
                        }
                        options={SOFTWARE_TYPE_OPTIONS}
                        placeholder="Chọn loại"
                      />
                    </div>
                  </div>

                  {/* Server config section: Shown only if sw.type === 'server' */}
                  {sw.type === "server" && (
                    <div className="border-t border-gray-200 pt-4 dark:border-white/5">
                      <div className="mb-3 flex items-center justify-between">
                        <FieldLabel>
                          Cấu hình Services (Server Config)
                        </FieldLabel>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddServerConfig(idx)}
                          disabled={isSaving}
                          className="text-indigo-650 flex items-center gap-1 text-[10px] font-medium hover:text-indigo-700 dark:text-indigo-400"
                        >
                          <FiPlus className="text-[10px]" /> Thêm cấu hình
                        </motion.button>
                      </div>

                      {sw.serverConfig.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {sw.serverConfig.map((cfg, cfgIdx) => (
                            <div
                              key={cfgIdx}
                              className="flex items-center gap-4 border-b border-gray-100 py-2 last:border-0 dark:border-white/5"
                            >
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={cfg.name}
                                  onChange={(e) =>
                                    handleUpdateServerConfigField(
                                      idx,
                                      cfgIdx,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Tên service (ví dụ: hub-clients)"
                                  disabled={isSaving}
                                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none hover:border-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                              </div>

                              <div className="flex items-center gap-2 select-none">
                                <Switch
                                  checked={cfg.active}
                                  onChange={(val) =>
                                    handleUpdateServerConfigField(
                                      idx,
                                      cfgIdx,
                                      "active",
                                      val,
                                    )
                                  }
                                  disabled={isSaving}
                                />
                                <span className="text-gray-655 text-xs dark:text-white/40">
                                  Kích hoạt
                                </span>
                              </div>

                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleRemoveServerConfig(idx, cfgIdx)
                                }
                                disabled={isSaving}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-red-500/10 text-red-500 hover:bg-red-500/10"
                              >
                                <FiTrash2 className="text-[11px]" />
                              </motion.button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-455 py-2 text-center text-[11px] dark:text-white/30">
                          Chưa có cấu hình service nào được thêm.
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <FieldLabel>Ghi chú phần mềm</FieldLabel>
                    <TextareaInput
                      id={`sw-note-${idx}`}
                      value={sw.note}
                      onChange={(v) => handleUpdateSoftware(idx, "note", v)}
                      placeholder="Chi tiết cấu hình, tài khoản admin..."
                      rows={2}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              ))}

              {softwares.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-8 dark:border-white/5">
                  <p className="text-xs text-gray-400 dark:text-white/20">
                    Chưa kích hoạt phần mềm nào.
                  </p>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddSoftware}
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-400"
                    disabled={isSaving}
                  >
                    Thêm phần mềm đầu tiên
                  </motion.button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Cột phải */}
        <div className="flex flex-col gap-5">
          {/* Chi phí */}
          <section className="rounded-xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/2">
            <h2 className="mb-5 text-sm font-medium text-gray-955 dark:text-white/80">
              Chi phí
            </h2>
            <div>
              <FieldLabel>Chi phí hàng năm (VND)</FieldLabel>
              <TextInput
                id="yearly-cost"
                value={yearlyCost}
                onChange={(v) => setYearlyCost(parseFloat(v) || 0)}
                placeholder="Ví dụ: 12000000"
                type="number"
                disabled={isSaving}
              />
            </div>
          </section>

          {/* Lưu ý */}
          <section className="rounded-xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/2">
            <h2 className="mb-4 text-sm font-medium text-gray-955 dark:text-white/80">
              Lưu ý khi tạo bản quyền
            </h2>
            <div className="text-gray-455 space-y-2.5 text-xs leading-relaxed dark:text-white/30">
              <p>
                Hãy chắc chắn các thông tin liên hệ của khách hàng chính xác để
                gửi thông báo gia hạn bản quyền.
              </p>
              <p>
                Bản hợp đồng đính kèm cần được đồng bộ lên kho lưu trữ trước.
              </p>
              <p>
                Cấu hình server sẽ kích hoạt tự động đồng bộ khi bạn kiểm chọn
                kết nối.
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-500/10 dark:text-indigo-400"
            >
              {isSaving ? (
                <Spinner size="sm" />
              ) : (
                <FiPlus className="text-xs" />
              )}
              Tạo ngay
            </motion.button>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
