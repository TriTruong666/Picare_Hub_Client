import type { UserRole } from "@/types/User";

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

export type HubClientRole = UserRole;

export type CreateHubClientInput = {
  clientName: string;
  clientDescription: string;
  clientInternalUrl: string;
  clientExternalUrl: string;
  clientLogoImage: string;
  clientMockupImage: string;
  clientStatus: HubClientStatus;
  allowedRoles: HubClientRole[];
  note?: string;
};

export type UpdateHubClientInput = {
  clientId: string;
  clientName?: string;
  clientDescription?: string;
  clientInternalUrl?: string;
  clientExternalUrl?: string;
  clientLogoImage?: string;
  clientMockupImage?: string;
  clientStatus?: HubClientStatus;
  allowedRoles?: HubClientRole[];
  note?: string;
};
