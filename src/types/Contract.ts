export type PrincipleContractPayload = {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractType: "principle";
  contractDueDate?: string | null;
  contractData: PrincipleContractRequestDataPayload;
};

export type ServiceContractPayload = {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractType: "service";
  contractData: ServiceContractDataPayload;
};

export type AppendixContractProductPayload = {
  origin?: string | null;
  rawContent?: string | null;
  html?: string | null;
  rawHtml?: string | null;
  richText?: string | null;
  productRichText?: string | null;
  ingredients?: string | null;
  productName?: string | null;
  unitPriceVat?: number | string | null;
  classification?: string | null;
  registrationNumber?: string | null;
  packageSpecification?: string | null;
};

export type PrincipleContractRequestDataPayload = {
  paymentTermDays: number;
  creditLimit: number | string | null;
};

export type AppendixContractDataPayload = {
  details: ContractDetail[];
  products?: AppendixContractProductPayload[];
  contractDueDate: string | null;
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  principleContractNumber?: string | null;
};

export type AppendixContractPayload = {
  contractType: "appendix";
  principleContractNumber: string;
  principleContractSignedDate?: string | null;
  contractDueDate?: string | null;
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  products: AppendixContractProductPayload[];
};

export type UpdateContractPayload =
  | PrincipleContractPayload
  | ServiceContractPayload
  | AppendixContractPayload;

export type CreateContractPayload = UpdateContractPayload;

export type ContractDetailPayload = {
  productName: string;
  price: number;
};

export type PrincipleContractDataPayload = {
  paymentTermDays: number;
  creditLimit: number | null;
};

export type ServiceContractDataPayload = {
  title?: string;
  scope?: string;
  paymentTerm?: string;
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
  companyName: string | null;
  address: string;
  phone: string;
  email: string;
  bankInfo: string;
  mst: string | null;
  ownerName: string;
  role: string;
};

export type ContractType =
  | "principle"
  | "appendix"
  | "service"
  | "digital"
  | "default";

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
  id?: number;
  contractDocumentId: string;
  version: number;
  status?: string;
  fileUrl: string | null;
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

export type IndividualCredentialAddressEntities = {
  ward?: string | null;
  street?: string | null;
  district?: string | null;
  province?: string | null;
};

export type IndividualCredentialOcrResponse<TData> = {
  data: TData[];
  errorCode: number;
  errorMessage: string;
};

export type IndividualCredentialFrontOcrData = {
  id?: string | null;
  dob?: string | null;
  doe?: string | null;
  sex?: string | null;
  home?: string | null;
  name?: string | null;
  type?: string | null;
  address?: string | null;
  id_prob?: string | null;
  dob_prob?: string | null;
  doe_prob?: string | null;
  sex_prob?: string | null;
  type_new?: string | null;
  home_prob?: string | null;
  name_prob?: string | null;
  nationality?: string | null;
  address_prob?: string | null;
  overall_score?: string | null;
  address_entities?: IndividualCredentialAddressEntities | null;
  nationality_prob?: string | null;
  number_of_name_lines?: string | null;
};

export type IndividualCredentialBackOcrData = {
  doe?: string | null;
  mrz?: string[] | null;
  pob?: string | null;
  type?: string | null;
  address?: string | null;
  doe_prob?: string | null;
  features?: string | null;
  mrz_prob?: string | null;
  pob_prob?: string | null;
  type_new?: string | null;
  issue_loc?: string | null;
  issue_date?: string | null;
  mrz_details?: {
    id?: string | null;
    dob?: string | null;
    doe?: string | null;
    sex?: string | null;
    name?: string | null;
    nationality?: string | null;
  } | null;
  address_prob?: string | null;
  features_prob?: string | null;
  overall_score?: string | null;
  issue_loc_prob?: string | null;
  issue_date_prob?: string | null;
};

export type IndividualCredential = {
  dob?: string | null;
  doe?: string | null;
  ocr?: {
    first?: IndividualCredentialOcrResponse<IndividualCredentialFrontOcrData> | null;
    second?: IndividualCredentialOcrResponse<IndividualCredentialBackOcrData> | null;
  } | null;
  sex?: string | null;
  home?: string | null;
  name?: string | null;
  type?: string | null;
  address?: string | null;
  features?: string | null;
  religion?: string | null;
  type_new?: string | null;
  ethnicity?: string | null;
  issue_loc?: string | null;
  issue_date?: string | null;
  nationality?: string | null;
  credentialId?: string | null;
  address_entities?: IndividualCredentialAddressEntities | null;
  first_identification_image?: string | null;
  second_identification_image?: string | null;
  first_identification_image_key?: string | null;
  second_identification_image_key?: string | null;
};

export type Contract = {
  id: number;
  contractId: string;
  contractNumber: string;
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractDueDate: string | null;
  contractData?:
    | PrincipleContractDataPayload
    | ServiceContractDataPayload
    | AppendixContractDataPayload
    | null;
  principleContractNumber?: string | null;
  principleContractSignedDate?: string | null;
  products?: string[];
  contractChecksum: string;
  contractType: ContractType;
  contractUrl: string | null;
  createdAt: string;
  updatedAt: string;
  status: ContractStatus;
  individualCredential?: IndividualCredential | null;
  organizationCredential?: unknown | null;
  details?: ContractDetail[];
  documents?: ContractDocument[];
  signatures?: ContractSignature[];
};

export type CreateContractResponse = {
  contract: Contract;
  pdfHashHex: string;
  previewUrl: string;
};

export type DraftDownloadContractResponse = {
  contractId: string;
  contractDocumentId: string;
  documentVersion: number;
  status: "draft";
  fileName: string;
  fileUrl: string;
  fileKey: string;
  downloadUrl: string;
  pdfHashHex: string;
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
  first_identification_image: File;
  second_identification_image: File;
};

export type UploadOrganizationCredentialPayload = {
  business_license: File;
  power_of_attorney_image?: File | null;
};

export type HandwrittenSignaturePayload = {
  // signerType: "individual" | "organization";
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

export type DeleteCredentialPayload = {
  credentialType: "individual" | "organization";
};
