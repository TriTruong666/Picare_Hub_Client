export interface LicenseContract {
  name: string;
  url: string;
}

export interface SoftwareServerConfig {
  name: string;
  active: boolean;
}

export interface SoftwareItem {
  name: string;
  price: number;
  status: string;
  domain: string;
  type: string;
  serverConfig: SoftwareServerConfig;
  note: string;
}

export interface CreateLicensePayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  yearlyCost: number;
  oncePaymentStatus: string;
  licenseContract: LicenseContract[];
  note: string;
  software: SoftwareItem[];
}
