import { Navigate, useLocation } from "react-router-dom";

import { canAccessDashboard } from "@/config/dashboardAccess";
import { PATHS } from "@/config/paths";
import { useAuth, type Role } from "@/hooks/useAuth";
import { FullScreenSpinner } from "../custom_ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * Bảo vệ các private routes.
 * Nếu chưa đăng nhập, chuyển về LoginHubPage kèm redirect về link đang mở.
 */
export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to={`${PATHS.LOGIN_HUB}?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  if (allowedRoles) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to={PATHS.HOME} replace />;
    }
  } else {
    if (!canAccessDashboard(user?.role)) {
      return <Navigate to={PATHS.HOME} replace />;
    }
  }

  return <>{children}</>;
}

