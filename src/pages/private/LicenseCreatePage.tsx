import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FiArrowLeft,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
  FiFileText,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import {
  useCreateLicense,
  useLicenseDetail,
  useUpdateLicense,
} from "@/hooks/data/useLicenseHooks";
import { useUploadS3Asset } from "@/hooks/data/useS3Hooks";
import type { SoftwareItem, SoftwareServerConfig } from "@/types/License";
import { toast } from "@/hooks/useToast";
import { formatFileSize } from "@/common/format";
import ConfirmSoftwareStatusModal from "@/components/modals/ConfirmSoftwareStatusModal";

const CONTRACT_FILE_FOLDER = "contracts";

const SOFTWARE_TYPE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "server", label: "Server" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "paid", label: "Đã thanh toán" },
  { value: "partialy_paid", label: "Thanh toán một phần" },
  { value: "unpaid", label: "Chưa thanh toán" },
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
    <label className="mb-2 block text-[11px] font-medium text-gray-500 dark:text-white/40">
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
      className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3.5 text-[13px] text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-[border-color,background-color,box-shadow] duration-200 outline-none placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-indigo-500/50 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] dark:placeholder:text-white/25 dark:hover:border-white/15 dark:hover:bg-white/[0.06] dark:focus:border-indigo-400/50 dark:focus:bg-indigo-500/[0.04] dark:focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
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
      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/80 px-3.5 py-3 text-[13px] leading-5 text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-[border-color,background-color,box-shadow] duration-200 outline-none placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-indigo-500/50 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] dark:placeholder:text-white/25 dark:hover:border-white/15 dark:hover:bg-white/[0.06] dark:focus:border-indigo-400/50 dark:focus:bg-indigo-500/[0.04] dark:focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
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
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
      className="relative flex flex-col gap-5 rounded-2xl border border-gray-300 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-white/[0.03]"
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onRemove(c.id)}
        disabled={isSaving}
        className="absolute top-3 right-4 flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition-all hover:bg-red-500/20 dark:text-red-400"
      >
        <FiTrash2 className="text-xs" />
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

      <div className="flex flex-col gap-4">
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
            whileHover={!isSaving ? { scale: 1.005 } : {}}
            onClick={() => !isSaving && fileInputRef.current?.click()}
            className={`group relative flex min-h-[96px] w-full cursor-pointer items-center overflow-hidden rounded-xl border border-dashed p-4 transition-all duration-300 md:p-5 ${
              isDragActive
                ? "border-indigo-500 bg-indigo-500/10 shadow-[0_16px_40px_rgba(99,102,241,0.12)]"
                : c.file
                  ? "border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]"
                  : "border-gray-300 bg-gray-50/50 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] dark:border-white/10 dark:bg-white/[0.01] dark:hover:border-indigo-400/30 dark:hover:bg-indigo-500/[0.04]"
            } ${isSaving ? "pointer-events-none opacity-60" : ""}`}
          >
            <AnimatePresence mode="wait">
              {c.file ? (
                <motion.div
                  key="file-attached"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex w-full items-center gap-3.5 text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <FiFileText className="text-lg" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-gray-900 dark:text-white/80">
                      {c.file.name}
                    </span>
                    <span className="mt-1 block text-[10px] text-gray-500 dark:text-white/35">
                      {formatFileSize(c.file.size)} · Sẵn sàng tải lên
                    </span>
                  </span>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFile}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                  >
                    <FiX />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/15 transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <FiUpload className="text-base" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-800 dark:text-white/75">
                      Kéo thả hoặc nhấn để chọn file hợp đồng
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-white/35">
                      Hỗ trợ PDF, DOCX tối đa 20MB
                    </p>
                  </div>
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

type LicenseCreatePageProps = {
  mode?: "create" | "edit";
  licenseId?: string;
};

export default function LicenseCreatePage({
  mode = "create",
  licenseId = "",
}: LicenseCreatePageProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isEdit = mode === "edit";
  const createMutation = useCreateLicense();
  const updateMutation = useUpdateLicense();
  const {
    data: license,
    isLoading: isLoadingLicense,
    isError: isLicenseError,
    refetch: refetchLicense,
  } = useLicenseDetail(isEdit ? licenseId : "");
  const uploadMutation = useUploadS3Asset({ showSuccessToast: false });
  const hydratedLicenseId = useRef<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [yearlyCost, setYearlyCost] = useState<string | number>("");
  const [oncePaymentStatus, setOncePaymentStatus] = useState("paid");
  const [note, setNote] = useState("");

  // Contract list state (supports multiple uploads/inputs)
  const [contracts, setContracts] = useState<LocalContractItem[]>([
    { id: "init-1", name: "", file: null, url: "" },
  ]);

  // Software items state
  const [softwares, setSoftwares] = useState<any[]>([]);

  // State for software status confirmation modal
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusTargetIdx, setStatusTargetIdx] = useState<number | null>(null);
  const [statusTargetVal, setStatusTargetVal] = useState<"active" | "error" | null>(null);

  const handleToggleStatusClick = (idx: number, target: "active" | "error") => {
    setStatusTargetIdx(idx);
    setStatusTargetVal(target);
    setStatusConfirmOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (statusTargetIdx === null || !statusTargetVal) return;
    handleUpdateSoftware(statusTargetIdx, "status", statusTargetVal);
  };

  useEffect(() => {
    if (!isEdit || !license || hydratedLicenseId.current === license.licenseId) {
      return;
    }

    setCustomerName(license.customerName || "");
    setCustomerPhone(license.customerPhone || "");
    setCustomerEmail(license.customerEmail || "");
    setYearlyCost(license.yearlyCost ?? "");
    setOncePaymentStatus(license.oncePaymentStatus || "paid");
    setNote(license.note || "");
    setContracts(
      license.licenseContract.length > 0
        ? license.licenseContract.map((contract, index) => ({
            id: `${license.licenseId}-contract-${index}`,
            name: contract.name,
            file: null,
            url: contract.url,
          }))
        : [{ id: "init-1", name: "", file: null, url: "" }],
    );
    setSoftwares(
      license.software.map((software) => ({
        ...software,
        status: software.status || "active",
        serverConfig: software.serverConfig || [],
      })),
    );
    hydratedLicenseId.current = license.licenseId;
  }, [isEdit, license]);

  const handleAddContractItem = () => {
    setContracts([
      ...contracts,
      { id: Math.random().toString(), name: "", file: null, url: "" },
    ]);
  };

  const handleRemoveContractItem = (id: string) => {
    setContracts(contracts.filter((c) => c.id !== id));
  };

  const handleUpdateContractItem = <K extends keyof LocalContractItem>(
    id: string,
    key: K,
    val: LocalContractItem[K],
  ) => {
    setContracts(
      contracts.map((c) => (c.id === id ? { ...c, [key]: val } : c)),
    );
  };

  const handleAddSoftware = () => {
    const newItem: any = {
      softwareId: "",
      name: "",
      price: "",
      status: "active",
      domain: "",
      type: "client",
      serverConfig: [],
      note: "",
    };
    setSoftwares([...softwares, newItem]);
  };

  const handleUpdateSoftware = <K extends keyof SoftwareItem>(
    index: number,
    key: K,
    val: SoftwareItem[K],
  ) => {
    const updated = [...softwares];
    // If software type changes away from server, clear config
    if (key === "type" && val !== "server") {
      updated[index] = {
        ...updated[index],
        type: val as SoftwareItem["type"],
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
  const handleUpdateServerConfigField = <K extends keyof SoftwareServerConfig>(
    swIdx: number,
    cfgIdx: number,
    key: K,
    val: SoftwareServerConfig[K],
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
      (_: SoftwareServerConfig, i: number) => i !== cfgIdx,
    );
    setSoftwares(updated);
  };

  const handleRemoveSoftware = (index: number) => {
    setSoftwares(softwares.filter((_, i: number) => i !== index));
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
    if (
      createMutation.isPending ||
      updateMutation.isPending ||
      uploadMutation.isPending
    )
      return;

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

      const payload = {
        customerName,
        customerPhone,
        customerEmail,
        yearlyCost: yearlyCost === "" ? 0 : parseFloat(String(yearlyCost)) || 0,
        oncePaymentStatus,
        licenseContract: processedContracts,
        note,
        software: softwares.map((sw) => ({
          ...sw,
          price: sw.price === "" ? 0 : parseFloat(String(sw.price)) || 0,
        })),
      };

      const response = isEdit
        ? await updateMutation.mutateAsync({ id: licenseId, payload })
        : await createMutation.mutateAsync(payload);

      if (response.success) {
        navigate(PATHS.DASHBOARD.LICENSE_LIST);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      toast.error("Lỗi", message);
    }
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending;
  const reveal = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    visible: { opacity: 1, y: 0 },
  };

  if (isEdit && isLoadingLicense) {
    return (
      <div className="page-layout dashboard-theme flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEdit && (!licenseId || isLicenseError || !license)) {
    return (
      <div className="page-layout dashboard-theme flex min-h-100 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-red-500 dark:text-red-400">
          Không thể tải thông tin bản quyền.
        </p>
        <button type="button" className="btn-secondary" onClick={() => refetchLicense()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="page-layout dashboard-theme pb-28 lg:pb-12">
      <motion.header
        initial="hidden"
        animate="visible"
        variants={reveal}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mb-10 flex flex-col"
      >
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Bản quyền", path: PATHS.DASHBOARD.LICENSE_LIST },
            { label: isEdit ? "Chỉnh sửa bản quyền" : "Tạo bản quyền" },
          ]}
        />
        <div className="mt-5 flex flex-col gap-6 border-b border-gray-200 pb-7 md:flex-row md:items-end md:justify-between dark:border-white/[0.08]">
          <div className="flex items-start gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(PATHS.DASHBOARD.LICENSE_LIST)}
              aria-label="Quay lại danh sách bản quyền"
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-all duration-200 hover:border-gray-400 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50 dark:hover:border-white/20 dark:hover:text-white"
            >
              <FiArrowLeft className="text-sm" />
            </motion.button>
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold text-gray-950 md:text-4xl dark:text-white">
                {isEdit ? "Chỉnh sửa bản quyền" : "Tạo bản quyền"}
              </h1>
              <p className="mt-3 max-w-xl text-[13px] leading-5 text-gray-500 dark:text-white/40">
                {isEdit
                  ? "Cập nhật thông tin sử dụng phần mềm và cấu hình liên kết"
                  : "Thêm bản quyền sử dụng phần mềm và cấu hình liên kết"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className={`hidden items-center gap-2 rounded-lg border text-xs font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 md:flex ${
              isEdit
                ? "h-9 border-indigo-300/20 bg-indigo-600 px-3.5 shadow-[0_6px_18px_rgba(79,70,229,0.18)] hover:border-indigo-200/30 hover:bg-indigo-500"
                : "h-10 border-transparent bg-indigo-600 px-5 shadow-[0_8px_24px_rgba(79,70,229,0.2)] hover:bg-indigo-500"
            }`}
          >
            {isSaving ? <Spinner size="sm" /> : <FiSave className="text-sm" />}
            {isEdit ? "Lưu thay đổi" : "Tạo bản quyền"}
          </motion.button>
        </div>
      </motion.header>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={reveal}
        transition={{
          delay: reduceMotion ? 0 : 0.1,
          duration: reduceMotion ? 0 : 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="flex min-w-0 flex-col gap-6">
          {/* Thông tin khách hàng */}
          <section className="border-b border-gray-200 pb-10 dark:border-white/[0.08]">
            <div className="mb-6 border-b border-gray-200 pb-4 dark:border-white/[0.07]">
              <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white/85">
                Thông tin khách hàng
              </h2>
            </div>
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
          <section className="border-b border-gray-200 py-4 pb-10 dark:border-white/[0.08]">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/[0.07]">
              <div>
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white/85">
                  Hợp đồng liên quan ({contracts.length})
                </h2>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddContractItem}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-[11px] font-semibold text-indigo-700 transition-all duration-200 hover:bg-indigo-500/20 active:scale-[0.98] dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
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
          <section className="py-4">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/[0.07]">
              <div>
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white/85">
                  Danh sách phần mềm kích hoạt
                </h2>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSoftware}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-[11px] font-semibold text-indigo-700 transition-all duration-200 hover:bg-indigo-500/20 active:scale-[0.98] dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
                disabled={isSaving}
              >
                <FiPlus className="text-xs" /> Thêm phần mềm
              </motion.button>
            </div>

            <div className="flex flex-col gap-5">
              {softwares.map((sw, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col gap-5 border-b border-gray-200 py-7 first:pt-0 last:border-b-0 dark:border-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-indigo-550 dark:text-indigo-455 text-xs font-medium">
                      Phần mềm #{idx + 1}
                    </h3>
                    <div className="flex items-center gap-4">
                      {isEdit && (
                        <div className="flex items-center gap-2 select-none">
                          <Switch
                            checked={(sw.status || "active") === "active"}
                            onChange={(val) =>
                              handleToggleStatusClick(idx, val ? "active" : "error")
                            }
                            disabled={isSaving}
                          />
                          <span className="text-gray-500 text-xs font-medium dark:text-white/40">
                            {(sw.status || "active") === "active" ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </div>
                      )}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemoveSoftware(idx)}
                        disabled={isSaving}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition-all hover:bg-red-500/20 dark:text-red-400"
                      >
                        <FiTrash2 className="text-sm" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <FieldLabel>Mã phần mềm (Software ID)</FieldLabel>
                      <TextInput
                        id={`sw-softwareId-${idx}`}
                        value={sw.softwareId || ""}
                        onChange={(v) => handleUpdateSoftware(idx, "softwareId", v)}
                        placeholder="Ví dụ: happycare_app"
                        disabled={isSaving}
                      />
                    </div>
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
                          handleUpdateSoftware(idx, "price", v as any)
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
                          {sw.serverConfig.map((cfg: SoftwareServerConfig, cfgIdx: number) => (
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
                                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 text-xs text-gray-800 transition-all outline-none hover:border-gray-300 hover:bg-white focus:border-indigo-500/50 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:border-white/15 dark:hover:bg-white/[0.06] dark:focus:border-indigo-400/50 dark:focus:bg-white/[0.06]"
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
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
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
        <aside className="flex flex-col gap-10 xl:sticky xl:top-6 xl:self-start xl:border-l xl:border-gray-200 xl:pl-8 dark:xl:border-white/[0.08]">
          {/* Chi phí và thanh toán */}
          <section className="border-b border-gray-200 pb-8 dark:border-white/[0.08]">
            <h2 className="mb-5 text-[13px] font-semibold text-gray-900 dark:text-white/85">
              {isEdit ? "Chi phí và thanh toán" : "Chi phí"}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel>Chi phí hàng năm (VND)</FieldLabel>
                <TextInput
                  id="yearly-cost"
                  value={yearlyCost}
                  onChange={setYearlyCost}
                  placeholder="Ví dụ: 12000000"
                  type="number"
                  disabled={isSaving}
                />
              </div>
              {isEdit && (
                <div>
                  <FieldLabel>Trạng thái thanh toán</FieldLabel>
                  <GlassSelect
                    value={oncePaymentStatus}
                    onChange={setOncePaymentStatus}
                    options={PAYMENT_STATUS_OPTIONS}
                    placeholder="Chọn trạng thái thanh toán"
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Lưu ý */}
          <section>
            <h2 className="mb-4 text-[13px] font-semibold text-gray-900 dark:text-white/85">
              {isEdit ? "Lưu ý khi chỉnh sửa bản quyền" : "Lưu ý khi tạo bản quyền"}
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
              className={`mt-6 flex items-center justify-center gap-2 rounded-lg border text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 ${
                isEdit
                  ? "h-9 w-fit border-indigo-300/20 bg-indigo-600 px-3.5 shadow-[0_6px_18px_rgba(79,70,229,0.16)] hover:border-indigo-200/30 hover:bg-indigo-500"
                  : "h-10 w-full border-transparent bg-indigo-600 px-4 shadow-[0_8px_24px_rgba(79,70,229,0.18)] hover:bg-indigo-500"
              }`}
            >
              {isSaving ? (
                <Spinner size="sm" />
              ) : (
                isEdit ? (
                  <FiSave className="text-xs" />
                ) : (
                  <FiPlus className="text-xs" />
                )
              )}
              {isEdit ? "Lưu thay đổi" : "Tạo ngay"}
            </motion.button>
          </section>
        </aside>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/90 p-3 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-[#090909]/90">
        <motion.button
          type="button"
          whileTap={{ scale: reduceMotion ? 1 : 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? <Spinner size="sm" /> : <FiSave className="text-sm" />}
          {isEdit ? "Lưu thay đổi" : "Tạo bản quyền"}
        </motion.button>
      </div>

      <ConfirmSoftwareStatusModal
        isOpen={statusConfirmOpen}
        softwareName={
          statusTargetIdx !== null && softwares[statusTargetIdx]
            ? softwares[statusTargetIdx].name || softwares[statusTargetIdx].softwareId || `Phần mềm #${statusTargetIdx + 1}`
            : ""
        }
        targetStatus={statusTargetVal || "error"}
        onClose={() => {
          setStatusConfirmOpen(false);
          setStatusTargetIdx(null);
          setStatusTargetVal(null);
        }}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
