import type {
  CreateContractPayload,
  LivestreamResponsibilityPersonalInfoPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type LivestreamResponsibilityCommitmentFormValues =
  LivestreamResponsibilityPersonalInfoPayload;

function normalizeDateOnly(value: string) {
  return value.trim().split("T")[0];
}

const EMPTY_VALUES: LivestreamResponsibilityCommitmentFormValues = {
  fullName: "",
  dateOfBirth: "",
  position: "",
  department: "",
  permanentAddress: "",
  citizenId: "",
  citizenIdIssuedDate: "",
  citizenIdIssuedPlace: "",
};

export const livestreamResponsibilityCommitmentContractVariant: ContractVariantDefinition<
  "livestream_responsibility_commitment",
  LivestreamResponsibilityCommitmentFormValues
> = {
  type: "livestream_responsibility_commitment",
  title: "Cam kết trách nhiệm Livestream",
  description: "Cam kết trách nhiệm dành cho nhân sự Livestream nội bộ",
  createInitialValues: () => ({ ...EMPTY_VALUES }),
  hydrate: (contract) => {
    if (contract.contractType !== "livestream_responsibility_commitment") {
      return { ...EMPTY_VALUES };
    }

    return { ...EMPTY_VALUES, ...contract.personalInfo };
  },
  validate: (values) => {
    if (Object.values(values).some((value) => !value.trim())) {
      return "Vui lòng nhập đầy đủ thông tin cá nhân.";
    }
    return null;
  },
  buildPayload: (values, common) =>
    ({
      contractType: "livestream_responsibility_commitment",
      ownerCompanyInfo: common.ownerCompanyInfo,
      personalInfo: {
        ...Object.fromEntries(
          Object.entries(values).map(([key, value]) => [key, value.trim()]),
        ),
        dateOfBirth: normalizeDateOnly(values.dateOfBirth),
        citizenIdIssuedDate: normalizeDateOnly(values.citizenIdIssuedDate),
      } as LivestreamResponsibilityPersonalInfoPayload,
    }) satisfies Extract<
      CreateContractPayload,
      { contractType: "livestream_responsibility_commitment" }
    >,
};
