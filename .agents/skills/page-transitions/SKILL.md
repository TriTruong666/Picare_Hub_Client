---
name: page-transitions
description: Complete reference and architectural guide for all page transition mechanisms in Picare Hub Client. Includes Curve SVG swipe, AeroShard WebGPU particle drain/reverse flow, login slide panel width shifting (50%/100%), decoupled static background pattern (eliminating white flashes), and 3D WebGL page-turn canvas. Use whenever creating, modifying, or troubleshooting page transitions, route changes, or animated UI handoffs.
---

# Picare Hub Client - Master Page Transition Architecture

Tài liệu này tổng hợp toàn bộ các hệ thống **Page Transition (Chuyển cảnh trang)** đang hoạt động trong dự án `Picare_Hub_Client`. Mọi AI Agent và lập trình viên khi bảo trì, mở rộng hoặc thêm trang mới **bắt buộc phải tuân theo các quy chuẩn và pattern dưới đây**.

---

## Bảng Tổng Quan Các Loại Page Transition

| Loại Transition | Công Nghệ | Vị Trí File Chính | Phạm Vi Ứng Dụng |
|---|---|---|---|
| **1. Curve Elastic Swipe** | SVG Path Morphing + GSAP | `src/components/custom_ui/CurvePageTransition.tsx` | Chuyển sang Static Client; Màn hình Intro Landing |
| **2. AeroShard Stream Flow** | WebGPU Particle Shader + GSAP | `src/components/reactbit/AeroShard.tsx`<br>`src/pages/public/LandingPageTest.tsx` | Giữa Trang chủ `/` và Thư viện Catalogue `/catalogue/public/gallery` |
| **3. Slide Panel Shifting** | Framer Motion + Layout Width | `src/components/custom_ui/LoginHubFormSection.tsx`<br>`src/pages/public/LandingPageTest.tsx` | Giữa `/` ↔ `/login` (50%) ↔ `/login/client` (100%) |
| **4. Decoupled Static BG** | CSS Root Lock + Motion Wrapper | `src/pages/public/CataloguePublicGalleryPage.tsx`<br>`index.html`, `src/index.css` | Chuyển cảnh mềm mại không bị chớp trắng (Zero White Flash) |
| **5. 3D Curved Page Turn** | OGL WebGL Mesh Deformation + CSS 3D Fallback | `src/components/custom_ui/CataloguePageTurnCanvas.tsx`<br>`src/pages/public/CataloguePublicPreviewPage.tsx` | Lật trang sách Catalogue 3D thực tế |

---

## 1. Curve Elastic Swipe Transition

### Đặc điểm & Cơ chế
- Sử dụng thẻ `<svg>` toàn màn hình (`viewBox="0 0 100 100" preserveAspectRatio="none"`).
- Dùng GSAP animate thuộc tính `d` của thẻ `<path>` qua 5 chuỗi path 12 tham số chuẩn:
  - `PATH_INITIAL`: Đáy màn hình (`M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z`)
  - `PATH_CURVE_ENTER`: Quét cong kéo lên (`M 0 0 Q 50 -25 100 0 L 100 100 Q 50 100 0 100 Z`)
  - `PATH_COVERED`: Phẳng phủ kín 100% màn hình màu đen (`M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z`)
  - `PATH_CURVE_EXIT`: Kéo cong thoát lên trên (`M 0 0 Q 50 0 100 0 L 100 0 Q 50 -25 0 0 Z`)
  - `PATH_EXITED`: Biến mất hoàn toàn trên đỉnh (`M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z`)
- **Điểm chuyển giao (`onCovered`)**: Khi curve đạt trạng thái phẳng che kín màn hình, callback `onCovered()` được gọi để thực hiện chuyển trang hoặc đổi state ngầm bên dưới trước khi vuốt thoát.

### Cách sử dụng qua Hook
```tsx
import { useCurveTransition } from "@/components/custom_ui/CurvePageTransition";

function MyComponent() {
  const { navigateWithTransition, triggerTransition } = useCurveTransition();

  // Cách 1: Chuyển route trực tiếp kèm hiệu ứng
  const handleOpenClient = () => {
    navigateWithTransition("/qr-products/generator", {
      text: "Picare QR Generator",
      subtext: "Đang chuyển hướng...",
      color: "#000000",
    });
  };

  // Cách 2: Tự xử lý logic khi màn hình bị che phủ
  const handleCustomAction = () => {
    triggerTransition(() => {
      // Thực hiện hành động ngầm khi màn hình đang đen kín
      doSomethingSecret();
    }, { text: "Picare Hub" });
  };
}
```

