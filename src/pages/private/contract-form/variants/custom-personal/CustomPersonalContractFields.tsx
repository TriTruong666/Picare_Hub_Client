import { useCallback } from "react";

import Calendar from "@/components/custom_ui/Calendar";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { CustomPersonalInfoPayload } from "@/types/Contract";
import {
  FieldLabel,
  SectionTitle,
  TextareaInput,
  TextInput,
} from "../../common/FormPrimitives";
import type { CustomPersonalContractFormValues } from "./customPersonalContractVariant";

type PersonalField = {
  key: keyof CustomPersonalInfoPayload;
  label: string;
  placeholder: string;
  isDate?: boolean;
  multiline?: boolean;
};

const PERSONAL_FIELDS: PersonalField[] = [
  { key: "fullName", label: "Họ và tên", placeholder: "Nguyễn Văn A" },
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

export function CustomPersonalContractFields({
  values,
  onChange,
}: {
  values: CustomPersonalContractFormValues;
  onChange: (values: CustomPersonalContractFormValues) => void;
}) {
  const handleRawContentChange = useCallback(
    ({ html }: { html: string }) => {
      if (html !== values.rawContent) {
        onChange({ ...values, rawContent: html });
      }
    },
    [onChange, values],
  );

  const updatePersonalInfo = (
    key: keyof CustomPersonalInfoPayload,
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
        <SectionTitle>Nội dung hợp đồng</SectionTitle>
        <div className="space-y-4">
          <div>
            <FieldLabel>Tiêu đề</FieldLabel>
            <TextInput
              id="custom-personal-title"
              value={values.title}
              onChange={(title) => onChange({ ...values, title })}
              placeholder="THỎA THUẬN CÔNG VIỆC"
              required
            />
          </div>
          <div>
            <FieldLabel>Tiêu đề phụ</FieldLabel>
            <TextInput
              id="custom-personal-subtitle"
              value={values.subTitle}
              onChange={(subTitle) => onChange({ ...values, subTitle })}
              placeholder="(Áp dụng cho nhân sự)"
            />
          </div>
          <div>
            <FieldLabel>Nội dung chi tiết</FieldLabel>
            <SimpleEditor
              content={values.rawContent}
              placeholder="Nhập nội dung thỏa thuận..."
              showThemeToggle={false}
              wrapperClassName="min-h-[360px] bg-white dark:bg-[#050505]"
              contentClassName="min-h-[300px]"
              editorClassName="min-h-[300px]"
              onChange={handleRawContentChange}
            />
          </div>
        </div>
      </section>

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
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                  allowClear={false}
                  compact
                />
              ) : field.multiline ? (
                <TextareaInput
                  id={`custom-personal-${field.key}`}
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                  required
                />
              ) : (
                <TextInput
                  id={`custom-personal-${field.key}`}
                  value={values.personalInfo[field.key]}
                  onChange={(value) => updatePersonalInfo(field.key, value)}
                  placeholder={field.placeholder}
                  required
                />
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
