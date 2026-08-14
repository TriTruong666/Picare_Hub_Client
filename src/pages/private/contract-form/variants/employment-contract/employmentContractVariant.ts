import type {
  Contract,
  CreateContractPayload,
  EmploymentContractDataPayload,
  EmploymentPersonalInfoPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type EmploymentContractFormValues = {
  personalInfo: {
    [Field in keyof EmploymentPersonalInfoPayload]: string;
  };
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

const EMPTY_PERSONAL_INFO: EmploymentContractFormValues["personalInfo"] = {
  fullName: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  citizenId: "",
  citizenIdIssuedDate: "",
  citizenIdIssuedPlace: "",
  permanentAddress: "",
  currentAddress: "",
  taxCode: "",
  socialInsuranceNumber: "",
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

function emptyValues(): EmploymentContractFormValues {
  return {
    personalInfo: { ...EMPTY_PERSONAL_INFO },
    contractDate: "",
    contractTerm: "",
    startDate: "",
    workLocation: "",
    baseSalary: "",
    salaryInWords: "",
    mealAllowance: "",
    phoneUniformAllowance: "",
    performanceBonus: "",
    transportationAllowance: "",
    totalSalary: "",
  };
}

function normalizeDateOnly(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .split("T")[0];
}

function normalizeMoney(value: string) {
  const normalized = value.replace(/[.,\s]/g, "").trim();
  return normalized ? Number(normalized) : null;
}

function nullableText(value: string) {
  return value.trim() || null;
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
  title: "Hợp đồng lao động",
  description:
    "Mẫu hợp đồng lao động 9 trang, đã bao gồm phụ lục lương và phúc lợi đi liền hợp đồng.",
  createInitialValues: emptyValues,
  hydrate: (contract) => {
    if (contract.contractType !== "employment_contract") return emptyValues();

    const data = getEmploymentData(contract);
    if (!data) return emptyValues();

    return {
      personalInfo: Object.fromEntries(
        Object.entries({ ...EMPTY_PERSONAL_INFO, ...data.personalInfo }).map(
          ([key, value]) => [key, String(value ?? "")],
        ),
      ) as EmploymentContractFormValues["personalInfo"],
      contractDate: normalizeDateOnly(data.contractDate || ""),
      contractTerm: data.contractTerm || "",
      startDate: normalizeDateOnly(data.startDate || ""),
      workLocation: data.workLocation || "",
      baseSalary: String(data.baseSalary ?? ""),
      salaryInWords: data.salaryInWords || "",
      mealAllowance: String(data.mealAllowance ?? ""),
      phoneUniformAllowance: String(data.phoneUniformAllowance ?? ""),
      performanceBonus: String(data.performanceBonus ?? ""),
      transportationAllowance: String(data.transportationAllowance ?? ""),
      totalSalary: String(data.totalSalary ?? ""),
    };
  },
  validate: (values) => {
    const requiredPersonalFields: Array<keyof EmploymentPersonalInfoPayload> = [
      "fullName",
      "email",
    ];
    if (
      requiredPersonalFields.some(
        (field) => !String(values.personalInfo[field] || "").trim(),
      )
    ) {
      return "Vui lòng nhập họ tên và email nhận link ký của người lao động.";
    }

    if (
      MONEY_FIELDS.some((field) => {
        const amount = normalizeMoney(values[field]);
        return amount !== null && (!Number.isFinite(amount) || amount < 0);
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
            key === "fullName" || key === "email"
              ? value.trim()
              : nullableText(value),
          ]),
        ),
        dateOfBirth: normalizeDateOnly(values.personalInfo.dateOfBirth) || null,
        citizenIdIssuedDate:
          normalizeDateOnly(values.personalInfo.citizenIdIssuedDate) || null,
      } as EmploymentPersonalInfoPayload,
      contractDate: normalizeDateOnly(values.contractDate) || null,
      contractTerm: nullableText(values.contractTerm),
      startDate: normalizeDateOnly(values.startDate) || null,
      workLocation: nullableText(values.workLocation),
      baseSalary: normalizeMoney(values.baseSalary),
      salaryInWords: nullableText(values.salaryInWords),
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
