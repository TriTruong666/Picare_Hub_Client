---
name: contract-template
description: Chuẩn hóa template hợp đồng Picare. Use when editing ContractPreviewPage.tsx, ContractPartnerSignPage.tsx, ContractCreatePage.tsx, contract payload/types, or adding a new contract type such as principle, appendix, service; ensures all contract preview/sign documents share one visual shell while legal content follows the correct PDF mẫu.
---

# Contract Template

## Core Rule

Use the existing principle contract preview as the visual shell for every contract document:

- Keep the same `motion.article` container, max width, border, page padding, background, shadow, typography scale, section spacing, and signature block placement.
- Keep shared primitives such as `ArticleTitle`, `ClauseList`, `PartySection`, `FieldLine`, and `SignatureBlock` unless a real legal-layout requirement forces a change.
- Branch by `contract.contractType` only for legal content, not for the overall document structure.
- Bold all dynamic values injected from API payloads: contract numbers, dates, company names, tax codes, representatives, payment terms, credit limits, product cells.
- Do not reuse the principle legal clauses for appendix/service contracts. Each contract type must render its own legal body.

## Template Mapping

- `principle`: Follow `preview-hop-dong-nguyen-tac-mock-v3.pdf`.
- `appendix`: Follow `preview-phu-luc-hop-dong-mock-v2.pdf`.
- `service`: Do not invent the legal body until the source PDF/API format is provided.

## Required Workflow

1. Read the relevant PDF sample or existing extracted text before changing legal content.
2. Update both private preview and public partner sign pages together.
3. Keep private and public documents structurally identical, with only theme color differences where the existing pages already differ.
4. Add or update contract types in `src/types/Contract.ts` before using new payload fields.
5. Render by explicit `contract.contractType` branching.
6. Run `npm run build` after changes.

## Appendix Rules

The appendix document must not show the 11 principle contract articles. It must include:

- Header with owner company and contract number.
- National title block.
- Current document date.
- Title `Phụ lục hợp đồng`.
- Line: `Đính kèm Hợp đồng nguyên tắc số: ... ký ngày ...`.
- Both party sections using the same `PartySection` layout as principle.
- Text: `Hai bên đồng ý ký kết Phụ lục với các điều khoản sau:`.
- Full pricing/cooperation paragraph from the appendix PDF sample.
- Full VAT note from the appendix PDF sample.
- Product table with columns: `STT`, `Tên sản phẩm`, `Thành phần`, `Quy cách đóng gói`, `Số đăng ký`, `Nước sản xuất`, `Đơn giá(+VAT)`, `Phân loại`.
- Same signature layout as principle.

## Product Parsing

When appendix API returns `products: string[]`, parse each product from newline-separated labels:

```text
Tên sản phẩm: ...
Thành phần: ...
Quy cách đóng gói: ...
Số đăng ký: ...
Nước sản xuất: ...
Đơn giá(+VAT): ...
Phân loại: ...
```

If a product cannot be parsed, still render the raw product text in the product name column and use `-` for missing cells.
