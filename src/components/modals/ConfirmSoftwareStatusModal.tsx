import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

type ConfirmSoftwareStatusModalProps = {
  isOpen: boolean;
  softwareName: string;
  targetStatus: "active" | "error";
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmSoftwareStatusModal({
  isOpen,
  softwareName,
  targetStatus,
  onClose,
  onConfirm,
}: ConfirmSoftwareStatusModalProps) {
  const isDisable = targetStatus === "error";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="dashboard-theme relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {isDisable ? "Tạm dừng phần mềm" : "Kích hoạt phần mềm"}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex gap-4 p-6">
              {isDisable ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <FiAlertTriangle size={24} />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-450">
                  <FiCheckCircle size={24} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {isDisable
                    ? `Xác nhận tạm dừng hoạt động phần mềm?`
                    : `Xác nhận kích hoạt lại phần mềm?`}
                </p>
                <p className="mt-2 text-sm text-gray-550 dark:text-gray-400 break-all">
                  {isDisable ? (
                    <>
                      Phần mềm{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {softwareName || "Không tên"}
                      </span>{" "}
                      sẽ bị chuyển sang trạng thái tạm dừng. Người dùng hoặc client kết nối qua domain này sẽ không thể truy cập dịch vụ cho đến khi được kích hoạt lại.
                    </>
                  ) : (
                    <>
                      Phần mềm{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {softwareName || "Không tên"}
                      </span>{" "}
                      sẽ hoạt động trở lại bình thường. Các cấu hình kết nối và quyền truy cập sẽ được khôi phục ngay lập tức.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95 ${
                  isDisable
                    ? "bg-amber-600 shadow-lg shadow-amber-500/25 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 dark:shadow-amber-500/10"
                    : "bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:shadow-emerald-500/10"
                }`}
              >
                {isDisable ? "Xác nhận tạm dừng" : "Xác nhận kích hoạt"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
