---
name: contract-form-architecture
description: Refactor and extend Picare contract create/edit forms through isolated contract-type variants. Use when changing ContractCreatePage.tsx, ContractEditPage.tsx, contract form state, validation, hydration, payload builders, the contract form registry, or when adding a contract type while preserving the existing shared UI.
---

# Contract Form Architecture

## Core rule

Keep `ContractCreatePage.tsx` as the shared create/edit shell. Put behavior that varies by `contractType` in `src/pages/private/contract-form/variants/<type>/`.

Do not change visible UI, copy, DOM order, class names, API field names, or navigation behavior during an architecture-only refactor.

## Module responsibilities

- `contractFormRegistry.ts`: Be the single source of truth for creatable contract types and selector metadata.
- `types.ts`: Define common form context and the variant contract.
- `common/`: Hold behavior and UI truly shared by multiple contract types.
- `variants/<type>/<type>ContractVariant.ts`: Own initial values, edit hydration, validation, normalization, and payload construction for one type.
- `variants/<type>/*Fields.tsx`: Own type-specific UI without changing the shared page shell.
- `ContractCreatePage.tsx`: Select a registered variant, coordinate shared state and mutations, and render the existing shell.
- `ContractEditPage.tsx`: Fetch a draft and pass it to the same form shell; do not create a separate edit form.

## Variant contract

Implement each registered type with:

```ts
{
  type,
  title,
  description,
  createInitialValues,
  hydrate,
  validate,
  buildPayload,
}
```

Type `buildPayload` with `Extract<CreateContractPayload, { contractType: TType }>` so API changes fail at compile time.

## Adding a contract type

1. Add its request and response data types to `src/types/Contract.ts`.
2. Create `contract-form/variants/<type>/` with its variant definition and fields component.
3. Register it in `contractFormRegistry.ts`; never add a second local contract-type list in a page.
4. Hydrate only when `contract.contractType` matches. Never fall back an unknown type to `principle`.
5. Keep shared owner/partner behavior in `common/`; keep variant-only fields and dependent API queries inside the variant.
6. Build the payload exclusively through the selected variant.
7. Update preview and partner-sign rendering under the `contract-template` skill when the legal document body changes.

## Refactor guardrails

- Preserve current markup and Tailwind classes when the task is structural only.
- Preserve field defaults, required rules, toast copy, submit labels, redirects, and create/update mutation behavior.
- Avoid `as any` for `contractData`; narrow by `contractType` or provide a typed hydrator.
- Do not duplicate create and edit implementations.
- Do not place a growing `if/switch` for hydrate, validate, and payload construction back in the page shell.
- Keep unavailable types out of the registry until their API format and legal template are defined.

## Verification

1. Run ESLint on the changed form, registry, and variant files.
2. Run `npm run build`.
3. Compare create and edit behavior for every registered type.
4. Confirm an architecture-only change has no intentional visual diff.

