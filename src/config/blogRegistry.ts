import type { ComponentType } from "react";
import {
  OrderReturnGuideUpdateDetailPage,
  SecurityOfficeUpdateDetailPage,
  StocktakingGuideUpdateDetailPage,
} from "@/pages/public/update-blog";

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
    id: "huong-dan-kiem-ke",
    path: "/changes/huong-dan-kiem-ke",
    component: StocktakingGuideUpdateDetailPage,
    version: "v1.0.0-stocktaking",
    category: "Tính năng mới",
    date: "01/10/2026",
    readTime: "8 phút đọc",
    title: "Hướng dẫn kiểm kê: từ tạo đợt đến ký biên bản",
    summary:
      "Hướng dẫn Kế toán, Kho và QC/QA kiểm theo kho hoặc brand, nhập số đếm, xác nhận, ký và tải biên bản kiểm kê.",
    author: "IT Picare Vietnam",
    authorRole: "Picare Engineering",
  },
  {
    id: "huong-dan-quy-trinh-tra-hang",
    path: "/changes/huong-dan-quy-trinh-tra-hang",
    component: OrderReturnGuideUpdateDetailPage,
    version: "v1.0.0-return",
    category: "Tính năng mới",
    date: "22/09/2026",
    readTime: "7 phút đọc",
    title: "Hướng dẫn quy trình trả hàng và ký biên bản điện tử",
    summary:
      "Hướng dẫn khách hàng và nhân viên bán hàng tạo yêu cầu, ký biên bản, theo dõi trạng thái và phối hợp kiểm nhận hàng trả trên Picare Salesforce.",
    author: "IT Picare Vietnam",
    authorRole: "Picare Engineering",
  },
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
    title: "Đăng nhập an toàn hơn trên Picare Client",
    summary:
      "Triển khai hạ tầng mã hóa ở cấp độ lõi, kiểm soát phiên làm việc Zero Trust thích ứng và giao thức kết nối an toàn chuẩn doanh nghiệp nhằm sẵn sàng bàn giao cho toàn bộ phân hệ văn phòng Picare Office mới.",
    author: "IT Picare Vietnam",
    authorRole: "IT Picare Vietnam",
  },
];

/**
 * Trả về danh sách route tự động từ registry để đưa vào hệ thống routing
 */
export function getBlogCustomRoutes() {
  return BLOG_REGISTRY.filter((item) =>
    Boolean(item.path && item.component),
  ).map((item) => ({
    path: item.path!,
    component: item.component!,
  }));
}
