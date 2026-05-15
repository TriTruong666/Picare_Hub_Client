import type { ChangeEvent, RefObject, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiImage,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import {
  useDeleteHubClient,
  useHubClientDetail,
  useUpdateHubClient,
} from "@/hooks/data/useHubClientHooks";
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

    reader.onerror = () =>
      reject(reader.error ?? new Error("Đọc file thất bại"));
    reader.readAsDataURL(file);
  });
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-white/40 uppercase">
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
      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/25 transition-all outline-none focus:border-indigo-500/50 focus:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40"
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
      className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 transition-all outline-none focus:border-indigo-500/50 focus:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40"
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
                aspectRatio === "landscape"
                  ? "object-cover"
                  : "object-contain p-4"
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
          {fileName
            ? `Đã chọn: ${fileName}`
            : "Ảnh chỉ được upload khi bấm Lưu"}
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

export default function HubClientEditPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const {
    data: client,
    isLoading,
    isError,
  } = useHubClientDetail(clientId ?? "");

  const updateMutation = useUpdateHubClient();
  const deleteMutation = useDeleteHubClient();
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

  const revokeObjectUrl = (ref: RefObject<string | null>) => {
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
    objectUrlRef: RefObject<string | null>;
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
    objectUrlRef: RefObject<string | null>;
  }) => {
    revokeObjectUrl(objectUrlRef);
    setFile(null);
    setPreview("");
  };

  useEffect(() => {
    if (!client) return;

    revokeObjectUrl(logoObjectUrlRef);
    revokeObjectUrl(mockupObjectUrlRef);

    setClientName(client.clientName ?? "");
    setClientDescription(client.clientDescription ?? "");
    setClientInternalUrl(client.clientInternalUrl ?? "");
    setClientExternalUrl(client.clientExternalUrl ?? "");
    setClientLogoImage(client.clientLogoImage ?? "");
    setClientMockupImage(client.clientMockupImage ?? "");
    setLogoFile(null);
    setMockupFile(null);
    setClientStatus(client.clientStatus ?? "active");
    setAllowedRoles(client.allowedRoles ?? []);
    setNote(client.note ?? "");
  }, [client]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(logoObjectUrlRef);
      revokeObjectUrl(mockupObjectUrlRef);
    };
  }, []);

  const toggleRole = (role: HubClientRole) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const uploadImageIfNeeded = async (
    file: File | null,
    fallbackUrl: string,
    description: string,
  ) => {
    if (!file || !clientId) return fallbackUrl;

    const base64File = await fileToBase64(file);
    const response = await uploadMutation.mutateAsync({
      file: base64File,
      folder: HUB_CLIENT_IMAGE_FOLDER,
      clientId,
      description,
      visibility: "public",
    });

    if (!response.success || !response.data?.url) {
      throw new Error(response.message ?? "Upload ảnh thất bại");
    }

    return response.data.url;
  };

  const handleSave = async () => {
    if (!clientId || updateMutation.isPending || uploadMutation.isPending)
      return;

    try {
      const uploadedLogoUrl = await uploadImageIfNeeded(
        logoFile,
        clientLogoImage,
        `Hub client logo - ${clientId}`,
      );

      const uploadedMockupUrl = await uploadImageIfNeeded(
        mockupFile,
        clientMockupImage,
        `Hub client mockup - ${clientId}`,
      );

      const response = await updateMutation.mutateAsync({
        id: clientId,
        data: {
          clientId,
          clientName,
          clientDescription,
          clientInternalUrl,
          clientExternalUrl,
          clientLogoImage: uploadedLogoUrl,
          clientMockupImage: uploadedMockupUrl,
          clientStatus,
          allowedRoles,
          note,
        },
      });

      if (response.success) {
        navigate(PATHS.DASHBOARD.HUB_CLIENTS);
      }
    } catch {
      return;
    }
  };

  const handleDelete = () => {
    if (!clientId) return;
    if (!window.confirm("Bạn có chắc muốn xóa client này không?")) return;

    deleteMutation.mutate(clientId, {
      onSuccess: (res) => {
        if (res.success) navigate(PATHS.DASHBOARD.HUB_CLIENTS);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="page-layout dashboard-theme flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="page-layout dashboard-theme flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-400">Không tìm thấy client</p>
        <button
          onClick={() => navigate(PATHS.DASHBOARD.HUB_CLIENTS)}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition-all hover:bg-white/10"
        >
          <FiArrowLeft /> Quay lại
        </button>
      </div>
    );
  }

  const isSaving = updateMutation.isPending || uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-8 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Hub Clients", path: PATHS.DASHBOARD.HUB_CLIENTS },
            { label: client.clientName },
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
                Chỉnh sửa client
              </h1>
              <p className="mt-0.5 text-xs text-white/40">
                ID: {client.clientId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
            >
              {isDeleting ? (
                <Spinner size="sm" />
              ) : (
                <FiTrash2 className="text-sm" />
              )}
              Xóa client
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <Spinner size="sm" />
              ) : (
                <FiSave className="text-sm" />
              )}
              Lưu thay đổi
            </button>
          </div>
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
            <h2 className="mb-5 text-sm font-semibold text-white">
              Thông tin cơ bản
            </h2>
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
                  placeholder="Ghi chú dành cho nội bộ (không hiển thị ra ngoài)"
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
            <h2 className="mb-5 text-sm font-semibold text-white">
              Trạng thái
            </h2>
            <GlassSelect
              value={clientStatus}
              onChange={(val) => setClientStatus(val as HubClientStatus)}
              options={STATUS_OPTIONS}
              placeholder="Chọn trạng thái"
            />
          </section>

          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-1 text-sm font-semibold text-white">
              Roles được phép
            </h2>
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
            <h2 className="mb-4 text-sm font-semibold text-white">
              Thông tin hệ thống
            </h2>
            <div className="flex flex-col gap-2.5 text-xs text-white/40">
              <div className="flex justify-between">
                <span>Client ID</span>
                <span className="font-mono text-white/60">
                  {client.clientId.slice(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ngày tạo</span>
                <span>
                  {new Date(client.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cập nhật lần cuối</span>
                <span>
                  {new Date(client.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
