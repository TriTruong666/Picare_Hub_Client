/**
 * Centralized paths for the application.
 * Using constants helps avoid magic strings and makes it easier to refactor.
 */
export const PATHS = {
  // Public Paths
  HOME: "/",
  MY_PAGE: "/quynhnhu",
  LOGIN: "/login", // Trang chon client hub
  LOGIN_CLIENT: "/login/client", // Form dang nhap cho client cu the
  LOGIN_HUB: "/login/hub", // Trang dang nhap Hub chung (centered)
  CONTRACT_CREATE: "/contracts/create",
  CONTRACT_DETAIL: "/dashboard/contracts/:contractId",
  CONTRACT_EDIT: "/contracts/:contractId/edit",
  CONTRACT_PREVIEW: "/contracts/:contractId/preview",
  PARTNER_SIGN: "/contracts/:contractId/sign-partner",
  QR_PRODUCT_GENERATOR: "/qr-products/generator",
  QR_PRODUCT_PREVIEW: "/qr-products/:productId",
  QR_PRODUCT_EDIT: "/qr-products/:productId/edit",

  // Private Paths (Dashboard)
  DASHBOARD: {
    ROOT: "/dashboard",
    SUMMARY: "/dashboard/summary",
    NOTIFICATIONS: "/dashboard/notifications",
    MESSAGES: "/dashboard/messages",
    PROFILE: "/dashboard/profile",
    SETTINGS: {
      ROOT: "/dashboard/settings",
      SECURITY: "/dashboard/settings/security",
      SYSTEM: "/dashboard/settings/system",
    },
    ACCOUNTS: "/dashboard/accounts",
    CONTRACTS: "/dashboard/contracts",
    QR_PRODUCTS: "/dashboard/qr-products",
    STORAGE: "/dashboard/storage",
    HUB_CLIENTS: "/dashboard/hub-clients",
    HUB_CLIENT_CREATE: "/dashboard/hub-clients/create",
    HUB_CLIENT_EDIT: "/dashboard/hub-clients/:clientId/edit",
    LICENSE_CREATE: "/dashboard/licenses/create",
    LICENSE_EDIT: "/dashboard/licenses/:licenseId/edit",
    LICENSE_LIST: "/dashboard/licenses",
    LICENSE_SUPPORT: "/dashboard/licenses/support",
  },
};
