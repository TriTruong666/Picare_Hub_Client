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
    id: "picare-office-security-upgrade",
    // 1. Điền đường link tùy chỉnh
    path: "/cap-nhat-he-thong-bao-mat",
    // 2. Import file page component từ thư mục update-blog để trỏ tới đường link đó
    component: SecurityOfficeUpdateDetailPage,
    version: "v2.5.0-sec",
    category: "Bảo mật & Picare Office",
    date: "21/09/2026",
    readTime: "4 phút đọc",
    title:
      "Hệ thống vừa nâng cấp toàn diện về mặt bảo mật để phục vụ cho hệ thống Picare Office (Mới)",
    summary:
      "Triển khai hạ tầng mã hóa ở cấp độ lõi, kiểm soát phiên làm việc Zero Trust thích ứng và giao thức kết nối an toàn chuẩn doanh nghiệp nhằm sẵn sàng bàn giao cho toàn bộ phân hệ văn phòng Picare Office mới.",
    author: "Picare Core Security Team",
    authorRole: "Bộ phận Kỹ thuật Bảo mật & Hạ tầng",
  },
  {
    id: "oms-sync-latency-optimization",
    // Khi thêm trang mới trong thư mục update-blog:
    // path: "/toi-uu-dong-bo-don-hang-oms",
    // component: OmsSyncUpdateDetailPage,
    version: "v2.4.2",
    category: "Hiệu năng & Tối ưu",
    date: "15/09/2026",
    readTime: "3 phút đọc",
    title:
      "Tối ưu hoá luồng đồng bộ đơn hàng OMS đa kênh và bộ nhớ đệm phân tán Redis",
    summary:
      "Nâng cấp kiến trúc pipeline đồng bộ dữ liệu thời gian thực giữa các sàn thương mại điện tử về hệ thống trung tâm Picare Hub, giảm 65% thời gian xử lý đơn hàng lúc cao điểm.",
    author: "OMS Architecture Group",
    authorRole: "Nhóm Kiến trúc Phân hệ OMS",
  },
  {
    id: "contract-dynamic-templates-engine",
    version: "v2.4.0",
    category: "Tính năng mới",
    date: "08/09/2026",
    readTime: "5 phút đọc",
    title:
      "Ra mắt động cơ tạo mẫu hợp đồng linh hoạt và cổng ký điện tử từ xa cho đối tác",
    summary:
      "Cung cấp giải pháp khởi tạo hợp đồng nguyên tắc, phụ lục cam kết và thỏa thuận dịch vụ với giao diện chỉnh sửa trực quan, cho phép đối tác xác thực và ký số tức thì trên thiết bị di động.",
    author: "Contract & Legal Tech Team",
    authorRole: "Phòng Công nghệ Pháp chế & Hợp đồng",
  },
  {
    id: "wms-multi-warehouse-failover",
    version: "v2.3.8",
    category: "Hạ tầng Cloud",
    date: "28/08/2026",
    readTime: "3 phút đọc",
    title:
      "Tăng cường khả năng chịu tải và mở rộng cụm máy chủ WMS quản lý kho bãi đa vùng",
    summary:
      "Nâng cấp hạ tầng máy chủ xử lý dữ liệu nhập xuất kho, đảm bảo khả năng quét mã vạch và phân phối hàng hóa mượt mà ngay cả khi mất kết nối Internet tạm thời tại kho vật lý.",
    author: "Cloud Infrastructure Team",
    authorRole: "Đội ngũ Vận hành Hạ tầng Đám mây",
  },
  {
    id: "catalog-3d-renderer-enhancement",
    version: "v2.3.5",
    category: "Giao diện & Trải nghiệm",
    date: "18/08/2026",
    readTime: "2 phút đọc",
    title:
      "Cải tiến công nghệ trình chiếu danh mục sản phẩm 3D và hiển thị tương tác thời gian thực",
    summary:
      "Tích hợp công nghệ kết xuất đồ họa WebGL tối ưu hóa cho di động, cho phép khách hàng xem chi tiết cấu tạo sản phẩm ở mọi góc độ mà không làm nóng thiết bị.",
    author: "Product Design & Experience Lab",
    authorRole: "Phòng Trải nghiệm Sản phẩm Số",
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
