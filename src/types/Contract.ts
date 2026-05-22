export type CreateContractPayload = {
  ownerCompanyInfo: OwnerCompanyInfoPayload;
  partnerCompanyInfo: PartnerCompanyInfoPayload;
  contractDueDate: string;
  contractType: "digital" | "default";
  contractUrl: string;
  details: ContractDetailPayload[];
};

type ContractDetailPayload = {
  productName: string;
  price: string;
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

export type SigningSessionPayload = {
  signerType: "owner" | "partner";
  signerEmail: string;
  signerName: string;
};

export type SigningCompletePayload = {
  signatureHex: string;
  certificatePem: string;
  certificateSerial: string;
  certificaateIssuer: string;
  certificateSubject: string;
  vendor: string;
};
