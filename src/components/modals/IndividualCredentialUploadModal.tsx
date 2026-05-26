import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiExternalLink,
  FiImage,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useUploadIndividualCredential } from "@/hooks/data/useContractHooks";
import { toast } from "@/hooks/useToast";
import type { IndividualCredential } from "@/types/Contract";

type CredentialSide = "front" | "back";

type SelectedImage = {
  file: File;
  previewUrl: string;
};

type IndividualCredentialUploadModalProps = {
  contractId: string;
  partnerToken?: string;
  credential?: IndividualCredential | null;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void | Promise<void>;
  onContinue?: () => void;
  forceUploadMode?: boolean;
  onForceUploadModeConsumed?: () => void;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function getCredentialFrontData(credential?: IndividualCredential | null) {
  return credential?.ocr?.first?.data?.[0] ?? null;
}

function getS3ViewUrl(key?: string | null) {
  if (!key) return "";
  const baseUrl = import.meta.env.VITE_HUB_API_URL || "";
  return `${baseUrl}/api/v1/s3/view/${key}`;
}

function CredentialInfoLine({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid gap-1 border-b border-white/8 py-3 sm:grid-cols-[140px_1fr] sm:gap-5">
      <dt className="text-[11px] font-medium text-white/35 uppercase">
        {label}
      </dt>
      <dd className="text-sm leading-6 text-white/82">{value || "-"}</dd>
    </div>
  );
}

function CredentialImageAction({
  label,
  s3Key,
}: {
  label: string;
  s3Key?: string | null;
}) {
  const viewUrl = getS3ViewUrl(s3Key);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3 last:border-b-0">
      <p className="text-sm text-white/72">{label}</p>
      <button
        type="button"
        disabled={!viewUrl}
        onClick={() => window.open(viewUrl, "_blank", "noopener,noreferrer")}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
      >
        <FiExternalLink size={13} />
        Xem ảnh
      </button>
    </div>
  );
}

function CredentialDropZone({
  label,
  description,
  image,
  disabled,
  onSelect,
  onRemove,
}: {
  label: string;
  description: string;
  image: SelectedImage | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file || disabled) return;

    if (!isImageFile(file)) {
      toast.error("File không hợp lệ", "Vui lòng chọn file ảnh.");
      return;
    }

    onSelect(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFile(event.dataTransfer.files?.[0]);
      }}
      className="group relative min-h-[210px] cursor-pointer overflow-hidden rounded-xl border border-dashed border-white/12 bg-white/[0.025] p-4 transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {image ? (
        <>
          <img
            src={image.previewUrl}
            alt={label}
            className="h-40 w-full rounded-lg object-cover"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{label}</p>
              <p className="truncate text-xs text-white/35">
                {image.file.name}
              </p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex h-full min-h-[178px] flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60">
            <FiUploadCloud size={22} />
          </div>
          <p className="mt-4 text-sm font-medium text-white">{label}</p>
          <p className="mt-1 max-w-[220px] text-xs leading-5 text-white/38">
            {description}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/55">
            <FiImage size={14} />
            Chọn hoặc kéo ảnh vào đây
          </span>
        </div>
      )}
    </div>
  );
}