---

## 2. AeroShard Stream Drain / Reverse Flow Transition

### Đặc điểm & Cơ chế
- Dành riêng cho luồng chuyển đổi giữa **Trang chủ (`LandingPageTest.tsx`)** và **Thư viện Catalogue (`CataloguePublicGalleryPage.tsx`)**.
- Tận dụng shader parameter `drain` (giá trị từ `0.0` đến `1.0`) trong `AeroShard.tsx`:
  - `drain = 0.0`: Luồng hạt bay tuần hoàn đều đặn, đầy đủ mật độ.
  - `drain = 1.0`: Luồng hạt bị trôi dạt về phía trước và tan biến hoàn toàn, để lộ nền `#120F17` sạch sẽ.

### Chiều 1: Đi từ Trang chủ sang Catalogue (`/` -> `/catalogue/public/gallery`)
1. User bấm vào **Catalogues** trên Navbar.
2. `LandingPageTest` kích hoạt state `isNavigatingToCatalogue = true`.
3. Toàn bộ nội dung Hero mờ dần và bay nhẹ lên (`opacity: 0, y: -20, filter: blur(6px)` trong 0.38s).
4. Đồng thời, GSAP animate `streamDrainRef` từ `0.0 -> 1.0` trong 0.8s (`ease: "power2.inOut"`).
5. Khi luồng hạt vừa tan biến vào khoảng không nền `#120F17`, gọi `navigate("/catalogue/public/gallery")`.

```tsx
// Pattern triển khai trong LandingPageTest.tsx
const handleNavigateToCatalogue = () => {
  setIsNavigatingToCatalogue(true);
  gsap.to(streamDrainRef.current, {
    value: 1.0,
    duration: 0.8,
    ease: "power2.inOut",
    onUpdate: () => setStreamDrain(streamDrainRef.current.value),
    onComplete: () => navigate("/catalogue/public/gallery"),
  });
};
```

### Chiều 2: Quay về từ Catalogue (`/catalogue/public/gallery` -> `/`)
1. User bấm Logo Picare trên Navbar tại trang Catalogue.
2. Navbar điều hướng về `PATHS.HOME` kèm state: `{ state: { fromCatalogue: true } }`.
3. `LandingPageTest` phát hiện `isFromCatalogue === true`:
   - Bỏ qua màn hình Intro đen che phủ.
   - Khởi tạo giá trị ban đầu: `streamDrain = 1.0` (luồng hạt đang ẩn hoàn toàn).
   - Chạy GSAP timeline animate ngược lại: `streamDrain` từ `1.0 -> 0.0` trong 1.35s (`ease: "power2.out"`).
4. Luồng hạt AeroShard WebGPU từ xa chảy ngược tràn ngập trở lại màn hình trang chủ.

```tsx
// Pattern triển khai khi mount lại LandingPageTest.tsx
useEffect(() => {
  if (isFromCatalogue) {
    window.history.replaceState({}, document.title, location.pathname);
    streamDrainRef.current.value = 1.0;
    setStreamDrain(1.0);
    gsap.to(streamDrainRef.current, {
      value: 0.0,
      duration: 1.35,
      ease: "power2.out",
      onUpdate: () => setStreamDrain(streamDrainRef.current.value),
    });
  }
}, [isFromCatalogue]);
```

---

## 3. Slide Panel Shifting Transition (`/login` & `/login/client`)

### Đặc điểm & Cơ chế
- Phối hợp giữa animation layout width của Framer Motion và vị trí luồng hạt WebGPU AeroShard:
  - **Trang `/login`**:
    - Panel form chiếm **50% chiều rộng** bên phải màn hình.
    - AeroShard chuyển `placement="right"`.
    - Form đăng nhập trượt từ bên trái sang phải vào vị trí trung tâm (`x: -60 -> 0`, `opacity: 0 -> 1`).
  - **Trang `/login/client`**:
    - Panel mở rộng chiếm trọn **100% chiều rộng** màn hình (`0% -> 100%`).
    - Hiển thị lưới thẻ Client Cards (OMS, WMS, CRM, Generator...).
  - **Chuyển đổi ngược về `/`**:
    - Panel trượt thu hẹp từ 50% hoặc 100% về `0%`.
    - AeroShard dịch chuyển trọng tâm về `placement="full"` để đón chào lại Hero Section.

