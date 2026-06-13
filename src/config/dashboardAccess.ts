import type { UserRole } from "@/types/User";

export const DASHBOARD_ACCESS_ROLES: UserRole[] = [
  "business_development",
  "admin",
  "finance",
];

export function canAccessDashboard(role?: UserRole | null) {
  return !!role && DASHBOARD_ACCESS_ROLES.includes(role);
}
