import { useEffect, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCheckCircle, FiDownload, FiPenTool } from "react-icons/fi";
import { useParams, useSearchParams } from "react-router-dom";
import picareLogoDark from "@/assets/images/picare_logo_dark.png";
import HandwrittenSignatureModal from "@/components/modals/HandwrittenSignatureModal";
import IndividualCredentialUploadModal from "@/components/modals/IndividualCredentialUploadModal";
import OrganizationCredentialUploadModal from "@/components/modals/OrganizationCredentialUploadModal";
import PartnerOrganizationSigningModal from "@/components/modals/PartnerOrganizationSigningModal";
import PartnerSignTypeModal from "@/components/modals/PartnerSignTypeModal";
import type { PartnerSignType } from "@/components/modals/PartnerSignTypeModal";

import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import {
  useContractDetail,
  useUpdatePartnerSignType,
} from "@/hooks/data/useContractHooks";
import { useDownloadS3Asset } from "@/hooks/data/useS3Hooks";
import { toast } from "@/hooks/useToast";
import type {
  Contract,
  ContractDetail,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";

type RefreshedContractHandler = () =>
  | Contract
  | undefined
  | Promise<Contract | undefined>;

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: "Bản nháp",
  unsigned: "Chờ ký",
  owner_signed: "Chủ sở hữu đã ký",
  completed: "Hoàn tất",
};

function normalizeLegalName(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/^(ong|ba|anh|chi|co|chu)\s+/i, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

function getIndividualCredentialName(contract: Contract) {
  return (
    contract.individualCredential?.name ||
    contract.individualCredential?.ocr?.first?.data?.[0]?.name ||
    ""
  );
}

function isCredentialNameMatched(contract: Contract) {
  const credentialName = normalizeLegalName(
    getIndividualCredentialName(contract),
  );
  const partnerOwnerName = normalizeLegalName(
    contract.partnerCompanyInfo.ownerName,
  );

  if (!credentialName || !partnerOwnerName) {
    return true;
  }

  return credentialName === partnerOwnerName;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
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

function ArticleTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 text-[13px] font-medium tracking-[0.12em] text-white/80 uppercase">
      {children}
    </h2>
  );
}

function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-[14px] leading-7 text-white/62">
      <span className="mr-2 text-white/35">{label}:</span>
      <span className="text-white/82">{value || "-"}</span>
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
      <h3 className="text-[15px] font-medium text-white uppercase">{title}</h3>
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
        <p key={item} className="text-[14px] leading-7 text-white/62">
          {item}
        </p>
      ))}
    </div>
  );
}