---

## 4. Decoupled Static Background Pattern (Loại Bỏ Hoàn Toàn Vệt Trắng)

### Vấn đề thường gặp (White Flash Bug)
Nếu đặt animation `initial={{ opacity: 0 }}` trên thẻ cha mang màu nền `bg-[#120F17]`, khi chuyển trang thẻ đó sẽ bị trong suốt 100%, làm lộ ra nền trắng mặc định của thẻ `body` / `html` của trình duyệt bên dưới, gây ra hiện tượng chớp trắng (white flash / white flicker) cực kỳ khó chịu.

### Quy tắc Vàng (Golden Rules)
1. **Khóa cứng màu nền `#120F17` ở 4 tầng gốc**:
   - `index.html`: `<html style="background-color: #120F17;">`, `<body style="background-color: #120F17;">`, `<div id="root" style="background-color: #120F17;">`.
   - `index.css`: Cài đặt `body` và `body.dark` đều có `background-color: #120F17`.
2. **Tách biệt màu nền khỏi animation**:
   - Thẻ `<main>` hoặc wrapper ngoài cùng mang class `bg-[#120F17]` **phải luôn luôn cố định 100% opacity**, không bao giờ được animate `opacity` trên thẻ này.
   - Chỉ bọc nội dung con (tiêu đề, thẻ, danh sách) trong một thẻ `<motion.div>` để thực hiện fade-in / fade-out.

```tsx
// Pattern chuẩn hóa trong CataloguePublicGalleryPage.tsx
return (
  <main className="font-haffer relative min-h-screen w-full bg-[#120F17] ...">
    <PublicLandingNavbar onLogoClick={handleBackToHome} />

    {/* Ambient Glow cố định */}
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">...</div>

    {/* CHỈ ANIMATE NỘI DUNG CON NÀY */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        y: isExiting ? -16 : 0,
        filter: isExiting ? "blur(4px)" : "blur(0px)",
      }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-[min(calc(100%_-_3rem),82.5rem)] pb-24"
    >
      {/* Hero title, search bar, catalogue cards */}
    </motion.div>
  </main>
);
```

---

## 5. 3D Curved Page Turn Transition (`CataloguePageTurnCanvas.tsx`)

### Đặc điểm & Cơ chế
- Dùng OGL WebGL vẽ một tấm lưới 3D (Mesh Grid `32x32` vertices).
- Vertex shader uốn cong mặt giấy theo công thức hình trụ / nón xoay quanh trục lật trang:
  - Mặt trước (Front) render hình ảnh trang lẻ/chẵn hiện tại.
  - Mặt sau (Back) render hình ảnh của trang tiếp theo khi lật ngược.
  - Fragment shader tự động tính toán ánh sáng specular highlight dọc theo sống nếp gấp và bóng đổ tự nhiên bên dưới trang giấy.
- **Tự động Fallback**: Nếu WebGL không khởi tạo được hoặc mất context (`webglcontextlost`), component tự động chuyển sang `CssPageTurnFallback` sử dụng `perspective` và `rotateY: 180deg` với `transform-style: preserve-3d`.

---

## Tóm Tắt Quy Tắc Cho Agent Khi Thêm Trang Mới
1. **Kiểm tra tông màu**: Bắt buộc nền tối luôn là `#120F17` (đồng bộ với Landing Page & Dark Palette mới của Picare). Không dùng `#050505` hay màu đen thuần trừ khi có yêu cầu đặc thù.
2. **Không làm lộ thẻ Body**: Tuyệt đối không đặt `opacity: 0` trên thẻ mang màu nền `bg-[#120F17]`.
3. **Điều hướng có chủ đích**:
   - Nếu từ Landing đi sang Catalogue: Gọi callback kích hoạt AeroShard `drain: 0 -> 1`.
   - Nếu từ Catalogue về Landing: Truyền `{ state: { fromCatalogue: true } }` để chạy AeroShard `drain: 1 -> 0`.
   - Nếu chuyển sang Client module riêng lẻ: Dùng `navigateWithTransition` của `CurveTransitionProvider`.
