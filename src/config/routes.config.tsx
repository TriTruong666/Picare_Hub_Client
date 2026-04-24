/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
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
    path: PATHS.LOGIN,
    element: <LoginPage />,
  },
];

export const PRIVATE_ROUTES: RouteConfig[] = [
  // Placeholder for future dashboard routes
];
