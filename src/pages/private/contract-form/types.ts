import type {
  Contract,
  CreateContractPayload,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";

export type PartnerEntityType = "individual" | "company";
export type SupportedContractType =
  | "principle"
  | "appendix"
  | "livestream_responsibility_commitment";

export type ContractFormCommonValues = {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  partnerEntityType: PartnerEntityType;
  contractDueDate?: string | null;
};

export type ContractVariantDefinition<
  TType extends SupportedContractType,
  TValues,
> = {
  type: TType;
  title: string;
  description: string;
  createInitialValues: () => TValues;
  hydrate: (contract: Contract) => TValues;
  validate: (
    values: TValues,
    common: ContractFormCommonValues,
  ) => string | null;
  buildPayload: (
    values: TValues,
    common: ContractFormCommonValues,
  ) => Extract<CreateContractPayload, { contractType: TType }>;
};

