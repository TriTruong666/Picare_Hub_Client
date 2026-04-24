import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "../custom_ui/Spinner";
import { Navigate } from "react-router-dom";
import { PATHS } from "@/config/paths";

/**
 * Bảo vệ các public-only routes (login, landing, v.v...).
 * Nếu chưa đăng nhập → render children bình thường.
 * Nếu đã đăng nhập → redirect về trang chọn client (không được vào lại trang login).
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  if (isAuthenticated) {
    // Đã login rồi → không cho vào trang login nữa
    return <Navigate to={PATHS.HOME} replace />;
  }

  return <>{children}</>;
}
