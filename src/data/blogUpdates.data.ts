export type BlogHighlight = {
  num: string;
  title: string;
  description: string;
};

export type BlogUpdate = {
  id: string;
  publishedAt: string;
  dateLabel: string;
  version: string;
  category: string;
  title: string;
  summary: string;
  readingTime: string;
  isFeatured?: boolean;
  hasDetail: boolean;
  highlights?: BlogHighlight[];
  improvements?: string[];
};

export const FEATURED_SECURITY_UPDATE: BlogUpdate = {
  id: "bao-mat-dang-nhap-trusted-ip-otp",
  publishedAt: "2026-09-21",
  dateLabel: "21.09.2026",
  version: "v2.5.0-sec",
  category: "Bảo mật",
  title: "Đăng nhập an toàn hơn với OTP, Trusted IP và kiểm soát phiên",
  summary:
    "Picare Hub bổ sung lớp xác minh email khi đăng nhập từ IP mới, giới hạn thử mật khẩu và cơ chế thu hồi phiên tức thời khi thông tin bảo mật thay đổi.",
  readingTime: "4 phút đọc",
  isFeatured: true,
  hasDetail: true,
  highlights: [
    {
      num: "01",
      title: "Xác minh IP mới bằng OTP",
      description:
        "Lần đăng nhập đầu tiên từ một địa chỉ IP chưa được tin cậy sẽ cần mã gồm 6 chữ số gửi qua email.",
    },
    {
      num: "02",
      title: "Trusted IP có thời hạn",
      description:
        "Mỗi IP lưu thiết bị, thời điểm xác minh, lần sử dụng gần nhất và tự hết hạn sau 30 ngày.",
    },
    {
      num: "03",
      title: "Giới hạn đăng nhập thất bại",
      description:
        "Redis kiểm soát số lần thử theo cả tài khoản và IP, đồng thời trả thời gian chờ rõ ràng khi bị giới hạn.",
    },
    {
      num: "04",
      title: "Thu hồi phiên tức thời",
      description:
        "JWT và kết nối realtime cũ bị vô hiệu khi đổi mật khẩu, khóa tài khoản, đổi vai trò hoặc chính sách xác thực.",
    },
  ],
  improvements: [
    "Chuẩn hóa địa chỉ IP phía sau Nginx với cấu hình trusted proxy dành riêng cho môi trường production.",
    "Bổ sung màn hình quản trị để khóa tài khoản, bật bypass có kiểm soát và xem metadata Trusted IP.",
    "Tự động đăng xuất sau khi đổi mật khẩu và chặn tài khoản INACTIVE trên HTTP, gRPC và Socket.IO.",
    "Migration chỉ bổ sung trường mới, backfill dữ liệu IP cũ và không xóa dữ liệu hiện có.",
    "Bổ sung bộ kiểm thử cho OTP, rate limit, session version, socket revocation và vòng đời Trusted IP.",
  ],
};

export const BLOG_UPDATES: BlogUpdate[] = [
  FEATURED_SECURITY_UPDATE,
  {
    id: "oms-sync-latency-optimization",
    publishedAt: "2026-09-15",
    dateLabel: "15.09.2026",
    version: "v2.4.2",
    category: "Hiệu năng OMS",
    title: "Tối ưu luồng đồng bộ đơn hàng đa kênh",
    summary:
      "Cải thiện pipeline xử lý và bộ nhớ đệm cho các tác vụ đồng bộ đơn hàng trong giờ cao điểm.",
    readingTime: "3 phút đọc",
    hasDetail: false,
  },
  {
    id: "contract-dynamic-templates-engine",
    publishedAt: "2026-09-08",
    dateLabel: "08.09.2026",
    version: "v2.4.0",
    category: "Hợp đồng số",
    title: "Mở rộng bộ tạo mẫu hợp đồng và luồng ký từ xa",
    summary:
      "Chuẩn hóa trải nghiệm khởi tạo, gửi và theo dõi trạng thái tài liệu trên nhiều thiết bị.",
    readingTime: "5 phút đọc",
    hasDetail: false,
  },
  {
    id: "wms-multi-warehouse-failover",
    publishedAt: "2026-08-28",
    dateLabel: "28.08.2026",
    version: "v2.3.8",
    category: "Hạ tầng WMS",
    title: "Cải thiện khả năng vận hành kho trong điều kiện mạng yếu",
    summary:
      "Chuẩn bị cơ chế đồng bộ lại dữ liệu và tối ưu trải nghiệm quét mã tại các điểm kho.",
    readingTime: "4 phút đọc",
    hasDetail: false,
  },
];

export const getBlogUpdateById = (id: string) =>
  BLOG_UPDATES.find((item) => item.id === id && item.hasDetail);
