import type { ChangeEvent, MutableRefObject, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiImage, FiPlus, FiSave, FiUpload, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { useCreateHubClient } from "@/hooks/data/useHubClientHooks";
import { useUploadS3Asset } from "@/hooks/data/useS3Hooks";
import type { HubClientRole, HubClientStatus } from "@/types/HubClient";

const HUB_CLIENT_IMAGE_FOLDER = "public";

const ALL_ROLES: { value: HubClientRole; label: string }[] = [
  { value: "admin", label: "Quản trị viên" },
  { value: "ecom_staff", label: "Ecom Staff" },
  { value: "ecom_lead", label: "Ecom Leader" },
  { value: "logistics", label: "Vận hành" },
  { value: "warehouse", label: "Kho" },
  { value: "sale_lead", label: "Sale Leader" },
  { value: "sale_staff", label: "Sale Staff" },
  { value: "marketing", label: "Marketing" },
];

const STATUS_OPTIONS: { value: HubClientStatus; label: string }[] = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
];

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Không thể đọc file ảnh"));
    };

    reader.onerror = () => reject(reader.error ?? new Error("Đọc file thất bại"));
    reader.readAsDataURL(file);
  });
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
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
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40"
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
      className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

function ImageUploadField({
  id,
  label,
  value,
  fileName,
  onSelectFile,
  onClear,
  aspectRatio = "square",
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  fileName?: string | null;
  onSelectFile: (file: File) => void;
  onClear: () => void;
  aspectRatio?: "square" | "landscape";
  disabled?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImgError(false);
  }, [value]);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onSelectFile(file);
  };

  const hasImage = !!value && !imgError;
  const previewH = aspectRatio === "landscape" ? "h-44" : "h-40";

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        className={`group relative w-full overflow-hidden rounded-xl border transition-all duration-200 ${
          hasImage
            ? "border-white/10 bg-white/5"
            : "border-dashed border-white/10 bg-white/3 hover:border-white/20"
        } ${previewH}`}
      >
        {hasImage ? (
          <>
            <img
              src={value}
              alt={label}
              className={`h-full w-full ${
                aspectRatio === "landscape" ? "object-cover" : "object-contain p-4"
              }`}
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiUpload className="text-xs" />
                Đổi ảnh
              </button>
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiX className="text-xs" />
                Xóa
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/25 transition-colors hover:text-white/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiImage className="text-3xl" />
            <span className="text-xs font-medium">Chọn file ảnh</span>
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-white/35">
        <span className="truncate">
          {fileName ? `Đã chọn: ${fileName}` : "Ảnh chỉ được upload khi bấm Lưu"}
        </span>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="shrink-0 text-white/55 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {hasImage ? "Chọn ảnh khác" : "Chọn ảnh"}
        </button>
      </div>
    </div>
  );
}

