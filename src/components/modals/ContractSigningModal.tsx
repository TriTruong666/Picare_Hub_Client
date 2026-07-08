import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheckCircle,
  FiCreditCard,
  FiDownload,
  FiLock,
  FiPenTool,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import {
  useCompleteSigningSession,
  useCreateSigningSession,
  usePublishOwnerSignedContract,
  usePublishDraftContract,
} from "@/hooks/data/useContractHooks";
import {
  useCheckLocalSigningService,
  useGetCertificateMutation,
  useGetUSBInfoMutation,
  useSignPdfCms,
} from "@/hooks/data/useLocalSignHooks";
import { toast } from "@/hooks/useToast";
import huongdan1 from "@/assets/images/huongdan1.jpg";
import huongdan2 from "@/assets/images/huongdan2.jpg";
import huongdan3 from "@/assets/images/huongdan3.jpg";
import huongdan4 from "@/assets/images/huongdan4.jpg";
import huongdan5 from "@/assets/images/huongdan5.jpg";
import type { Contract } from "@/types/Contract";
import type {
  CertificateResponse,
  CheckHealthResponse,
  USBInfoResponse,
} from "@/types/LocalSign";
import type { BaseResponse } from "@/types/ApiResponse";

type ContractSigningModalProps = {
  contract: Contract | null;
  onClose: () => void;
  onSigned?: () => void;
};

type ContractSigningFormProps = {
  contract: Contract;
  onClose: () => void;
  onSigned?: () => void;
};

const LOCAL_SIGN_APP_DOWNLOAD_URL =
  "https://drive.google.com/file/d/10fZYSzI_qLTrM4bgMev9AgrdK_o_czm-/view?usp=sharing";

const PICAREVN_ASCII = String.raw`
 ____  ___ ____    _    ____  _____ __     ___   _
|  _ \|_ _/ ___|  / \  |  _ \| ____|\ \   / / \ | |
| |_) || | |     / _ \ | |_) |  _|   \ \ / /|  \| |
|  __/ | | |___ / ___ \|  _ <| |___   \ V / | |\  |
|_|   |___\____/_/   \_\_| \_\_____|   \_/  |_| \_|
`;

