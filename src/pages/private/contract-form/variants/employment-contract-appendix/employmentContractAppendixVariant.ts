import type {
  Contract,
  CreateContractPayload,
  EmploymentContractAppendixDataPayload,
  EmploymentContractDataPayload,
  EmploymentPersonalInfoPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type EmploymentContractAppendixFormValues = {
  parentContractId: string;
  employmentContractNumber: string;
  personalInfo: {
    [Field in keyof EmploymentPersonalInfoPayload]: string;
  };
  contractDate: string;
  baseSalary: string;
  mealAllowance: string;
  phoneUniformAllowance: string;
  performanceBonus: string;
  transportationAllowance: string;
  totalSalary: string;
};

const EMPTY_PERSONAL_INFO: EmploymentContractAppendixFormValues["personalInfo"] =
  {
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

function emptyValues(): EmploymentContractAppendixFormValues {
  return {
    parentContractId: "",
    employmentContractNumber: "",
    personalInfo: { ...EMPTY_PERSONAL_INFO },
    contractDate: "",
    baseSalary: "",
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

function normalizePersonalInfo(
  personalInfo?: Partial<EmploymentPersonalInfoPayload> | null,
) {
  return Object.fromEntries(
    Object.entries({ ...EMPTY_PERSONAL_INFO, ...personalInfo }).map(
      ([key, value]) => [key, String(value ?? "")],
    ),
  ) as EmploymentContractAppendixFormValues["personalInfo"];
}

export function createEmploymentAppendixValuesFromParent(
  contract: Contract,
): EmploymentContractAppendixFormValues {
  const data = contract.contractData;
  if (
    contract.contractType !== "employment_contract" ||
    !data ||
    !("personalInfo" in data)
  ) {
    return emptyValues();
  }

  const employmentData = data as EmploymentContractDataPayload;
  return {
    parentContractId: contract.contractId,
    employmentContractNumber: contract.contractNumber,
    personalInfo: normalizePersonalInfo(employmentData.personalInfo),
    contractDate: normalizeDateOnly(employmentData.contractDate),
    baseSalary: String(employmentData.baseSalary ?? ""),
    mealAllowance: String(employmentData.mealAllowance ?? ""),
    phoneUniformAllowance: String(employmentData.phoneUniformAllowance ?? ""),
    performanceBonus: String(employmentData.performanceBonus ?? ""),
    transportationAllowance: String(
      employmentData.transportationAllowance ?? "",
    ),
    totalSalary: String(employmentData.totalSalary ?? ""),
  };
}

export const employmentContractAppendixVariant: ContractVariantDefinition<
  "employment_contract_appendix",
  EmploymentContractAppendixFormValues
> = {
  type: "employment_contract_appendix",
  title: "Phụ lục hợp đồng lao động",
  description:
    "Bản phụ lục độc lập được sao chép từ HĐLĐ gốc; HĐLĐ gốc vẫn giữ nguyên phụ lục đi kèm.",
  createInitialValues: emptyValues,
  hydrate: (contract) => {
    if (contract.contractType !== "employment_contract_appendix") {
      return emptyValues();
    }

    const data = contract.contractData;
    if (!data || !("parentContractId" in data) || !("personalInfo" in data)) {
      return emptyValues();
    }
    const appendixData = data as EmploymentContractAppendixDataPayload;
    return {
      parentContractId: appendixData.parentContractId || "",
      employmentContractNumber: appendixData.employmentContractNumber || "",
      personalInfo: normalizePersonalInfo(appendixData.personalInfo),
      contractDate: normalizeDateOnly(appendixData.contractDate),
      baseSalary: String(appendixData.baseSalary ?? ""),
      mealAllowance: String(appendixData.mealAllowance ?? ""),
      phoneUniformAllowance: String(appendixData.phoneUniformAllowance ?? ""),
      performanceBonus: String(appendixData.performanceBonus ?? ""),
      transportationAllowance: String(
        appendixData.transportationAllowance ?? "",
      ),
      totalSalary: String(appendixData.totalSalary ?? ""),
    };
  },
  validate: (values) => {
    if (!values.parentContractId.trim()) {
      return "Vui lòng chọn Hợp đồng lao động gốc.";
    }
    if (
      !values.personalInfo.fullName.trim() ||
      !values.personalInfo.email.trim()
    ) {
      return "HĐLĐ gốc cần có họ tên và email nhận link ký của người lao động.";
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
      contractType: "employment_contract_appendix",
      parentContractId: values.parentContractId.trim(),
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
      baseSalary: normalizeMoney(values.baseSalary),
      mealAllowance: normalizeMoney(values.mealAllowance),
      phoneUniformAllowance: normalizeMoney(values.phoneUniformAllowance),
      performanceBonus: normalizeMoney(values.performanceBonus),
      transportationAllowance: normalizeMoney(values.transportationAllowance),
      totalSalary: normalizeMoney(values.totalSalary),
    }) satisfies Extract<
      CreateContractPayload,
      { contractType: "employment_contract_appendix" }
    >,
};
