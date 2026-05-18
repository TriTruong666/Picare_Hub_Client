import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";
import { Spinner } from "@/components/custom_ui/Spinner";
import { useDeleteS3Object } from "@/hooks/data/useS3Hooks";
import type { S3Asset } from "@/types/S3";

type DeleteS3AssetModalProps = {
  asset: S3Asset | null;
  onClose: () => void;
  onSuccess?: (deletedAsset: S3Asset) => void;
};

export default function DeleteS3AssetModal({
  asset,
  onClose,
  onSuccess,
}: DeleteS3AssetModalProps) {
  const deleteMutation = useDeleteS3Object();

  const handleDeleteConfirm = () => {
    if (!asset) return;
    deleteMutation.mutate(asset.s3Key, {
      onSuccess: (data) => {
        if (data.success) {
          onSuccess?.(asset);
          onClose();
        }
      },
    });
  };

  return (
    <AnimatePresence>
      {asset && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleteMutation.isPending && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-300 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-neutral-900"
          >
            <button
              type="button"
              onClick={() => !deleteMutation.isPending && onClose()}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <FiX size={16} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <FiAlertTriangle size={24} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Xóa tệp tin
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Bạn có chắc chắn muốn xóa tệp tin{" "}
                <span className="font-semibold text-gray-900 dark:text-white break-all">
                  {asset.originalName}
                </span>
                ? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-500"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={12} />
                    Xóa tệp
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
