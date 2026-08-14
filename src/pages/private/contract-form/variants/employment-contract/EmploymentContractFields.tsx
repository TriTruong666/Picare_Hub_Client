import Calendar from "@/components/custom_ui/Calendar";
import GlassSelect from "@/components/custom_ui/Select";
import type { EmploymentPersonalInfoPayload } from "@/types/Contract";
import {
  FieldLabel,
  SectionTitle,
  TextareaInput,
  TextInput,
} from "../../common/FormPrimitives";
import type { EmploymentContractFormValues } from "./employmentContractVariant";

type PersonalField = {
  key: keyof EmploymentPersonalInfoPayload;
  label: string;
  placeholder: string;
  type?: "email" | "tel";
  isDate?: boolean;
  multiline?: boolean;
  optional?: boolean;
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
    label: "Ngày sinh",
    placeholder: "Chọn ngày sinh",
    isDate: true,
    optional: true,
  },
  {
    key: "citizenId",
    label: "Số CCCD/CMTND",
    placeholder: "079095001234",
    optional: true,
  },
  {
    key: "citizenIdIssuedDate",
    label: "Ngày cấp CCCD",
    placeholder: "Chọn ngày cấp",
    isDate: true,
    optional: true,
  },
  {
    key: "citizenIdIssuedPlace",
    label: "Nơi cấp CCCD",
    placeholder: "Cục Cảnh sát QLHC về TTXH",
    optional: true,
  },
  {
    key: "permanentAddress",
    label: "Nơi thường trú theo CCCD",
    placeholder: "Nhập địa chỉ thường trú",
    multiline: true,
    optional: true,
  },
  {
    key: "currentAddress",
    label: "Địa chỉ hiện đang sinh sống",
    placeholder: "Nhập địa chỉ hiện tại",
    multiline: true,
    optional: true,
  },
  {
    key: "taxCode",
    label: "Mã số thuế",
    placeholder: "Để trống nếu chưa có",
    optional: true,
  },
  {
    key: "socialInsuranceNumber",
    label: "Mã số BHXH",
    placeholder: "Để trống nếu chưa có",
    optional: true,
  },
  {
    key: "emergencyContact",
    label: "Liên hệ khẩn cấp",
    placeholder: "Họ tên và số điện thoại",
    optional: true,
  },
];

const SALARY_FIELDS = [
  { key: "baseSalary", label: "Mức lương cơ bản" },
  { key: "mealAllowance", label: "Tiền ăn giữa ca" },
  { key: "phoneUniformAllowance", label: "Hỗ trợ điện thoại + đồng phục" },
  { key: "performanceBonus", label: "Thưởng hiệu quả công việc" },
  { key: "transportationAllowance", label: "Hỗ trợ xăng xe" },
  { key: "totalSalary", label: "Tổng cộng" },
] as const;

export function EmploymentContractFields({
  values,
  onChange,
}: {
  values: EmploymentContractFormValues;
  onChange: (values: EmploymentContractFormValues) => void;
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
        <SectionTitle>Thông tin hợp đồng lao động</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Ngày lập hợp đồng (không bắt buộc)</FieldLabel>
            <Calendar
              value={values.contractDate}
              onChange={(contractDate) => onChange({ ...values, contractDate })}
              placeholder="Chọn ngày lập hợp đồng"
              allowClear
              compact
            />
          </div>
          <div>
            <FieldLabel>Ngày bắt đầu làm việc (không bắt buộc)</FieldLabel>
            <Calendar
              value={values.startDate}
              onChange={(startDate) => onChange({ ...values, startDate })}
              placeholder="Chọn ngày bắt đầu"
              allowClear
              compact
            />
          </div>
          <div>
            <FieldLabel>Thời hạn hợp đồng (không bắt buộc)</FieldLabel>
            <TextInput
              id="employment-contract-term"
              value={values.contractTerm}
              onChange={(contractTerm) => onChange({ ...values, contractTerm })}
              placeholder="Không xác định thời hạn"
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Địa điểm làm việc (không bắt buộc)</FieldLabel>
            <TextareaInput
              id="employment-work-location"
              value={values.workLocation}
              onChange={(workLocation) => onChange({ ...values, workLocation })}
              placeholder="Nhập địa điểm làm việc"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 py-6 dark:border-white/10">
        <SectionTitle>Thông tin người lao động</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PERSONAL_FIELDS.map((field) => (
            <div
              key={field.key}
              className={field.multiline ? "md:col-span-2" : ""}
            >
              <FieldLabel>
                {field.label}
                {field.optional ? " (không bắt buộc)" : ""}
              </FieldLabel>
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
                  id={`employment-${field.key}`}
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                  required={!field.optional}
                />
              ) : (
                <TextInput
                  id={`employment-${field.key}`}
                  type={field.type || "text"}
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                  required={!field.optional}
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
            <FieldLabel>Chức danh/vị trí công việc (không bắt buộc)</FieldLabel>
            <TextInput
              id="employment-position"
              value={values.personalInfo.position}
              onChange={(value) => updatePersonalInfo("position", value)}
              placeholder="Nhân viên kế toán"
            />
          </div>
          <div>
            <FieldLabel>Phòng ban/Bộ phận (không bắt buộc)</FieldLabel>
            <TextInput
              id="employment-department"
              value={values.personalInfo.department}
              onChange={(value) => updatePersonalInfo("department", value)}
              placeholder="Kế toán - Tài chính"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 py-6 dark:border-white/10">
        <SectionTitle>Tiền lương và phụ lục đi kèm</SectionTitle>
        <p className="mb-5 text-xs leading-5 text-black/48 dark:text-white/40">
          Các khoản dưới đây được điền đồng thời vào Điều 3 của hợp đồng và Phụ
          lục hợp đồng lao động ở hai trang cuối.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SALARY_FIELDS.map((field) => (
            <div key={field.key}>
              <FieldLabel>{field.label} (đồng, không bắt buộc)</FieldLabel>
              <TextInput
                id={`employment-${field.key}`}
                type="number"
                value={values[field.key]}
                onChange={(value) =>
                  onChange({ ...values, [field.key]: value })
                }
                placeholder="0"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <FieldLabel>Mức lương bằng chữ (không bắt buộc)</FieldLabel>
            <TextInput
              id="employment-salary-in-words"
              value={values.salaryInWords}
              onChange={(salaryInWords) =>
                onChange({ ...values, salaryInWords })
              }
              placeholder="Tám triệu đồng"
            />
          </div>
        </div>
      </section>
    </>
  );
}
