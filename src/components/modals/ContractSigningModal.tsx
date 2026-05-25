import type { FormEvent } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiPenTool,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import {
  useCreateSigningSession,
  usePublishDraftContract,
} from "@/hooks/data/useContractHooks";
import { useCheckLocalSigningService } from "@/hooks/data/useLocalSignHooks";
import { toast } from "@/hooks/useToast";
import type { Contract } from "@/types/Contract";

type ContractSigningModalProps = {
  contract: Contract | null;
  onClose: () => void;
};

type ContractSigningFormProps = {
  contract: Contract;
  onClose: () => void;
};

const LOCAL_SIGN_APP_DOWNLOAD_URL =
  "https://drive.google.com/file/d/1Oed-YQl0OAwKlj72ffynibC_cqMpdCuU/view?usp=sharing";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ContractSigningForm({ contract, onClose }: ContractSigningFormProps) {
  const checkLocalSigningMutation = useCheckLocalSigningService();
  const publishDraftMutation = usePublishDraftContract();
  const signingSessionMutation = useCreateSigningSession();

  const [signerName, setSignerName] = useState(
    contract.ownerCompanyInfo.ownerName || "",
  );
  const [signerEmail, setSignerEmail] = useState(
    contract.ownerCompanyInfo.email || "",
  );
  const [showLocalAppGuide, setShowLocalAppGuide] = useState(false);

  const isSubmitting =
    checkLocalSigningMutation.isPending ||
    publishDraftMutation.isPending || signingSessionMutation.isPending;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedName = signerName.trim();
    const normalizedEmail = signerEmail.trim();

    if (!normalizedName) {
      toast.error("Thiếu tên người ký", "Vui lòng nhập họ tên người ký.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Email không hợp lệ", "Vui lòng nhập email người ký hợp lệ.");
      return;
    }

    try {
      const healthResponse = await checkLocalSigningMutation.mutateAsync();

      if (!healthResponse.success || !healthResponse.data?.ok) {
        setShowLocalAppGuide(true);
        return;
      }

      setShowLocalAppGuide(false);
    } catch {
      setShowLocalAppGuide(true);
      return;
    }

    const publishResponse = await publishDraftMutation.mutateAsync(
      contract.contractId,
    );

    if (!publishResponse.success) {
      return;
    }

    const sessionResponse = await signingSessionMutation.mutateAsync({
      contractId: contract.contractId,
      data: {
        signerType: "owner",
        signerEmail: normalizedEmail,
        signerName: normalizedName,
      },
    });

    const localSignUrl = sessionResponse.data?.localSignUrl;
    if (sessionResponse.success && localSignUrl) {
      window.location.assign(localSignUrl);
      return;
    }

    if (sessionResponse.success && !localSignUrl) {
      toast.error(
        "Thiếu đường dẫn ký",
        "Phiên ký đã được tạo nhưng không có đường dẫn ký cục bộ.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
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
        className="dashboard-theme relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] p-6">
          <div>
            <h2 className="text-base font-semibold text-white">Ký hợp đồng</h2>
            <p className="mt-1 text-xs text-white/45">
              Nhập thông tin người ký để tạo phiên ký hợp đồng.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Họ tên người ký
            </label>
            <input
              value={signerName}
              onChange={(event) => setSignerName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Nguyễn Văn A"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm text-white transition-all outline-none placeholder:text-white/25 hover:border-white/20 hover:bg-white/[0.08] focus:border-indigo-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Email người ký
            </label>
            <input
              type="email"
              value={signerEmail}
              onChange={(event) => setSignerEmail(event.target.value)}
              disabled={isSubmitting}
              placeholder="email@congty.com"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm text-white transition-all outline-none placeholder:text-white/25 hover:border-white/20 hover:bg-white/[0.08] focus:border-indigo-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>

          {showLocalAppGuide && (
            <div className="overflow-hidden rounded-xl border border-amber-300/20 bg-amber-300/8">
              <div className="border-b border-amber-300/15 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-300/10 text-amber-100">
                    <FiAlertTriangle />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-amber-50">
                      Chưa kết nối được ứng dụng ký số
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
                      Vui lòng cài đặt hoặc mở ứng dụng ký số local trên máy này
                      trước khi xác nhận ký hợp đồng.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-4 py-4">
                {[
                  "Tải và cài đặt ứng dụng ký số local.",
                  "Mở ứng dụng sau khi cài đặt và giữ ứng dụng đang chạy.",
                  "Quay lại màn hình này rồi bấm kiểm tra lại hoặc xác nhận ký.",
                ].map((step, index) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs leading-relaxed text-white/70">
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 border-t border-amber-300/15 bg-black/10 px-4 py-3 sm:flex-row">
                <a
                  href={LOCAL_SIGN_APP_DOWNLOAD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-amber-300 px-3 py-2 text-xs font-semibold text-neutral-950 transition-all hover:bg-amber-200 active:scale-95"
                >
                  <FiDownload size={14} />
                  Tải ứng dụng
                </a>
                <button
                  type="button"
                  disabled={checkLocalSigningMutation.isPending}
                  onClick={async () => {
                    try {
                      const healthResponse =
                        await checkLocalSigningMutation.mutateAsync();
                      setShowLocalAppGuide(
                        !healthResponse.success || !healthResponse.data?.ok,
                      );
                    } catch {
                      setShowLocalAppGuide(true);
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkLocalSigningMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <FiRefreshCw size={14} />
                  )}
                  Kiểm tra lại
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-lg border border-amber-300/15 bg-amber-300/8 px-3 py-2 text-xs font-medium text-amber-100">
            <FiCheckCircle className="shrink-0 text-amber-200/80" />
            <span>
              Sau khi xác nhận ký, hợp đồng sẽ được xuất bản và không thể chỉnh
              sửa.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.04] p-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                Đang xử lý...
              </>
            ) : (
              <>
                <FiPenTool size={14} />
                Xác nhận ký
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default function ContractSigningModal({
  contract,
  onClose,
}: ContractSigningModalProps) {
  return (
    <AnimatePresence>
      {contract && (
        <ContractSigningForm
          key={contract.contractId}
          contract={contract}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
