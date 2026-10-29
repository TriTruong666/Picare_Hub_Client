import React from "react";
import { AuthGuard } from "./AuthGuard";
import ServiceSuspendedPage from "@/components/common/ServiceSuspendedPage";
import {
  getStaticHubClient,
  isStaticHubClientActive,
} from "@/constants/staticHubClients";
import type { Role } from "@/hooks/useAuth";

interface StaticClientGuardProps {
  children: React.ReactNode;
  clientId: string;
  requireAuth?: boolean;
  checkRoles?: boolean;
  allowedRoles?: Role[];
  requireDashboardAccess?: boolean;
}

/**
 * Guard hợp nhất cho các Static Hub Client:
 * 1. Kiểm tra client có bị ngưng hoạt động không (isActive = false) -> ServiceSuspendedPage
 * 2. Tự động liên kết allowedRoles từ staticHubClients.ts (không cần cấu hình lại ở Router)
 * 3. Hỗ trợ requireAuth = false cho các route public cần check trạng thái ngưng dịch vụ
 */
export function StaticClientGuard({
  children,
  clientId,
  requireAuth = true,
  checkRoles = true,
  allowedRoles,
  requireDashboardAccess = true,
}: StaticClientGuardProps) {
  const client = getStaticHubClient(clientId);
  const isActive = isStaticHubClientActive(clientId);

  if (!isActive) {
    return (
      <ServiceSuspendedPage clientName={client?.clientName || "Dịch vụ"} />
    );
  }

  if (!requireAuth) {
    return <>{children}</>;
  }

  const effectiveRoles = checkRoles
    ? (allowedRoles ?? (client?.allowedRoles as Role[] | undefined))
    : undefined;

  return (
    <AuthGuard
      allowedRoles={effectiveRoles}
      requireDashboardAccess={requireDashboardAccess}
    >
      {children}
    </AuthGuard>
  );
}

