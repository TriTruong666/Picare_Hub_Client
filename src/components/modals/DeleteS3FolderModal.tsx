import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useDeleteS3Folder } from "@/hooks/data/useS3Hooks";
import type { S3Folder } from "@/types/S3";

type DeleteS3FolderModalProps = {
  folder: S3Folder | null;
  onClose: () => void;
  onSuccess?: (deletedFolder: S3Folder) => void;
};

export default function DeleteS3FolderModal({
  folder,
  onClose,
  onSuccess,
}: DeleteS3FolderModalProps) {
  const deleteMutation = useDeleteS3Folder();

  const handleDeleteConfirm = () => {
    if (!folder) return;
    deleteMutation.mutate(folder.folderId, {
      onSuccess: (data) => {
        if (data.success) {
          onSuccess?.(folder);
          onClose();
        }
      },
    });
  };

  return (
    <AnimatePresence>
      {folder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleteMutation.isPending && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="dashboard-theme relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]"
          >
            <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Xóa thư mục
              </h2>

              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <FiAlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Bạn có chắc chắn muốn xóa thư mục này?
                </p>
                <p className="mt-2 break-all text-sm text-gray-500 dark:text-gray-400">
                  Thư mục{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {folder.name}
                  </span>{" "}
                  sẽ bị xóa vĩnh viễn và hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50 dark:bg-red-600 dark:shadow-red-500/10 dark:hover:bg-red-500"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={14} />
                    Xóa thư mục
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
