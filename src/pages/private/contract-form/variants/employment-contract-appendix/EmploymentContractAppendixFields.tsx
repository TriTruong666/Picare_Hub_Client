import Calendar from "@/components/custom_ui/Calendar";
import GlassSelect from "@/components/custom_ui/Select";
import type { Contract, EmploymentPersonalInfoPayload } from "@/types/Contract";
import {
  FieldLabel,
  SectionTitle,
  TextareaInput,
  TextInput,
} from "../../common/FormPrimitives";
import type { EmploymentContractAppendixFormValues } from "./employmentContractAppendixVariant";

type PersonalField = {
  key: keyof EmploymentPersonalInfoPayload;
  label: string;
  placeholder: string;
  type?: "email" | "tel";
  isDate?: boolean;
  multiline?: boolean;
};

const PERSONAL_FIELDS: PersonalField[] = [
  { key: "fullName", label: "Họ và tên", placeholder: "Nguyễn Văn A" },
  {
    key: "email",
    label: "Email nhận link ký",
    placeholder: "nguyenvana@example.com",
    type: "email",
  },
  {
    key: "dateOfBirth",
    label: "Ngày sinh (không bắt buộc)",
    placeholder: "Chọn ngày sinh",
    isDate: true,
  },
  {
    key: "citizenId",
    label: "Số CCCD/CMTND (không bắt buộc)",
    placeholder: "079095001234",
  },
  {
    key: "citizenIdIssuedDate",
    label: "Ngày cấp CCCD (không bắt buộc)",
    placeholder: "Chọn ngày cấp",
    isDate: true,
  },
  {
    key: "citizenIdIssuedPlace",
    label: "Nơi cấp CCCD (không bắt buộc)",
    placeholder: "Cục Cảnh sát QLHC về TTXH",
  },
  {
    key: "permanentAddress",
    label: "Nơi thường trú (không bắt buộc)",
    placeholder: "Nhập địa chỉ thường trú",
    multiline: true,
  },
  {
    key: "currentAddress",
    label: "Địa chỉ hiện tại (không bắt buộc)",
    placeholder: "Nhập địa chỉ hiện tại",
    multiline: true,
  },
  {
    key: "taxCode",
    label: "Mã số thuế (không bắt buộc)",
    placeholder: "Để trống nếu chưa có",
  },
  {
    key: "socialInsuranceNumber",
    label: "Mã số BHXH (không bắt buộc)",
    placeholder: "Để trống nếu chưa có",
  },
  {
    key: "emergencyContact",
    label: "Liên hệ khẩn cấp (không bắt buộc)",
    placeholder: "Họ tên và số điện thoại",
  },
];

const SALARY_FIELDS = [
  { key: "baseSalary", label: "Mức lương cơ bản" },
  { key: "mealAllowance", label: "Tiền ăn giữa ca" },
  {
    key: "phoneUniformAllowance",
    label: "Hỗ trợ điện thoại + đồng phục",
  },
  { key: "performanceBonus", label: "Thưởng hiệu quả công việc" },
  { key: "transportationAllowance", label: "Hỗ trợ xăng xe" },
  { key: "totalSalary", label: "Tổng cộng" },
] as const;

function getEmployeeName(contract: Contract) {
  const data = contract.contractData;
  return data && "personalInfo" in data
    ? data.personalInfo?.fullName || "Chưa có tên người lao động"
    : "Chưa có tên người lao động";
}

