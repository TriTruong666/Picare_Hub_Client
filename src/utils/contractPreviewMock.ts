import type { Contract, OwnerCompanyInfoPayload } from "@/types/Contract";

const MOCK_CONTRACT_PREVIEW_STORAGE_KEY = "picare.contract.preview.mock";

export const MOCK_APPENDIX_CONTRACT_ID = "__mock_appendix_contract_preview__";

const DEFAULT_OWNER_COMPANY: OwnerCompanyInfoPayload = {
  companyCode: "PIC",
  companyName: "CÔNG TY CỔ PHẦN PICARE VIỆT NAM",
  address: "123 Nguyễn Trãi, TP.HCM",
  phone: "0900000000",
  bankInfo: "0123456789 - Vietcombank",
  mst: "0312345678",
  ownerName: "Nguyễn Văn A",
  role: "Giám đốc",
};

const DEFAULT_PARTNER_COMPANY = {
  companyName: "CÔNG TY TNHH MOCELUX",
  address: "456 Lê Lợi, TP.HCM",
  phone: "0911111111",
  bankInfo: "9876543210 - ACB",
  mst: "0398765432",
  ownerName: "Trần Văn B",
  role: "Giám đốc",
};

const DEFAULT_APPENDIX_PRODUCTS = [
  "Tên sản phẩm: Mocelux Collagen\nThành phần: Collagen peptide, Vitamin C\nQuy cách đóng gói: Hộp 30 gói x 10ml\nSố đăng ký: 1234/2026/ĐKSP\nNước sản xuất: Việt Nam\nĐơn giá(+VAT): 350000\nPhân loại: Thực phẩm bảo vệ sức khỏe\n",
];

export function createDefaultMockAppendixContract(): Contract {
  return {
    id: -1,
    contractId: MOCK_APPENDIX_CONTRACT_ID,
    contractNumber: "002/06/2026/PLHP/TH",
    ownerCompanyInfo: DEFAULT_OWNER_COMPANY,
    partnerCompanyInfo: DEFAULT_PARTNER_COMPANY,
    contractDueDate: null,
    contractData: {
      details: [],
      contractDueDate: null,
      ownerCompanyInfo: DEFAULT_OWNER_COMPANY,
      partnerCompanyInfo: DEFAULT_PARTNER_COMPANY,
    },
    contractChecksum: "mock",
    contractType: "appendix",
    contractUrl: null,
    createdAt: "2026-06-17T10:13:26.912Z",
    updatedAt: "2026-06-17T10:13:27.249Z",
    status: "owner_signed",
    documents: [
      {
        id: -1,
        contractDocumentId: "mock-appendix-version-1",
        version: 1,
        status: "owner_signed",
        fileUrl: "",
        fileHash: "mock",
        createdAt: "2026-06-17T10:13:27.253Z",
        updatedAt: "2026-06-17T10:13:27.253Z",
      },
    ],
    details: [],
    signatures: [],
    principleContractNumber: "08/2026/HĐNT/MOCELUX-PICARE",
    products: DEFAULT_APPENDIX_PRODUCTS,
  };
}

export function storeMockContractPreview(contract: Contract) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    MOCK_CONTRACT_PREVIEW_STORAGE_KEY,
    JSON.stringify(contract),
  );
}

export function clearMockContractPreview() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(MOCK_CONTRACT_PREVIEW_STORAGE_KEY);
}

export function readMockContractPreview(contractId: string) {
  if (contractId !== MOCK_APPENDIX_CONTRACT_ID || typeof window === "undefined") {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(
    MOCK_CONTRACT_PREVIEW_STORAGE_KEY,
  );

  if (!storedValue) {
    return createDefaultMockAppendixContract();
  }

  try {
    return JSON.parse(storedValue) as Contract;
  } catch {
    return createDefaultMockAppendixContract();
  }
}
