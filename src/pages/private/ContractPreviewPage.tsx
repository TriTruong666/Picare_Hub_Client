import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiDownload, FiEdit3, FiMail, FiPenTool } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import ContractSigningModal from "@/components/modals/ContractSigningModal";
import { PATHS } from "@/config/paths";
import {
  useContractDetail,
  useGenerateSignLink,
} from "@/hooks/data/useContractHooks";
import { useSendMailTemplate } from "@/hooks/data/useMailHooks";
import { useDownloadS3Asset } from "@/hooks/data/useS3Hooks";
import { toast } from "@/hooks/useToast";
import type {
  Contract,
  ContractDetail,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getEditPath(contractId: string) {
  return PATHS.CONTRACT_EDIT.replace(":contractId", contractId);
}

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

function getAbsoluteUrl(path: string) {
  return `${window.location.origin}${path}`;
}

function getS3KeyFromUrl(fileUrl?: string | null) {
  if (!fileUrl) return "";

  try {
    const url = new URL(fileUrl);
    return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    return decodeURIComponent(fileUrl.replace(/^\/+/, ""));
  }
}

function getFileNameFromS3Key(key: string, fallback: string) {
  const fileName = key.split("/").filter(Boolean).at(-1);
  return fileName || fallback;
}

function getSignatureDisplayName(fullName?: string) {
  const normalizedName = fullName?.trim();
  if (!normalizedName) return "";

  const nameWithoutTitle = normalizedName.replace(
    /^(ong|ông|ba|bà|anh|chị|chi)\s+/i,
    "",
  );
  const lastNamePart = nameWithoutTitle.split(/\s+/).filter(Boolean).at(-1);
  if (!lastNamePart) return normalizedName;

  return `${lastNamePart.charAt(0).toLocaleUpperCase("vi-VN")}${lastNamePart
    .slice(1)
    .toLocaleLowerCase("vi-VN")}`;
}

function stripVietnameseDiacritics(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const [year, month, day] = value.split("-");
    return [day, month, year].filter(Boolean).join("/");
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getVietnameseDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "ngày ... tháng ... năm ...";
  }

  return `ngày ${String(date.getDate()).padStart(2, "0")} tháng ${String(
    date.getMonth() + 1,
  ).padStart(2, "0")} năm ${date.getFullYear()}`;
}

function ArticleTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
      {children}
    </h2>
  );
}

function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-[14px] leading-7 text-black/62 dark:text-white/62">
      <span className="mr-2 text-black/35 dark:text-white/35">{label}:</span>
      <span className="text-black/82 dark:text-white/82">{value || "-"}</span>
    </p>
  );
}

function PartySection({
  title,
  party,
}: {
  title: string;
  party: OwnerCompanyInfoPayload | PartnerCompanyInfoPayload;
}) {
  return (
    <section className="mt-8">
      <h3 className="text-[15px] font-medium text-[#111111] uppercase dark:text-white">{title}</h3>
      <div className="mt-3 space-y-1">
        <FieldLine label="Tên công ty" value={party?.companyName || ""} />
        <FieldLine label="Địa chỉ" value={party?.address || ""} />
        <FieldLine label="Điện thoại" value={party?.phone || ""} />
        <FieldLine label="Email" value={party?.email || ""} />
        <FieldLine label="Tài khoản" value={party?.bankInfo || ""} />
        <FieldLine label="Mã số thuế" value={party?.mst || ""} />
        <FieldLine label="Đại diện" value={party.ownerName} />
        <FieldLine label="Chức vụ" value={party.role} />
      </div>
    </section>
  );
}

function ClauseList({ items }: { items: string[] }) {
  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => (
        <p key={item} className="text-[14px] leading-7 text-black/62 dark:text-white/62">
          {item}
        </p>
      ))}
    </div>
  );
}