export default function HubClientCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateHubClient();
  const uploadMutation = useUploadS3Asset({ showSuccessToast: false });

  const logoObjectUrlRef = useRef<string | null>(null);
  const mockupObjectUrlRef = useRef<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientDescription, setClientDescription] = useState("");
  const [clientInternalUrl, setClientInternalUrl] = useState("");
  const [clientExternalUrl, setClientExternalUrl] = useState("");
  const [clientLogoImage, setClientLogoImage] = useState("");
  const [clientMockupImage, setClientMockupImage] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [mockupFile, setMockupFile] = useState<File | null>(null);
  const [clientStatus, setClientStatus] = useState<HubClientStatus>("active");
  const [allowedRoles, setAllowedRoles] = useState<HubClientRole[]>([]);
  const [note, setNote] = useState("");

  const revokeObjectUrl = (ref: MutableRefObject<string | null>) => {
    if (!ref.current) return;
    URL.revokeObjectURL(ref.current);
    ref.current = null;
  };

  const setImageState = ({
    file,
    setFile,
    setPreview,
    objectUrlRef,
  }: {
    file: File;
    setFile: (next: File | null) => void;
    setPreview: (next: string) => void;
    objectUrlRef: MutableRefObject<string | null>;
  }) => {
    revokeObjectUrl(objectUrlRef);
    objectUrlRef.current = URL.createObjectURL(file);
    setFile(file);
    setPreview(objectUrlRef.current);
  };

  const clearImageState = ({
    setFile,
    setPreview,
    objectUrlRef,
  }: {
    setFile: (next: File | null) => void;
    setPreview: (next: string) => void;
    objectUrlRef: MutableRefObject<string | null>;
  }) => {
    revokeObjectUrl(objectUrlRef);
    setFile(null);
    setPreview("");
  };

  useEffect(() => {
    return () => {
      revokeObjectUrl(logoObjectUrlRef);
      revokeObjectUrl(mockupObjectUrlRef);
    };
  }, []);

  const toggleRole = (role: HubClientRole) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role],
    );
  };

  const uploadImageIfNeeded = async (file: File | null, description: string) => {
    if (!file) return "";

    const base64File = await fileToBase64(file);
    const response = await uploadMutation.mutateAsync({
      file: base64File,
      folder: HUB_CLIENT_IMAGE_FOLDER,
      description,
      visibility: "public",
    });

    if (!response.success || !response.data?.url) {
      throw new Error(response.message ?? "Upload ảnh thất bại");
    }

    return response.data.url;
  };

  const handleSave = async () => {
    if (createMutation.isPending || uploadMutation.isPending) return;

    try {
      const uploadedLogoUrl = await uploadImageIfNeeded(
        logoFile,
        `Hub client logo - ${clientName || "new-client"}`,
      );
      const uploadedMockupUrl = await uploadImageIfNeeded(
        mockupFile,
        `Hub client mockup - ${clientName || "new-client"}`,
      );

      const response = await createMutation.mutateAsync({
        clientName,
        clientDescription,
        clientInternalUrl,
        clientExternalUrl,
        clientLogoImage: uploadedLogoUrl,
        clientMockupImage: uploadedMockupUrl,
        clientStatus,
        allowedRoles,
        note,
      });

      if (response.success) {
        navigate(PATHS.DASHBOARD.HUB_CLIENTS);
      }
    } catch {
      return;
    }
  };

  const isSaving = createMutation.isPending || uploadMutation.isPending;

  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-8 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Hub Clients", path: PATHS.DASHBOARD.HUB_CLIENTS },
            { label: "Thêm client" },
          ]}
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(PATHS.DASHBOARD.HUB_CLIENTS)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <FiArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Thêm client mới
              </h1>
              <p className="mt-0.5 text-xs text-white/40">
                Tạo client và chỉ upload ảnh khi bấm lưu
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Spinner size="sm" /> : <FiSave className="text-sm" />}
            Tạo client
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-5 text-sm font-semibold text-white">Thông tin cơ bản</h2>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel>Tên client</FieldLabel>
                <TextInput
                  id="client-name"
                  value={clientName}
                  onChange={setClientName}
                  placeholder="Tên hiển thị của client"
                  disabled={isSaving}
                />
              </div>
              <div>
                <FieldLabel>Mô tả</FieldLabel>
                <TextareaInput
                  id="client-description"
                  value={clientDescription}
                  onChange={setClientDescription}
                  placeholder="Mô tả ngắn về client này..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              <div>
                <FieldLabel>Ghi chú nội bộ</FieldLabel>
                <TextareaInput
                  id="client-note"
                  value={note}
                  onChange={setNote}
                  placeholder="Ghi chú dành cho nội bộ"
                  rows={2}
                  disabled={isSaving}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-5 text-sm font-semibold text-white">Đường dẫn</h2>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel>URL nội bộ</FieldLabel>
                <TextInput
                  id="client-internal-url"
                  value={clientInternalUrl}
                  onChange={setClientInternalUrl}
                  placeholder="http://internal.example.com"
                  disabled={isSaving}
                />
              </div>
              <div>
                <FieldLabel>URL bên ngoài</FieldLabel>
                <TextInput
                  id="client-external-url"
                  value={clientExternalUrl}
                  onChange={setClientExternalUrl}
                  placeholder="https://example.com"
                  disabled={isSaving}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-5 text-sm font-semibold text-white">Hình ảnh</h2>
            <div className="flex flex-col gap-6">
              <ImageUploadField
                id="client-logo-image"
                label="Logo"
                value={clientLogoImage}
                fileName={logoFile?.name}
                onSelectFile={(file) =>
                  setImageState({
                    file,
                    setFile: setLogoFile,
                    setPreview: setClientLogoImage,
                    objectUrlRef: logoObjectUrlRef,
                  })
                }
                onClear={() =>
                  clearImageState({
                    setFile: setLogoFile,
                    setPreview: setClientLogoImage,
                    objectUrlRef: logoObjectUrlRef,
                  })
                }
                aspectRatio="square"
                disabled={isSaving}
              />
              <ImageUploadField
                id="client-mockup-image"
                label="Mockup"
                value={clientMockupImage}
                fileName={mockupFile?.name}
                onSelectFile={(file) =>
                  setImageState({
                    file,
                    setFile: setMockupFile,
                    setPreview: setClientMockupImage,
                    objectUrlRef: mockupObjectUrlRef,
                  })
                }
                onClear={() =>
                  clearImageState({
                    setFile: setMockupFile,
                    setPreview: setClientMockupImage,
                    objectUrlRef: mockupObjectUrlRef,
                  })
                }
                aspectRatio="landscape"
                disabled={isSaving}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-5 text-sm font-semibold text-white">Trạng thái</h2>
            <GlassSelect
              value={clientStatus}
              onChange={(val) => setClientStatus(val as HubClientStatus)}
              options={STATUS_OPTIONS}
              placeholder="Chọn trạng thái"
            />
          </section>

          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-1 text-sm font-semibold text-white">Roles được phép</h2>
            <p className="mb-4 text-[11px] text-white/30">
              Chọn các vai trò có thể truy cập client này
            </p>
            <div className="flex flex-col gap-2">
              {ALL_ROLES.map((role) => {
                const active = allowedRoles.includes(role.value);
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    disabled={isSaving}
                    className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-xs font-medium transition-all disabled:opacity-50 ${
                      active
                        ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                        : "border-white/5 bg-white/3 text-white/50 hover:border-white/10 hover:bg-white/5 hover:text-white/70"
                    }`}
                  >
                    {role.label}
                    <span
                      className={`h-2 w-2 rounded-full ${active ? "bg-indigo-400" : "bg-white/10"}`}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-4 text-sm font-semibold text-white">Lưu ý</h2>
            <div className="space-y-3 text-xs text-white/40">
              <p>Ảnh logo và mockup sẽ chỉ được upload khi bạn bấm tạo client.</p>
              <p>Nếu không chọn ảnh, payload tạo mới sẽ gửi chuỗi rỗng cho 2 field ảnh.</p>
              <p>Hãy kiểm tra URL nội bộ và URL bên ngoài trước khi lưu.</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="mt-5 flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 disabled:opacity-50"
            >
              {isSaving ? <Spinner size="sm" /> : <FiPlus className="text-sm" />}
              Tạo ngay
            </button>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
