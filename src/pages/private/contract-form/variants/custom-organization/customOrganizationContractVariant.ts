import type { CreateContractPayload } from "@/types/Contract";
import {
  normalizePartnerCompanyInfo,
  validatePartnerCompanyInfo,
} from "../../common/partnerCompany";
import type { ContractVariantDefinition } from "../../types";

export type CustomOrganizationContractFormValues = {
  title: string;
  subTitle: string;
  rawContent: string;
};

const emptyValues = (): CustomOrganizationContractFormValues => ({
  title: "",
  subTitle: "",
  rawContent: "",
});

export const customOrganizationContractVariant: ContractVariantDefinition<
  "custom_organization",
  CustomOrganizationContractFormValues
> = {
  type: "custom_organization",
  title: "Hợp đồng tuỳ chỉnh tổ chức",
  description:
    "Chỉ sử dụng cho trường hợp không có mẫu sẵn hoặc đối tác muốn thay đổi nội dung hợp đồng. Dành cho công ty, tổ chức, hộ kinh doanh...",
  createInitialValues: emptyValues,
  hydrate: (contract) => {
    if (contract.contractType !== "custom_organization") return emptyValues();

    const data = contract.contractData;
    if (!data || !("rawContent" in data)) return emptyValues();

    return {
      title: data.title ?? "",
      subTitle: data.subTitle ?? "",
      rawContent: data.rawContent ?? "",
    };
  },
  validate: (values, common) => {
    if (!values.title.trim()) return "Vui lòng nhập tiêu đề hợp đồng.";
    if (!values.rawContent.trim() || values.rawContent === "<p></p>") {
      return "Vui lòng nhập nội dung hợp đồng.";
    }

    return validatePartnerCompanyInfo(common.partnerCompanyInfo, "company");
  },
  buildPayload: (values, common) =>
    ({
      contractType: "custom_organization",
      ownerCompanyInfo: common.ownerCompanyInfo,
      partnerCompanyInfo: normalizePartnerCompanyInfo(
        common.partnerCompanyInfo,
        "company",
      ),
      title: values.title.trim(),
      subTitle: values.subTitle.trim(),
      rawContent: values.rawContent.trim(),
    }) satisfies Extract<
      CreateContractPayload,
      { contractType: "custom_organization" }
    >,
};
