import { FullScreenSpinner } from "../custom_ui/Spinner";

interface ClientAccessGuardProps {
  children: React.ReactNode;
  isCheckingAccess?: boolean;
}

/**
 * Guard đơn giản - chỉ hiện spinner khi đang load.
 * Toàn bộ logic check quyền và redirect được xử lý tại LoginPage.
 */
export function ClientAccessGuard({
  children,
  isCheckingAccess = false,
}: ClientAccessGuardProps) {
  if (isCheckingAccess) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
