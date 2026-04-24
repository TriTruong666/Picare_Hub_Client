/**
 * Centralized paths for the application.
 * Using constants helps avoid magic strings and makes it easier to refactor.
 */
export const PATHS = {
  // Public Paths
  HOME: "/",
  LOGIN: "/login",            // Trang chọn client hub
  LOGIN_CLIENT: "/login/client", // Form đăng nhập cho client cụ thể

  // Private Paths (Dashboard)
  DASHBOARD: {
    ROOT: "/dashboard",
  },
};
