import { Navigate, useLocation } from "react-router-dom";

import { PATHS } from "@/config/paths";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "../custom_ui/Spinner";

/**
 * Bảo vệ các private routes.
 * Nếu chưa đăng nhập, chuyển về LoginHubPage kèm redirect về link đang mở.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
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

  return <>{children}</>;
}
