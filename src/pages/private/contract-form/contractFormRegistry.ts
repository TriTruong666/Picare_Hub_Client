import type { ContractType } from "@/types/Contract";
import { appendixContractVariant } from "./variants/appendix/appendixContractVariant";
import { principleContractVariant } from "./variants/principle/principleContractVariant";
import { customOrganizationContractVariant } from "./variants/custom-organization/customOrganizationContractVariant";
import { customPersonalContractVariant } from "./variants/custom-personal/customPersonalContractVariant";
import { livestreamResponsibilityCommitmentContractVariant } from "./variants/livestream-responsibility-commitment/livestreamResponsibilityCommitmentContractVariant";
import { livestreamResponsibilityCommitmentAppendixContractVariant } from "./variants/livestream-responsibility-commitment-appendix/livestreamResponsibilityCommitmentAppendixContractVariant";

export const CONTRACT_FORM_REGISTRY = {
  principle: principleContractVariant,
  appendix: appendixContractVariant,

  livestream_responsibility_commitment:
    livestreamResponsibilityCommitmentContractVariant,
  livestream_responsibility_commitment_appendix:
    livestreamResponsibilityCommitmentAppendixContractVariant,
  custom_organization: customOrganizationContractVariant,
  custom_personal: customPersonalContractVariant,
} as const;

export type RegisteredContractType = keyof typeof CONTRACT_FORM_REGISTRY;

export const CONTRACT_TYPE_OPTIONS = Object.values(CONTRACT_FORM_REGISTRY).map(
  ({ type, title, description }) => ({
    value: type,
    title,
    description,
    disabled: false,
  }),
);

export function isRegisteredContractType(
  type: ContractType | string | null | undefined,
): type is RegisteredContractType {
  return Boolean(type && type in CONTRACT_FORM_REGISTRY);
}
