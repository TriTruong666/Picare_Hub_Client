import type { LivestreamResponsibilityPersonalInfoPayload } from "@/types/Contract";
import Calendar from "@/components/custom_ui/Calendar";
import {
  FieldLabel,
  SectionTitle,
  TextareaInput,
  TextInput,
} from "../../common/FormPrimitives";

type PersonalField = {
  key: keyof LivestreamResponsibilityPersonalInfoPayload;
  label: string;
  placeholder: string;
  isDate?: boolean;
  multiline?: boolean;
};

const PERSONAL_FIELDS: PersonalField[] = [
  { key: "fullName", label: "Họ và tên", placeholder: "Nguyễn Văn A" },
  {
    key: "email",
    label: "Email",
    placeholder: "nguyenvana@example.com",
  },
  {
    key: "dateOfBirth",
    label: "Ngày sinh",
    placeholder: "Chọn ngày sinh",
    isDate: true,
  },
  { key: "position", label: "Chức vụ", placeholder: "Nhân viên Livestream" },
  { key: "department", label: "Phòng ban", placeholder: "Kinh doanh" },
  {
    key: "permanentAddress",
    label: "Địa chỉ thường trú",
    placeholder: "Nhập địa chỉ thường trú",
    multiline: true,
  },
  { key: "citizenId", label: "Số CCCD", placeholder: "079095001234" },
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
];

export function LivestreamResponsibilityCommitmentFields({
  values,
  onChange,
}: {
  values: LivestreamResponsibilityPersonalInfoPayload;
  onChange: (
    key: keyof LivestreamResponsibilityPersonalInfoPayload,
    value: string,
  ) => void;
}) {
  return (
    <section className="border-b border-black/10 py-6 dark:border-white/10">
      <SectionTitle>Thông tin cá nhân</SectionTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PERSONAL_FIELDS.map((field) => (
          <div
            key={field.key}
            className={field.multiline ? "md:col-span-2" : ""}
          >
            <FieldLabel>{field.label}</FieldLabel>
            {field.isDate ? (
              <Calendar
                value={values[field.key]}
                onChange={(value) => onChange(field.key, value)}
                placeholder={field.placeholder}
                allowClear={false}
                compact
              />
            ) : field.multiline ? (
              <TextareaInput
                id={`personal-${field.key}`}
                value={values[field.key]}
                onChange={(value) => onChange(field.key, value)}
                placeholder={field.placeholder}
                required
              />
            ) : (
              <TextInput
                id={`personal-${field.key}`}
                type={field.key === "email" ? "email" : "text"}
                value={values[field.key]}
                onChange={(value) => onChange(field.key, value)}
                placeholder={field.placeholder}
                required
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