function GuideStepIllustration({
  imageSrc,
  caption,
}: {
  imageSrc: string;
  caption: string;
}) {
  return (
    <figure className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <img
        src={imageSrc}
        alt={caption}
        className="block max-h-[520px] w-full bg-white object-contain"
      />
      <figcaption className="border-t border-white/10 px-4 py-3 text-xs leading-6 text-white/45">
        {caption}
      </figcaption>
    </figure>
  );
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

function isAvailableToken(token: USBInfoResponse) {
  return (
    token.available !== false &&
    !!token.token &&
    Array.isArray(token.certificates) &&
    token.certificates.length > 0
  );
}

function formatCertificateDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPendingOwnerSignature(contract: Contract) {
  return contract.signatures
    ?.filter(
      (signature) =>
        signature.signerType === "owner" &&
        signature.status === "pending" &&
        !!signature.contractSignatureId &&
        !!signature.preparedPdfHash &&
        !signature.signedPdfUrl,
    )
    .sort(
      (current, next) =>
        new Date(next.createdAt).getTime() -
        new Date(current.createdAt).getTime(),
    )[0];
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
    <div className="fixed inset-0 z-320 flex items-center justify-center p-4">
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
        className="dashboard-theme contract-surface relative flex max-h-[calc(100vh-2rem)] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-2xl border"
      >
        <div className="flex shrink-0 items-start justify-between gap-5 border-b border-white/10 px-6 py-5 md:px-8 md:py-7">
          <div>
            <h2 className="mt-3 text-lg leading-tight font-semibold tracking-tight text-white">
              Cần phần mềm Picare Sign Helper
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 md:px-8 md:py-7">
          <article className="mx-auto max-w-2xl">
            <pre className="mb-7 overflow-hidden border-white/10 py-5 text-center text-[9px] leading-[1.05] font-bold tracking-[-0.02em] text-white/80 sm:text-[11px] md:text-xs">
              {PICAREVN_ASCII}
            </pre>

            <section>
              <h3 className="text-base font-semibold text-white">
                Ứng dụng này dùng để làm gì?
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-white/72">
                <strong className="font-semibold text-white">
                  Picare Digital Sign Helper
                </strong>{" "}
                là ứng dụng chạy trên Windows, giúp Picare kết nối với{" "}
                <strong className="font-semibold text-white">
                  USB Token ký số
                </strong>{" "}
                của bạn. Khi ứng dụng đang chạy, hệ thống có thể mở bước ký hợp
                đồng và dùng USB Token để hoàn tất chữ ký số.
              </p>
              <div className="mt-5 border-l border-white/20 pl-5">
                <p className="text-sm leading-7 font-medium text-white/85">
                  Cần làm trước khi ký: cài ứng dụng, mở ứng dụng, cắm USB
                  Token, rồi bấm kiểm tra lại.
                </p>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
                <p>
                  Ứng dụng là{" "}
                  <strong className="font-semibold text-white/85">
                    cầu nối cục bộ
                  </strong>{" "}
                  giữa trình duyệt, hệ thống Picare và USB Token, giúp thao tác
                  ký số diễn ra trực tiếp trên máy người dùng.
                </p>
                <p>
                  Dịch vụ chạy ngầm dưới dạng{" "}
                  <strong className="font-semibold text-white/85">
                    Windows Service
                  </strong>
                  , tự khởi động cùng hệ thống và chỉ lắng nghe trên địa chỉ nội
                  bộ của máy.
                </p>
                <p>
                  Cửa sổ trạng thái, nếu có, chỉ dùng để kiểm tra dịch vụ và
                  không phải tiến trình xử lý ký số chính.
                </p>
                <p>
                  Mọi thao tác ký số được xử lý trực tiếp tại thiết bị nội bộ
                  của người dùng, thông qua driver USB Token đã cài trên
                  Windows.
                </p>
              </div>
            </section>

            <section className="mt-8 border-t border-white/10 pt-7">
              <h3 className="text-base font-semibold text-white">
                Thông tin bảo mật và pháp lý
              </h3>
              <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/8 p-4">
                <p className="text-sm leading-7 font-medium text-emerald-100">
                  <strong className="font-semibold text-white">
                    Cam kết quan trọng:
                  </strong>{" "}
                  ứng dụng{" "}
                  <strong className="text-white">không lưu mã PIN</strong>,
                  <strong className="text-white">
                    {" "}
                    không sao chép khóa bí mật
                  </strong>
                  ,<strong className="text-white"> không chứa mã độc</strong> và
                  <strong className="text-white">
                    {" "}
                    không tự ý can thiệp dữ liệu ngoài nghiệp vụ ký số
                  </strong>
                  .
                </p>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
                <p>
                  Ứng dụng{" "}
                  <strong className="font-semibold text-white/85">
                    không thu thập, không lưu trữ và không gửi mã PIN
                  </strong>{" "}
                  ra bên ngoài.
                </p>
                <p>
                  <strong className="font-semibold text-white/85">
                    Khóa bí mật không rời khỏi USB Token
                  </strong>{" "}
                  và không được sao chép bởi ứng dụng.
                </p>
                <p>
                  Ứng dụng{" "}
                  <strong className="font-semibold text-white/85">
                    không chứa mã độc, không cài kèm thành phần ẩn, không tự ý
                    thu thập dữ liệu ngoài phạm vi cần thiết
                  </strong>{" "}
                  để thực hiện ký số cục bộ.
                </p>
                <p>
                  Chứng thư số chỉ được đọc để phục vụ thao tác ký số hợp lệ
                  theo yêu cầu từ hệ thống được ủy quyền.
                </p>
                <p>
                  Ứng dụng chỉ xử lý yêu cầu từ phần mềm Picare hoặc hệ thống
                  tích hợp đã được cấu hình hợp lệ.
                </p>
                <p>
                  Dữ liệu ký số được xử lý theo từng phiên yêu cầu, không tự ý
                  tạo, sửa, gửi hoặc phát sinh giao dịch ngoài phạm vi nghiệp
                  vụ.
                </p>
                <p>
                  Ứng dụng{" "}
                  <strong className="font-semibold text-white/85">
                    không thay đổi nội dung hợp đồng, không đọc file ngoài luồng
                    ký và không gửi tài liệu lên hệ thống khác
                  </strong>{" "}
                  nếu không có yêu cầu hợp lệ từ Picare.
                </p>
                <p>
                  Người dùng chịu trách nhiệm bảo vệ USB Token, mã PIN, tài
                  khoản đăng nhập và quyền truy cập máy tính.
                </p>
                <p>
                  Việc sử dụng chữ ký số cần tuân thủ quy định pháp luật Việt
                  Nam hiện hành và chính sách của đơn vị phát hành chứng thư số.
                </p>
                <p>
                  Không sử dụng ứng dụng cho hành vi giả mạo, trái phép, vượt
                  quyền hoặc ngoài phạm vi nghiệp vụ đã được cấp phép.
                </p>
                <p>
                  Nếu chạy bằng Windows Service, cửa sổ CMD chỉ dùng để theo dõi
                  và có thể tắt.
                </p>
              </div>
            </section>

            <section className="mt-8 border-t border-white/10 pt-7">
              <h3 className="text-base font-semibold text-white">
                Nếu bạn chưa cài ứng dụng
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                <p>
                  <strong className="mr-2 text-white">1.</strong>Bấm nút{" "}
                  <strong className="font-semibold text-white">
                    tải ứng dụng
                  </strong>{" "}
                  ở cuối thông báo này để tải file cài đặt về máy tính.
                </p>
                <GuideStepIllustration
                  imageSrc={huongdan1}
                  caption="Bước 1: Bắt đầu Setup file cài đặt"
                />
                <p>
                  <strong className="mr-2 text-white">2.</strong>Mở file vừa
                  tải, chọn đồng ý khi Windows hỏi quyền cài đặt, rồi làm theo
                  các bước hiển thị trên màn hình.
                </p>
                <GuideStepIllustration
                  imageSrc={huongdan2}
                  caption="Bước 2: Lời khuyên cho bạn nên cho hệ thống chạy bằng quyền quản trị (Tick hết)"
                />
                <p>
                  <strong className="mr-2 text-white">3.</strong>Sau khi cài
                  xong,{" "}
                  <strong className="font-semibold text-white">
                    hãy cắm USB vào máy. Hệ thống sẽ chạy ngầm
                  </strong>
                  . Sau đó quay lại màn hình này để kiểm tra lại.
                </p>
                <GuideStepIllustration
                  imageSrc={huongdan3}
                  caption="Bước 3: Hoàn thành Setup và hệ thống đã bắt đầu chạy ngầm"
                />
              </div>
            </section>

            <section className="mt-8 border-t border-white/10 pt-7">
              <h3 className="text-base font-semibold text-white">
                Nếu bạn đã cài nhưng quên bật ứng dụng
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                <p>
                  <strong className="mr-2 text-white">1.</strong>Mở ứng dụng{" "}
                  <strong className="font-semibold text-white">
                    Dịch vụ hỗ trợ ký số Picare
                  </strong>{" "}
                  trên máy tính Windows.
                </p>
                <GuideStepIllustration
                  imageSrc={huongdan4}
                  caption="Bước 4: mở ứng dụng Dịch vụ hỗ trợ ký số Picare trên Windows."
                />
                <p>
                  <strong className="mr-2 text-white">2.</strong>
                  <strong className="font-semibold text-white">
                    Đây là console của hệ thống(có thể tắt)
                  </strong>{" "}
                  . Chúng tôi đã setup ban đầu để hệ thống chạy ngầm(default).
                  Bạn có thể thao tác các lựa chọn trên console bằng cách nhấn
                  các phím tương đương.
                </p>
                <GuideStepIllustration
                  imageSrc={huongdan5}
                  caption="Bước 5: Bạn có thể thao tác trên console hoặc tắt đi. Hệ thống đã setup chế độ chạy ngầm!"
                />
                <p>
                  <strong className="mr-2 text-white">3.</strong>Cắm USB Token
                  và đảm bảo phần mềm USB Token của nhà cung cấp chữ ký số đã
                  sẵn sàng.
                </p>
                <p>
                  <strong className="mr-2 text-white">4.</strong>Quay lại đây và
                  bấm{" "}
                  <strong className="font-semibold text-white">
                    kiểm tra lại
                  </strong>
                  . Khi ứng dụng hoạt động, bạn có thể tiếp tục xác nhận ký.
                </p>
              </div>
            </section>

            <section className="mt-8 border-t border-white/10 pt-7">
              <h3 className="text-base font-semibold text-white">
                Những thứ cần chuẩn bị
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                <p>
                  <strong className="font-semibold text-white/85">
                    File cài đặt:
                  </strong>{" "}
                  Picare Digital Sign Helper.
                </p>
                <p>
                  <strong className="font-semibold text-white/85">
                    Thiết bị:
                  </strong>{" "}
                  USB Token ký số đang dùng cho doanh nghiệp.
                </p>
                <p>
                  <strong className="font-semibold text-white/85">
                    Phần mềm đi kèm:
                  </strong>{" "}
                  phần mềm USB Token từ nhà cung cấp chữ ký số của bạn.
                </p>
              </div>
            </section>

            <section className="mt-8 border-t border-white/10 pt-7">
              <h3 className="text-base font-semibold text-white">
                Nếu bạn không biết tải ở đâu
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/60">
                Bấm nút tải ứng dụng bên dưới. Đường dẫn tải:
              </p>
              <p className="mt-3 border-l border-white/15 pl-4 text-sm leading-6 break-all text-white/45">
                {LOCAL_SIGN_APP_DOWNLOAD_URL}
              </p>
            </section>
          </article>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-white/10 px-6 py-4 sm:flex-row sm:justify-end md:px-8 md:py-6">
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
            className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-gray-100 active:scale-95"
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

function TokenSelectionModal({
  tokens,
  isLoading,
  onSelect,
  onClose,
}: {
  tokens: USBInfoResponse[];
  isLoading: boolean;
  onSelect: (token: USBInfoResponse) => void;
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
        className="dashboard-theme contract-surface relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">
              Chọn USB Token ký số
            </h2>
            <p className="mt-1 text-[12px] leading-6 text-white/45">
              Hệ thống chỉ hiển thị các token đang khả dụng trên máy này.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {tokens.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-white">
                Không phát hiện USB Token khả dụng
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                Vui lòng cắm USB Token, mở phần mềm token của nhà cung cấp rồi
                thử lại.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => {
                const certificate = token.certificates?.[0];

                return (
                  <button
                    key={`${token.vendor}-${token.token?.serialNumber || token.label}`}
                    type="button"
                    disabled={isLoading}
                    onClick={() => onSelect(token)}
                    className="group w-full rounded-xl border border-white/10 p-4 text-left transition hover:border-white/25 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/60">
                        <FiCreditCard />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {token.label}
                        </p>
                        <p className="mt-1 truncate text-xs text-white/45">
                          {token.token?.label || "USB Token"}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">
                          {certificate?.label || "Chứng thư số khả dụng"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CertificateSelectionModal({
  token,
  certificates,
  isLoading,
  onSelect,
  onClose,
}: {
  token: USBInfoResponse;
  certificates: CertificateResponse[];
  isLoading: boolean;
  onSelect: (certificate: CertificateResponse) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-325 flex items-center justify-center p-4">
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
        className="dashboard-theme contract-surface relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">
              Chọn chứng thư số
            </h2>
            <p className="mt-1 text-[12px] leading-6 text-white/45">
              {token.label} đang có {certificates.length} chứng thư số khả dụng.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {certificates.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-white">
                Không có chứng thư số khả dụng
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                USB Token này chưa có chứng thư số dùng được để ký hợp đồng.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((certificate) => (
                <button
                  key={`${certificate.vendor}-${certificate.certificateId}`}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onSelect(certificate)}
                  className={`group w-full rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    certificate.isExpired
                      ? "border-red-400/25 bg-red-500/6 hover:border-red-300/40 hover:bg-red-500/10"
                      : "border-white/10 hover:border-white/25 hover:bg-white/4"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-white/60 ${
                        certificate.isExpired
                          ? "border-red-400/25 text-red-200/80"
                          : "border-white/10"
                      }`}
                    >
                      <FiCreditCard />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {certificate.label || "Chứng thư số"}
                        </p>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        Serial: {certificate.serialHex || "-"}
                      </p>
                      <p
                        className={`mt-1 text-xs leading-5 ${
                          certificate.isExpired
                            ? "text-red-100/80"
                            : "text-white/40"
                        }`}
                      >
                        Thời hạn: {formatCertificateDate(certificate.notBefore)}{" "}
                        - {formatCertificateDate(certificate.notAfter)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PinSigningModal({
  token,
  certificate,
  pin,
  isSigning,
  onPinChange,
  onSubmit,
  onClose,
}: {
  token: USBInfoResponse;
  certificate: CertificateResponse | null;
  pin: string;
  isSigning: boolean;
  onPinChange: (pin: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-330 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isSigning && onClose()}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="dashboard-theme contract-surface relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">
              Nhập mã PIN USB Token
            </h2>
            <p className="mt-1 text-[11px] leading-6 text-white/45">
              Mã PIN chỉ được gửi tới ứng dụng ký số local trên máy của bạn.
            </p>
          </div>

          <button
            type="button"
            disabled={isSigning}
            onClick={onClose}
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="border-l border-white/15 pl-4">
            <p className="text-sm font-semibold text-white">{token.label}</p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              {certificate?.label || token.certificates?.[0]?.label}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Mã PIN
            </label>
            <input
              type="password"
              value={pin}
              disabled={isSigning}
              onChange={(event) => onPinChange(event.target.value)}
              placeholder="Nhập mã PIN USB Token"
              className="h-11 w-full rounded-lg border border-white/10 bg-white/6 px-4 text-sm text-white transition-all outline-none placeholder:text-white/25 hover:border-white/20 hover:bg-white/8 focus:border-indigo-400/50 focus:bg-white/8 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/4 p-6">
          <button
            type="button"
            disabled={isSigning}
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSigning || !pin.trim()}
            onClick={onSubmit}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSigning ? <Spinner size="sm" /> : <FiLock size={14} />}
            Ký hợp đồng
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ContractSigningForm({
  contract,
  onClose,
  onSigned,
}: ContractSigningFormProps) {
  const checkLocalSigningMutation = useCheckLocalSigningService();
  const getUSBInfoMutation = useGetUSBInfoMutation();
  const getCertificateMutation = useGetCertificateMutation();
  const signPdfCmsMutation = useSignPdfCms({ showSuccessToast: false });
  const publishDraftMutation = usePublishDraftContract({
    showSuccessToast: false,
  });
  const signingSessionMutation = useCreateSigningSession({
    showSuccessToast: false,
  });
  const completeSigningSessionMutation = useCompleteSigningSession({
    showSuccessToast: false,
  });
  const publishOwnerSignedMutation = usePublishOwnerSignedContract();

  const [isLocalAppGuideOpen, setIsLocalAppGuideOpen] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<USBInfoResponse[]>([]);
  const [isTokenSelectionOpen, setIsTokenSelectionOpen] = useState(false);
  const [availableCertificates, setAvailableCertificates] = useState<
    CertificateResponse[]
  >([]);
  const [isCertificateSelectionOpen, setIsCertificateSelectionOpen] =
    useState(false);
  const [selectedToken, setSelectedToken] = useState<USBInfoResponse | null>(
    null,
  );
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateResponse | null>(null);
  const [pin, setPin] = useState("");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [activeSigningSession, setActiveSigningSession] = useState<{
    contractSignatureId: string;
    hashToSign: string;
  } | null>(null);
  const pendingSigner = useMemo(
    () => ({
      name:
        contract.ownerCompanyInfo.companyName?.trim() ||
        contract.ownerCompanyInfo.ownerName?.trim() ||
        "",
      email: contract.ownerCompanyInfo.email?.trim() || "",
    }),
    [
      contract.ownerCompanyInfo.companyName,
      contract.ownerCompanyInfo.email,
      contract.ownerCompanyInfo.ownerName,
    ],
  );

  const isSubmitting =
    checkLocalSigningMutation.isPending ||
    getUSBInfoMutation.isPending ||
    getCertificateMutation.isPending ||
    signPdfCmsMutation.isPending ||
    publishDraftMutation.isPending ||
    signingSessionMutation.isPending ||
    completeSigningSessionMutation.isPending ||
    publishOwnerSignedMutation.isPending;

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

  const scanAvailableTokens = async () => {
    const tokenResponse = await getUSBInfoMutation.mutateAsync();

    if (!tokenResponse.success) {
      toast.error(
        "Không thể quét USB Token",
        tokenResponse.message || "Vui lòng kiểm tra lại ứng dụng ký số local.",
      );
      return [];
    }

    const tokens = (tokenResponse.data || []).filter(isAvailableToken);
    setAvailableTokens(tokens);

    if (tokens.length === 0) {
      toast.error(
        "Không phát hiện USB Token",
        "Vui lòng cắm USB Token và đảm bảo phần mềm token của nhà cung cấp đã sẵn sàng.",
      );
    }

    return tokens;
  };

  const handleSelectToken = async (token: USBInfoResponse) => {
    const certificateResponse = await getCertificateMutation.mutateAsync({
      vendor: token.vendor,
    });

    const certificates = certificateResponse.data || [];

    if (!certificateResponse.success) {
      toast.error(
        "Không lấy được chứng thư số",
        certificateResponse.message ||
          "Vui lòng kiểm tra USB Token và thử lại.",
      );
      return;
    }

    setSelectedToken(token);
    setSelectedCertificate(null);
    setAvailableCertificates(certificates);
    setPin("");
    setIsPinModalOpen(false);
    setIsTokenSelectionOpen(false);

    if (certificates.length === 0) {
      toast.error(
        "Không có chứng thư số",
        "USB Token này chưa có chứng thư số khả dụng để ký hợp đồng.",
      );
      return;
    }

    setIsCertificateSelectionOpen(true);
  };

  const handleSelectCertificate = (
    token: USBInfoResponse,
    certificate: CertificateResponse,
  ) => {
    setSelectedToken(token);
    setSelectedCertificate(certificate);
    setAvailableCertificates((currentCertificates) =>
      currentCertificates.length > 0 ? currentCertificates : [certificate],
    );
    setPin("");
    const pendingOwnerSignature = getPendingOwnerSignature(contract);
    setActiveSigningSession(
      pendingOwnerSignature
        ? {
            contractSignatureId: pendingOwnerSignature.contractSignatureId,
            hashToSign: pendingOwnerSignature.preparedPdfHash,
          }
        : null,
    );
    setIsCertificateSelectionOpen(false);
    setIsPinModalOpen(true);
  };

  const handleConfirmPin = async () => {
    if (!selectedToken || !selectedCertificate) return;

    const normalizedPin = pin.trim();
    if (!normalizedPin) {
      toast.error("Thiếu mã PIN", "Vui lòng nhập mã PIN USB Token.");
      return;
    }

    let signingSession = activeSigningSession;

    if (!signingSession) {
      const pendingOwnerSignature = getPendingOwnerSignature(contract);
      if (pendingOwnerSignature) {
        signingSession = {
          contractSignatureId: pendingOwnerSignature.contractSignatureId,
          hashToSign: pendingOwnerSignature.preparedPdfHash,
        };
      }
    }

    if (!signingSession) {
      if (contract.status === "draft") {
        const publishResponse = await publishDraftMutation.mutateAsync(
          contract.contractId,
        );

        if (!publishResponse.success) {
          return;
        }
      }

      const sessionResponse = await signingSessionMutation.mutateAsync({
        contractId: contract.contractId,
        data: {
          signerType: "owner",
          signerEmail: pendingSigner.email,
          signerName: pendingSigner.name,
        },
      });

      const hashToSign = sessionResponse.data?.hashToSign;
      const contractSignatureId = sessionResponse.data?.contractSignatureId;
      if (!sessionResponse.success || !hashToSign || !contractSignatureId) {
        toast.error(
          "Không thể tạo phiên ký",
          "Phiên ký chưa có đủ dữ liệu để ký số.",
        );
        return;
      }

      signingSession = {
        contractSignatureId,
        hashToSign,
      };
      setActiveSigningSession(signingSession);
    }

    const signResponse = await signPdfCmsMutation.mutateAsync({
      hash: signingSession.hashToSign,
      pin: normalizedPin,
      vendor: selectedToken.vendor,
      certificateId: selectedCertificate.certificateId,
    });

    const signedData = signResponse.data;
    if (
      !signResponse.success ||
      !signedData?.signatureHex ||
      !signedData.certificatePem ||
      !signedData.certificateSerial ||
      !signedData.certificateSubject ||
      !signedData.certificateIssuer ||
      !signedData.vendor
    ) {
      toast.error(
        "Không thể hoàn tất ký số",
        "Ứng dụng ký số chưa trả đủ dữ liệu chữ ký.",
      );
      return;
    }

    const completeResponse = await completeSigningSessionMutation.mutateAsync({
      contractId: contract.contractId,
      contractSignatureId: signingSession.contractSignatureId,
      data: {
        signatureHex: signedData.signatureHex,
        certificatePem: signedData.certificatePem,
        certificateSerial: signedData.certificateSerial,
        certificateIssuer: signedData.certificateIssuer,
        certificateSubject: signedData.certificateSubject,
        vendor: signedData.vendor,
      },
    });

    if (!completeResponse.success) {
      return;
    }

    const publishOwnerSignedResponse =
      await publishOwnerSignedMutation.mutateAsync(contract.contractId);

    if (!publishOwnerSignedResponse.success) {
      return;
    }

    onSigned?.();
    setActiveSigningSession(null);
    setIsPinModalOpen(false);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!pendingSigner.name) {
      toast.error(
        "Thiếu thông tin công ty ký",
        "Vui lòng cập nhật tên công ty của bên sở hữu trước khi tạo phiên ký.",
      );
      return;
    }

    if (!pendingSigner.email) {
      toast.error(
        "Thiếu email công ty ký",
        "Vui lòng cập nhật email công ty của bên sở hữu trước khi tạo phiên ký.",
      );
      return;
    }

    const isLocalSigningReady = await ensureLocalSigningReady();
    if (!isLocalSigningReady) {
      return;
    }

    const tokens = await scanAvailableTokens();
    setIsTokenSelectionOpen(tokens.length > 0);
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
          className="dashboard-theme contract-surface relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-white/10 bg-white/[0.04] p-6">
            <div>
              <h2 className="text-base font-semibold text-white">
                Ký hợp đồng
              </h2>
              <p className="mt-1 text-xs text-white/45">
                Xác nhận thông tin công ty ký trước khi tạo phiên ký hợp đồng.
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

          <div className="space-y-5 px-6 pb-4">
            <div>
              <dl className="mt-4 divide-y divide-white/8 border-white/10">
                <div className="grid grid-cols-[112px_1fr] gap-4 py-3">
                  <dt className="text-xs text-white/40">Công ty</dt>
                  <dd className="text-right text-sm font-medium text-white">
                    {pendingSigner.name || "-"}
                  </dd>
                </div>

                <div className="grid grid-cols-[112px_1fr] gap-4 py-3">
                  <dt className="text-xs text-white/40">Mã số thuế</dt>
                  <dd className="text-right text-[13px] text-white/75">
                    {contract.ownerCompanyInfo.mst || "-"}
                  </dd>
                </div>

                <div className="grid grid-cols-[112px_1fr] gap-4 py-3">
                  <dt className="text-xs text-white/40">Người đại diện</dt>
                  <dd className="text-right text-[13px] text-white/75">
                    {contract.ownerCompanyInfo.ownerName || "-"}
                  </dd>
                </div>

                <div className="grid grid-cols-[112px_1fr] gap-4 py-3">
                  <dt className="text-xs text-white/40">Email</dt>
                  <dd className="text-right text-[13px] text-white/75">
                    {pendingSigner.email || "-"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex items-start gap-2 border-l border-amber-600 pl-3 text-xs leading-5 font-medium text-amber-600 dark:border-amber-200/25 dark:text-amber-100">
              <span>
                Phiên ký này sẽ dùng tên công ty và email công ty của bên sở
                hữu. Sau khi xác nhận ký, hợp đồng sẽ được xuất bản và không thể
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

      <AnimatePresence>
        {isTokenSelectionOpen && (
          <TokenSelectionModal
            tokens={availableTokens}
            isLoading={getCertificateMutation.isPending}
            onClose={() => setIsTokenSelectionOpen(false)}
            onSelect={handleSelectToken}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCertificateSelectionOpen && selectedToken && (
          <CertificateSelectionModal
            token={selectedToken}
            certificates={availableCertificates}
            isLoading={false}
            onClose={() => setIsCertificateSelectionOpen(false)}
            onSelect={(certificate) =>
              handleSelectCertificate(selectedToken, certificate)
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPinModalOpen && selectedToken && (
          <PinSigningModal
            token={selectedToken}
            certificate={selectedCertificate}
            pin={pin}
            isSigning={
              publishDraftMutation.isPending ||
              signingSessionMutation.isPending ||
              signPdfCmsMutation.isPending ||
              completeSigningSessionMutation.isPending ||
              publishOwnerSignedMutation.isPending
            }
            onClose={() => setIsPinModalOpen(false)}
            onPinChange={setPin}
            onSubmit={handleConfirmPin}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function ContractSigningModal({
  contract,
  onClose,
  onSigned,
}: ContractSigningModalProps) {
  return (
    <AnimatePresence>
      {contract && (
        <ContractSigningForm
          key={contract.contractId}
          contract={contract}
          onClose={onClose}
          onSigned={onSigned}
        />
      )}
    </AnimatePresence>
  );
}
