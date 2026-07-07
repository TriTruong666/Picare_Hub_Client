import type {
  Contract,
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

function getPersonalInfo(contract: Contract) {
  return (
    contract.personalInfo ??
    (contract.contractData && "personalInfo" in contract.contractData
      ? contract.contractData.personalInfo
      : null)
  );
}

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

    const parentContractId =
      contract.parentContractId ||
      (contract.contractData && "parentContractId" in contract.contractData
        ? (contract.contractData.parentContractId as string)
        : "") ||
      "";

    const ownerCompanyInfo =
      contract.ownerCompanyInfo ||
      (contract.contractData && "ownerCompanyInfo" in contract.contractData
        ? contract.contractData.ownerCompanyInfo
        : null) ||
      null;

    return {
      parentContractId,
      personalInfo: getPersonalInfo(contract),
      ownerCompanyInfo,
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
    if (Object.values(values.personalInfo).some((value) => !value.trim())) {
      return "Hợp đồng Livestream gốc chưa có đầy đủ thông tin cá nhân.";
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