function ProductList({ details }: { details: ContractDetail[] }) {
  return (
    <div className="mt-5 divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10">
      <div className="grid grid-cols-[42px_1fr_130px] gap-4 py-3 text-[11px] tracking-[0.12em] text-black/35 uppercase dark:text-white/35">
        <span>STT</span>
        <span>Sản phẩm</span>
        <span className="text-right">Giá</span>
      </div>
      {details.map((item, index) => (
        <div
          key={item.contractDetailId || item.productName}
          className="grid grid-cols-[42px_1fr_130px] gap-4 py-4 text-[14px]"
        >
          <span className="text-black/35 dark:text-white/35">{index + 1}</span>
          <span className="text-black/82 dark:text-white/82">{item.productName}</span>
          <span className="text-right text-black/62 tabular-nums dark:text-white/62">
            {formatCurrency(item.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnimatedSignature({
  name,
  shouldAnimate,
  revealKey,
}: {
  name: string;
  shouldAnimate: boolean;
  revealKey?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const canAnimate = shouldAnimate && !prefersReducedMotion;
  const signatureFontFamily =
    '"Allura", "Sriracha", "Segoe Script", "Snell Roundhand", cursive';
  const displayName = stripVietnameseDiacritics(name);

  return (
    <div className="relative mx-auto flex h-36 w-full max-w-[300px] items-center justify-center overflow-hidden">
      <motion.svg
        viewBox="0 0 300 120"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-black/70 dark:text-white/80"
      >
        <motion.path
          d="M42 86 C88 84, 126 84, 184 84 S230 84, 258 84"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={canAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.svg>

      <motion.div
        key={`${name}-${revealKey ?? 0}-${shouldAnimate ? "animated" : "static"}`}
        initial={
          canAnimate
            ? {
                opacity: 0,
                y: 12,
                scale: 0.98,
                rotate: -2,
                filter: "blur(7px)",
              }
            : false
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.62,
          delay: canAnimate ? 0.42 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 text-[58px] leading-none text-[#111111] drop-shadow-[0_0_18px_rgba(0,0,0,0.08)] select-none dark:text-white dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.14)]"
        style={{
          fontFamily: signatureFontFamily,
          fontWeight: 300,
        }}
      >
        {displayName}
      </motion.div>
    </div>
  );
}

function SignatureBlock({
  title,
  name,
  isSigned,
  shouldAnimate,
  revealKey,
  signatureRef,
}: {
  title: string;
  name: string;
  isSigned?: boolean;
  shouldAnimate?: boolean;
  revealKey?: number;
  signatureRef?: React.Ref<HTMLDivElement>;
}) {
  const signatureName = getSignatureDisplayName(name);
  return (
    <div ref={signatureRef} className="relative text-center">
      <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
        {title}
      </p>
      <p className="mt-2 text-[12px] text-black/35 dark:text-white/35">
        Ký, đóng dấu, ghi rõ họ và tên
      </p>
      {isSigned && signatureName ? (
        <AnimatedSignature
          name={signatureName}
          shouldAnimate={Boolean(shouldAnimate)}
          revealKey={revealKey}
        />
      ) : (
        <div className="h-32" />
      )}

      {isSigned ? (
        <motion.p
          initial={shouldAnimate ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: shouldAnimate ? 1.05 : 0 }}
          className="mb-2 text-[11px] font-medium tracking-[0.16em] text-emerald-200/80 uppercase"
        >
          Đã ký
        </motion.p>
      ) : null}
      <p className="text-[14px] font-medium text-[#111111] uppercase dark:text-white">{name}</p>
    </div>
  );
}

type PartnerMailForm = {
  to: string;
  subject: string;
  title: string;
  intro: string;
  message: string;
  replyTo: string;
};

function createPartnerMailForm(contract: Contract): PartnerMailForm {
  const partner = contract.partnerCompanyInfo;
  const owner = contract.ownerCompanyInfo;

  return {
    to: partner.email || "",
    subject: `Hợp đồng nguyên tắc ${contract.contractNumber} đã sẵn sàng để xem và ký`,
    title: `Hợp đồng đã được ký bởi ${owner.companyName}`,
    intro: `Kính gửi ${partner.companyName || `${partner.ownerName || "Quý đối tác"}`},`,
    message: `${owner.companyName} đã hoàn tất chữ ký số cho hợp đồng ${contract.contractNumber}. Vui lòng kiểm tra nội dung hợp đồng và tiếp tục xử lý theo quy trình của bên mua.`,
    replyTo: owner.email || "",
  };
}

function SendPartnerMailModal({
  contract,
  isOpen,
  onClose,
}: {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
}) {
  const sendMailMutation = useSendMailTemplate();
  const generateSignLinkMutation = useGenerateSignLink();
  const [form, setForm] = useState<PartnerMailForm>(() =>
    createPartnerMailForm(contract),
  );

  useEffect(() => {
    if (isOpen) {
      setForm(createPartnerMailForm(contract));
    }
  }, [contract, isOpen]);

  const isSending =
    sendMailMutation.isPending || generateSignLinkMutation.isPending;

  const updateField = (field: keyof PartnerMailForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSend = async () => {
    const normalizedTo = form.to.trim();
    const normalizedSubject = form.subject.trim();

    if (!normalizedTo || !normalizedSubject) {
      toast.error(
        "Thiếu thông tin gửi mail",
        "Vui lòng kiểm tra email đối tác và tiêu đề.",
      );
      return;
    }

    const signLinkResponse = await generateSignLinkMutation.mutateAsync(
      contract.contractId,
    );

    if (!signLinkResponse.success || !signLinkResponse.data?.signingUrl) {
      return;
    }

    const response = await sendMailMutation.mutateAsync({
      to: normalizedTo,
      subject: normalizedSubject,
      title: form.title.trim() || normalizedSubject,
      intro: form.intro.trim(),
      bodyLines: form.message
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      actionLabel: "Xem hợp đồng",
      actionUrl: signLinkResponse.data.signingUrl,
      footer:
        "Email này được gửi tự động từ hệ thống của công ty Picare Việt Nam. Vui lòng không chia sẻ đường dẫn nếu không có thẩm quyền.",
      replyTo: form.replyTo.trim() || contract.ownerCompanyInfo.email || "",
    });

    if (response.success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSending && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="dashboard-theme relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-white/10 bg-white/[0.04] p-6">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Gửi mail cho đối tác
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Kiểm tra nội dung trước khi gửi hợp đồng đã ký cho bên mua.
                </p>
              </div>

              <button
                type="button"
                disabled={isSending}
                onClick={onClose}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Email đối tác
                </span>
                <input
                  type="email"
                  value={form.to}
                  disabled={isSending}
                  onChange={(event) => updateField("to", event.target.value)}
                  className="h-10 w-full border-b border-white/10 bg-transparent text-sm text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Tiêu đề
                </span>
                <input
                  value={form.subject}
                  disabled={isSending}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  className="h-10 w-full border-b border-white/10 bg-transparent text-sm text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Lời mở đầu
                </span>
                <input
                  value={form.intro}
                  disabled={isSending}
                  onChange={(event) => updateField("intro", event.target.value)}
                  className="h-10 w-full border-b border-white/10 bg-transparent text-sm text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Nội dung
                </span>
                <textarea
                  value={form.message}
                  disabled={isSending}
                  rows={5}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  className="w-full resize-none border-b border-white/10 bg-transparent py-2 text-sm leading-6 text-white transition outline-none focus:border-white/35 disabled:opacity-50"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.04] p-6">
              <button
                type="button"
                disabled={isSending}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleSend}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? <Spinner size="sm" /> : <FiMail size={14} />}
                Gửi mail
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function ContractDocument({
  contract,
  ownerSignatureRef,
  ownerSignatureRevealKey,
  partnerSignatureRef,
  partnerSignatureRevealKey,
}: {
  contract: Contract;
  ownerSignatureRef?: React.Ref<HTMLDivElement>;
  ownerSignatureRevealKey?: number;
  partnerSignatureRef?: React.Ref<HTMLDivElement>;
  partnerSignatureRevealKey?: number;
}) {
  const owner = contract.ownerCompanyInfo;
  const partner = contract.partnerCompanyInfo;
  const signedDate = getVietnameseDate(contract.createdAt);
  const dueDate = formatDate(contract.contractDueDate);
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-3xl pb-24"
    >
      <header className="grid gap-8 border-b border-black/10 pb-10 dark:border-white/10 md:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            {owner.companyName}
          </p>
          <p className="mt-3 text-[13px] text-black/35 dark:text-white/35">
            Số: {contract.contractNumber}
          </p>
        </div>
        <div className="text-left md:text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
            Cộng hòa xã hội chủ nghĩa Việt Nam
          </p>
          <p className="mt-1 text-[13px] text-black/62 dark:text-white/62">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>
      </header>

      <section className="pt-14 text-center">
        <p className="text-[13px] text-black/35 dark:text-white/35">Hôm nay, {signedDate}</p>
        <h1 className="mt-7 text-4xl font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
          Hợp đồng nguyên tắc
        </h1>
        <p className="mt-3 text-[15px] text-black/62 dark:text-white/62">
          Số {contract.contractNumber}
        </p>
        <p className="mt-1 text-[13px] text-black/35 dark:text-white/35">Về việc: Bán hàng</p>
      </section>

      <section className="mt-14">
        <ArticleTitle>Căn cứ ký kết</ArticleTitle>
        <ClauseList
          items={[
            "Căn cứ Bộ Luật Dân sự số 33/2005/QH ngày 14/06/2005 của Quốc hội nước CHXHCN Việt Nam",
            "Căn cứ Luật Thương Mại số 36/2005/QH ngày 14/06/2005 của Quốc hội nước CHXHCN Việt Nam",
            "Căn cứ vào khả năng và nhu cầu của hai bên",
          ]}
        />
      </section>

      <p className="mt-10 text-[14px] leading-7 text-black/62 dark:text-white/62">
        Hôm nay tại văn phòng công ty, hai bên gồm có các đại diện dưới đây cùng
        thống nhất ký hợp đồng nguyên tắc bán hàng theo các điều khoản trong văn
        bản này.
      </p>

      <PartySection title="Bên bán (Bên A)" party={owner} />
      <PartySection title="Bên mua (Bên B)" party={partner} />

      <section>
        <ArticleTitle>Điều 1: Nguyên tắc mua bán</ArticleTitle>
        <p className="text-[14px] leading-7 text-black/62 dark:text-white/62">
          Bên A đồng ý bán cho Bên B các sản phẩm do Bên A đăng ký, sản xuất
          hoặc phân phối. Danh mục sản phẩm và giá trị được xác nhận như sau:
        </p>
        <ProductList details={contract.details ?? []} />
        <ClauseList
          items={[
            "Số lượng sản phẩm được quy định chi tiết tại từng đơn đặt hàng của Bên B.",
            "Số lượng hàng giao cho phép dao động trong phạm vi hai bên thống nhất tại từng thời điểm.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 2: Quy cách, chất lượng hàng hóa</ArticleTitle>
        <ClauseList
          items={[
            "Quy cách và chất lượng hàng hóa tuân thủ theo tiêu chuẩn đã được công bố hoặc đăng ký với cơ quan có thẩm quyền.",
            "Bên B chịu trách nhiệm bảo quản và tiêu thụ sản phẩm đúng quy định pháp luật.",
            "Bên A chịu trách nhiệm về chất lượng sản phẩm theo phạm vi cam kết và quy chế hiện hành.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>
          Điều 3: Trách nhiệm và quyền lợi của các bên
        </ArticleTitle>
        <p className="mt-4 text-[14px] font-medium text-black/82 dark:text-white/82">
          1. Trách nhiệm của Bên A
        </p>
        <ClauseList
          items={[
            "Cung cấp hàng theo đúng số lượng, chủng loại và tiêu chuẩn đã xác nhận.",
            "Giao hàng trong thời hạn hai bên thống nhất tại từng đơn đặt hàng.",
            "Phối hợp xử lý các trường hợp hàng hóa hư hỏng do lỗi sản xuất theo quy định.",
          ]}
        />
        <p className="mt-7 text-[14px] font-medium text-black/82 dark:text-white/82">
          2. Trách nhiệm của Bên B
        </p>
        <ClauseList
          items={[
            "Gửi đơn đặt hàng trước thời điểm cần nhận hàng theo thời gian hai bên thống nhất.",
            "Kinh doanh sản phẩm theo đúng quy định của pháp luật hiện hành.",
            "Thanh toán đầy đủ và đúng thời hạn theo điều khoản thanh toán của hợp đồng.",
            "Mọi khiếu nại về hàng hóa cần được lập thành văn bản và gửi trong thời hạn quy định.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 4: Khiếu nại và giải quyết khiếu nại</ArticleTitle>
        <ClauseList
          items={[
            "Bên B có trách nhiệm kiểm tra số lượng, quy cách và chất lượng hàng hóa khi giao nhận.",
            "Khi có sai lệch, Bên B phải thông báo bằng văn bản cho Bên A trong thời hạn phù hợp.",
            "Trong thời gian xử lý tranh chấp, Bên B có trách nhiệm bảo quản hàng hóa theo đúng điều kiện quy định.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 5: Giá cả và phương thức thanh toán</ArticleTitle>
        <ClauseList
          items={[
            "Giá bán được thể hiện trong hợp đồng, phụ lục, bảng giá hoặc từng đơn đặt hàng đã được hai bên xác nhận.",
            "Thanh toán bằng chuyển khoản theo thời hạn và thông tin tài khoản do Bên A cung cấp.",
            "Các trường hợp đặc biệt khác phải có thỏa thuận bằng văn bản của hai bên.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 6: Điều khoản chung</ArticleTitle>
        <ClauseList
          items={[
            "Hai bên cam kết thực hiện đúng nội dung của hợp đồng nguyên tắc này.",
            "Trường hợp phát sinh tranh chấp, hai bên ưu tiên giải quyết bằng thương lượng.",
            "Nếu không thể giải quyết bằng thương lượng, tranh chấp sẽ được đưa ra cơ quan có thẩm quyền theo quy định pháp luật.",
          ]}
        />
        <p className="mt-8 text-[14px] leading-7 text-black/62 dark:text-white/62">
          Hợp đồng có hiệu lực kể từ ngày ký đến ngày {dueDate || "..."}. Sau
          thời hạn trên, hợp đồng có thể được ký lại hoặc gia hạn nếu được hai
          bên cùng thống nhất.
        </p>
      </section>

      <section className="mt-20 grid gap-12 border-t border-black/10 pt-12 dark:border-white/10 md:grid-cols-2">
        <SignatureBlock
          title="Đại diện Bên A"
          name={owner.ownerName}
          isSigned={hasOwnerSigned || Boolean(ownerSignatureRevealKey)}
          shouldAnimate={Boolean(ownerSignatureRevealKey)}
          revealKey={ownerSignatureRevealKey}
          signatureRef={ownerSignatureRef}
        />
        <SignatureBlock
          title="Đại diện Bên B"
          name={partner.ownerName}
          isSigned={hasPartnerSigned || Boolean(partnerSignatureRevealKey)}
          shouldAnimate={Boolean(partnerSignatureRevealKey)}
          revealKey={partnerSignatureRevealKey}
          signatureRef={partnerSignatureRef}
        />
      </section>
    </motion.article>
  );
}

function DockButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.06] text-black/70 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-black hover:text-white active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:bg-white/[0.07] dark:text-white/70 dark:hover:bg-white dark:hover:text-black"
        aria-label={label}
      >
        <span className="text-[18px] transition duration-250 ease-out group-hover:scale-105">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}

function ContractActionDock({
  contract,
  onSigned,
}: {
  contract: Contract;
  onSigned: () => void;
}) {
  const navigate = useNavigate();
  const downloadMutation = useDownloadS3Asset();
  const [signingContract, setSigningContract] = useState<Contract | null>(null);
  const [isSendMailOpen, setIsSendMailOpen] = useState(false);
  const canSignContract =
    contract.status === "draft" || contract.status === "unsigned";
  const canSendPartnerMail = contract.status === "owner_signed";

  const handleDownloadContract = () => {
    const key = getS3KeyFromUrl(contract.contractUrl);

    if (!key) {
      toast.error(
        "Không thể tải hợp đồng",
        "Hợp đồng chưa có đường dẫn tập tin để tải xuống.",
      );
      return;
    }

    downloadMutation.mutate({
      key,
      originalName: getFileNameFromS3Key(
        key,
        `${contract.contractNumber || contract.contractId}.pdf`,
      ),
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0b0b0b]/90 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        {canSignContract ? (
          <DockButton
            label="Ký hợp đồng"
            icon={<FiPenTool />}
            onClick={() => setSigningContract(contract)}
          />
        ) : null}
        {contract.status === "draft" ? (
          <DockButton
            label="Chỉnh sửa hợp đồng"
            icon={<FiEdit3 />}
            onClick={() => navigate(getEditPath(contract.contractId))}
          />
        ) : null}
        {contract.status !== "draft" ? (
          <DockButton
            label="Tải hợp đồng"
            icon={<FiDownload />}
            onClick={handleDownloadContract}
            disabled={downloadMutation.isPending}
          />
        ) : null}
        {canSendPartnerMail ? (
          <DockButton
            label="Gửi mail cho đối tác"
            icon={<FiMail />}
            onClick={() => setIsSendMailOpen(true)}
          />
        ) : null}
      </motion.div>

      <ContractSigningModal
        contract={signingContract}
        onClose={() => setSigningContract(null)}
        onSigned={onSigned}
      />

      <SendPartnerMailModal
        contract={contract}
        isOpen={isSendMailOpen}
        onClose={() => setIsSendMailOpen(false)}
      />
    </>
  );
}

export default function ContractPreviewPage() {
  const { contractId = "" } = useParams();
  const ownerSignatureRef = useRef<HTMLDivElement>(null);
  const partnerSignatureRef = useRef<HTMLDivElement>(null);
  const [ownerSignatureRevealKey, setOwnerSignatureRevealKey] = useState(0);
  const [partnerSignatureRevealKey, setPartnerSignatureRevealKey] = useState(0);
  const previousStatusRef = useRef<string>(null);
  const {
    data: contract,
    isLoading,
    isError,
    refetch,
  } = useContractDetail(contractId);

  useEffect(() => {
    if (!ownerSignatureRevealKey) return;

    const frameId = window.requestAnimationFrame(() => {
      ownerSignatureRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [ownerSignatureRevealKey]);

  useEffect(() => {
    if (!partnerSignatureRevealKey) return;

    const frameId = window.requestAnimationFrame(() => {
      partnerSignatureRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [partnerSignatureRevealKey]);

  useEffect(() => {
    if (!contract) return;

    if (
      previousStatusRef.current &&
      previousStatusRef.current !== "completed" &&
      contract.status === "completed"
    ) {
      setPartnerSignatureRevealKey((current) => current + 1);
    }

    previousStatusRef.current = contract.status;
  }, [contract]);

  const handleSigned = () => {
    void refetch();
    setOwnerSignatureRevealKey((current) => current + 1);
  };

  if (isLoading) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="white" />
          <p className="text-sm text-black/45 dark:text-white/45">Đang tải hợp đồng...</p>
        </div>
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Không tải được hợp đồng</h1>
          <p className="mt-3 text-sm leading-6 text-black/45 dark:text-white/45">
            Vui lòng kiểm tra lại mã hợp đồng hoặc thử tải lại trang.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-black/15 px-5 py-2 text-sm text-black/80 transition hover:border-black/30 hover:text-[#111111] dark:border-white/15 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-theme min-h-screen bg-[#f6f1e8] px-5 py-10 text-[#111111] dark:bg-black dark:text-white md:px-8">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <ContractDocument
        contract={contract}
        ownerSignatureRef={ownerSignatureRef}
        ownerSignatureRevealKey={ownerSignatureRevealKey}
        partnerSignatureRef={partnerSignatureRef}
        partnerSignatureRevealKey={partnerSignatureRevealKey}
      />
      <ContractActionDock contract={contract} onSigned={handleSigned} />
    </main>
  );
}
