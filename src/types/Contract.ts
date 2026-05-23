export type CreateContractPayload = {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractDueDate: string;
  contractType: "digital" | "default";
  details: ContractDetailPayload[];
};

export type ContractDetailPayload = {
  productName: string;
  price: number;
};

export type OwnerCompanyInfoPayload = {
  companyCode: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  bankInfo: string;
  mst: string;
  ownerName: string;
  role: string;
};

export type PartnerCompanyInfoPayload = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  bankInfo: string;
  mst: string;
  ownerName: string;
  role: string;
};

export type ContractType = "digital" | "default";

export type ContractDocumentStatus =
  | "unsigned"
  | "owner_signed"
  | "completed";

export type ContractSignatureStatus = "signed";
export type ContractSignerType = "owner" | "partner";
export type ContractSigningMethod = "pdf_byte_range";

export type ContractDetail = {
  id: number;
  contractDetailId: string;
  productName: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type ContractDocument = {
  id: number;
  contractDocumentId: string;
  version: number;
  status: ContractDocumentStatus;
  fileUrl: string;
  fileHash: string;
  createdAt: string;
  updatedAt: string;
};

export type ContractSignature = {
  contractSignatureId: string;
  contractDocumentId: string;
  signerType: ContractSignerType;
  signerEmail: string;
  signerName: string;
  signingMethod: ContractSigningMethod;
  status: ContractSignatureStatus;
  pdfHashBeforeSign: string;
  preparedPdfHash: string;
  byteRange: number[];
  signatureLength: number;
  certificateSerial: string;
  certificateSubject: string;
  certificateIssuer: string;
  vendor: string;
  signedPdfHash: string;
  signedPdfUrl: string;
  signedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Contract = {
  id: number;
  contractId: string;
  contractNumber: string;
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractDueDate: string;
  contractChecksum: string;
  contractType: ContractType;
  contractUrl: string;
  createdAt: string;
  updatedAt: string;
  details: ContractDetail[];
  documents: ContractDocument[];
  signatures: ContractSignature[];
};

export type CreateContractResponse = {
  contract: Contract;
  pdfHashHex: string;
  previewUrl: string;
};

export type SigningSessionPayload = {
  signerType: "owner" | "partner";
  signerEmail: string;
  signerName: string;
};

export type SigningSessionResponse = {
  contractId: string;
  contractSignatureId: string;
  contractDocumentId: string;
  documentVersion: number;
  hashToSign: string;
  pdfHashBeforeSign: string;
  byteRange: number[];
  algorithm: string;
  signatureFormat: string;
  localSignUrl: string;
};

export type SigningCompletePayload = {
  signatureHex: string;
  certificatePem: string;
  certificateSerial: string;
  certificaateIssuer: string;
  certificateSubject: string;
  vendor: string;
};
