import { type FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFolderPlus } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useCreateS3Folder } from "@/hooks/data/useS3Hooks";

type CreateS3FolderModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateS3FolderModal({
  open,
  onClose,
  onSuccess,
}: CreateS3FolderModalProps) {
  const createFolderMutation = useCreateS3Folder();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const folderName = name.trim();
  const folderDescription = description.trim();
  const canSubmit = folderName.length > 0 && !createFolderMutation.isPending;

  const nameError = useMemo(() => {
    if (!folderName) return "";
    if (folderName.length < 2) return "Tên thư mục cần tối thiểu 2 ký tự.";
    if (folderName.length > 80)
      return "Tên thư mục không được vượt quá 80 ký tự.";
    return "";
  }, [folderName]);

  const resetForm = () => {
    setName("");
    setDescription("");
    createFolderMutation.reset();
  };

  const handleClose = () => {
    if (createFolderMutation.isPending) return;
    resetForm();
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || nameError) return;

    createFolderMutation.mutate(
      {
        name: folderName,
        description: folderDescription,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            onSuccess?.();
            resetForm();
            onClose();
          }
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onSubmit={handleSubmit}
            className="dashboard-theme relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]"
          >
            <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                  Tạo thư mục lưu trữ
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Thêm thư mục mới để phân loại tập tin trên hệ thống.
                </p>
              </div>

              <button
                type="button"
                disabled={createFolderMutation.isPending}
                onClick={handleClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-50 p-4 dark:bg-indigo-500/10">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-black/30 dark:text-indigo-300">
                    <FiFolderPlus className="text-xl" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Thư mục sẽ xuất hiện ngay trong trang Lưu trữ.
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      Tên thư mục nên ngắn gọn, dễ nhận diện và không trùng mục
                      đích với các thư mục hiện có.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="s3-folder-name"
                  className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-white/40"
                >
                  Tên thư mục
                </label>
                <input
                  id="s3-folder-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={createFolderMutation.isPending}
                  maxLength={80}
                  autoFocus
                  placeholder="Ví dụ: Hồ sơ khách hàng"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 transition-all outline-none placeholder:text-gray-400 hover:border-gray-400 hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
                />
                {nameError ? (
                  <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
                    {nameError}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="s3-folder-description"
                  className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-white/40"
                >
                  Mô tả
                </label>
                <textarea
                  id="s3-folder-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={createFolderMutation.isPending}
                  rows={4}
                  placeholder="Mục đích sử dụng của thư mục"
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-all outline-none placeholder:text-gray-400 hover:border-gray-400 hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                disabled={createFolderMutation.isPending}
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Thoát
              </button>
              <button
                type="submit"
                disabled={!canSubmit || !!nameError}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 enabled:bg-indigo-600 enabled:hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none dark:shadow-indigo-500/10 dark:enabled:bg-indigo-500 dark:enabled:hover:bg-indigo-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
              >
                {createFolderMutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FiFolderPlus size={14} />
                    Tạo thư mục
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
