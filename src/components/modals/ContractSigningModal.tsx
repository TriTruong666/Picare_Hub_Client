import type { FormEvent } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiPenTool } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import {
  useCreateSigningSession,
  usePublishDraftContract,
} from "@/hooks/data/useContractHooks";
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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ContractSigningForm({ contract, onClose }: ContractSigningFormProps) {
  const publishDraftMutation = usePublishDraftContract();
  const signingSessionMutation = useCreateSigningSession();

  const [signerName, setSignerName] = useState(
    contract.ownerCompanyInfo.ownerName || "",
  );
  const [signerEmail, setSignerEmail] = useState(
    contract.ownerCompanyInfo.email || "",
  );

  const isSubmitting =
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

          <div className="flex items-center gap-2 rounded-lg border border-amber-300/15 bg-amber-300/8 px-3 py-2 text-xs font-medium text-amber-100">
            <FiAlertTriangle className="shrink-0 text-amber-200/80" />
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
