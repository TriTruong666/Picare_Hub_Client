import type { Contract } from "@/types/Contract";
import { SectionTitle } from "../../common/FormPrimitives";
import { PrincipleContractSelect } from "../appendix/AppendixContractFields";

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
  return (
    <section className="border-b border-black/10 py-6 dark:border-white/10">
      <SectionTitle>Bản cam kết Livestream gốc</SectionTitle>
      <PrincipleContractSelect
        contracts={contracts}
        selectedContractId={selectedId}
        isLoading={isLoading}
        onChange={onSelect}
        contractKind="livestream"
      />
    </section>
  );
}
