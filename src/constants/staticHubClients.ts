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
    isActive: false, // Bật/tắt trạng thái hoạt động: true = Hoạt động bình thường, false = Ngưng hoạt động toàn bộ tính năng và UI
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
    isActive: true,
    allowedRoles: ["admin", "business_development", "marketing"],
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
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1785172408749_upload1785172408748.png",
    clientInternalUrl: PATHS.CATALOGUE.CREATE,
    clientExternalUrl: PATHS.CATALOGUE.CREATE,
    clientStatus: "active",
    isActive: true,
    allowedRoles: ["admin", "business_development", "marketing"],
    note: "Static hub client",
    createdAt: "",
    updatedAt: "",
  },
];

/**
 * Kiểm tra xem một static hub client có đang hoạt động hay không.
 * Nếu isActive = false hoặc clientStatus != "active", trả về false.
 */
export function isStaticHubClientActive(clientId: string): boolean {
  const client = STATIC_HUB_CLIENTS.find((c) => c.clientId === clientId);
  if (!client) return true;
  return client.isActive !== false && client.clientStatus === "active";
}

/**
 * Lấy thông tin static client theo clientId.
 */
export function getStaticHubClient(clientId: string): HubClient | undefined {
  return STATIC_HUB_CLIENTS.find((c) => c.clientId === clientId);
}

/**
 * Kiểm tra pathname của route xem có thuộc về một static hub client nào đang bị ngưng hoạt động hay không.
 */
export function isStaticRoutePathActive(pathname: string): {
  isActive: boolean;
  clientName?: string;
  clientId?: string;
} {
  if (
    pathname.startsWith("/contracts") ||
    pathname.startsWith("/dashboard/contracts")
  ) {
    const active = isStaticHubClientActive(DIGITAL_CONTRACT_CLIENT_ID);
    return {
      isActive: active,
      clientName: "Picare E-Contract",
      clientId: DIGITAL_CONTRACT_CLIENT_ID,
    };
  }
  if (
    pathname.startsWith("/qr-products") ||
    pathname.startsWith("/dashboard/qr-products")
  ) {
    const active = isStaticHubClientActive(QR_CODE_GENERATOR_CLIENT_ID);
    return {
      isActive: active,
      clientName: "Picare QR Generator",
      clientId: QR_CODE_GENERATOR_CLIENT_ID,
    };
  }
  if (pathname.startsWith("/catalogue")) {
    const active = isStaticHubClientActive(DIGITAL_CATALOGUE_CLIENT_ID);
    return {
      isActive: active,
      clientName: "Picare Catalogue",
      clientId: DIGITAL_CATALOGUE_CLIENT_ID,
    };
  }
  return { isActive: true };
}

