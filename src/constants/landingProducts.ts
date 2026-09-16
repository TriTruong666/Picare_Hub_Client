import { PATHS } from "@/config/paths";

export interface LandingProductItem {
  id: string;
  name: string;
  href: string;
  badge?: string;
  description: string;
  image: string;
}

// Ảnh mock mặc định - Bạn có thể thay đổi đường dẫn ảnh thực tế cho từng sản phẩm
export const DEFAULT_PRODUCT_MOCK_IMAGE =
  "https://framerusercontent.com/images/gTH5qA521PTXYmAuTkvadn5fso.png?width=1292&height=450";

export const LANDING_PRODUCTS: LandingProductItem[] = [
  {
    id: "picare-oms",
    name: "Picare OMS",
    href: PATHS.CLIENT_OMS,
    description:
      "Hệ thống quản lý và xử lý đơn hàng đa kênh tập trung, đồng bộ real-time.",
    image:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1779252603657_upload1779252603626.png",
  },
  {
    id: "picare-wms",
    name: "Picare WMS",
    href: "#",
    description:
      "Quản trị kho bãi thông minh, tối ưu hóa vị trí lưu trữ và quy trình xuất nhập tồn.",
    image: "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1785136928251_upload1785136928250.png",
  },
  {
    id: "picare-saleforce",
    name: "Picare Saleforce",
    href: "#",
    badge: "Mới",
    description:
      "Quản lý đội ngũ kinh doanh, chỉ tiêu bán hàng và mở rộng mạng lưới phân phối.",
    image: "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1787048687332_23254c2e-0d2d-4376-90bf-8a0f61237acb_upload1787048687302.png",
  },
  {
    id: "picare-office",
    name: "Picare Office",
    href: "#",
    badge: "Sắp ra mắt",
    description:
      "Không gian làm việc số và số hóa quy trình phê duyệt hành chính nội bộ.",
    image: DEFAULT_PRODUCT_MOCK_IMAGE,
  },
  {
    id: "picare-lab",
    name: "Picare Lab",
    href: "#",
    badge: "Đang phát triển",
    description:
      "Trung tâm nghiên cứu, thử nghiệm và ứng dụng các giải pháp công nghệ tiên tiến.",
    image: DEFAULT_PRODUCT_MOCK_IMAGE,
  },
  {
    id: "picare-career",
    name: "Picare Career",
    href: "#",
    badge: "Đang phát triển",
    description:
      "Cổng tuyển dụng và quản trị phát triển sự nghiệp nhân tài tại Picare.",
    image: DEFAULT_PRODUCT_MOCK_IMAGE,
  },
  {
    id: "picare-econtract",
    name: "Picare E-Contract",
    href: "#",
    description:
      "Khởi tạo, ký số và quản lý hồ sơ hợp đồng điện tử pháp lý bảo mật cao.",
    image: DEFAULT_PRODUCT_MOCK_IMAGE,
  },
  {
    id: "picare-qr-generator",
    name: "Picare QR Generator",
    href: "#",
    description:
      "Tạo và quản lý mã QR thông minh phục vụ truy xuất nguồn gốc sản phẩm.",
    image: DEFAULT_PRODUCT_MOCK_IMAGE,
  },
  {
    id: "picare-catalogues",
    name: "Picare Catalogues",
    href: "#",
    description:
      "Ấn phẩm số và thư viện tài liệu giới thiệu sản phẩm trực quan, sống động.",
    image: DEFAULT_PRODUCT_MOCK_IMAGE,
  },
];
