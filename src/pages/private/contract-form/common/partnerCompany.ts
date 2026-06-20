import type { PartnerCompanyInfoPayload } from "@/types/Contract";
import type { PartnerEntityType } from "../types";

export type PartnerField = keyof PartnerCompanyInfoPayload;

export const PARTNER_FIELDS: {
  key: PartnerField;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    key: "companyName",
    label: "Tên công ty",
    placeholder: "Nhập tên công ty đối tác",
  },
  { key: "mst", label: "Mã số thuế", placeholder: "Nhập mã số thuế" },
  {
    key: "address",
    label: "Địa chỉ",
    placeholder: "Nhập địa chỉ công ty",
    multiline: true,
  },
  {
    key: "phone",
    label: "Số điện thoại",
    placeholder: "Nhập số điện thoại",
  },
  { key: "email", label: "Email", placeholder: "Nhập email liên hệ" },
  {
    key: "bankInfo",
    label: "Thông tin ngân hàng",
    placeholder: "Số tài khoản, ngân hàng, chi nhánh",
    multiline: true,
  },
  {
    key: "ownerName",
    label: "Người đại diện",
    placeholder: "Nhập tên người đại diện",
  },
  { key: "role", label: "Chức vụ", placeholder: "Nhập chức vụ" },
];

export const PARTNER_DETAIL_FIELDS = PARTNER_FIELDS.filter(
  (field) => field.key !== "mst" && field.key !== "companyName",
);

export function normalizePartnerCompanyInfo(
  info: PartnerCompanyInfoPayload,
  partnerEntityType: PartnerEntityType,
): PartnerCompanyInfoPayload {
  return {
    ...info,
    companyName:
      partnerEntityType === "company" ? info.companyName?.trim() || "" : null,
    mst: partnerEntityType === "company" ? info.mst?.trim() || "" : null,
    address: info.address.trim(),
    phone: info.phone.trim(),
    email: info.email.trim(),
    bankInfo: info.bankInfo.trim(),
    ownerName: info.ownerName.trim(),
    role: info.role.trim(),
  };
}

export function validatePartnerCompanyInfo(
  info: PartnerCompanyInfoPayload,
  partnerEntityType: PartnerEntityType,
) {
  const requiredFields =
    partnerEntityType === "company" ? PARTNER_FIELDS : PARTNER_DETAIL_FIELDS;
  const missingFields = requiredFields.filter(
    (field) => !String(info[field.key] ?? "").trim(),
  );

  if (missingFields.length === 0) return null;

  return `Vui lòng nhập đầy đủ thông tin đối tác: ${missingFields
    .map((field) => field.label.toLowerCase())
    .join(", ")}.`;
}

