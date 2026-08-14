import type {
  Contract,
  CreateContractPayload,
  EmploymentPersonalInfoPayload,
  ProbationContractDataPayload,
} from "@/types/Contract";
import type { ContractVariantDefinition } from "../../types";

export type ProbationContractFormValues = {
  personalInfo: {
    [Field in keyof EmploymentPersonalInfoPayload]: string;
  };
  contractDate: string;
  probationStartDate: string;
  probationEndDate: string;
  workLocation: string;
  probationSalary: string;
  performanceBonus: string;
};

const EMPTY_PERSONAL_INFO: ProbationContractFormValues["personalInfo"] = {
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

function emptyValues(): ProbationContractFormValues {
  return {
    personalInfo: { ...EMPTY_PERSONAL_INFO },
    contractDate: "",
    probationStartDate: "",
    probationEndDate: "",
    workLocation: "",
    probationSalary: "",
    performanceBonus: "",
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

function getProbationData(contract: Contract) {
  const data = contract.contractData;

  if (!data || !("probationStartDate" in data) || !("personalInfo" in data)) {
    return null;
  }

  return data as ProbationContractDataPayload;
}

export const probationContractVariant: ContractVariantDefinition<
  "probation_contract",
  ProbationContractFormValues
> = {
  type: "probation_contract",
  title: "Hợp đồng thử việc",
  description:
    "Mẫu hợp đồng thử việc có thời hạn tối đa 60 ngày, đầy đủ điều khoản và vùng ký điện tử.",
  createInitialValues: emptyValues,
  hydrate: (contract) => {
    if (contract.contractType !== "probation_contract") return emptyValues();

    const data = getProbationData(contract);
    if (!data) return emptyValues();

    return {
      personalInfo: Object.fromEntries(
        Object.entries({ ...EMPTY_PERSONAL_INFO, ...data.personalInfo }).map(
          ([key, value]) => [key, String(value ?? "")],
        ),
      ) as ProbationContractFormValues["personalInfo"],
      contractDate: normalizeDateOnly(data.contractDate),
      probationStartDate: normalizeDateOnly(data.probationStartDate),
      probationEndDate: normalizeDateOnly(data.probationEndDate),
      workLocation: data.workLocation || "",
      probationSalary: String(data.probationSalary ?? ""),
      performanceBonus: String(data.performanceBonus ?? ""),
    };
  },
  validate: (values) => {
    if (
      !values.personalInfo.fullName.trim() ||
      !values.personalInfo.email.trim()
    ) {
      return "Vui lòng nhập họ tên và email nhận link ký của người lao động.";
    }

    for (const value of [values.probationSalary, values.performanceBonus]) {
      const amount = normalizeMoney(value);
      if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
        return "Mức lương và thưởng hiệu quả phải là số không âm.";
      }
    }

    if (
      values.probationStartDate &&
      values.probationEndDate &&
      values.probationEndDate < values.probationStartDate
    ) {
      return "Ngày kết thúc thử việc không được trước ngày bắt đầu.";
    }

    if (values.probationStartDate && values.probationEndDate) {
      const startDate = Date.parse(`${values.probationStartDate}T00:00:00Z`);
      const endDate = Date.parse(`${values.probationEndDate}T00:00:00Z`);
      const durationInDays = (endDate - startDate) / (24 * 60 * 60 * 1000);
      if (Number.isFinite(durationInDays) && durationInDays > 60) {
        return "Thời hạn thử việc không được vượt quá 60 ngày.";
      }
    }

    return null;
  },
  buildPayload: (values, common) =>
    ({
      contractType: "probation_contract",
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
      probationStartDate: normalizeDateOnly(values.probationStartDate) || null,
      probationEndDate: normalizeDateOnly(values.probationEndDate) || null,
      workLocation: nullableText(values.workLocation),
      probationSalary: normalizeMoney(values.probationSalary),
      performanceBonus: normalizeMoney(values.performanceBonus),
    }) satisfies Extract<
      CreateContractPayload,
      { contractType: "probation_contract" }
    >,
};
