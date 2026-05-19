import type { ChangeEvent, DragEvent } from "react";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheckCircle,
  FiFile,
  FiUpload,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { formatFileSize } from "@/common/format";
import { Spinner } from "@/components/custom_ui/Spinner";
import { useUploadS3Asset } from "@/hooks/data/useS3Hooks";

type UploadFileStatus = "pending" | "uploading" | "success" | "error";

type QueuedUploadFile = {
  id: string;
  file: File;
  status: UploadFileStatus;
  message?: string;
};

type UploadS3AssetsModalProps = {
  open: boolean;
  folderName: string;
  onClose: () => void;
  onSuccess: () => void;
};

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Không thể đọc tệp tin"));
    };

    reader.onerror = () =>
      reject(reader.error ?? new Error("Đọc tệp tin thất bại"));
    reader.readAsDataURL(file);
  });
}

export default function UploadS3AssetsModal({
  open,
  folderName,
  onClose,
  onSuccess,
}: UploadS3AssetsModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadS3Asset({
    showSuccessToast: false,
    showErrorToast: false,
  });

  const [files, setFiles] = useState<QueuedUploadFile[]>([]);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isDragging, setIsDragging] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  const isUploading = files.some((item) => item.status === "uploading");
  const uploadableFiles = files.filter((item) => item.status !== "success");
  const successCount = files.filter((item) => item.status === "success").length;
  const totalSize = files.reduce((total, item) => total + item.file.size, 0);
  const canClose = !isUploading;

  const resetModal = () => {
    setFiles([]);
    setDescription("");
    setVisibility("public");
    setIsDragging(false);
    setHasUploaded(false);
  };

  const handleClose = () => {
    if (!canClose) return;
    resetModal();
    onClose();
  };

  const addFiles = (incomingFiles: File[]) => {
    if (isUploading) return;

    setFiles((prev) => {
      const existingKeys = new Set(
        prev.map(
          (item) =>
            `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
        ),
      );

      const nextFiles = incomingFiles
        .filter((file) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`;
          return !existingKeys.has(key);
        })
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          status: "pending" as UploadFileStatus,
        }));

      return [...prev, ...nextFiles];
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const removeFile = (fileId: string) => {
    if (isUploading) return;
    setFiles((prev) => prev.filter((item) => item.id !== fileId));
  };

  const updateFileStatus = (
    fileId: string,
    status: UploadFileStatus,
    message?: string,
  ) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === fileId ? { ...item, status, message } : item,
      ),
    );
  };

  const handleUpload = async () => {
    if (!folderName || uploadableFiles.length === 0 || isUploading) return;

    let uploadedAtLeastOne = false;

    for (const item of uploadableFiles) {
      updateFileStatus(item.id, "uploading");

      try {
        const base64File = await fileToBase64(item.file);
        const response = await uploadMutation.mutateAsync({
          file: base64File,
          folder: folderName,
          description: description.trim() || item.file.name,
          visibility,
        });

        if (!response.success) {
          updateFileStatus(
            item.id,
            "error",
            response.message || "Tải lên thất bại",
          );
          continue;
        }

        uploadedAtLeastOne = true;
        updateFileStatus(item.id, "success", "Đã tải lên");
      } catch (error) {
        updateFileStatus(
          item.id,
          "error",
          error instanceof Error ? error.message : "Tải lên thất bại",
        );
      }
    }

    if (uploadedAtLeastOne) {
      setHasUploaded(true);
      onSuccess();
    }
  };

  const renderStatus = (status: UploadFileStatus) => {
    if (status === "success") {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <FiCheckCircle /> Xong
        </span>
      );
    }

    if (status === "error") {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 dark:text-red-400">
          <FiXCircle /> Lỗi
        </span>
      );
    }

    if (status === "uploading") {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          <Spinner size="sm" /> Đang tải
        </span>
      );
    }

    return (
      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
        Chờ tải
      </span>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="dashboard-theme relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]"
          >
            <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Tải tệp lên thư mục
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Chọn các tệp cần tải lên thư mục hiện tại.
                </p>
              </div>

              <button
                type="button"
                disabled={!canClose}
                onClick={handleClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <FiUpload className="text-2xl" />
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Kéo thả tệp vào đây hoặc bấm để chọn
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Có thể chọn nhiều tệp cùng lúc.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-white/40">
                    Ghi chú
                  </label>
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    disabled={isUploading}
                    placeholder="Mô tả chung cho các tệp"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 transition-all outline-none placeholder:text-gray-400 hover:border-gray-400 hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-white/40">
                    Quyền truy cập
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(["public", "private"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={isUploading}
                        onClick={() => setVisibility(item)}
                        className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                          visibility === item
                            ? "border-indigo-500/40 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                        }`}
                      >
                        {item === "public" ? "Công khai" : "Riêng tư"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-xl border border-gray-300 dark:border-white/10">
                  <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {files.length} tệp đã chọn
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums dark:text-gray-400">
                      {successCount}/{files.length} hoàn tất ·{" "}
                      {formatFileSize(totalSize)}
                    </span>
                  </div>

                  <div className="max-h-56 divide-y divide-gray-200 overflow-y-auto dark:divide-white/10">
                    {files.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-transparent"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300">
                          <FiFile />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {item.file.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(item.file.size)}</span>
                            {item.message && <span>· {item.message}</span>}
                          </div>
                        </div>
                        {renderStatus(item.status)}
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => removeFile(item.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasUploaded && (
                <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Danh sách đã được cập nhật sau khi tải lên thành công.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                disabled={!canClose}
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {hasUploaded ? "Đóng" : "Thoát"}
              </button>

              <button
                type="button"
                disabled={
                  !folderName || uploadableFiles.length === 0 || isUploading
                }
                onClick={handleUpload}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 enabled:bg-indigo-600 enabled:hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none dark:shadow-indigo-500/10 dark:enabled:bg-indigo-500 dark:enabled:hover:bg-indigo-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
              >
                {isUploading ? (
                  <>
                    <Spinner size="sm" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <FiUpload size={14} />
                    {files.some((item) => item.status === "error")
                      ? "Thử lại tệp lỗi"
                      : "Tải lên"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
