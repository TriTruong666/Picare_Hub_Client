# Picare Hub UI/UX Design System (Core Pattern)

This document defines the final visual and interaction standards for Picare Hub, based on the established landing page, hero section architecture, and high-end Authentication flow.

## 1. Design Philosophy: Modern Premium & Glassmorphism
*   **Aesthetic**: Sleek, high-end SaaS feel with a focus on depth, soft edges, and transparency.
*   **Soft Geometry**: Use large border-radii (`rounded-full`, `rounded-2xl`, `rounded-3xl` or specific px like `48px`, `24px`) for a friendly yet professional look.
*   **Depth & Layering**: Leverage `backdrop-blur-xl` and semi-transparent backgrounds to create a layered "Glass" effect.
*   **Atmosphere**: Dark background (`#050505`) with subtle color glows and high-contrast primary elements.

## 2. Core Color Palette
| Purpose | Hex Code | Visual |
| :--- | :--- | :--- |
| **Main Background** | `#050505` | SaaS Dark Black |
| **Surface/Pills** | `#1a1a1a/80` | Translucent Dark |
| **Text Primary** | `#FFFFFF` | Pure White |
| **Text Secondary** | `rgba(255,255,255,0.4)` | Dimmed White/Grey |
| **Accent Glow** | `#E1A3F1` | Soft Purple |
| **Primary Gradient** | `#E1A3F1` → `#D192E1` | Brand Purple Gradient |

## 3. Typography
*   **Headings**: `font-bricolage` (Bold/Extrabold, tracking-tight).
*   **Body/UI**: `font-inter` (Light to Medium, tracking-normal).
*   **Font Weights**: Use `font-light` or `font-thin` for secondary messages to emphasize headings.
*   **Letter Spacing**: Use `tracking-tight` for headings and `tracking-widest` for uppercase labels.

## 4. Component Standards

### 🔘 Buttons
*   **Premium Primary**: `rounded-full bg-linear-to-r from-[#E1A3F1] to-[#D192E1] text-[#050505] font-bold shadow-xl shadow-white/5`.
    *   *Effect*: Add a `Shine` overlay that sweeps across on hover.
*   **Secondary (Ghost)**: `rounded-full border border-white/20 bg-white/5 px-6 py-2 text-white backdrop-blur-sm`.
*   **Interaction**: `transition-all active:scale-95 hover:scale-[1.01]`.

### ⌨️ Input Fields (Minimalist Style)
*   **Base**: Transparent background with a `border-b border-white/10`.
*   **Focus Animation**: A smooth left-to-right animated underline using `scale-x-0` to `scale-x-100` with `origin-left`.
*   **Labels**: Small uppercase labels (`text-[12px]`) with significant tracking.

### 🍱 Layout Patterns
*   **Split Screen**: Half-screen layout for complex flows (e.g., Login). Left side for interaction (Form), right side for visual mockup (`object-cover`).
*   **Floating Menus**: Ecosystem lists triggered by a floating button (`FiGrid`). Individual items should be rounded cards with `scale` hover effects.

## 5. Animation Philosophy (Framer Motion)
*   **Entrance Sequence**: Elements should appear sequentially (Staggered) rather than all at once.
    1. Logo (`delay: 0.1s`).
    2. Heading/Subtitle (`delay: 0.25s`).
    3. Inputs (`delay: 0.4s` and `0.55s`).
    4. Primary Actions (`delay: 0.75s`).
*   **Easing**: High quality easing like `[0.16, 1, 0.3, 1]` for a slow, premium feel.
*   **Transitions**: Duration for entrance should be generous (`0.7s` to `1.0s`) to ensure impact.

## 6. Architecture Pattern
*   **Global Providers**: Wrap the app in `QueryClientProvider` and `BrowserRouter`.
*   **Routing**: Clean `Routes` with `element` based component mapping.
*   **Responsiveness**: Mobile-first with `md:`, `lg:` breakpoints. On mobile, full-width containers replace split-screens.
