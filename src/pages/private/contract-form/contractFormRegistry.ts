import type { ContractType } from "@/types/Contract";
import { appendixContractVariant } from "./variants/appendix/appendixContractVariant";
import { principleContractVariant } from "./variants/principle/principleContractVariant";
import { livestreamResponsibilityCommitmentContractVariant } from "./variants/livestream-responsibility-commitment/livestreamResponsibilityCommitmentContractVariant";

export const CONTRACT_FORM_REGISTRY = {
  principle: principleContractVariant,
  appendix: appendixContractVariant,
  livestream_responsibility_commitment:
    livestreamResponsibilityCommitmentContractVariant,
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
