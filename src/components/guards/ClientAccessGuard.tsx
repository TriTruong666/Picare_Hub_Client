import { useAuth } from "@/hooks/useAuth";
import { useCheckAccessHubClient } from "@/hooks/data/useHubClientHooks";
import { FullScreenSpinner } from "../custom_ui/Spinner";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { AxiosError } from "axios";

/**
 * Guard kiểm tra quyền truy cập của User vào một Client cụ thể.
 * Logic xử lý:
 * 1. Thành công (success: true) -> Cho phép truy cập.
 * 2. Chưa đăng nhập (ERR_UNAUTHORIZED_001) -> useAuth sẽ xử lý (hoặc tự động logout).
 * 3. Sai Role (ERR_AUTH_003) -> Đá về trang chọn client (xóa clientId).
 */
export function ClientAccessGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");

  const {
    fullResponse,
    isLoading: isAccessLoading,
    error,
  } = useCheckAccessHubClient(clientId || "");

  useEffect(() => {
    // Chỉ xử lý khi đã xác thực và có clientId
    if (!isAuthLoading && isAuthenticated && clientId) {
      const response = fullResponse;
      const apiError = error as AxiosError<any>;

      // Trường hợp 1: Backend trả về success: false hoặc Axios bắn lỗi
      const errorCode =
        response?.error_code || apiError?.response?.data?.error_code;

      if (errorCode === "ERR_AUTH_003") {
        // Tài khoản không có quyền -> Quay về Hub chọn client khác
        setSearchParams({});
        return;
      }

      if (errorCode === "ERR_UNAUTHORIZED_001") {
        // Phiên đăng nhập hết hạn -> Để useAuth hoặc các interceptor xử lý logout
        return;
      }
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    clientId,
    fullResponse,
    error,
    setSearchParams,
  ]);

  // Hiện Spinner khi đang xác thực hoặc đang check quyền (nếu đã login)
  if (isAuthLoading || (isAuthenticated && clientId && isAccessLoading)) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
