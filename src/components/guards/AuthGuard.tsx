import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "../custom_ui/Spinner";

const HUB_UI_URL = import.meta.env.VITE_HUB_UI_URL || "https://hub.picare.vn";

/**
 * Bảo vệ các private routes.
 * Nếu chưa đăng nhập → redirect sang trang login.
 * Nếu đã đăng nhập → render children bình thường.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  if (!isAuthenticated) {
    // Chuyển hướng sang Hub để đăng nhập
    window.location.href = `${HUB_UI_URL}/login?redirect=${encodeURIComponent(window.location.href)}`;
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
