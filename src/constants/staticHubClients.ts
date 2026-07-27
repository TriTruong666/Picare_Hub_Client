import { PATHS } from "@/config/paths";
import type { HubClient } from "@/types/HubClient";

export const DIGITAL_CONTRACT_CLIENT_ID = "digital-contracts";
export const QR_CODE_GENERATOR_CLIENT_ID = "qr-code-generator";
export const DIGITAL_CATALOGUE_CLIENT_ID = "digital-catalogue";

export const STATIC_HUB_CLIENTS: HubClient[] = [
  {
    clientId: DIGITAL_CONTRACT_CLIENT_ID,
    clientName: "Picare E-Contract",
    clientDescription:
      "Tạo, quản lý và ký hợp đồng điện tử tập trung với luồng phê duyệt rõ ràng, lưu trữ an toàn và tra cứu nhanh theo từng đối tác.",
    clientLogoImage:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1780040494670_upload1780040494670.png",
    clientMockupImage:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1780032435040_upload1780032435039.png",
    clientInternalUrl: PATHS.CONTRACT_CREATE,
    clientExternalUrl: PATHS.CONTRACT_CREATE,
    clientStatus: "active",
    allowedRoles: ["admin", "finance", "hr", "ceo", "supply_chain"],
    note: "Static hub client",
    createdAt: "",
    updatedAt: "",
  },
  {
    clientId: QR_CODE_GENERATOR_CLIENT_ID,
    clientName: "Picare QR Generator",
    clientDescription:
      "Tạo QR Code cho sản phẩm của bạn, có thể tùy chỉnh logo, màu sắc và các thông tin khác.",
    clientLogoImage:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1781065814978_upload1781065814978.png",
    clientMockupImage:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1780894621968_upload1780894621967.png",
    clientInternalUrl: PATHS.QR_PRODUCT_GENERATOR,
    clientExternalUrl: PATHS.QR_PRODUCT_GENERATOR,
    clientStatus: "active",
    allowedRoles: ["admin", "business_development"],
    note: "Static hub client",
    createdAt: "",
    updatedAt: "",
  },
  {
    clientId: DIGITAL_CATALOGUE_CLIENT_ID,
    clientName: "Picare Catalogue",
    clientDescription:
      "Tạo, quản lý Catalogue kỹ thuật số giúp người dùng có cái nhìn trực quan về sản phẩm của hệ sinh thái Picare",
    clientLogoImage:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1785137232920_upload1785137232920.png",
    clientMockupImage:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1785137232920_upload1785137232920.png",
    clientInternalUrl: PATHS.CATALOGUE.CREATE,
    clientExternalUrl: PATHS.CATALOGUE.CREATE,
    clientStatus: "active",
    allowedRoles: ["admin", "business_development", "marketing"],
    note: "Static hub client",
    createdAt: "",
    updatedAt: "",
  },
];
