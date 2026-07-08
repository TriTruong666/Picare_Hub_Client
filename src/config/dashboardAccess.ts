import type { UserRole } from "@/types/User";

export const DASHBOARD_ACCESS_ROLES: UserRole[] = [
  "admin",
  "ceo",
  "hr",
  "finance",
  "admin_brand",
  "business_development",
];

export function canAccessDashboard(role?: UserRole | null) {
  return !!role && DASHBOARD_ACCESS_ROLES.includes(role);
}

