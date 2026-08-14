import Calendar from "@/components/custom_ui/Calendar";
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
  },
  { key: "citizenId", label: "Số CCCD/CMTND", placeholder: "079095001234" },
  {
    key: "citizenIdIssuedDate",
    label: "Ngày cấp CCCD",
    placeholder: "Chọn ngày cấp",
    isDate: true,
  },
  {
    key: "citizenIdIssuedPlace",
    label: "Nơi cấp CCCD",
    placeholder: "Cục Cảnh sát QLHC về TTXH",
  },
  {
    key: "permanentAddress",
    label: "Nơi thường trú theo CCCD",
    placeholder: "Nhập địa chỉ thường trú",
    multiline: true,
  },
  {
    key: "currentAddress",
    label: "Địa chỉ hiện đang sinh sống",
    placeholder: "Nhập địa chỉ hiện tại",
    multiline: true,
  },
  { key: "taxCode", label: "Mã số thuế", placeholder: "0" },
  {
    key: "socialInsuranceNumber",
    label: "Mã số BHXH",
    placeholder: "0",
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
            <FieldLabel>Ngày lập hợp đồng</FieldLabel>
            <Calendar
              value={values.contractDate}
              onChange={(contractDate) => onChange({ ...values, contractDate })}
              placeholder="Chọn ngày lập hợp đồng"
              allowClear={false}
              compact
            />
          </div>
          <div>
            <FieldLabel>Ngày bắt đầu làm việc</FieldLabel>
            <Calendar
              value={values.startDate}
              onChange={(startDate) => onChange({ ...values, startDate })}
              placeholder="Chọn ngày bắt đầu"
              allowClear={false}
              compact
            />
          </div>
          <div>
            <FieldLabel>Thời hạn hợp đồng</FieldLabel>
            <TextInput
              id="employment-contract-term"
              value={values.contractTerm}
              onChange={(contractTerm) => onChange({ ...values, contractTerm })}
              placeholder="Không xác định thời hạn"
              required
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Địa điểm làm việc</FieldLabel>
            <TextareaInput
              id="employment-work-location"
              value={values.workLocation}
              onChange={(workLocation) => onChange({ ...values, workLocation })}
              placeholder="Nhập địa điểm làm việc"
              required
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
                  allowClear={false}
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
            <FieldLabel>Giới tính</FieldLabel>
            <select
              value={values.personalInfo.gender}
              onChange={(event) =>
                updatePersonalInfo("gender", event.target.value)
              }
              required
              className="h-11 w-full rounded-lg border border-black/15 bg-white px-4 text-sm text-[#111111] transition-all outline-none hover:border-black/25 focus:border-black/35 dark:border-white/10 dark:bg-black dark:text-white dark:hover:border-white/20 dark:focus:border-white/30"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <FieldLabel>Chức danh/vị trí công việc</FieldLabel>
            <TextInput
              id="employment-position"
              value={values.personalInfo.position}
              onChange={(value) => updatePersonalInfo("position", value)}
              placeholder="Nhân viên kế toán"
              required
            />
          </div>
          <div>
            <FieldLabel>Phòng ban/Bộ phận</FieldLabel>
            <TextInput
              id="employment-department"
              value={values.personalInfo.department}
              onChange={(value) => updatePersonalInfo("department", value)}
              placeholder="Kế toán - Tài chính"
              required
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
              <FieldLabel>{field.label} (đồng)</FieldLabel>
              <TextInput
                id={`employment-${field.key}`}
                type="number"
                value={values[field.key]}
                onChange={(value) =>
                  onChange({ ...values, [field.key]: value })
                }
                placeholder="0"
                required
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <FieldLabel>Mức lương bằng chữ</FieldLabel>
            <TextInput
              id="employment-salary-in-words"
              value={values.salaryInWords}
              onChange={(salaryInWords) =>
                onChange({ ...values, salaryInWords })
              }
              placeholder="Tám triệu đồng"
              required
            />
          </div>
        </div>
      </section>
    </>
  );
}
