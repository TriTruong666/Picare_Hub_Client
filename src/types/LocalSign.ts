export type CheckHealthResponse = {
  ok: boolean;
  port: number;
  service: string;
  vendor: string[];
};

export type USBInfoResponse = {
  vendor: string;
  label: string;
  available?: boolean;
  error?: string;
  driverPath?: string;
  token?: USBToken;
  certificates?: USBCertificate[];
};

type USBToken = {
  label: string;
  manufacturerID: string;
  model: string;
  serialNumber: string;
};

export type USBCertificate = {
  certificateId: string;
  label: string;
  serialHex: string;
  subjectHex: string;
  issuerHex: string;
  notBefore: string;
  notAfter: string;
  isExpired: boolean;
};

export type CertificateResponse = {
  vendor: string;
  driverPath: string;
  certificateId: string;
  label: string;
  certificateDerHex: string;
  certificatePem: string;
  subjectHex: string;
  issuerHex: string;
  serialHex: string;
  notBefore: string;
  notAfter: string;
  isExpired: boolean;
};

export type SignPDFCMSPayload = {
  hash: string;
  pin: string;
  vendor: string;
  certificateId: string;
};

export type SignPDFCMSResponse = {
  signatureHex?: string;
  signatureFormat?: string;
  vendor?: string;
  certificateId?: string;
  certificatePem?: string;
  certificateSerial?: string;
  certificateSubject?: string;
  certificateIssuer?: string;
};
