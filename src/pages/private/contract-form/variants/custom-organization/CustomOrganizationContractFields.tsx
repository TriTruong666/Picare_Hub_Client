import { useCallback } from "react";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import {
  FieldLabel,
  SectionTitle,
  TextInput,
} from "../../common/FormPrimitives";
import type { CustomOrganizationContractFormValues } from "./customOrganizationContractVariant";

export function CustomOrganizationContractFields({
  values,
  onChange,
}: {
  values: CustomOrganizationContractFormValues;
  onChange: (values: CustomOrganizationContractFormValues) => void;
}) {
  const handleRawContentChange = useCallback(
    ({ html }: { html: string }) => {
      if (html !== values.rawContent) {
        onChange({ ...values, rawContent: html });
      }
    },
    [onChange, values],
  );

  const handleLegalRegulationChange = useCallback(
    ({ html }: { html: string }) => {
      if (html !== values.legalRegulation) {
        onChange({ ...values, legalRegulation: html });
      }
    },
    [onChange, values],
  );

  return (
    <section className="border-b border-black/10 py-6 dark:border-white/10">
      <SectionTitle>Nội dung hợp đồng</SectionTitle>
      <div className="space-y-4">
        <div>
          <FieldLabel>Tiêu đề</FieldLabel>
          <TextInput
            id="custom-organization-title"
            value={values.title}
            onChange={(title) => onChange({ ...values, title })}
            placeholder="HỢP ĐỒNG HỢP TÁC"
            required
          />
        </div>
        <div>
          <FieldLabel>Tiêu đề phụ</FieldLabel>
          <TextInput
            id="custom-organization-subtitle"
            value={values.subTitle}
            onChange={(subTitle) => onChange({ ...values, subTitle })}
            placeholder="(Về việc hợp tác kinh doanh)"
          />
        </div>
        <div>
          <FieldLabel>Quy định pháp lý</FieldLabel>
          <SimpleEditor
            content={values.legalRegulation}
            placeholder="Nhập quy định pháp lý..."
            showThemeToggle={false}
            wrapperClassName="min-h-[260px] bg-white dark:bg-[#050505]"
            contentClassName="min-h-[200px]"
            editorClassName="min-h-[200px]"
            onChange={handleLegalRegulationChange}
          />
        </div>
        <div>
          <FieldLabel>Nội dung chi tiết</FieldLabel>
          <SimpleEditor
            content={values.rawContent}
            placeholder="Nhập nội dung hợp đồng..."
            showThemeToggle={false}
            wrapperClassName="min-h-[360px] bg-white dark:bg-[#050505]"
            contentClassName="min-h-[300px]"
            editorClassName="min-h-[300px]"
            onChange={handleRawContentChange}
          />
        </div>
      </div>
    </section>
  );
}
