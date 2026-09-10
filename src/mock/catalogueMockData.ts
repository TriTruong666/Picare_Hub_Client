import type { Catalogue } from "@/types/Catalogue";
import huongdan1 from "@/assets/images/huongdan1.jpg";
import huongdan2 from "@/assets/images/huongdan2.jpg";
import huongdan3 from "@/assets/images/huongdan3.jpg";
import huongdan4 from "@/assets/images/huongdan4.jpg";
import huongdan5 from "@/assets/images/huongdan5.jpg";
import catalogueLanding from "@/assets/images/catalogue_landing.png";
import omsLanding from "@/assets/images/oms_landing.png";
import wmsLanding from "@/assets/images/wms_landing.png";
import sfaLanding from "@/assets/images/sfa_landing.png";
import saleforceIntro from "@/assets/images/saleforce_intro.png";
import loginMockup from "@/assets/images/login_mockup.jpeg";

export const MOCK_CATALOGUE_SAMPLE_ID = "ab845e2f-cfb9-4761-be7c-59ddf3b49e3f";

export const MOCK_CATALOGUES: Catalogue[] = [
  {
    catalogueId: MOCK_CATALOGUE_SAMPLE_ID,
    catalogueName: "Picare Ecosystem & Operations Guide 2026",
    status: "ACTIVE",
    note: "Sổ tay hướng dẫn kiến trúc giải pháp và quy trình vận hành chuỗi phân hệ Picare 2.0.",
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-03-08T10:00:00.000Z",
    details: [
      {
        catalogueDetailId: "page-1",
        imageUrl: huongdan1,
        imageKey: "huongdan1.jpg",
        sortOrder: 1,
        note: "Trang bìa - Tổng quan hệ sinh thái",
        createdAt: "2026-03-01T08:00:00.000Z",
        updatedAt: "2026-03-01T08:00:00.000Z",
      },
      {
        catalogueDetailId: "page-2",
        imageUrl: huongdan2,
        imageKey: "huongdan2.jpg",
        sortOrder: 2,
        note: "Quy trình kết nối CRM & OMS",
        createdAt: "2026-03-01T08:00:00.000Z",
        updatedAt: "2026-03-01T08:00:00.000Z",
      },
      {
        catalogueDetailId: "page-3",
        imageUrl: huongdan3,
        imageKey: "huongdan3.jpg",
        sortOrder: 3,
        note: "Tích hợp Kho vận thông minh WMS",
        createdAt: "2026-03-01T08:00:00.000Z",
        updatedAt: "2026-03-01T08:00:00.000Z",
      },
      {
        catalogueDetailId: "page-4",
        imageUrl: huongdan4,
        imageKey: "huongdan4.jpg",
        sortOrder: 4,
        note: "Tự động hóa số hóa hợp đồng E-Contract",
        createdAt: "2026-03-01T08:00:00.000Z",
        updatedAt: "2026-03-01T08:00:00.000Z",
      },
      {
        catalogueDetailId: "page-5",
        imageUrl: huongdan5,
        imageKey: "huongdan5.jpg",
        sortOrder: 5,
        note: "Quản trị phân quyền tài khoản & bảo mật",
        createdAt: "2026-03-01T08:00:00.000Z",
        updatedAt: "2026-03-01T08:00:00.000Z",
      },
      {
        catalogueDetailId: "page-6",
        imageUrl: catalogueLanding,
        imageKey: "catalogue_landing.png",
        sortOrder: 6,
        note: "Trang kết - Liên hệ hỗ trợ kỹ thuật",
        createdAt: "2026-03-01T08:00:00.000Z",
        updatedAt: "2026-03-01T08:00:00.000Z",
      },
    ],
  },
  {
    catalogueId: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    catalogueName: "Picare Omnichannel Management (OMS) Portfolio",
    status: "ACTIVE",
    note: "Bộ giải pháp xử lý đơn hàng đa kênh và quản trị tồn kho thời gian thực.",
    createdAt: "2026-02-18T09:00:00.000Z",
    updatedAt: "2026-02-25T14:30:00.000Z",
    details: [
      {
        catalogueDetailId: "oms-page-1",
        imageUrl: omsLanding,
        imageKey: "oms_landing.png",
        sortOrder: 1,
        note: "Bìa OMS",
        createdAt: "2026-02-18T09:00:00.000Z",
        updatedAt: "2026-02-18T09:00:00.000Z",
      },
      {
        catalogueDetailId: "oms-page-2",
        imageUrl: wmsLanding,
        imageKey: "wms_landing.png",
        sortOrder: 2,
        note: "Quản trị luồng nhập xuất tồn",
        createdAt: "2026-02-18T09:00:00.000Z",
        updatedAt: "2026-02-18T09:00:00.000Z",
      },
      {
        catalogueDetailId: "oms-page-3",
        imageUrl: sfaLanding,
        imageKey: "sfa_landing.png",
        sortOrder: 3,
        note: "Phân hệ bán hàng dã ngoại SFA",
        createdAt: "2026-02-18T09:00:00.000Z",
        updatedAt: "2026-02-18T09:00:00.000Z",
      },
      {
        catalogueDetailId: "oms-page-4",
        imageUrl: saleforceIntro,
        imageKey: "saleforce_intro.png",
        sortOrder: 4,
        note: "Dashboard & báo cáo doanh thu",
        createdAt: "2026-02-18T09:00:00.000Z",
        updatedAt: "2026-02-18T09:00:00.000Z",
      },
    ],
  },
  {
    catalogueId: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
    catalogueName: "Picare Enterprise Design & Technology Stack 2026",
    status: "ACTIVE",
    note: "Tài liệu quy chuẩn giao diện người dùng và hạ tầng WebGPU 60fps.",
    createdAt: "2026-01-20T11:15:00.000Z",
    updatedAt: "2026-01-28T16:00:00.000Z",
    details: [
      {
        catalogueDetailId: "tech-page-1",
        imageUrl: loginMockup,
        imageKey: "login_mockup.jpeg",
        sortOrder: 1,
        note: "Bìa công nghệ",
        createdAt: "2026-01-20T11:15:00.000Z",
        updatedAt: "2026-01-20T11:15:00.000Z",
      },
      {
        catalogueDetailId: "tech-page-2",
        imageUrl: huongdan1,
        imageKey: "huongdan1.jpg",
        sortOrder: 2,
        note: "Hạ tầng bảo mật SSO",
        createdAt: "2026-01-20T11:15:00.000Z",
        updatedAt: "2026-01-20T11:15:00.000Z",
      },
      {
        catalogueDetailId: "tech-page-3",
        imageUrl: huongdan2,
        imageKey: "huongdan2.jpg",
        sortOrder: 3,
        note: "Cơ chế đồng bộ thời gian thực",
        createdAt: "2026-01-20T11:15:00.000Z",
        updatedAt: "2026-01-20T11:15:00.000Z",
      },
    ],
  },
];

export function getMockCatalogueDetail(catalogueId?: string): Catalogue {
  const found = MOCK_CATALOGUES.find((c) => c.catalogueId === catalogueId);
  if (found) return found;

  // Nếu tìm theo sample id hoặc bất kỳ id nào không khớp, fallback về sample id
  return {
    ...MOCK_CATALOGUES[0],
    catalogueId: catalogueId || MOCK_CATALOGUE_SAMPLE_ID,
  };
}
