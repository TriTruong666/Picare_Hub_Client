---
name: picare_hub_ui
description: Master UI animation & interaction architecture guide for Picare HUB Frontend. Integrates Framer Motion, OGL WebGL shaders, spring physics (critically damped release/settle), gesture holding progress refs, and image decoding/caching for high-performance complex UI animations. Use when building or refactoring complex interactive UI animations, 3D cards, WebGL overlays, interactive canvases, or dynamic micro-interactions.
---

# Picare HUB Frontend UI Animation & Complex Interaction Architecture

Tài liệu này định nghĩa **Kiến trúc & Pattern Animation Chuẩn hóa** cho Frontend Picare HUB. Được thiết kế để giải quyết bài toán: **Khi Framer Motion / CSS 3D đơn thuần không đạt độ thẩm mỹ, không thể hiện được chiều sâu/vật lý phức tạp (như uốn cong bề mặt 3D, mesh deformation, kéo thả mượt mà 60-120fps theo ngón tay)**.

---

## 1. Triết Lý Kiến Trúc Phân Tầng (Layered Animation Architecture)

Không bao giờ dùng một thư viện duy nhất cho mọi nhu cầu. Mọi component giao diện phức tạp đều được chia thành 3 tầng độc lập:

```
┌─────────────────────────────────────────────────────────┐
│ Tầng 1: Page & Layout Transitions (Framer Motion)       │
│  - Entrance, Exit, Staggered Children, Modal Backdrop   │
├─────────────────────────────────────────────────────────┤
│ Tầng 2: Interactive Gesture & Physical Springs          │
│  - Ref-driven State (`progressRef`), Critically Damped │
│    Spring Physics (Release / Settle Loop)               │
├─────────────────────────────────────────────────────────┤
│ Tầng 3: Mesh Deformation & Shaders (OGL WebGL Canvas)   │
│  - Mesh Grid Deformation (Curved Surfaces, Bending)     │
│  - Vertex Shaders & Custom Fragment Lighting            │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 5 Architectural Patterns Cốt Lõi (General Reusable Patterns)

### Pattern 1: Ref-Driven Animation Loop (Zero React Re-renders)

**Vấn đề**: Ghi nhận tọa độ kéo thả (Drag/Swipe) vào `useState` làm React re-render toàn bộ component tree ở mỗi frame (60-120Hz), gây trễ giật (lag).

**Quy tắc Cấu trúc**:
1. Component cha giữ một `progressRef` (`MutableRefObject<number>`) từ `0.0` đến `1.0`.
2. Sự kiện `onPointerMove` mutate trực tiếp `progressRef.current = progress` (không trigger React render).
3. Component render/canvas đọc `progressRef.current` bên trong `requestAnimationFrame` loop.

```tsx
// Reusable Pattern: Parent Controller
const progressRef = useRef<number>(0);
const [settleTo, setSettleTo] = useState<0 | 1 | null>(null);

const handlePointerMove = (e: React.PointerEvent) => {
  if (!isDragging) return;
  const delta = e.clientX - startXRef.current;
  // Mutate ref trực tiếp -> 0 React re-renders!
  progressRef.current = Math.min(1, Math.max(0, delta / totalDistance));
};

const handlePointerUp = () => {
  setIsDragging(false);
  // Settle về 1 (hoàn thành) hoặc 0 (hủy/trả lại) dựa trên ngưỡng
  setSettleTo(progressRef.current > 0.35 ? 1 : 0);
};
```

---

### Pattern 2: Critically Damped Spring Physics (Vật Lý Buông Tay & Settle)

**Vấn đề**: Easing tuyến tính (`easeInOut`) khi người dùng thả tay ra nhìn bị giả và cứng nhắc.

**Quy tắc Cấu trúc**: Sử dụng phương trình vi phân lò xo giảm xóc tới hạn (Critically Damped Spring) trong render loop:

$$\text{velocity} \mathrel{+}= (\text{target} - \text{current}) \cdot \text{stiffness} \cdot \Delta t$$
$$\text{velocity} \mathrel{*}= e^{-\text{damping} \cdot \Delta t}$$

```typescript
// Reusable Pattern: Render Loop Spring Physics Integration
let currentProgress = progressRef?.current ?? 0;
let velocity = 0;
let previousTime = performance.now();

