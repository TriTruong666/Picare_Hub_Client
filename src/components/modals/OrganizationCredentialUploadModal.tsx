import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiFileText,
  FiImage,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useUploadOrganizationCredential } from "@/hooks/data/useContractHooks";
import { toast } from "@/hooks/useToast";
import type { Contract } from "@/types/Contract";

type SelectedFile = {
  file: File;
  previewUrl: string;
};

type OrganizationCredentialUploadModalProps = {
  contractId: string;
  partnerToken?: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => Contract | undefined | Promise<Contract | undefined>;
  onContinue?: (contract?: Contract) => void;
};

type UploadKind = "pdf" | "image" | "any";

function isPdfFile(file: File) {
  return file.type === "application/pdf";
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function validateFileKind(file: File, kind: UploadKind) {
  if (kind === "pdf") return isPdfFile(file);
  if (kind === "image") return isImageFile(file);
  return true;
}

function FileUploadCard({
  label,
  description,
  file,
  kind,
  icon,
  placeholderLabel,
  disabled,
  onSelect,
  onRemove,
}: {
  label: string;
  description: string;
  file: SelectedFile | null;
  kind: UploadKind;
  icon: React.ReactNode;
  placeholderLabel: string;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const accept =
    kind === "pdf"
      ? "application/pdf"
      : kind === "image"
        ? "image/*"
        : "image/*,application/pdf";

  const handleFile = (nextFile?: File) => {
    if (!nextFile || disabled) return;

    if (!validateFileKind(nextFile, kind)) {
      toast.error(
        "File không hợp lệ",
        kind === "pdf" ? "Vui lòng chọn file PDF." : "Vui lòng chọn file ảnh.",
      );
      return;
    }

    onSelect(nextFile);
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
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {file ? (
        <>
          {kind === "pdf" ? (
            <div className="flex h-40 w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <div className="text-center">
                <FiFileText className="mx-auto text-4xl text-white/75" />
                <p className="mt-3 text-sm font-medium text-white">
                  {file.file.name}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  PDF đã sẵn sàng tải lên
                </p>
              </div>
            </div>
          ) : (
            <img
              src={file.previewUrl}
              alt={label}
              className="h-40 w-full rounded-lg object-cover"
            />
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{label}</p>
              <p className="truncate text-xs text-white/35">
                {file.file.name}
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
            {icon}
          </div>
          <p className="mt-4 text-sm font-medium text-white">{label}</p>
          <p className="mt-1 max-w-[240px] text-xs leading-5 text-white/38">
            {description}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/55">
            <FiUpload size={14} />
            {placeholderLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export default function OrganizationCredentialUploadModal({
  contractId,
  partnerToken,
  isOpen,
  onClose,
  onUploaded,
  onContinue,
}: OrganizationCredentialUploadModalProps) {
  const uploadOrganizationMutation = useUploadOrganizationCredential({
    showSuccessToast: false,
  });
  const [businessLicenseFile, setBusinessLicenseFile] =
    useState<SelectedFile | null>(null);
  const [authorityFile, setAuthorityFile] = useState<SelectedFile | null>(null);

  const isSubmitting = uploadOrganizationMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setBusinessLicenseFile(null);
    setAuthorityFile(null);
  }, [isOpen]);

  const setFileState = (
    setter: Dispatch<SetStateAction<SelectedFile | null>>,
    file: File,
  ) => {
    setter((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return { file, previewUrl: URL.createObjectURL(file) };
    });
  };

  const clearFileState = (
    setter: Dispatch<SetStateAction<SelectedFile | null>>,
    current: SelectedFile | null,
  ) => {
    if (current?.previewUrl) {
      URL.revokeObjectURL(current.previewUrl);
    }
    setter(null);
  };

  useEffect(() => {
    return () => {
      if (businessLicenseFile?.previewUrl) {
        URL.revokeObjectURL(businessLicenseFile.previewUrl);
      }
      if (authorityFile?.previewUrl) {
        URL.revokeObjectURL(authorityFile.previewUrl);
      }
    };
  }, [authorityFile?.previewUrl, businessLicenseFile?.previewUrl]);

  const handleClose = () => {
    if (isSubmitting) return;
    clearFileState(setBusinessLicenseFile, businessLicenseFile);
    clearFileState(setAuthorityFile, authorityFile);
    onClose();
  };

  const handleSubmit = async () => {
    if (!partnerToken) {
      toast.error("Thiếu token", "Đường dẫn ký không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (!businessLicenseFile) {
      toast.error("Thiếu giấy phép", "Vui lòng upload file PDF giấy phép kinh doanh.");
      return;
    }

    const response = await uploadOrganizationMutation.mutateAsync({
      contractId,
      partnerToken,
      data: {
        business_license: businessLicenseFile.file,
        power_of_attorney_image: authorityFile?.file ?? null,
      },
    });

    if (response.success) {
      const refreshedContract = await onUploaded?.();
      clearFileState(setBusinessLicenseFile, businessLicenseFile);
      clearFileState(setAuthorityFile, authorityFile);
      onContinue?.(refreshedContract);
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
            className="dashboard-theme contract-surface relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border"
          >
            <div className="flex items-start justify-between gap-5 border-b border-white/10 bg-white/[0.04] px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Xác thực tổ chức
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Upload giấy phép kinh doanh bằng PDF, giấy uỷ quyền là tùy
                  chọn nếu người ký không phải đại diện pháp luật.
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <FileUploadCard
                  label="Giấy phép kinh doanh"
                  description="Bắt buộc. Vui lòng upload file PDF giấy phép kinh doanh."
                  file={businessLicenseFile}
                  kind="pdf"
                  icon={<FiFileText size={22} />}
                  placeholderLabel="Chọn file PDF"
                  disabled={isSubmitting}
                  onSelect={(file) =>
                    setFileState(setBusinessLicenseFile, file)
                  }
                  onRemove={() =>
                    clearFileState(setBusinessLicenseFile, businessLicenseFile)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <FileUploadCard
                  label="Giấy uỷ quyền"
                  description="Tùy chọn. Dành cho trường hợp người ký được ủy quyền."
                  file={authorityFile}
                  kind="any"
                  icon={<FiImage size={22} />}
                  placeholderLabel="Chọn file ảnh hoặc PDF"
                  disabled={isSubmitting}
                  onSelect={(file) => setFileState(setAuthorityFile, file)}
                  onRemove={() => clearFileState(setAuthorityFile, authorityFile)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.04] p-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {isSubmitting ? <Spinner size="sm" color="black" /> : null}
                Tiếp theo
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
