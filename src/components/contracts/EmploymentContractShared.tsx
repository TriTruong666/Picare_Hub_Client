import { motion } from "framer-motion";
import type { Ref } from "react";
import type { Contract } from "@/types/Contract";

type SignatureProps = {
  title: string;
  subtitle: string;
  name: string;
  signed: boolean;
  signatureRef?: Ref<HTMLDivElement>;
  revealKey?: number;
};

export function ContractHeader({
  companyName,
  contractNumber,
  contractDate,
}: {
  companyName: string;
  contractNumber: string;
  contractDate: string;
}) {
  return (
    <header className="grid grid-cols-1 gap-8 text-center text-[14px] leading-7 text-black/62 sm:grid-cols-2 dark:text-white/62">
      <div>
        <p className="font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
          {companyName}
        </p>
        <p className="mt-2">Số: {contractNumber}</p>
      </div>
      <div>
        <p className="font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
          Cộng hòa xã hội chủ nghĩa Việt Nam
        </p>
        <p className="mt-1 font-semibold">Độc lập - Tự do - Hạnh phúc</p>
        <p className="mt-1">----------- oOo ----------</p>
        <p className="mt-3 italic">TP. Hồ Chí Minh, {contractDate}</p>
      </div>
    </header>
  );
}

export function PartyRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-black/10 py-1.5 last:border-0 sm:grid-cols-[170px_1fr] sm:gap-3 dark:border-white/10">
      <dt className="text-black/35 dark:text-white/35">{label}</dt>
      <dd className="font-semibold text-black/86 dark:text-white/86">
        {value || "-"}
      </dd>
    </div>
  );
}

function Signature({
  title,
  subtitle,
  name,
  signed,
  signatureRef,
  revealKey,
}: SignatureProps) {
  const displayName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  return (
    <div ref={signatureRef} className="relative text-center">
      <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
        {title}
      </p>
      <p className="mt-2 text-[12px] text-black/35 dark:text-white/35">
        {subtitle} · Ký, ghi rõ họ và tên
      </p>
      {signed && displayName ? (
        <motion.div
          key={`${displayName}-${revealKey ?? 0}`}
          initial={
            revealKey ? { opacity: 0, y: 12, filter: "blur(7px)" } : false
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-36 max-w-[300px] items-center justify-center text-[54px] leading-none text-[#111111] dark:text-white"
          style={{
            fontFamily:
              '"Allura", "Sriracha", "Segoe Script", "Snell Roundhand", cursive',
          }}
        >
          {displayName}
        </motion.div>
      ) : (
        <div className="h-32" />
      )}
      {signed ? (
        <p className="mb-2 text-[11px] font-medium tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-200/80">
          Đã ký
        </p>
      ) : null}
      <p className="text-[14px] font-medium text-[#111111] uppercase dark:text-white">
        {name || "-"}
      </p>
    </div>
  );
}

export function SignatureArea({
  contract,
  employeeName,
  ownerSignatureRef,
  partnerSignatureRef,
  ownerSignatureRevealKey,
  partnerSignatureRevealKey,
}: {
  contract: Contract;
  employeeName: string;
  ownerSignatureRef?: Ref<HTMLDivElement>;
  partnerSignatureRef?: Ref<HTMLDivElement>;
  ownerSignatureRevealKey?: number;
  partnerSignatureRevealKey?: number;
}) {
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";

  return (
    <section className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
      <Signature
        title="Bên A"
        subtitle="Người sử dụng lao động"
        name={contract.ownerCompanyInfo.ownerName}
        signed={hasOwnerSigned}
        signatureRef={ownerSignatureRef}
        revealKey={ownerSignatureRevealKey}
      />
      <Signature
        title="Bên B"
        subtitle="Người lao động"
        name={employeeName}
        signed={hasPartnerSigned}
        signatureRef={partnerSignatureRef}
        revealKey={partnerSignatureRevealKey}
      />
    </section>
  );
}
