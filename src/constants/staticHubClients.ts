import { PATHS } from "@/config/paths";
import type { HubClient } from "@/types/HubClient";

export const DIGITAL_CONTRACT_CLIENT_ID = "digital-contracts";

export const STATIC_HUB_CLIENTS: HubClient[] = [
  {
    clientId: DIGITAL_CONTRACT_CLIENT_ID,
    clientName: "Picare E-Contract",
    clientDescription:
      "Tạo, quản lý và ký hợp đồng điện tử tập trung với luồng phê duyệt rõ ràng, lưu trữ an toàn và tra cứu nhanh theo từng đối tác.",
    clientLogoImage: null,
    clientMockupImage: null,
    clientInternalUrl: PATHS.CONTRACT_CREATE,
    clientExternalUrl: PATHS.CONTRACT_CREATE,
    clientStatus: "active",
    allowedRoles: ["admin", "sale_lead", "sale_staff"],
    note: "Static hub client",
    createdAt: "",
    updatedAt: "",
  },
];
