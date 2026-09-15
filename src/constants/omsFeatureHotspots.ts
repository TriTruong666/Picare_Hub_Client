/**
 * Cấu hình danh sách các màn hình Mockup và các điểm Hotspot tương tác trên Studio Display OMS
 * Bạn có thể dễ dàng thêm mới màn hình (slide), đổi ảnh và thêm/sửa tọa độ các điểm dot của từng màn hình tại đây.
 */

export interface FeatureHotspotItem {
  /** Định danh duy nhất cho mỗi hotspot (vd: 'sync-orders', 'return-detail') */
  id: string;

  /** Tiêu đề ngắn gọn của tính năng */
  title: string;

  /** Đoạn mô tả chi tiết chức năng */
  description: string;

  /** Loại media: 'video' hoặc 'image' */
  mediaType: "video" | "image";

  /** Đường dẫn URL hình ảnh hoặc video mp4 */
  mediaUrl: string;

  /**
   * Tọa độ vị trí % trên màn hình mockup (từ 0% đến 100%)
   * x: tính từ mép trái (0%) sang mép phải (100%)
   * y: tính từ mép trên (0%) xuống mép dưới (100%)
   */
  x: number;
  y: number;

  /**
   * Hướng mở Card UI popup so với vị trí Dot (tùy chọn)
   * 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
   * Nếu không điền, hệ thống sẽ tự động mở về phía trung tâm màn hình.
   */
  placement?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
}

export interface OmsMockupSlide {
  /** Định danh duy nhất cho slide (vd: 'oms-dashboard', 'oms-return-order') */
  id: string;

  /** Tên hiển thị tab / nhãn slide */
  name: string;

  /** Link ảnh chụp màn hình mockup */
  image: string;

  /** Danh sách các điểm hotspot dot riêng biệt cho màn hình này */
  hotspots: FeatureHotspotItem[];
}

export const OMS_MOCKUP_SLIDES: OmsMockupSlide[] = [
  {
    id: "oms-dashboard",
    name: "Tổng quan đơn hàng",
    image:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789453707874_5472133c-50f6-4e76-9c69-63ce735f1d32_oms1.png",
    hotspots: [
      {
        id: "sync-orders",
        title: "Đồng bộ đơn hàng TikTok",
        description:
          "Tự động đồng bộ và kéo toàn bộ đơn hàng phát sinh từ các gian hàng TikTok Shop theo thời gian thực về OMS.",
        mediaType: "video",
        mediaUrl:
          "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789040818588_274e6a57-8814-4602-a775-eb61a3a008f5_syncorderoms.mp4",
        x: 90.1,
        y: 20.7,
        placement: "bottom-left",
      },
      // {
      //   id: "global-search",
      //   title: "Tìm kiếm thông minh toàn hệ thống",
      //   description:
      //     "Truy xuất nhanh đơn hàng, khách hàng, sản phẩm hoặc điều hướng tính năng trên toàn hệ thống OMS chỉ với một thao tác tìm kiếm.",
      //   mediaType: "video",
      //   mediaUrl:
      //     "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789458002777_58b55ca6-dd5d-483f-b91b-441faa0134ba_omsglobalsearch.mp4",
      //   x: 20.5,
      //   y: 3.8,
      //   placement: "bottom-right",
      // },
    ],
  },
  {
    id: "oms-return-order",
    name: "Quản lý đơn hoàn trả",
    image:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789459428074_2b2811db-af5b-4f6c-ab3c-c9ee3e1c1733_omsreturnorder.png",
    hotspots: [
      {
        id: "return-order-detail",
        title: "Chi tiết đơn hoàn trả",
        description:
          "Theo dõi chi tiết thông tin kiện hàng, nguyên nhân hoàn trả và đồng bộ tiến độ hoàn trả về kho theo thời gian thực.",
        mediaType: "video",
        mediaUrl:
          "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789458581713_c334f2b4-9508-4e66-b0a3-d4dc41c80879_omsdetailreturn.mp4",
        x: 92.5,
        y: 47.0,
        placement: "bottom-left",
      },
    ],
  },
  {
    id: "oms-package-video",
    name: "Quay video đóng gói",
    image:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789464615318_812c5653-f149-42e9-b52a-f79e2286a8bb_omspackagevideo.png",
    hotspots: [
      {
        id: "package-video-list",
        title: "Liên kết đến danh sách videos",
        description:
          "Danh sách videos đóng hàng bao gồm Đóng hàng và Trả hàng. Liên kết trực tiếp với đơn hàng nhằm tra cứu nhanh và ghép video để khiếu nại lên sàn.",
        mediaType: "image",
        mediaUrl:
          "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789464614470_e912604b-32e5-46d4-aa0a-3ebb3c30a85c_omspackagevideolist.png",
        x: 4.5,
        y: 61.0,
        placement: "top-right",
      },
    ],
  },
  {
    id: "oms-print-order",
    name: "Quản lý in đơn hàng",
    image:
      "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789465442229_3a99d724-66f9-4b22-bdc8-6085ba6ed06e_oms-print-order.png",
    hotspots: [
      {
        id: "oms-print-order-flow",
        title: "In đơn hàng loạt",
        description:
          "Xuất và in đơn hàng hàng loạt chỉ với những thao tác đơn giản, kết hợp với kiểm tra tồn kho và trừ tồn kho. In xong hệ thống sẽ tự động gộp file PDF để in.",
        mediaType: "video",
        mediaUrl:
          "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789040808196_e5d26978-c804-46e8-b634-7056d9519bb6_printorderoms.mp4",
        x: 86.1,
        y: 20.7,
        placement: "bottom-left",
      },
    ],
  },
];

// Giữ lại để tương thích ngược nếu có chỗ khác đang gọi OMS_FEATURE_HOTSPOTS
export const OMS_FEATURE_HOTSPOTS: FeatureHotspotItem[] =
  OMS_MOCKUP_SLIDES[0].hotspots;
