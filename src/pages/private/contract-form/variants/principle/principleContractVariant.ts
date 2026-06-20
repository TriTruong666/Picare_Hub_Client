import type { CreateContractPayload } from "@/types/Contract";
import { normalizePartnerCompanyInfo, validatePartnerCompanyInfo } from "../../common/partnerCompany";
import type { ContractVariantDefinition } from "../../types";

export type PrincipleContractFormValues = {
  paymentTermDays: string;
  creditLimit: string;
};

function normalizeCreditLimitValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : trimmed;
}

export const principleContractVariant: ContractVariantDefinition<
  "principle",
  PrincipleContractFormValues
> = {
  type: "principle",
  title: "Hợp đồng nguyên tắc",
  description: "Mẫu hợp đồng đồng nguyên tắc về việc mua bán",
  createInitialValues: () => ({ paymentTermDays: "", creditLimit: "" }),
  hydrate: (contract) => {
    if (contract.contractType !== "principle") {
      return { paymentTermDays: "", creditLimit: "" };
    }

    const contractData = contract.contractData;
    return {
      paymentTermDays:
        contractData && "paymentTermDays" in contractData
          ? String(contractData.paymentTermDays ?? "")
          : "",
      creditLimit:
        contractData && "creditLimit" in contractData
          ? String(contractData.creditLimit ?? "")
          : "",
    };
  },
  validate: (values, common) => {
    const paymentTermDays = Number(values.paymentTermDays);
    if (
      !values.paymentTermDays.trim() ||
      !Number.isInteger(paymentTermDays) ||
      paymentTermDays <= 0
    ) {
      return "Vui lòng nhập thời hạn thanh toán là số ngày lớn hơn 0.";
    }

    return validatePartnerCompanyInfo(
      common.partnerCompanyInfo,
      common.partnerEntityType,
    );
  },
  buildPayload: (values, common) =>
    ({
      ownerCompanyInfo: common.ownerCompanyInfo,
      partnerCompanyInfo: normalizePartnerCompanyInfo(
        common.partnerCompanyInfo,
        common.partnerEntityType,
      ),
      contractType: "principle",
      contractDueDate: common.contractDueDate ?? null,
      contractData: {
        paymentTermDays: Number(values.paymentTermDays),
        creditLimit: normalizeCreditLimitValue(values.creditLimit),
      },
    }) satisfies Extract<CreateContractPayload, { contractType: "principle" }>,
};

