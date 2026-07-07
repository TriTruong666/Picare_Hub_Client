import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SignatureCanvas from "react-signature-canvas";
import { FiRotateCcw } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useUploadHandwrittenSignature } from "@/hooks/data/useContractHooks";
import { toast } from "@/hooks/useToast";

type HandwrittenSignatureModalProps = {
  contractId: string;
  partnerToken?: string;
  signerName: string;
  signerEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSigned?: () => void | Promise<void>;
};

export default function HandwrittenSignatureModal({
  contractId,
  partnerToken,
  signerName,
  signerEmail,
  isOpen,
  onClose,
  onSigned,
}: HandwrittenSignatureModalProps) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const uploadMutation = useUploadHandwrittenSignature();
  const [strokeCount, setStrokeCount] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 760, height: 280 });
  const isSubmitting = uploadMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;

    const syncCanvasSize = () => {
      const width = canvasWrapRef.current?.clientWidth;
      if (!width) return;

      setCanvasSize({
        width: Math.round(width),
        height: 280,
      });
      signatureRef.current?.clear();
      setStrokeCount(0);
    };

    const animationFrame = window.requestAnimationFrame(syncCanvasSize);
    const resizeObserver = new ResizeObserver(syncCanvasSize);

    if (canvasWrapRef.current) {
      resizeObserver.observe(canvasWrapRef.current);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [isOpen]);

  const handleClear = () => {
    signatureRef.current?.clear();
    setStrokeCount(0);
  };

  const handleSubmit = async () => {
    if (!partnerToken) {
      toast.error("Thiếu token", "Đường dẫn ký không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Thiếu chữ ký", "Vui lòng ký tay trong khung trước khi gửi.");
      return;
    }

    const signatureImage = signatureRef.current.toDataURL("image/png");
    const response = await uploadMutation.mutateAsync({
      contractId,
      partnerToken,
      data: {
        signerName,
        signerEmail,
        signature_image: signatureImage,
      },
    });

    if (response.success) {
      await onSigned?.();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[330] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && onClose()}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="dashboard-theme contract-surface relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border"
          >
            <div className="flex items-start justify-between gap-5 border-b border-white/10 bg-white/[0.04] px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Ký tay xác nhận
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Chữ ký này sẽ được lưu làm chữ ký cá nhân của bên mua trong
                  hợp đồng.
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[220px_1fr]">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] font-medium text-white/35 uppercase">
                    Người ký
                  </dt>
                  <dd className="mt-1 leading-6 text-white/82">{signerName}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium text-white/35 uppercase">
                    Email
                  </dt>
                  <dd className="mt-1 leading-6 break-all text-white/62">
                    {signerEmail || "-"}
                  </dd>
                </div>
              </dl>

              <div>
                <div
                  ref={canvasWrapRef}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-[#f7f2e9]"
                >
                  <SignatureCanvas
                    ref={signatureRef}
                    penColor="#101010"
                    minWidth={0.8}
                    maxWidth={2.2}
                    velocityFilterWeight={0.7}
                    clearOnResize={false}
                    onEnd={() => setStrokeCount((count) => count + 1)}
                    canvasProps={{
                      width: canvasSize.width,
                      height: canvasSize.height,
                      className: "block h-[280px] w-full touch-none",
                    }}
                  />
                  <div className="pointer-events-none absolute right-5 bottom-5 left-5 border-t border-black/18" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-white/38">
                    Ký trực tiếp bằng chuột hoặc thao tác chạm.
                  </p>
                  <button
                    type="button"
                    disabled={isSubmitting || strokeCount === 0}
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <FiRotateCcw size={13} />
                    Ký lại
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.04] p-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
              >
                {isSubmitting ? <Spinner size="sm" color="white" /> : null}
                Xác nhận ký
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