export function EmploymentContractAppendixFields({
  values,
  contracts,
  isLoading,
  onParentChange,
  onChange,
}: {
  values: EmploymentContractAppendixFormValues;
  contracts: Contract[];
  isLoading: boolean;
  onParentChange: (contractId: string) => void;
  onChange: (values: EmploymentContractAppendixFormValues) => void;
}) {
  const updatePersonalInfo = (
    key: keyof EmploymentPersonalInfoPayload,
    value: string,
  ) => {
    onChange({
      ...values,
      personalInfo: { ...values.personalInfo, [key]: value },
    });
  };

  return (
    <>
      <section className="border-b border-black/10 py-6 dark:border-white/10">
        <SectionTitle>Hợp đồng lao động gốc</SectionTitle>
        <FieldLabel>Chọn HĐLĐ để sao chép phụ lục</FieldLabel>
        <GlassSelect
          value={values.parentContractId}
          onChange={onParentChange}
          disabled={isLoading}
          placeholder={isLoading ? "Đang tải HĐLĐ..." : "Chọn HĐLĐ gốc"}
          options={contracts.map((contract) => ({
            value: contract.contractId,
            label: `${contract.contractNumber} · ${getEmployeeName(contract)}`,
          }))}
        />
        {values.employmentContractNumber ? (
          <p className="mt-3 text-xs text-black/48 dark:text-white/40">
            Phụ lục đang tham chiếu HĐLĐ số {values.employmentContractNumber}.
            HĐLĐ gốc và phụ lục đang gắn trong HĐLĐ không bị thay đổi.
          </p>
        ) : null}
      </section>

      <section className="border-b border-black/10 py-6 dark:border-white/10">
        <SectionTitle>Thông tin phụ lục</SectionTitle>
        <div className="max-w-md">
          <FieldLabel>Ngày lập phụ lục (không bắt buộc)</FieldLabel>
          <Calendar
            value={values.contractDate}
            onChange={(contractDate) => onChange({ ...values, contractDate })}
            placeholder="Chọn ngày lập phụ lục"
            allowClear
            compact
          />
        </div>
      </section>

      <section className="border-b border-black/10 py-6 dark:border-white/10">
        <SectionTitle>Thông tin người lao động được sao chép</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PERSONAL_FIELDS.map((field) => (
            <div
              key={field.key}
              className={field.multiline ? "md:col-span-2" : ""}
            >
              <FieldLabel>{field.label}</FieldLabel>
              {field.isDate ? (
                <Calendar
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                  allowClear
                  compact
                />
              ) : field.multiline ? (
                <TextareaInput
                  id={`employment-appendix-${field.key}`}
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <TextInput
                  id={`employment-appendix-${field.key}`}
                  type={field.type || "text"}
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                  required={field.key === "fullName" || field.key === "email"}
                />
              )}
            </div>
          ))}
          <div>
            <FieldLabel>Giới tính (không bắt buộc)</FieldLabel>
            <GlassSelect
              value={values.personalInfo.gender}
              onChange={(value) => updatePersonalInfo("gender", value)}
              placeholder="Chọn giới tính"
              options={[
                { label: "Không chọn", value: "" },
                { label: "Nam", value: "Nam" },
                { label: "Nữ", value: "Nữ" },
                { label: "Khác", value: "Khác" },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Chức danh/vị trí (không bắt buộc)</FieldLabel>
            <TextInput
              id="employment-appendix-position"
              value={values.personalInfo.position}
              onChange={(value) => updatePersonalInfo("position", value)}
              placeholder="Nhân viên kế toán"
            />
          </div>
          <div>
            <FieldLabel>Phòng ban/Bộ phận (không bắt buộc)</FieldLabel>
            <TextInput
              id="employment-appendix-department"
              value={values.personalInfo.department}
              onChange={(value) => updatePersonalInfo("department", value)}
              placeholder="Kế toán - Tài chính"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 py-6 dark:border-white/10">
        <SectionTitle>Tiền lương, chế độ và phúc lợi</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SALARY_FIELDS.map((field) => (
            <div key={field.key}>
              <FieldLabel>{field.label} (đồng, không bắt buộc)</FieldLabel>
              <TextInput
                id={`employment-appendix-${field.key}`}
                type="number"
                value={values[field.key]}
                onChange={(value) =>
                  onChange({ ...values, [field.key]: value })
                }
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
