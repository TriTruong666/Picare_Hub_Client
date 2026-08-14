import Calendar from "@/components/custom_ui/Calendar";
import GlassSelect from "@/components/custom_ui/Select";
import type { EmploymentPersonalInfoPayload } from "@/types/Contract";
import {
  FieldLabel,
  SectionTitle,
  TextareaInput,
  TextInput,
} from "../../common/FormPrimitives";
import type { ProbationContractFormValues } from "./probationContractVariant";

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
    label: "Nơi thường trú theo CCCD (không bắt buộc)",
    placeholder: "Nhập địa chỉ thường trú",
    multiline: true,
  },
  {
    key: "currentAddress",
    label: "Địa chỉ hiện đang sinh sống (không bắt buộc)",
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
    label: "Số sổ lao động/BHXH (không bắt buộc)",
    placeholder: "Để trống nếu chưa có",
  },
  {
    key: "emergencyContact",
    label: "Liên hệ khẩn cấp (không bắt buộc)",
    placeholder: "Họ tên và số điện thoại",
  },
];

export function ProbationContractFields({
  values,
  onChange,
}: {
  values: ProbationContractFormValues;
  onChange: (values: ProbationContractFormValues) => void;
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
        <SectionTitle>Thông tin hợp đồng thử việc</SectionTitle>
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
            <FieldLabel>Ngày bắt đầu thử việc (không bắt buộc)</FieldLabel>
            <Calendar
              value={values.probationStartDate}
              onChange={(probationStartDate) =>
                onChange({ ...values, probationStartDate })
              }
              placeholder="Chọn ngày bắt đầu"
              allowClear
              compact
            />
          </div>
          <div>
            <FieldLabel>Ngày kết thúc thử việc (không bắt buộc)</FieldLabel>
            <Calendar
              value={values.probationEndDate}
              onChange={(probationEndDate) =>
                onChange({ ...values, probationEndDate })
              }
              placeholder="Chọn ngày kết thúc"
              allowClear
              compact
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Địa điểm làm việc (không bắt buộc)</FieldLabel>
            <TextareaInput
              id="probation-work-location"
              value={values.workLocation}
              onChange={(workLocation) => onChange({ ...values, workLocation })}
              placeholder="Tại văn phòng chính hoặc địa điểm theo quyết định của Công ty"
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
                  id={`probation-${field.key}`}
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <TextInput
                  id={`probation-${field.key}`}
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
            <FieldLabel>Vị trí công việc (không bắt buộc)</FieldLabel>
            <TextInput
              id="probation-position"
              value={values.personalInfo.position}
              onChange={(value) => updatePersonalInfo("position", value)}
              placeholder="Nhân viên marketing"
            />
          </div>
          <div>
            <FieldLabel>Phòng ban/Bộ phận (không bắt buộc)</FieldLabel>
            <TextInput
              id="probation-department"
              value={values.personalInfo.department}
              onChange={(value) => updatePersonalInfo("department", value)}
              placeholder="Marketing"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 py-6 dark:border-white/10">
        <SectionTitle>Lương và thưởng thử việc</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Mức lương thử việc (đồng, không bắt buộc)</FieldLabel>
            <TextInput
              id="probation-salary"
              type="number"
              value={values.probationSalary}
              onChange={(probationSalary) =>
                onChange({ ...values, probationSalary })
              }
              placeholder="0"
            />
          </div>
          <div>
            <FieldLabel>Thưởng hiệu quả (đồng, không bắt buộc)</FieldLabel>
            <TextInput
              id="probation-performance-bonus"
              type="number"
              value={values.performanceBonus}
              onChange={(performanceBonus) =>
                onChange({ ...values, performanceBonus })
              }
              placeholder="0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
