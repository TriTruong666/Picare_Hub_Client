export type HubClient = {
  clientId: string;
  clientName: string;
  clientDescription: string;
  clientLogoImage: string | null;
  clientMockupImage: string | null;
  clientInternalUrl: string;
  clientExternalUrl: string;
  clientStatus: HubClientStatus;
  allowedRoles: HubClientRole[];
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HubClientStatus = "active" | "inactive";

export type HubClientRole =
  | "admin"
  | "ecom_staff"
  | "ecom_lead"
  | "logistics"
  | "warehouse";
