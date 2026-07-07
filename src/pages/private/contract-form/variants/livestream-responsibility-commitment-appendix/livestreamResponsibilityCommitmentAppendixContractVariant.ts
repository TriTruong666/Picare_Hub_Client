import type {
  CreateContractPayload,
  LivestreamResponsibilityPersonalInfoPayload,
  OwnerCompanyInfoPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type LivestreamResponsibilityCommitmentAppendixFormValues = {
  parentContractId: string;
  personalInfo: LivestreamResponsibilityPersonalInfoPayload | null;
  ownerCompanyInfo: OwnerCompanyInfoPayload | null;
};

export const livestreamResponsibilityCommitmentAppendixContractVariant: ContractVariantDefinition<
  "livestream_responsibility_commitment_appendix",
  LivestreamResponsibilityCommitmentAppendixFormValues
> = {
  type: "livestream_responsibility_commitment_appendix",
  title: "Phụ lục cam kết Livestream",
  description: "Danh mục nội dung và từ khóa cấm kèm theo bản cam kết Livestream",
  createInitialValues: () => ({
    parentContractId: "",
    personalInfo: null,
    ownerCompanyInfo: null,
  }),
  hydrate: (contract) => {
    if (
      contract.contractType !==
      "livestream_responsibility_commitment_appendix"
    ) {
      return {
        parentContractId: "",
        personalInfo: null,
        ownerCompanyInfo: null,
      };
    }
    return {
      parentContractId: contract.parentContractId ?? "",
      personalInfo: contract.personalInfo ?? null,
      ownerCompanyInfo: contract.ownerCompanyInfo,
    };
  },
  validate: (values) => {
    if (
      !values.parentContractId ||
      !values.personalInfo ||
      !values.ownerCompanyInfo
    ) {
      return "Vui lòng chọn bản cam kết Livestream đã hoàn tất.";
    }
    return null;
  },
  buildPayload: (values) => {
    if (!values.personalInfo) {
      throw new Error("Personal information is required for the appendix.");
    }
    return {
      contractType: "livestream_responsibility_commitment_appendix",
      ownerCompanyInfo: values.ownerCompanyInfo,
      parentContractId: values.parentContractId,
      personalInfo: values.personalInfo,
    } satisfies Extract<
      CreateContractPayload,
      { contractType: "livestream_responsibility_commitment_appendix" }
    >;
  },
};
