export interface LicenseContract {
  name: string;
  url: string;
}

export interface SoftwareServerConfig {
  name: string;
  active: boolean;
}

export interface SoftwareItem {
  id?: string;
  licenseId?: string;
  softwareId: string;
  name: string;
  price: string | number;
  status: string;
  domain: string;
  type: string;
  serverConfig: SoftwareServerConfig[];
  note: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LicenseTicket {
  id: string;
  licenseId: string;
  title: string;
  message: string;
  attachments: string[];
  status: string;
  cancelReason: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: number;
  licenseId: string;
  licenseKey: string;
  licenseContract: LicenseContract[];
  yearlyCost: string | number;
  oncePaymentStatus: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  note: string;
  software: SoftwareItem[];
  tickets: LicenseTicket[];
  createdAt: string;
  updatedAt: string;
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

export interface UpdateLicensePayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  yearlyCost: number;
  oncePaymentStatus: string;
  licenseContract: LicenseContract[];
  note: string;
  software: SoftwareItem[];
}

export interface CreateLicenseTicketPayload {
  title: string;
  message: string;
  attachments: string[];
  note: string;
}
