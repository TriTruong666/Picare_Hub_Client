import React from "react";
import { AuthGuard } from "@/components/guards/AuthGuard";
import type { Role } from "@/hooks/useAuth";

export interface BlogAuthConfig {
  /**
   * Nếu true, yêu cầu tài khoản có quyền truy cập hệ thống dashboard nội bộ.
   * Mặc định là false (chỉ cần đăng nhập thành công là được đọc blog).
   */
  requireDashboardAccess?: boolean;
  /**
   * Giới hạn danh sách các roles được phép truy cập (nếu cần).
   * Mặc định để undefined (tất cả tài khoản đăng nhập đều xem được).
   */
  allowedRoles?: Role[];
}

/**
 * CẤU HÌNH AUTH DUY NHẤT CHO TOÀN BỘ PHÂN HỆ BLOG & BÀI VIẾT CẬP NHẬT (/changes/*)
 * - Mọi trang trong thư mục update-blog và trang danh sách BlogUpdatesPage đều áp dụng cấu hình này.
 * - Khi tạo bài blog/update mới trong update-blog, bạn KHÔNG cần viết thêm bất kỳ dòng code auth nào.
 * - Khi cần thay đổi chính sách bảo mật (ví dụ: yêu cầu role cụ thể), chỉ cần sửa tại đây.
 */
export const DEFAULT_BLOG_AUTH_CONFIG: BlogAuthConfig = {
  requireDashboardAccess: false,
};

interface BlogAuthGuardProps {
  children: React.ReactNode;
  config?: BlogAuthConfig;
}

/**
 * Guard bảo vệ xác thực cho các trang blog và release notes.
 * Nếu chưa đăng nhập, tự động chuyển hướng về trang /login và lưu đường dẫn hiện tại để redirect lại sau khi đăng nhập.
 */
export function BlogAuthGuard({
  children,
  config = DEFAULT_BLOG_AUTH_CONFIG,
}: BlogAuthGuardProps) {
  return (
    <AuthGuard
      requireDashboardAccess={config.requireDashboardAccess}
      allowedRoles={config.allowedRoles}
    >
      {children}
    </AuthGuard>
  );
}

/**
 * Higher-Order Component (HOC) bọc tự động một trang blog với cấu hình Auth tập trung
 */
export function withBlogAuth<P extends object>(
  Component: React.ComponentType<P>,
  config: BlogAuthConfig = DEFAULT_BLOG_AUTH_CONFIG,
) {
  return function AuthenticatedBlogPage(props: P) {
    return (
      <BlogAuthGuard config={config}>
        <Component {...props} />
      </BlogAuthGuard>
    );
  };
}

export default BlogAuthGuard;
