import type { UserRole } from "../types/User";
import { PATHS } from "./paths";
import {
  getStaticHubClientRoles,
  QR_CODE_GENERATOR_CLIENT_ID,
} from "../constants/staticHubClients";

export const ADMIN_ACCESS_ROLES: UserRole[] = ["admin"];
export const DASHBOARD_OVERVIEW_ROLES: UserRole[] = [
  "admin",
  "ceo",
  "hr",
  "finance",
  "admin_brand",
  "business_development",
];
export const QR_DASHBOARD_ROLES = getStaticHubClientRoles(
  QR_CODE_GENERATOR_CLIENT_ID,
);
export const CONTRACT_DASHBOARD_ROLES: UserRole[] = [
  "admin",
  "ceo",
  "hr",
  "finance",
];
export const DASHBOARD_ACCESS_ROLES: UserRole[] = [
  ...new Set([...DASHBOARD_OVERVIEW_ROLES, ...QR_DASHBOARD_ROLES]),
];
export const DASHBOARD_SCOPE_ROLES = {
  dashboard: DASHBOARD_ACCESS_ROLES,
  overview: DASHBOARD_OVERVIEW_ROLES,
  admin: ADMIN_ACCESS_ROLES,
  "contracts-dashboard": CONTRACT_DASHBOARD_ROLES,
  "qr-products": QR_DASHBOARD_ROLES,
};

// Specific sections precede the shell fallback; consumed by UI and build policy.
export const DASHBOARD_ROUTE_POLICIES = [
  {
    pattern: "^/dashboard/(?:accounts|storage|hub-clients|licenses)(?:/|$)",
    scope: "admin",
  },
  { pattern: "^/dashboard/settings/system/?$", scope: "admin" },
  { pattern: "^/dashboard/qr-products/?$", scope: "qr-products" },
  { pattern: "^/dashboard/contracts(?:/|$)", scope: "contracts-dashboard" },
  { pattern: "^/dashboard/summary/?$", scope: "overview" },
  { pattern: "^/dashboard(?:/|$)", scope: "dashboard" },
] as const;

export function canAccessDashboard(role?: UserRole | null) {
  return !!role && DASHBOARD_ACCESS_ROLES.includes(role);
}

export function canAccessDashboardPath(
  role: UserRole | null | undefined,
  pathname: string,
) {
  if (!role) return false;
  const rule = DASHBOARD_ROUTE_POLICIES.find((item) =>
    new RegExp(item.pattern).test(pathname),
  );
  return !!rule && DASHBOARD_SCOPE_ROLES[rule.scope].includes(role);
}

export function getDashboardHomePath(role?: UserRole | null) {
  return role &&
    !DASHBOARD_OVERVIEW_ROLES.includes(role) &&
    QR_DASHBOARD_ROLES.includes(role)
    ? PATHS.DASHBOARD.QR_PRODUCTS
    : PATHS.DASHBOARD.ROOT;
}
