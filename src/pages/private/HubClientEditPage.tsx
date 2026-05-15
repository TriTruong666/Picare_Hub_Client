import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiImage, FiLink, FiSave, FiTrash2, FiX } from "react-icons/fi";

import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { Spinner } from "@/components/custom_ui/Spinner";
import GlassSelect from "@/components/custom_ui/Select";
import { useHubClientDetail } from "@/hooks/data/useHubClientHooks";
import {
  useUpdateHubClient,
  useDeleteHubClient,
} from "@/hooks/data/useHubClientHooks";
import { PATHS } from "@/config/paths";
import type { HubClientRole, HubClientStatus } from "@/types/HubClient";

// ──────────────────────────────────────────────
const ALL_ROLES: { value: HubClientRole; label: string }[] = [
  { value: "admin", label: "Quản trị viên" },
  { value: "ecom_staff", label: "Ecom Staff" },
  { value: "ecom_lead", label: "Ecom Leader" },
  { value: "logistics", label: "Vận hành" },
  { value: "warehouse", label: "Kho" },
];

const STATUS_OPTIONS: { value: HubClientStatus; label: string }[] = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
];

// ──────────────────────────────────────────────
// Form field helper
// ──────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
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
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/8 resize-none"
    />
  );
}

// ──────────────────────────────────────────────
// Image Upload Field
// ──────────────────────────────────────────────
function ImageUploadField({
  id,
  label,
  value,
  onChange,
  aspectRatio = "square",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspectRatio?: "square" | "landscape";
}) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // sync external value changes
  useEffect(() => {
    setInputVal(value);
    setImgError(false);
  }, [value]);

  const handleConfirm = () => {
    onChange(inputVal.trim());
    setShowUrlInput(false);
    setImgError(false);
  };

  const handleClear = () => {
    onChange("");
    setInputVal("");
    setImgError(false);
  };

  const hasImage = !!value && !imgError;
  const previewH = aspectRatio === "landscape" ? "h-44" : "h-40";

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      {/* Preview zone */}
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
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                <FiLink className="text-xs" />
                Đổi URL
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur transition hover:bg-red-500/20"
              >
                <FiX className="text-xs" />
                Xóa
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/25 transition-colors hover:text-white/40"
          >
            <FiImage className="text-3xl" />
            <span className="text-xs font-medium">Nhập URL hình ảnh</span>
          </button>
        )}
      </div>

      {/* URL input panel */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex gap-2">
              <input
                ref={inputRef}
                id={id}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder="https://example.com/image.png"
                className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/50"
              />
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10"
              >
                Hủy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientDescription, setClientDescription] = useState("");
  const [clientInternalUrl, setClientInternalUrl] = useState("");
  const [clientExternalUrl, setClientExternalUrl] = useState("");
  const [clientLogoImage, setClientLogoImage] = useState("");
  const [clientMockupImage, setClientMockupImage] = useState("");
  const [clientStatus, setClientStatus] = useState<HubClientStatus>("active");
  const [allowedRoles, setAllowedRoles] = useState<HubClientRole[]>([]);
  const [note, setNote] = useState("");

  // Pre-fill form when client data is loaded
  useEffect(() => {
    if (!client) return;
    setClientName(client.clientName ?? "");
    setClientDescription(client.clientDescription ?? "");
    setClientInternalUrl(client.clientInternalUrl ?? "");
    setClientExternalUrl(client.clientExternalUrl ?? "");
    setClientLogoImage(client.clientLogoImage ?? "");
    setClientMockupImage(client.clientMockupImage ?? "");
    setClientStatus(client.clientStatus ?? "active");
    setAllowedRoles(client.allowedRoles ?? []);
    setNote(client.note ?? "");
  }, [client]);

  const toggleRole = (role: HubClientRole) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSave = () => {
    if (!clientId) return;
    updateMutation.mutate(
      {
        id: clientId,
        data: {
          clientId,
          clientName,
          clientDescription,
          clientInternalUrl,
          clientExternalUrl,
          clientLogoImage,
          clientMockupImage,
          clientStatus,
          allowedRoles,
          note,
        },
      },
      {
        onSuccess: (res) => {
          if (res.success) navigate(PATHS.DASHBOARD.HUB_CLIENTS);
        },
      },
    );
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

  // ── Loading / Error ──────────────────────────
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

  const isSaving = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // ── Render ───────────────────────────────────
  return (
    <div className="page-layout dashboard-theme">
      {/* Header */}
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
              disabled={isDeleting}
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
              {isSaving ? <Spinner size="sm" /> : <FiSave className="text-sm" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Left col — main info */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Basic info */}
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
                />
              </div>
            </div>
          </section>

          {/* URLs */}
          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-5 text-sm font-semibold text-white">
              Đường dẫn
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel>URL nội bộ</FieldLabel>
                <TextInput
                  id="client-internal-url"
                  value={clientInternalUrl}
                  onChange={setClientInternalUrl}
                  placeholder="http://internal.example.com"
                />
              </div>
              <div>
                <FieldLabel>URL bên ngoài</FieldLabel>
                <TextInput
                  id="client-external-url"
                  value={clientExternalUrl}
                  onChange={setClientExternalUrl}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-white/5 bg-white/3 p-6">
            <h2 className="mb-5 text-sm font-semibold text-white">Hình ảnh</h2>
            <div className="flex flex-col gap-6">
              <ImageUploadField
                id="client-logo-image"
                label="Logo"
                value={clientLogoImage}
                onChange={setClientLogoImage}
                aspectRatio="square"
              />
              <ImageUploadField
                id="client-mockup-image"
                label="Mockup"
                value={clientMockupImage}
                onChange={setClientMockupImage}
                aspectRatio="landscape"
              />
            </div>
          </section>
        </div>

        {/* Right col — settings */}
        <div className="flex flex-col gap-5">
          {/* Status */}
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

          {/* Roles */}
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
                    className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-xs font-medium transition-all ${
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

          {/* Meta */}
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
                <span>{new Date(client.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Cập nhật lần cuối</span>
                <span>{new Date(client.updatedAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