const render = (now: number) => {
  const requestedSettle = settleRef.current;

  if (!progressRef) {
    // Animation tự động chạy theo thời gian
    const elapsed = (now - startedAt) / durationMs;
    currentProgress = smoothPhysicalTurn(elapsed);
    if (elapsed >= 1) didSettle = true;
  } else if (requestedSettle === null) {
    // Người dùng đang giữ/kéo vật thể trên màn hình
    currentProgress = Math.min(1, Math.max(0, progressRef.current));
    previousTime = now;
  } else {
    // Người dùng thả tay -> Lò xo tự động kéo vật thể về vị trí đích
    const deltaSeconds = Math.min(0.032, Math.max(0.001, (now - previousTime) / 1000));
    previousTime = now;

    // Stiffness = 92, Damping = 15
    velocity += (requestedSettle - currentProgress) * 92 * deltaSeconds;
    velocity *= Math.exp(-15 * deltaSeconds);
    currentProgress += velocity * deltaSeconds;

    // Dừng khi đạt điểm cân bằng
    if (Math.abs(requestedSettle - currentProgress) < 0.002 && Math.abs(velocity) < 0.012) {
      currentProgress = requestedSettle;
      didSettle = true;
    }
  }

  // Cập nhật giá trị vào Shader Uniform hoặc CSS Transform
  uniforms.uProgress.value = Math.min(1, Math.max(0, currentProgress));
};
```

---

### Pattern 3: Instant WebGL Canvas Mount (0ms Startup & Dummy Texture Swap)

**Vấn đề**: Chờ `await loadImage()` nạp ảnh từ server trước khi tạo WebGL Canvas làm giật khựng 200-500ms khi người dùng tương tác.

**Quy tắc Cấu trúc**:
1. **Synchronous Canvas Mount**: Khởi tạo OGL `Renderer`, `Program`, `Plane Mesh` ngay ở frame 0 với Texture 2x2 tạm trên RAM (`createDummyCanvas()`).
2. **Background Async Texture Decoding**: Nạp và decode ảnh thật qua Image Cache / Blob URL.
3. **Seamless Texture Swap**: Ngay khi ảnh nạp xong, gán `texture.image = img; texture.needsUpdate = true` để GPU cập nhật tức thì.

```tsx
// 1. Tạo Dummy Texture 2x2 ngay trên RAM
function createDummyCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#f8f7f3";
    ctx.fillRect(0, 0, 2, 2);
  }
  return canvas;
}

// 2. Texture Swap trong Background
void loadDecodedImage(imageUrl)
  .then((img) => {
    if (cancelled || !gl) return;
    mainTexture.image = img;
    mainTexture.needsUpdate = true;
  })
  .catch(() => {});
```

---

### Pattern 4: General Mesh Deformation & Vertex Shading

Khi cần tạo cảm giác vật thể 3D uốn cong (bề mặt cong, vải, lá giấy, bề mặt chất lỏng):

1. **Geometry Mesh Grid**: Sử dụng plane với mật độ lưới phù hợp (ví dụ: `widthSegments: 40, heightSegments: 56`).
2. **Anchor Point (Trục cố định)**: Nhân độ dời với khoảng cách tới điểm cố định (`distanceFromHinge`) để giữ chặt mép vật thể.
3. **Non-linear Torsion**: Tạo lực kéo phi tuyến tính ở các góc tự do (`pow(1.0 - uv.y, power)`).

```glsl
// General Vertex Shader Pattern cho Uốn Cong Bề Mặt 3D
void main() {
  float distanceToAnchor = uDirection > 0.0 ? uv.x : 1.0 - uv.x;
  float cornerFactor = pow(1.0 - uv.y, 2.65);
  float forceFalloff = pow(distanceToAnchor, 1.45);
  
  float turnForce = sin(PI * uProgress);
  float localAngle = PI * uProgress + turnForce * cornerFactor * forceFalloff;

  // Tính tọa độ uốn cong 3D
  float x = uDirection * distanceToAnchor * cos(localAngle);
  float z = distanceToAnchor * sin(localAngle);
  float perspective = 1.0 / (1.0 - z * 0.19);
  
  gl_Position = vec4(vec2(x, y) * perspective, 0.25 - z * 0.12, 1.0);
}
```

---

### Pattern 5: Global Image Decoding Cache (CORS & Blob Safety)

Dùng chung một hệ thống caching & decoding hình ảnh cho mọi component UI có hiệu ứng Canvas/WebGL:

```typescript
// Shared Decoded Image Cache Strategy
const imageCache = new Map<string, HTMLImageElement>();

export async function getDecodedImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) return imageCache.get(url)!;

  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(blobUrl);
        imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = blobUrl;
    });
  } catch {
    // Standard Image fallback
  }
}
```

---

## 3. Bảng Phân Định Công Nghệ Animation

| Tình huống UI | Công nghệ khuyến nghị | Lưu ý kiến trúc |
| :--- | :--- | :--- |
| **Modal, Dialog, Toast, Drawer** | `Framer Motion` | Kết hợp `AnimatePresence` và `layoutId`. |
| **Hover, Scale, Button Ripple** | `Tailwind CSS / Motion` | Sử dụng CSS GPU hardware acceleration (`transform-gpu`). |
| **Cử chỉ vuốt kéo (Gesture Drag)** | `useRef` + Spring Physics | Dùng `progressRef`, tuyệt đối không lưu drag state vào `useState`. |
| **Uốn cong 3D, Particle, Wave, Mesh** | `OGL (WebGL Canvas)` | Mount Canvas đồng bộ 0ms với Dummy Canvas 2x2. |

---

## 4. Reusable Custom UI Components

Các component mẫu chuẩn hóa cấu trúc nằm tại `src/components/custom_ui/`:
- [CataloguePageTurnCanvas.tsx](file:///d:/OJT/Picare_Hub_Client/src/components/custom_ui/CataloguePageTurnCanvas.tsx): Component OGL Canvas mẫu kết hợp Progress Ref, Critically Damped Spring Physics và WebGL Mesh Deformation.

---

## 5. Developer Quality Checklist

- [ ] Không dùng `useState` lưu tọa độ drag liên tục (dùng `progressRef`).
- [ ] Mọi OGL WebGL Canvas phải mount ở frame 0 với dummy texture.
- [ ] Ảnh truyền vào Canvas phải đi qua Image Cache & Blob URL để tránh CORS Taint.
- [ ] Luôn có cơ chế dọn dẹp WebGL Context khi component unmount.
- [ ] Thả tay ra (`pointerup`) luôn gọi vòng lặp Lò xo vật lý (Spring Physics) để di chuyển về đích tự nhiên.
