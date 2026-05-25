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
import type { CheckHealthResponse } from "@/types/LocalSign";
import type { BaseResponse } from "@/types/ApiResponse";

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

const PICAREVN_ASCII = String.raw`
 ____  ___ ____    _    ____  _____ __     ___   _
|  _ \|_ _/ ___|  / \  |  _ \| ____|\ \   / / \ | |
| |_) || | |     / _ \ | |_) |  _|   \ \ / /|  \| |
|  __/ | | |___ / ___ \|  _ <| |___   \ V / | |\  |
|_|   |___\____/_/   \_\_| \_\_____|   \_/  |_| \_|
`;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLocalSigningServiceReady(
  response: BaseResponse<CheckHealthResponse>,
) {
  return (
    response.success === true &&
    response.data?.ok === true &&
    response.data?.service === "PicareDigitalSignHelper"
  );
}

function LocalSignAppGuideModal({
  isChecking,
  onRetry,
  onClose,
}: {
  isChecking: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="dashboard-theme relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-[0_24px_90px_rgba(0,0,0,0.75)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.24em] text-indigo-300 uppercase">
              Thông báo ký số
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
              Cần cài đặt hoặc mở ứng dụng ký số Picare
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[74vh] overflow-y-auto px-6 py-6">
          <div className="mb-6 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-5 text-center">
            <pre className="overflow-hidden text-[9px] leading-[1.05] font-bold tracking-[-0.02em] text-indigo-100 sm:text-[11px] md:text-xs">
              {PICAREVN_ASCII}
            </pre>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              Picare Digital Sign Helper là ứng dụng hỗ trợ ký số trên máy tính
              Windows. Ứng dụng giúp Picare nhận USB Token của bạn và mở bước ký
              hợp đồng ngay trên máy đang sử dụng.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">
                1. Tải ứng dụng
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                Bấm nút tải bên dưới và lưu file cài đặt về máy tính Windows.
              </p>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">
                2. Cài đặt ứng dụng
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                Mở file cài đặt, chọn đồng ý khi Windows hỏi quyền, sau đó làm
                theo các bước hiển thị trên màn hình.
              </p>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">3. Quay lại ký</p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                Cắm USB Token, đảm bảo phần mềm USB Token của nhà cung cấp đã
                sẵn sàng, rồi bấm kiểm tra lại.
              </p>
            </section>
          </div>

          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/8 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-300/10 text-amber-100">
                <FiAlertTriangle />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-50">
                  Các file và thiết bị cần có
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-100/75">
                  <li>File cài đặt: Picare Digital Sign Helper.</li>
                  <li>USB Token ký số đang dùng cho doanh nghiệp.</li>
                  <li>Phần mềm USB Token từ nhà cung cấp chữ ký số.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Để sau
          </button>
          <a
            href={LOCAL_SIGN_APP_DOWNLOAD_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 active:scale-95"
          >
            <FiDownload size={15} />
            Tải ứng dụng
          </a>
          <button
            type="button"
            disabled={isChecking}
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isChecking ? <Spinner size="sm" /> : <FiRefreshCw size={15} />}
            Kiểm tra lại
          </button>
        </div>
      </motion.div>
    </div>
  );
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
  const [isLocalAppGuideOpen, setIsLocalAppGuideOpen] = useState(false);

  const isSubmitting =
    checkLocalSigningMutation.isPending ||
    publishDraftMutation.isPending ||
    signingSessionMutation.isPending;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const ensureLocalSigningReady = async () => {
    try {
      const healthResponse = await checkLocalSigningMutation.mutateAsync();
      const isReady = isLocalSigningServiceReady(healthResponse);
      setIsLocalAppGuideOpen(!isReady);
      return isReady;
    } catch {
      setIsLocalAppGuideOpen(true);
      return false;
    }
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

    const isLocalSigningReady = await ensureLocalSigningReady();
    if (!isLocalSigningReady) {
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
    <>
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
              <h2 className="text-base font-semibold text-white">
                Ký hợp đồng
              </h2>
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
              <FiCheckCircle className="shrink-0 text-amber-200/80" />
              <span>
                Sau khi xác nhận ký, hợp đồng sẽ được xuất bản và không thể
                chỉnh sửa.
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

      <AnimatePresence>
        {isLocalAppGuideOpen && (
          <LocalSignAppGuideModal
            isChecking={checkLocalSigningMutation.isPending}
            onClose={() => setIsLocalAppGuideOpen(false)}
            onRetry={ensureLocalSigningReady}
          />
        )}
      </AnimatePresence>
    </>
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
