# Picare Hub UI/UX Design System (Core Pattern)

This document defines the final visual and interaction standards for Picare Hub, based on the established landing page and hero section architecture.

## 1. Design Philosophy: Modern Premium & Glassmorphism
*   **Aesthetic**: Sleek, high-end SaaS feel with a focus on depth, soft edges, and transparency.
*   **Soft Geometry**: Use large border-radii (`rounded-full`, `rounded-2xl`, `rounded-3xl` or specific px like `48px`) for a friendly yet professional look.
*   **Depth & Layering**: Leverage `backdrop-blur` and semi-transparent backgrounds to create a layered "Glass" effect.

## 2. Core Color Palette
| Purpose | Hex Code | Visual |
| :--- | :--- | :--- |
| **Main Background** | `#050505` | SaaS Dark Black |
| **Surface/Pills** | `#1a1a1a/80` | Translucent Dark |
| **Text Primary** | `#FFFFFF` | Pure White |
| **Text Secondary** | `rgba(255,255,255,0.6)` | Dimmed White |
| **Accent Glow** | `#E1A3F1` | Soft Purple |

## 3. Typography
*   **Headings**: `font-sans` (Medium/Light weight, high tracking-tight).
*   **Body/UI**: `font-inter` (Regular/Light/Medium).
*   **Letter Spacing**: Use `tracking-tight` for headings and `tracking-wide` for uppercase pills.

## 4. Component Standards (The "App Pattern")

### 🔘 Buttons
*   **Primary (Solid)**: `rounded-full bg-white px-6 py-2 text-black font-bold`.
*   **Secondary (Ghost)**: `rounded-full border border-white/20 bg-white/5 px-6 py-2 text-white backdrop-blur-sm`.
*   **Interaction**: `transition-all active:scale-95 hover:bg-white/90` (for white buttons) or `hover:bg-white/10` (for ghost buttons).

### 🏷️ UI Pills (Feature Labels)
*   **Style**: `rounded-full bg-[#1a1a1a]/80 px-4 py-2 text-white shadow-lg backdrop-blur-md`.
*   **Content**: Icon (`FiZap`, etc.) + Uppercase text (`tracking-wide text-xs`).

### 📦 Containers & Layout
*   **Sections**: Use large bottom rounding (e.g., `rounded-b-[48px]`) to separate main sections.
*   **Cards (Bento)**: Floating cards with soft shadows and refined borders.
*   **Backgrounds**: Use dynamic components like `DarkVeil` or `AnimatedGrid` for a "living" background.

## 5. Animation Philosophy (Framer Motion)
*   **Entrance**: Smooth `opacity` and `y` offset transitions.
*   **Easing**: High quality easing like `[0.16, 1, 0.3, 1]` (custom cubic-bezier).
*   **Hover States**: Subtle scale or box-shadow glows.

## 6. Architecture Pattern (`App.tsx`)
*   **Global Providers**: Wrap the app in `QueryClientProvider` and `BrowserRouter`.
*   **Routing**: Clean `Routes` with `element` based component mapping.
*   **Responsiveness**: Mobile-first with `md:`, `lg:` breakpoints (e.g., `text-5xl` scaled to `text-3xl` on mobile).
