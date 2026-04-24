/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import LoginClientPage from "@/pages/LoginClientPage";
import { PATHS } from "./paths";

// Types for Route Configuration
export interface RouteConfig {
  path: string;
  element?: ReactNode;
  label?: string;
  icon?: any;
  showInSidebar?: boolean;
  children?: RouteConfig[];
  index?: boolean;
}

export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: PATHS.HOME,
    element: <LandingPage />,
    index: true,
  },
  {
    // /login → Trang chọn client (LoginClientPage)
    path: PATHS.LOGIN,
    element: <LoginClientPage />,
  },
  {
    // /login?clientId=xxx → Được xử lý bởi LoginClientPage (setSearchParams)
    // Nhưng LoginPage cần route riêng khi navigate với clientId
    path: PATHS.LOGIN_CLIENT,
    element: <LoginPage />,
  },
];

export const PRIVATE_ROUTES: RouteConfig[] = [
  // Placeholder for future dashboard routes
];