export default function IndividualCredentialUploadModal({
  contractId,
  partnerToken,
  credential,
  isOpen,
  onClose,
  onUploaded,
  onContinue,
  forceUploadMode,
  onForceUploadModeConsumed,
}: IndividualCredentialUploadModalProps) {
  const uploadMutation = useUploadIndividualCredential();
  const [frontImage, setFrontImage] = useState<SelectedImage | null>(null);
  const [backImage, setBackImage] = useState<SelectedImage | null>(null);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
  const isUploading = uploadMutation.isPending;
  const hasCredential = Boolean(credential);
  const shouldShowCredentialInfo = hasCredential && !isUpdatingExisting;
  const frontOcr = getCredentialFrontData(credential);

  useEffect(() => {
    if (!isOpen || !forceUploadMode) return;
    setIsUpdatingExisting(true);
    onForceUploadModeConsumed?.();
  }, [forceUploadMode, isOpen, onForceUploadModeConsumed]);

  const setImage = (side: CredentialSide, file: File) => {
    const image = { file, previewUrl: URL.createObjectURL(file) };
    if (side === "front") setFrontImage(image);
    if (side === "back") setBackImage(image);
  };

  const removeImage = (side: CredentialSide) => {
    if (side === "front") setFrontImage(null);
    if (side === "back") setBackImage(null);
  };

  const resetUploadState = () => {
    setFrontImage(null);
    setBackImage(null);
    setIsUpdatingExisting(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    resetUploadState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!partnerToken) {
      toast.error("Thiếu token", "Đường dẫn ký không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (!frontImage || !backImage) {
      toast.error(
        "Thiếu ảnh CCCD",
        "Vui lòng tải lên đủ mặt trước và mặt sau.",
      );
      return;
    }

    const response = await uploadMutation.mutateAsync({
      contractId,
      partnerToken,
      data: {
        first_identification_image: frontImage.file,
        second_identification_image: backImage.file,
      },
    });

    if (response.success) {
      await onUploaded?.();
      setFrontImage(null);
      setBackImage(null);
      setIsUpdatingExisting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.12 }}
            className="dashboard-theme relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
          >
            <div className="flex items-start justify-between gap-5 border-b border-white/10 bg-white/[0.04] px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Xác thực danh tính
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  {hasCredential
                    ? "Thông tin đã được nhận diện từ CMND/CCCD đã tải lên."
                    : "Vui lòng tải lên mặt trước và mặt sau CMND/CCCD."}
                </p>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleClose}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {shouldShowCredentialInfo ? (
              <div className="space-y-2 p-6">
                <dl>
                  <CredentialInfoLine
                    label="Số CCCD"
                    value={credential?.credentialId || frontOcr?.id}
                  />
                  <CredentialInfoLine
                    label="Họ và tên"
                    value={credential?.name || frontOcr?.name}
                  />
                  <CredentialInfoLine
                    label="Ngày sinh"
                    value={credential?.dob || frontOcr?.dob}
                  />
                  <CredentialInfoLine
                    label="Giới tính"
                    value={credential?.sex || frontOcr?.sex}
                  />
                  <CredentialInfoLine
                    label="Địa chỉ"
                    value={credential?.address || frontOcr?.address}
                  />
                  <CredentialInfoLine
                    label="Quê quán"
                    value={credential?.home || frontOcr?.home}
                  />
                </dl>

                <div className="border-white/10">
                  <CredentialImageAction
                    label="Mặt trước CCCD"
                    s3Key={credential?.first_identification_image_key}
                  />
                  <CredentialImageAction
                    label="Mặt sau CCCD"
                    s3Key={credential?.second_identification_image_key}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <CredentialDropZone
                  label="Mặt trước CCCD"
                  description="Ảnh rõ số CCCD, họ tên và ngày sinh."
                  image={frontImage}
                  disabled={isUploading}
                  onSelect={(file) => setImage("front", file)}
                  onRemove={() => removeImage("front")}
                />
                <CredentialDropZone
                  label="Mặt sau CCCD"
                  description="Ảnh rõ ngày cấp, nơi cấp và mã bảo mật."
                  image={backImage}
                  disabled={isUploading}
                  onSelect={(file) => setImage("back", file)}
                  onRemove={() => removeImage("back")}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.04] p-6">
              <button
                type="button"
                disabled={isUploading}
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                {hasCredential ? "Đóng" : "Hủy"}
              </button>
              {shouldShowCredentialInfo ? (
                <>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setIsUpdatingExisting(true)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    Upload lại
                  </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={onContinue}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  Tiếp theo
                </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {isUploading ? <Spinner size="sm" color="black" /> : null}
                  Tiếp tục
                </button>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
