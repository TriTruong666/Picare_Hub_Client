import type { ComponentType } from "react";
import { SecurityOfficeUpdateDetailPage } from "@/pages/public/update-blog";

export interface BlogItemConfig {
  id: string;
  /**
   * Đường link tuỳ ý bạn muốn đặt cho bài blog (ví dụ: "/cap-nhat-he-thong-bao-mat").
   * Nếu có đường link, tiêu đề ở trang /changes sẽ có thể bấm vào để chuyển hướng đến trang này.
   */
  path?: string;
  /**
   * File Component trang chi tiết bạn import từ thư mục @/pages/public/update-blog để trỏ tới đường link đó.
   * Route sẽ được tự động đăng ký vào hệ thống routing.
   */
  component?: ComponentType;
  /**
   * Phiên bản phát hành
   */
  version: string;
  /**
   * Chuyên mục / Phân hệ
   */
  category: string;
  /**
   * Ngày tháng phát hành
   */
  date: string;
  /**
   * Thời lượng đọc ước tính
   */
  readTime: string;
  /**
   * Tiêu đề bài viết cập nhật
   */
  title: string;
  /**
   * Mô tả tóm tắt hiển thị ở trang danh sách /changes
   */
  summary: string;
  /**
   * Tác giả phát hành
   */
  author?: string;
  authorRole?: string;
}

export const BLOG_REGISTRY: BlogItemConfig[] = [
  {
    id: "1",
    // 1. Điền đường link tùy chỉnh
    path: "/changes/nang-cap-dang-nhap",
    // 2. Import file page component từ thư mục update-blog để trỏ tới đường link đó
    component: SecurityOfficeUpdateDetailPage,
    version: "v1.1.0-sec",
    category: "Bảo mật",
    date: "21/09/2026",
    readTime: "4 phút đọc",
    title:
      "Đăng nhập an toàn hơn trên Picare Client",
    summary:
      "Triển khai hạ tầng mã hóa ở cấp độ lõi, kiểm soát phiên làm việc Zero Trust thích ứng và giao thức kết nối an toàn chuẩn doanh nghiệp nhằm sẵn sàng bàn giao cho toàn bộ phân hệ văn phòng Picare Office mới.",
    author: "TriTruong666",
    authorRole: "IT Picare Vietnam",
  },
];

/**
 * Trả về danh sách route tự động từ registry để đưa vào hệ thống routing
 */
export function getBlogCustomRoutes() {
  return BLOG_REGISTRY.filter((item) => Boolean(item.path && item.component)).map(
    (item) => ({
      path: item.path!,
      element: item.component,
    }),
  );
}
