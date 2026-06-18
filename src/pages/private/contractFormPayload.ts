import type {
  AppendixContractProductPayload,
  Contract,
  CreateContractPayload,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";

type NormalizedPartnerInfoPayload = PartnerCompanyInfoPayload;

export function normalizeCreditLimitValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : trimmed;
}

export function normalizePartnerCompanyInfo(
  info: PartnerCompanyInfoPayload,
  partnerEntityType: "individual" | "company",
): NormalizedPartnerInfoPayload {
  return {
    ...info,
    companyName:
      partnerEntityType === "company" ? info.companyName?.trim() || "" : null,
    mst: partnerEntityType === "company" ? info.mst?.trim() || "" : null,
    address: info.address.trim(),
    phone: info.phone.trim(),
    email: info.email.trim(),
    bankInfo: info.bankInfo.trim(),
    ownerName: info.ownerName.trim(),
    role: info.role.trim(),
  };
}

export function buildPrincipleContractPayload({
  ownerCompanyInfo,
  partnerCompanyInfo,
  contractDueDate,
  paymentTermDays,
  creditLimit,
}: {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractDueDate?: string | null;
  paymentTermDays: string;
  creditLimit: string;
}): Extract<CreateContractPayload, { contractType: "principle" }> {
  return {
    ownerCompanyInfo,
    partnerCompanyInfo,
    contractType: "principle",
    contractDueDate: contractDueDate ?? null,
    contractData: {
      paymentTermDays: Number(paymentTermDays),
      creditLimit: normalizeCreditLimitValue(creditLimit),
    },
  };
}

export function buildAppendixContractPayload({
  ownerCompanyInfo,
  partnerCompanyInfo,
  contractDueDate,
  principleContract,
  principleContractSignedDate,
  products,
}: {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractDueDate?: string | null;
  principleContract: Contract;
  principleContractSignedDate?: string | null;
  products: Array<string | AppendixContractProductPayload>;
}): Extract<CreateContractPayload, { contractType: "appendix" }> {
  return {
    contractType: "appendix",
    principleContractNumber:
      principleContract.contractNumber || principleContract.contractId,
    principleContractSignedDate:
      principleContractSignedDate ||
      principleContract.principleContractSignedDate ||
      null,
    contractDueDate: contractDueDate ?? null,
    ownerCompanyInfo,
    partnerCompanyInfo,
    products: products
      .map((product) =>
        typeof product === "string" ? { rawContent: product.trim() } : product,
      )
      .filter((product) => Boolean(product.rawContent?.trim())),
  };
}
