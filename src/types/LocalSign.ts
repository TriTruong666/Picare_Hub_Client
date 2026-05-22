export type CheckHealthResponse = {
  ok: boolean;
  port: number;
  service: string;
  vendor: string[];
};

export type USBInfoResponse = {
  vendor: string;
  label: string;
  driverPath: string;
  token: USBToken;
  certificates: USBCertificate[];
};

type USBToken = {
  label: string;
  manufacturerID: string;
  model: string;
  serialNumber: string;
};

type USBCertificate = {
  certificateId: string;
  label: string;
  serialHex: string;
  subjectHex: string;
  issuerHex: string;
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
};

export type SignPDFCMSPayload = {
  hash: string;
  pin: string;
  vendor: string;
  certificateId: string;
};
