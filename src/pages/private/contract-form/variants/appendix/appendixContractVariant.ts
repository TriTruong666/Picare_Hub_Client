import type {
  AppendixContractDataPayload,
  AppendixContractProductPayload,
  Contract,
  CreateContractPayload,
} from "@/types/Contract";
import { normalizePartnerCompanyInfo } from "../../common/partnerCompany";
import type { ContractVariantDefinition } from "../../types";

export type AppendixProductRow = { id: string; content: string };

export type AppendixContractFormValues = {
  principleContract: Contract | null;
  principleContractSignedDate?: string | null;
  products: AppendixProductRow[];
};

export function createAppendixProductRow(content = ""): AppendixProductRow {
  return { id: crypto.randomUUID(), content };
}

export function formatAppendixProductContent(
  product: string | AppendixContractProductPayload,
) {
  if (typeof product === "string") return product;
  if (product.rawContent?.trim()) return product.rawContent.trim();

  return [
    product.productName ? `Tên sản phẩm: ${product.productName}` : "",
    product.ingredients ? `Thành phần: ${product.ingredients}` : "",
    product.packageSpecification
      ? `Quy cách đóng gói: ${product.packageSpecification}`
      : "",
    product.registrationNumber
      ? `Số đăng ký: ${product.registrationNumber}`
      : "",
    product.origin ? `Nước sản xuất: ${product.origin}` : "",
    product.unitPriceVat !== null && product.unitPriceVat !== undefined
      ? `Đơn giá(+VAT): ${product.unitPriceVat}`
      : "",
    product.classification ? `Phân loại: ${product.classification}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function getPreferredRawContent(product: AppendixContractProductPayload) {
  return (
    product.rawContent?.trim() ||
    product.html?.trim() ||
    product.rawHtml?.trim() ||
    product.richText?.trim() ||
    product.productRichText?.trim() ||
    ""
  );
}

export function hydrateAppendixContractValues(
  contract: Contract,
): Omit<AppendixContractFormValues, "principleContract"> & {
  principleContractNumber: string;
} {
  const contractData = contract.contractData as
    | AppendixContractDataPayload
    | null
    | undefined;
  const products = contractData?.products?.length
    ? contractData.products
    : (contract.products ?? []);

  return {
    principleContractNumber:
      contractData?.principleContractNumber ||
      contract.principleContractNumber ||
      "",
    principleContractSignedDate:
      contract.principleContractSignedDate ?? null,
    products: products.length
      ? products.map((product) =>
          createAppendixProductRow(formatAppendixProductContent(product)),
        )
      : [createAppendixProductRow()],
  };
}

export const appendixContractVariant: ContractVariantDefinition<
  "appendix",
  AppendixContractFormValues
> = {
  type: "appendix",
  title: "Phụ lục hợp đồng",
  description: "Phụ lục hợp đồng nguyên tắc dựa trên hợp đồng sẵn có",
  createInitialValues: () => ({
    principleContract: null,
    principleContractSignedDate: null,
    products: [createAppendixProductRow()],
  }),
  hydrate: (contract) => {
    const hydrated = hydrateAppendixContractValues(contract);
    return {
      principleContract: null,
      principleContractSignedDate: hydrated.principleContractSignedDate,
      products: hydrated.products,
    };
  },
  validate: (values) => {
    if (!values.principleContract) {
      return "Vui lòng chọn hợp đồng nguyên tắc đã hoàn tất.";
    }

    if (!values.products.some((product) => product.content.trim())) {
      return "Vui lòng nhập ít nhất một sản phẩm cho phụ lục hợp đồng.";
    }

    return null;
  },
  buildPayload: (values, common) => {
    if (!values.principleContract) {
      throw new Error("A principle contract is required to build an appendix.");
    }

    const principleContract = values.principleContract;
    return {
      contractType: "appendix",
      principleContractNumber:
        principleContract.contractNumber || principleContract.contractId,
      principleContractSignedDate:
        values.principleContractSignedDate ||
        principleContract.principleContractSignedDate ||
        null,
      contractDueDate: common.contractDueDate ?? null,
      ownerCompanyInfo: common.ownerCompanyInfo,
      partnerCompanyInfo: normalizePartnerCompanyInfo(
        common.partnerCompanyInfo,
        common.partnerEntityType,
      ),
      products: values.products
        .map((product) => ({ rawContent: product.content.trim() }))
        .filter((product) => Boolean(getPreferredRawContent(product))),
    } satisfies Extract<CreateContractPayload, { contractType: "appendix" }>;
  },
};

