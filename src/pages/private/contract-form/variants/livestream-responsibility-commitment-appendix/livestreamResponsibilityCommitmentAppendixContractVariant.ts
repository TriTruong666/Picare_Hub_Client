import type {
  CreateContractPayload,
  LivestreamResponsibilityPersonalInfoPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type LivestreamResponsibilityCommitmentAppendixFormValues = {
  parentContractId: string;
  personalInfo: LivestreamResponsibilityPersonalInfoPayload | null;
};

export const livestreamResponsibilityCommitmentAppendixContractVariant: ContractVariantDefinition<
  "livestream_responsibility_commitment_appendix",
  LivestreamResponsibilityCommitmentAppendixFormValues
> = {
  type: "livestream_responsibility_commitment_appendix",
  title: "Phụ lục cam kết Livestream",
  description: "Danh mục nội dung và từ khóa cấm kèm theo bản cam kết Livestream",
  createInitialValues: () => ({ parentContractId: "", personalInfo: null }),
  hydrate: (contract) => {
    if (
      contract.contractType !==
      "livestream_responsibility_commitment_appendix"
    ) {
      return { parentContractId: "", personalInfo: null };
    }
    return {
      parentContractId: contract.parentContractId ?? "",
      personalInfo: contract.personalInfo ?? null,
    };
  },
  validate: (values) => {
    if (!values.parentContractId || !values.personalInfo) {
      return "Vui lòng chọn bản cam kết Livestream đã hoàn tất.";
    }
    return null;
  },
  buildPayload: (values, common) => {
    if (!values.personalInfo) {
      throw new Error("Personal information is required for the appendix.");
    }
    return {
      contractType: "livestream_responsibility_commitment_appendix",
      ownerCompanyInfo: common.ownerCompanyInfo,
      parentContractId: values.parentContractId,
      personalInfo: values.personalInfo,
    } satisfies Extract<
      CreateContractPayload,
      { contractType: "livestream_responsibility_commitment_appendix" }
    >;
  },
};
