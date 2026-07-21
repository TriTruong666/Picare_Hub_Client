import type {
  Contract,
  CreateContractPayload,
  CustomPersonalInfoPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type CustomPersonalContractFormValues = {
  title: string;
  subTitle: string;
  rawContent: string;
  personalInfo: CustomPersonalInfoPayload;
};

const EMPTY_PERSONAL_INFO: CustomPersonalInfoPayload = {
  fullName: "",
  dateOfBirth: "",
  position: "",
  department: "",
  permanentAddress: "",
  citizenId: "",
  citizenIdIssuedDate: "",
  citizenIdIssuedPlace: "Cục Cảnh sát QLHC về TTXH",
};

const emptyValues = (): CustomPersonalContractFormValues => ({
  title: "",
  subTitle: "",
  rawContent: "",
  personalInfo: { ...EMPTY_PERSONAL_INFO },
});

function normalizeDateOnly(value: string) {
  return value.trim().split("T")[0];
}

function getPersonalInfo(contract: Contract) {
  const data = contract.contractData;
  if (!data || !("rawContent" in data) || !("personalInfo" in data)) {
    return EMPTY_PERSONAL_INFO;
  }

  return { ...EMPTY_PERSONAL_INFO, ...data.personalInfo };
}

export const customPersonalContractVariant: ContractVariantDefinition<
  "custom_personal",
  CustomPersonalContractFormValues
> = {
  type: "custom_personal",
  title: "Hợp đồng tuỳ chỉnh cá nhân",
  description: "Soạn thảo hợp đồng HTML dành cho cá nhân",
  createInitialValues: emptyValues,
  hydrate: (contract) => {
    if (contract.contractType !== "custom_personal") return emptyValues();

    const data = contract.contractData;
    if (!data || !("rawContent" in data)) return emptyValues();

    return {
      title: data.title ?? "",
      subTitle: data.subTitle ?? "",
      rawContent: data.rawContent ?? "",
      personalInfo: getPersonalInfo(contract),
    };
  },
  validate: (values) => {
    if (!values.title.trim()) return "Vui lòng nhập tiêu đề hợp đồng.";
    if (!values.rawContent.trim() || values.rawContent === "<p></p>") {
      return "Vui lòng nhập nội dung hợp đồng.";
    }
    if (Object.values(values.personalInfo).some((value) => !value.trim())) {
      return "Vui lòng nhập đầy đủ thông tin cá nhân.";
    }

    return null;
  },
  buildPayload: (values, common) =>
    ({
      contractType: "custom_personal",
      ownerCompanyInfo: common.ownerCompanyInfo,
      personalInfo: {
        ...Object.fromEntries(
          Object.entries(values.personalInfo).map(([key, value]) => [
            key,
            value.trim(),
          ]),
        ),
        dateOfBirth: normalizeDateOnly(values.personalInfo.dateOfBirth),
        citizenIdIssuedDate: normalizeDateOnly(
          values.personalInfo.citizenIdIssuedDate,
        ),
      } as CustomPersonalInfoPayload,
      title: values.title.trim(),
      subTitle: values.subTitle.trim(),
      rawContent: values.rawContent.trim(),
    }) satisfies Extract<
      CreateContractPayload,
      { contractType: "custom_personal" }
    >,
};
