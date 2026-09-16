---
name: product-landing-ui
description: "Comprehensive layout & UI architecture guide for building high-end, Apple-inspired public product showcase landing pages in Picare Hub (e.g. OMS, WMS, Saleforce, Office, Lab, Career). Covers sticky navbar scroll transitions, video hero overlays, Studio Display 3D mockups with interactive beacon hotspots, contrast feature sections, cross-sell ecosystem cards, quote forms, and FAQ accordions."
---

# Picare Product Landing Page UI Architecture & Implementation Guide

Tài liệu này là **chuẩn mực (master blueprint)** để xây dựng giao diện landing page giới thiệu các sản phẩm con trong hệ sinh thái Picare (ví dụ: **Picare OMS**, **Picare WMS**, **Picare Saleforce**, **Picare Office**, **Picare Lab**, **Picare Career**,...). 

Mẫu chuẩn mực hiện tại được triển khai tại:
- Page: [ClientOmsPage.tsx](file:///Users/it_picare/it_develop/picare_repo/Picare_Hub_Client/src/pages/public/client_products/ClientOmsPage.tsx)
- Route: `/client/oms` (`PATHS.CLIENT_OMS` / `PATHS.CLIENT_PRODUCTS_OMS`)

---

## 1. Triết Lý Thiết Kế (Design Philosophy)

1. **Aesthetic "Dark Luxury SaaS & Apple Minimalist"**:
   - Tông nền chủ đạo là Dark Violet/Black (`#120F17` hoặc `#0A090D`) kết hợp điểm nhấn ánh sáng Ambient Glow mờ (`blur-[60px]...blur-[90px]`).
   - Section tính năng trung tâm tương phản mạnh (High Contrast Showcase): Sử dụng nền trắng tinh tế hoặc panel kính để tôn vinh ảnh chụp màn hình UI thật của sản phẩm.
2. **Micro-interactions & Physics-driven**:
   - Sử dụng kết hợp **Framer Motion** cho layout/entrance/exit transitions.
   - Sử dụng **GSAP** cho timeline animation mượt mà (chuyển màu fill layer, magnetic cursor, camera transitions).
3. **No Placeholders & No Clutter**:
   - Luôn sử dụng hình ảnh/video render chất lượng cao hoặc mockup Studio Display chuẩn tỷ lệ thật.

---

## 2. Kiến Trúc 8 Khối Layout Chuẩn (8-Section Master Flow)

Mọi trang sản phẩm trong hệ sinh thái Picare cần tuân theo dòng chảy logic (visual hierarchy) gồm 8 khối:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Header & Navbar: PublicLandingNavbar (Fixed, Dynamic Dark BG Scroll)│
├────────────────────────────────────────────────────────────────────────┤
│ 2. Hero Section: Title + Subtitle + Video Card + Cinematic Modal      │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Value Proposition: Lead Problem-Solving Hook + 2-Col Benefits Grid │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Interactive Feature Showcase: Apple Mac Studio Display 3D Frame     │
│    - Tab Navigation / Swipe Slide Mockups                              │
│    - Interactive Beacon Hotspots (Pulse Wave + Popover Card)           │
│    - 2-Column Detailed Feature Rows                                    │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Ecosystem Cross-Sell Banner (e.g. WMS / Partner Integration)       │
│    - 3D Cutout Transparent Render + Glow + GSAP Magnetic CTA Button    │
├────────────────────────────────────────────────────────────────────────┤
│ 6. Conversion Card: Báo giá & Trải nghiệm Demo                         │
│    - Momokemuri Peach Gradient Container + Contact Form/Trigger        │
├────────────────────────────────────────────────────────────────────────┤
│ 7. FAQ Section: Accordion Component (Smooth Collapsible Q&A)          │
├────────────────────────────────────────────────────────────────────────┤
│ 8. Footer: PublicLandingFooter (Ecosystem Links, Smooth Anchors)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Chi Tiết Triển Khai Từng Section

### Section 1: Dynamic Fixed Navbar (`PublicLandingNavbar`)

- **Vị trí**: Cố định trên cùng (`fixed inset-x-0 top-0 z-50`).
- **Cơ chế hoạt động**:
  - Khi ở đầu trang (`scrollY <= 40`): Navbar trong suốt, hòa vào hero background.
  - Khi cuộn trang (`scrollY > 40`): Kích hoạt `isDarkBg={true}`, lớp background `bg-[#0E0B14]/92` viền `border-white/[0.12]` cùng hiệu ứng `backdrop-blur-md` tự động trượt xuống êm dịu bằng GSAP (giống hệt `LandingPageTest.tsx`).

```tsx
// Pattern chuẩn lắng nghe scroll trong trang sản phẩm:
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    setIsScrolled(scrollY > 40);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

return (
  <div className="font-haffer relative min-h-screen w-full overflow-x-hidden bg-[#120F17] text-white">
    <PublicLandingNavbar isDarkBg={isScrolled} />
    {/* Content */}
  </div>
);
```

---

### Section 2: Hero & Video Card (`CinematicVideoModal`)

- **Title & Subtitle**: Sử dụng font display (`font-haffer`), chữ to rõ với gradient text hoặc white tương phản cao (`text-4xl sm:text-5xl lg:text-6xl`).
- **Video Card Preview**:
  - Không zoom video khi hover để tránh layout shift hoặc mỏi mắt.
  - Hover hiển thị lớp phủ mờ đen (`opacity: 0 -> 1`), Logo Picare Client và nhãn *"Nhấn để chơi video"*.
- **Cinematic Modal**: Khi click, mở `CinematicVideoModal` phủ full viewport với video tự động phát ở độ phân giải gốc.

```tsx
<CinematicVideoModal
  isOpen={isVideoModalOpen}
  videoUrl={VIDEO_URL}
  onClose={() => setIsVideoModalOpen(false)}
/>
```

---

### Section 3: Value Proposition (Lợi ích cốt lõi)

- **Problem Hook**: Một khung viền bo cong tinh tế (`rounded-3xl border border-white/10 bg-white/[0.02] p-8`) dẫn dắt bài toán thực tế mà doanh nghiệp gặp phải.
- **Benefits Grid**: Grid 2 cột (`grid-cols-1 md:grid-cols-2 gap-8`):
  - Bên trái: Số thứ tự to nổi bật (`01`, `02`, `03`, `04`) màu cam `#F86D2B` hoặc xám gradient.
  - Bên phải: Tiêu đề in đậm + đoạn văn giải thích chi tiết, `font-normal text-neutral-400`.

---

### Section 4: Apple Mac Studio Display Interactive Showcase

Khối trình diễn màn hình mockup sản phẩm mang phong cách Apple cao cấp:

1. **Khung màn hình Studio Display CSS**:
   - Tỷ lệ hiển thị khớp với tỷ lệ ảnh chụp màn hình (ví dụ `aspect-[3024/1654]`).
   - Notch Camera nhỏ ở viền trên.
   - Thân kim loại viền đen, chân đế nhôm nguyên khối (Base & Neck) kèm bóng đổ chân đế.
2. **Thanh Tabs chuyển màn hình**:
   - Cho phép người dùng chuyển nhanh giữa các tính năng chính (Đơn hàng, Tồn kho, Khách hàng, Báo cáo,...).
3. **Interactive Beacon Hotspots (Điểm ghim tương tác)**:
   - Tọa độ theo phần trăm `%` (`top`, `left`) để responsive trên mọi màn hình.
   - Vòng sóng breathing mở rộng êm dịu (`animate-ping` hoặc custom keyframe).
   - Nút kính đen viền trắng tương phản cao, chứa biểu tượng `+` tự xoay thành `×` khi mở popover.
   - Card Popover kính mờ hiển thị tiêu đề, mô tả và badge chức năng.

```tsx
// Cấu trúc Hotspot Beacon Item:
export interface FeatureHotspotItem {
  id: string;
  x: number; // Tỷ lệ % từ mép trái
  y: number; // Tỷ lệ % từ mép trên
  badge?: string;
  title: string;
  description: string;
}
```

---

### Section 5: Ecosystem Cross-Sell Banner (Ví dụ: Picare WMS)

- Giới thiệu sản phẩm liên kết trong cùng hệ sinh thái.
- Layout 12 cột (`lg:grid-cols-12`):
  - **Cột trái (5 cột)**: Tiêu đề sản phẩm tiếp theo, danh sách tính năng đồng bộ, nút CTA tương tác slide fill layer GSAP (`GsapWmsCtaButton`).
  - **Cột phải (7 cột)**: Render 3D không nền (`scale-[1.4]` hoặc kích thước lớn) nổi bật trên nền ánh sáng ambient glow vàng/cam (`bg-gradient-to-tr from-[#F86D2B]/25 blur-[70px]`).

---

### Section 6: Conversion Card (Báo giá & Demo)

- Khối chuyển đổi trọng tâm ở cuối trang (`id="quote-card"`).
- Nền Gradient Momokemuri thời thượng (`gradient-momokemuri`) hoặc Peach Smoke sáng màu tạo điểm nhấn bừng sáng trước chân trang:
  ```css
  /* Token css gradient-momokemuri trong src/index.css */
  .gradient-momokemuri {
    background: linear-gradient(135deg, #FDE8E4 0%, #F5B1AA 50%, #F19A90 100%);
  }
  ```
- Typography chữ đen tương phản cao (`text-neutral-950`), kèm form liên hệ hoặc nút điều hướng đăng ký trải nghiệm.

---

### Section 7: FAQ Accordion (`Accordion`)

- Khối giải đáp thắc mắc thường gặp (`id="faq-section"`).
- Tái sử dụng component chuẩn: `@/components/custom_ui/Accordion`.
- Hỗ trợ chế độ đa mục (`allowMultiple={false}` để tự động đóng mục trước), animation `AnimatePresence` trơn tru không bị giật layout.

```tsx
import Accordion, { type AccordionItemData } from "@/components/custom_ui/Accordion";

<Accordion
  items={FAQ_LIST}
  allowMultiple={false}
  defaultOpenIndex={0}
/>
```

---

### Section 8: Footer (`PublicLandingFooter`)

- Tái sử dụng component: `@/components/landing/PublicLandingFooter`.
- Đã tích hợp sẵn:
  - Danh sách sản phẩm điều hướng đúng chuẩn `PATHS.CLIENT_OMS`.
  - Nút cuộn mượt (smooth scroll) tới `#quote-card` và `#faq-section`.
  - Thông tin bản quyền, công ty mẹ, chính sách bảo mật.

---

## 4. Checklist Khi Tạo Trang Sản Phẩm Mới (e.g. WMS, Saleforce)

Khi tạo một trang sản phẩm mới (ví dụ `ClientWmsPage.tsx`):
1. **Đăng ký Route**:
   - Thêm hằng số vào [src/config/paths.ts](file:///Users/it_picare/it_develop/picare_repo/Picare_Hub_Client/src/config/paths.ts) (ví dụ `CLIENT_WMS: "/client/wms"`).
   - Đăng ký vào [src/config/routes.config.tsx](file:///Users/it_picare/it_develop/picare_repo/Picare_Hub_Client/src/config/routes.config.tsx) trong `PUBLIC_ROUTES`.
2. **Đồng bộ Footer & Navbar**:
   - Cập nhật link trong [PublicLandingFooter.tsx](file:///Users/it_picare/it_develop/picare_repo/Picare_Hub_Client/src/components/landing/PublicLandingFooter.tsx) (`productLinks`).
   - Cập nhật menu xổ xuống trong [PublicLandingNavbar.tsx](file:///Users/it_picare/it_develop/picare_repo/Picare_Hub_Client/src/components/landing/PublicLandingNavbar.tsx) nếu có.
3. **Kế thừa State Scroll**:
   - Luôn thêm `isScrolled` listener và truyền `isDarkBg={isScrolled}` vào `<PublicLandingNavbar />`.
4. **Chuẩn hóa Asset Mockup**:
   - Mockup ảnh độ phân giải cao tỷ lệ 16:9 hoặc Studio Display chuẩn.
   - Định nghĩa các điểm hotspot beacon trong file constants riêng (như `constants/omsFeatureHotspots.ts`).
