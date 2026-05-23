/**
 * Centralized paths for the application.
 * Using constants helps avoid magic strings and makes it easier to refactor.
 */
export const PATHS = {
  // Public Paths
  HOME: "/",
  LOGIN: "/login",            // Trang chọn client hub
  LOGIN_CLIENT: "/login/client", // Form đăng nhập cho client cụ thể
  LOGIN_HUB: "/login/hub",       // Trang đăng nhập Hub chung (centered)
  CONTRACT_CREATE: "/contracts/create",
  CONTRACT_PREVIEW: "/contracts/:contractId/preview",

  // Private Paths (Dashboard)
  DASHBOARD: {
    ROOT: "/dashboard",
    SUMMARY: "/dashboard/summary",
    NOTIFICATIONS: "/dashboard/notifications",
    MESSAGES: "/dashboard/messages",
    PROFILE: "/dashboard/profile",
    SETTINGS: "/dashboard/settings",
    ACCOUNTS: "/dashboard/accounts",
    STORAGE: "/dashboard/storage",
    HUB_CLIENTS: "/dashboard/hub-clients",
    HUB_CLIENT_CREATE: "/dashboard/hub-clients/create",
    HUB_CLIENT_EDIT: "/dashboard/hub-clients/:clientId/edit",
  },
};