function ProductList({ details }: { details: ContractDetail[] }) {
  return (
    <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
      <div className="grid grid-cols-[42px_1fr_130px] gap-4 py-3 text-[11px] tracking-[0.12em] text-white/35 uppercase">
        <span>STT</span>
        <span>Sản phẩm</span>
        <span className="text-right">Giá</span>
      </div>
      {details.map((item, index) => (
        <div
          key={item.contractDetailId || item.productName}
          className="grid grid-cols-[42px_1fr_130px] gap-4 py-4 text-[14px]"
        >
          <span className="text-white/35">{index + 1}</span>
          <span className="text-white/82">{item.productName}</span>
          <span className="text-right text-white/62 tabular-nums">
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
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <motion.path
          d="M42 86 C88 84, 126 84, 184 84 S230 84, 258 84"
          fill="none"
          stroke="rgba(255,255,255,0.84)"
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
        className="relative z-10 text-[58px] leading-none font-light text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.14)] select-none"
        style={{
          fontFamily: signatureFontFamily,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          textShadow: "0 1px 0 rgba(255,255,255,0.08)",
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
  signatureRef?: Ref<HTMLDivElement>;
}) {
  const signatureName = getSignatureDisplayName(name);
  return (
    <div ref={signatureRef} className="relative text-center">
      <p className="text-[13px] font-medium tracking-[0.08em] text-white/80 uppercase">
        {title}
      </p>
      <p className="mt-2 text-[12px] text-white/35">
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
      <p className="text-[14px] font-medium text-white uppercase">{name}</p>
    </div>
  );
}

function ContractDocument({
  contract,
  partnerSignatureRef,
  partnerSignatureRevealKey,
}: {
  contract: Contract;
  partnerSignatureRef?: Ref<HTMLDivElement>;
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
      <header className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-white/80 uppercase">
            {owner.companyName}
          </p>
          <p className="mt-3 text-[13px] text-white/35">
            Số: {contract.contractNumber}
          </p>
        </div>
        <div className="text-left md:text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-white/80 uppercase">
            Cộng hòa xã hội chủ nghĩa Việt Nam
          </p>
          <p className="mt-1 text-[13px] text-white/62">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>
      </header>

      <section className="pt-14 text-center">
        <p className="text-[13px] text-white/35">Hôm nay, {signedDate}</p>
        <h1 className="mt-7 text-4xl font-medium tracking-[0.03em] text-white uppercase">
          Hợp đồng nguyên tắc
        </h1>
        <p className="mt-3 text-[15px] text-white/62">
          Số {contract.contractNumber}
        </p>
        <p className="mt-1 text-[13px] text-white/35">Về việc: Bán hàng</p>
      </section>

      <section className="mt-14">
        <ArticleTitle>Căn cứ ký kết</ArticleTitle>
        <ClauseList
          items={[
            "Căn cứ Bộ Luật Dân sự số 33/2005/QH ngày 14/06/2005 của Quốc hội nước CHXHCN Việt Nam;",
            "Căn cứ Luật Thương Mại số 36/2005/QH ngày 14/06/2005 của Quốc hội nước CHXHCN Việt Nam",
            "Căn cứ vào khả năng và nhu cầu của hai bên",
          ]}
        />
      </section>

      <p className="mt-10 text-[14px] leading-7 text-white/62">
        Hôm nay tại văn phòng công ty, hai bên gồm có các đại diện dưới đây cùng
        thống nhất ký hợp đồng nguyên tắc bán hàng theo các điều khoản trong văn
        bản này.
      </p>

      <PartySection title="Bên bán (Bên A)" party={owner} />
      <PartySection title="Bên mua (Bên B)" party={partner} />

      <section>
        <ArticleTitle>Điều 1: Nguyên tắc mua bán</ArticleTitle>
        <p className="text-[14px] leading-7 text-white/62">
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
        <p className="mt-4 text-[14px] font-medium text-white/82">
          1. Trách nhiệm của Bên A
        </p>
        <ClauseList
          items={[
            "Cung cấp hàng theo đúng số lượng, chủng loại và tiêu chuẩn đã xác nhận.",
            "Giao hàng trong thời hạn hai bên thống nhất tại từng đơn đặt hàng.",
            "Phối hợp xử lý các trường hợp hàng hóa hư hỏng do lỗi sản xuất theo quy định.",
          ]}
        />
        <p className="mt-7 text-[14px] font-medium text-white/82">
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
        <p className="mt-8 text-[14px] leading-7 text-white/62">
          Hợp đồng có hiệu lực kể từ ngày ký đến ngày {dueDate || "..."}. Sau
          thời hạn trên, hợp đồng có thể được ký lại hoặc gia hạn nếu được hai
          bên cùng thống nhất.
        </p>
      </section>

      <section className="mt-20 grid gap-12 border-t border-white/10 pt-12 md:grid-cols-2">
        <SignatureBlock
          title="Đại diện Bên A"
          name={owner.ownerName}
          isSigned={hasOwnerSigned}
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
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-black active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        aria-label={label}
      >
        <span className="text-[18px] transition duration-250 ease-out group-hover:scale-105">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}

function LegalNameMismatchModal({
  isOpen,
  credentialName,
  contractName,
  onClose,
  onContinue,
  onReupload,
}: {
  isOpen: boolean;
  credentialName: string;
  contractName: string;
  onClose: () => void;
  onContinue: () => void;
  onReupload: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="dashboard-theme relative w-full max-w-xl overflow-hidden rounded-2xl border border-amber-300/18 bg-[#0b0b0b] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
          >
            <div className="border-b border-white/10 bg-amber-300/[0.06] px-6 py-5">
              <p className="text-[11px] font-medium text-amber-200/75 uppercase">
                Cảnh báo pháp lý
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Tên trên CCCD không trùng người đại diện hợp đồng
              </h2>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-sm leading-6 text-white/62">
                Việc tiếp tục ký khi thông tin định danh không khớp có thể làm
                phát sinh rủi ro về thẩm quyền ký, giá trị chứng minh danh tính
                và hiệu lực pháp lý của hợp đồng nếu có tranh chấp.
              </p>

              <dl className="divide-y divide-white/10 border-y border-white/10">
                <div className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
                  <dt className="text-xs text-white/35">Tên trên CCCD</dt>
                  <dd className="text-sm text-white/82">
                    {credentialName || "-"}
                  </dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
                  <dt className="text-xs text-white/35">
                    Người đại diện hợp đồng
                  </dt>
                  <dd className="text-sm text-white/82">
                    {contractName || "-"}
                  </dd>
                </div>
              </dl>

              <p className="text-xs leading-5 text-amber-100/58">
                Chỉ tiếp tục nếu bên ký xác nhận mình có đầy đủ thẩm quyền đại
                diện và chịu trách nhiệm với chữ ký này.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.04] p-6">
              <button
                type="button"
                onClick={onReupload}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
              >
                Upload lại CCCD
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-100"
              >
                Tiếp tục ký
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function ContractCompletionModal({
  isOpen,
  onClose,
  onDownload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[340] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 14 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="dashboard-theme relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
          >
            <div className="flex flex-col items-center px-8 pt-8 text-center">
              <img
                src={picareLogoDark}
                alt="Picare"
                className="h-auto w-full max-w-[260px] object-contain"
              />

              <h2 className="mt-1 text-[20px] leading-7 font-semibold text-white">
                Hợp đồng đã được ký thành công
              </h2>

              <p className="mt-3 max-w-[420px] text-[13px] leading-6 text-white/62">
                Việc ký kết đã được ghi nhận trên hệ thống. Hợp đồng có giá trị
                pháp lý theo nội dung đã xác nhận và được lưu trữ để đối chiếu
                khi cần.
              </p>

              <p className="mt-4 max-w-[390px] text-[12px] leading-6 text-white/42">
                Bạn có thể tải bản hợp đồng hoàn chỉnh để lưu hồ sơ nội bộ hoặc
                sử dụng cho các mục đích đối chiếu sau này.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3 border-t border-white/10 bg-white/[0.03] px-7 py-5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm text-white/62 transition hover:bg-white/10 hover:text-white"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <FiDownload size={14} />
                Tải hợp đồng
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function ContractActionDock({
  contract,
  partnerToken,
  onCredentialUploaded,
}: {
  contract: Contract;
  partnerToken?: string;
  onCredentialUploaded?: RefreshedContractHandler;
}) {
  const downloadMutation = useDownloadS3Asset();
  const updatePartnerSignTypeMutation = useUpdatePartnerSignType();
  const [isSignTypeModalOpen, setIsSignTypeModalOpen] = useState(false);
  const [isIndividualCredentialOpen, setIsIndividualCredentialOpen] =
    useState(false);
  const [isNameMismatchOpen, setIsNameMismatchOpen] = useState(false);
  const [isHandwrittenSignatureOpen, setIsHandwrittenSignatureOpen] =
    useState(false);
  const [isOrganizationCredentialOpen, setIsOrganizationCredentialOpen] =
    useState(false);
  const [isOrganizationSigningOpen, setIsOrganizationSigningOpen] =
    useState(false);
  const canPartnerSign = contract.status === "owner_signed";
  const credentialName = getIndividualCredentialName(contract);
  const signatureSignerName =
    credentialName || contract.partnerCompanyInfo.ownerName;

  const openHandwrittenSignatureFlow = () => {
    setIsIndividualCredentialOpen(false);
    setIsNameMismatchOpen(false);
    setIsOrganizationCredentialOpen(false);
    setIsOrganizationSigningOpen(false);
    setIsHandwrittenSignatureOpen(true);
  };

  const handleCredentialContinue = (nextContract?: Contract) => {
    const activeContract = nextContract ?? contract;

    if (isCredentialNameMatched(activeContract)) {
      openHandwrittenSignatureFlow();
      return;
    }

    setIsIndividualCredentialOpen(false);
    setIsNameMismatchOpen(true);
  };

  const handleReuploadCredentialFromWarning = () => {
    setIsNameMismatchOpen(false);
    setIsIndividualCredentialOpen(true);
  };

  const handleOrganizationCredentialContinue = (nextContract?: Contract) => {
    setIsIndividualCredentialOpen(false);
    setIsNameMismatchOpen(false);
    setIsHandwrittenSignatureOpen(false);
    setIsOrganizationCredentialOpen(false);
    setIsOrganizationSigningOpen(true);
  };

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

  const handleSignTypeConfirm = async (type: PartnerSignType) => {
    if (!partnerToken) {
      toast.error("Thiếu token", "Đường dẫn ký không hợp lệ hoặc đã hết hạn.");
      return;
    }

    const response = await updatePartnerSignTypeMutation.mutateAsync({
      contractId: contract.contractId,
      partnerToken,
      data: { signerType: type },
    });

    if (!response.success) {
      return;
    }

    setIsSignTypeModalOpen(false);
    setIsIndividualCredentialOpen(false);
    setIsNameMismatchOpen(false);
    setIsHandwrittenSignatureOpen(false);
    setIsOrganizationCredentialOpen(false);
    setIsOrganizationSigningOpen(false);
    if (type === "individual") {
      if (contract.individualCredential) {
        handleCredentialContinue();
        return;
      }
      setIsIndividualCredentialOpen(true);
      return;
    }

    if (contract.organizationCredential) {
      setIsOrganizationSigningOpen(true);
      return;
    }

    setIsOrganizationCredentialOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0b0b0b]/90 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        {contract.status !== "draft" ? (
          <DockButton
            label="Tải hợp đồng"
            icon={<FiDownload />}
            onClick={handleDownloadContract}
            disabled={downloadMutation.isPending}
          />
        ) : null}
        {canPartnerSign ? (
          <DockButton
            label="Ký hợp đồng"
            icon={<FiPenTool className="text-emerald-400" />}
            onClick={() => setIsSignTypeModalOpen(true)}
          />
        ) : null}
      </motion.div>

      <PartnerSignTypeModal
        isOpen={isSignTypeModalOpen}
        onClose={() => setIsSignTypeModalOpen(false)}
        onConfirm={handleSignTypeConfirm}
      />

      <IndividualCredentialUploadModal
        contractId={contract.contractId}
        partnerToken={partnerToken}
        isOpen={isIndividualCredentialOpen}
        onClose={() => setIsIndividualCredentialOpen(false)}
        onUploaded={onCredentialUploaded}
        onContinue={handleCredentialContinue}
      />

      <OrganizationCredentialUploadModal
        contractId={contract.contractId}
        partnerToken={partnerToken}
        isOpen={isOrganizationCredentialOpen}
        onClose={() => setIsOrganizationCredentialOpen(false)}
        onUploaded={onCredentialUploaded}
        onContinue={handleOrganizationCredentialContinue}
      />

      <LegalNameMismatchModal
        isOpen={isNameMismatchOpen}
        credentialName={credentialName}
        contractName={contract.partnerCompanyInfo.ownerName}
        onClose={() => setIsNameMismatchOpen(false)}
        onContinue={openHandwrittenSignatureFlow}
        onReupload={handleReuploadCredentialFromWarning}
      />

      <HandwrittenSignatureModal
        contractId={contract.contractId}
        partnerToken={partnerToken}
        signerName={signatureSignerName}
        signerEmail={contract.partnerCompanyInfo.email}
        isOpen={isHandwrittenSignatureOpen}
        onClose={() => setIsHandwrittenSignatureOpen(false)}
        onSigned={onCredentialUploaded}
      />

      <PartnerOrganizationSigningModal
        contract={isOrganizationSigningOpen ? contract : null}
        partnerToken={partnerToken}
        onClose={() => setIsOrganizationSigningOpen(false)}
        onSigned={async () => {
          await onCredentialUploaded?.();
        }}
      />
    </>
  );
}

export default function ContractPartnerSignPage() {
  const { contractId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const downloadMutation = useDownloadS3Asset();
  const partnerSignatureRef = useRef<HTMLDivElement>(null);
  const [partnerSignatureRevealKey, setPartnerSignatureRevealKey] = useState(0);
  const previousStatusRef = useRef<string | undefined>(undefined);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const partnerToken = searchParams.get("token")?.trim() || undefined;
  const {
    data: contract,
    isLoading,
    isError,
    refetch,
  } = useContractDetail(contractId, partnerToken);

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
      setIsCompletionModalOpen(true);
    }

    previousStatusRef.current = contract.status;
  }, [contract]);

  if (isLoading) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="white" />
          <p className="text-sm text-white/45">Đang tải hợp đồng...</p>
        </div>
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Không tải được hợp đồng</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Vui lòng kiểm tra lại mã hợp đồng hoặc liên hệ với đối tác gửi link.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-white/15 px-5 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

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

  // Strictly restrict access if status is not owner_signed or completed
  if (contract.status !== "owner_signed" && contract.status !== "completed") {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <FiPenTool size={24} />
          </div>
          <h1 className="mt-6 text-xl font-semibold text-white">
            Liên kết không hợp lệ hoặc đã hết hạn
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Đường dẫn ký hợp đồng này chỉ mở khi bên bán đã ký số và trạng thái
            hợp đồng là chờ bên mua ký.
          </p>
          <p className="mt-1 text-xs text-white/30">
            Trạng thái hiện tại:{" "}
            <span className="font-medium text-white/50">{contract.status}</span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-theme min-h-screen bg-black px-5 py-10 text-white md:px-8">
      <ContractDocument
        contract={contract}
        partnerSignatureRef={partnerSignatureRef}
        partnerSignatureRevealKey={partnerSignatureRevealKey}
      />
      {contract.status === "owner_signed" || contract.status === "completed" ? (
        <ContractActionDock
          contract={contract}
          partnerToken={partnerToken}
          onCredentialUploaded={async () => {
            const response = await refetch();
            return response?.data;
          }}
        />
      ) : null}
      <ContractCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onDownload={handleDownloadContract}
      />
    </main>
  );
}
