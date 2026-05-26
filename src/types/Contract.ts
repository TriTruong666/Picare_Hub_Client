export type UpdateContractPayload = {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractDueDate: string;
  contractType: "digital" | "default";
  details: ContractDetailPayload[];
};

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

export type ContractStatus =
  | "draft"
  | "unsigned"
  | "owner_signed"
  | "completed";

export type ContractSignatureStatus = "pending" | "signed";
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
  certificateSerial: string | null;
  certificateSubject: string | null;
  certificateIssuer: string | null;
  vendor: string | null;
  signedPdfHash: string | null;
  signedPdfUrl: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  handwrittenSignatureImageUrl: string | null;
  handwrittenSignatureImageKey: string | null;
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
  contractUrl: string | null;
  createdAt: string;
  updatedAt: string;
  status: ContractStatus;
  details?: ContractDetail[];
  documents?: ContractDocument[];
  signatures?: ContractSignature[];
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
  certificateIssuer: string;
  certificateSubject: string;
  vendor: string;
};

export type SigningCompleteResponse = {
  contractId: string;
  contractSignatureId: string;
  signedDocumentId: string;
  signedPdfHash: string;
  signedPdfUrl: string;
  documentVersion: number;
  status: ContractStatus;
};

export type UpdatePartnerSignTypePayload = {
  signerType: "individual" | "organization";
};

export type UploadIndividualCredentialPayload = {
  first_identification_image: string;
  second_identification_image: string;
};

export type UploadOrganizationCredentialPayload = {
  business_license: string;
  power_of_attorney_image?: string | null;
};

export type HandwrittenSignaturePayload = {
  signerType: "individual" | "organization";
  signerName: string;
  signerEmail: string;
  signature_image: string;
};

export type GenSignLinkResponse = {
  contractId: string;
  partnerEmail: string;
  token: string;
  signingUrl: string;
};
