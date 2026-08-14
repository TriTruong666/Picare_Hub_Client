import type {
  Contract,
  CreateContractPayload,
  EmploymentContractDataPayload,
  EmploymentPersonalInfoPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type EmploymentContractFormValues = {
  personalInfo: EmploymentPersonalInfoPayload;
  contractDate: string;
  contractTerm: string;
  startDate: string;
  workLocation: string;
  baseSalary: string;
  salaryInWords: string;
  mealAllowance: string;
  phoneUniformAllowance: string;
  performanceBonus: string;
  transportationAllowance: string;
  totalSalary: string;
};

const EMPTY_PERSONAL_INFO: EmploymentPersonalInfoPayload = {
  fullName: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  citizenId: "",
  citizenIdIssuedDate: "",
  citizenIdIssuedPlace: "Cục Cảnh sát QLHC về TTXH",
  permanentAddress: "",
  currentAddress: "",
  taxCode: "0",
  socialInsuranceNumber: "0",
  emergencyContact: "",
  position: "",
  department: "",
};

const MONEY_FIELDS = [
  "baseSalary",
  "mealAllowance",
  "phoneUniformAllowance",
  "performanceBonus",
  "transportationAllowance",
  "totalSalary",
] as const;

function todayDateOnly() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function emptyValues(): EmploymentContractFormValues {
  return {
    personalInfo: { ...EMPTY_PERSONAL_INFO },
    contractDate: todayDateOnly(),
    contractTerm: "Không xác định thời hạn",
    startDate: "",
    workLocation:
      "38/11 Nguyễn Giản Thanh, Phường Hòa Hưng, Thành phố Hồ Chí Minh",
    baseSalary: "",
    salaryInWords: "",
    mealAllowance: "0",
    phoneUniformAllowance: "0",
    performanceBonus: "0",
    transportationAllowance: "0",
    totalSalary: "",
  };
}

function normalizeDateOnly(value: string) {
  return value.trim().split("T")[0];
}

function normalizeMoney(value: string) {
  return Number(value.replace(/[.,\s]/g, ""));
}

function getEmploymentData(contract: Contract) {
  const data = contract.contractData;

  if (!data || !("contractDate" in data) || !("personalInfo" in data)) {
    return null;
  }

  return data as EmploymentContractDataPayload;
}

export const employmentContractVariant: ContractVariantDefinition<
  "employment_contract",
  EmploymentContractFormValues
> = {
  type: "employment_contract",
  title: "Hợp đồng lao động PICARE",
  description:
    "Mẫu hợp đồng lao động 9 trang, đã bao gồm phụ lục lương và phúc lợi đi liền hợp đồng.",
  createInitialValues: emptyValues,
  hydrate: (contract) => {
    if (contract.contractType !== "employment_contract") return emptyValues();

    const data = getEmploymentData(contract);
    if (!data) return emptyValues();

    return {
      personalInfo: { ...EMPTY_PERSONAL_INFO, ...data.personalInfo },
      contractDate: normalizeDateOnly(data.contractDate || ""),
      contractTerm: data.contractTerm || "Không xác định thời hạn",
      startDate: normalizeDateOnly(data.startDate || ""),
      workLocation: data.workLocation || "",
      baseSalary: String(data.baseSalary ?? ""),
      salaryInWords: data.salaryInWords || "",
      mealAllowance: String(data.mealAllowance ?? "0"),
      phoneUniformAllowance: String(data.phoneUniformAllowance ?? "0"),
      performanceBonus: String(data.performanceBonus ?? "0"),
      transportationAllowance: String(data.transportationAllowance ?? "0"),
      totalSalary: String(data.totalSalary ?? ""),
    };
  },
  validate: (values, common) => {
    if (common.ownerCompanyInfo.companyCode !== "PIC") {
      return "Mẫu hợp đồng lao động này chỉ áp dụng cho công ty PICARE.";
    }

    const requiredPersonalFields: Array<keyof EmploymentPersonalInfoPayload> = [
      "fullName",
      "email",
      "dateOfBirth",
      "gender",
      "citizenId",
      "citizenIdIssuedDate",
      "citizenIdIssuedPlace",
      "permanentAddress",
      "currentAddress",
      "taxCode",
      "socialInsuranceNumber",
      "position",
      "department",
    ];
    if (
      requiredPersonalFields.some(
        (field) => !String(values.personalInfo[field] || "").trim(),
      )
    ) {
      return "Vui lòng nhập đầy đủ thông tin người lao động.";
    }

    if (
      !values.contractDate ||
      !values.contractTerm.trim() ||
      !values.startDate ||
      !values.workLocation.trim() ||
      !values.salaryInWords.trim()
    ) {
      return "Vui lòng nhập đầy đủ thông tin hợp đồng và tiền lương.";
    }

    if (
      MONEY_FIELDS.some((field) => {
        const amount = normalizeMoney(values[field]);
        return !values[field].trim() || !Number.isFinite(amount) || amount < 0;
      })
    ) {
      return "Các khoản lương, phụ cấp và tổng thu nhập phải là số không âm.";
    }

    return null;
  },
  buildPayload: (values, common) =>
    ({
      contractType: "employment_contract",
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
      } as EmploymentPersonalInfoPayload,
      contractDate: normalizeDateOnly(values.contractDate),
      contractTerm: values.contractTerm.trim(),
      startDate: normalizeDateOnly(values.startDate),
      workLocation: values.workLocation.trim(),
      baseSalary: normalizeMoney(values.baseSalary),
      salaryInWords: values.salaryInWords.trim(),
      mealAllowance: normalizeMoney(values.mealAllowance),
      phoneUniformAllowance: normalizeMoney(values.phoneUniformAllowance),
      performanceBonus: normalizeMoney(values.performanceBonus),
      transportationAllowance: normalizeMoney(values.transportationAllowance),
      totalSalary: normalizeMoney(values.totalSalary),
    }) satisfies Extract<
      CreateContractPayload,
      { contractType: "employment_contract" }
    >,
};
