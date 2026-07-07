import type { Contract } from "@/types/Contract";
import { FieldLabel, SectionTitle } from "../../common/FormPrimitives";

export function LivestreamResponsibilityCommitmentAppendixFields({
  contracts,
  selectedId,
  onSelect,
  isLoading,
}: {
  contracts: Contract[];
  selectedId: string;
  onSelect: (contractId: string) => void;
  isLoading: boolean;
}) {
  const selected = contracts.find((contract) => contract.contractId === selectedId);
  return (
    <section className="border-b border-black/10 py-6 dark:border-white/10">
      <SectionTitle>Bản cam kết Livestream gốc</SectionTitle>
      <FieldLabel>Chọn bản cam kết đã hoàn tất</FieldLabel>
      <select
        value={selectedId}
        onChange={(event) => onSelect(event.target.value)}
        disabled={isLoading}
        required
        className="h-11 w-full rounded-lg border border-black/15 bg-white px-4 text-sm text-[#111111] outline-none dark:border-white/10 dark:bg-black dark:text-white"
      >
        <option value="">{isLoading ? "Đang tải..." : "Chọn bản cam kết"}</option>
        {contracts.map((contract) => (
          <option key={contract.contractId} value={contract.contractId}>
            {contract.contractNumber || contract.contractId} — {contract.personalInfo?.fullName || "Chưa có tên"}
          </option>
        ))}
      </select>
      {selected?.personalInfo ? (
        <div className="mt-4 rounded-xl border border-black/10 p-4 text-sm leading-7 text-black/62 dark:border-white/10 dark:text-white/62">
          <p className="font-medium text-[#111111] dark:text-white">{selected.personalInfo.fullName}</p>
          <p>{selected.personalInfo.position} · {selected.personalInfo.department}</p>
          <p>CCCD: {selected.personalInfo.citizenId}</p>
        </div>
      ) : null}
    </section>
  );
}
