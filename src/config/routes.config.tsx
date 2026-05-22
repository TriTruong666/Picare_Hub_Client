/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { FiArchive, FiLayout, FiUsers, FiGrid } from "react-icons/fi";
import type { Role } from "@/hooks/useAuth";
import LandingPage from "@/pages/public/LandingPage";
import LoginPage from "@/pages/public/LoginPage";
import LoginClientPage from "@/pages/public/LoginClientPage";
import LoginHubPage from "@/pages/public/LoginHubPage";
import ContractCreatePage from "@/pages/public/ContractCreatePage";
import AccountDashboardPage from "@/pages/private/AccountDashboardPage";
import StorageDashboardPage from "@/pages/private/StorageDashboardPage";
import SummaryDashboardPage from "@/pages/private/SummaryDashboardPage";
import HubClientDashboardPage from "@/pages/private/HubClientDashboardPage";
import { PATHS } from "./paths";

export interface RouteConfig {
  path: string;
  element?: ReactNode;
  label?: string;
  icon?: any;
  showInSidebar?: boolean;
  roles?: Role[];
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
    element: <LoginClientPage />,
  },
  {
    path: PATHS.LOGIN_CLIENT,
    element: <LoginPage />,
  },
  {
    path: PATHS.LOGIN_HUB,
    element: <LoginHubPage />,
  },
  {
    path: PATHS.CONTRACT_CREATE,
    element: <ContractCreatePage />,
  },
];

export const PRIVATE_ROUTES: RouteConfig[] = [
  {
    path: PATHS.DASHBOARD.ROOT,
    element: <SummaryDashboardPage />,
    label: "T\u1ed5ng quan",
    icon: FiLayout,
    showInSidebar: true,
    index: true,
  },
  {
    path: PATHS.DASHBOARD.SUMMARY,
    element: <SummaryDashboardPage />,
    label: "T\u1ed5ng quan",
    icon: FiLayout,
    showInSidebar: false,
  },
  {
    path: PATHS.DASHBOARD.ACCOUNTS,
    element: <AccountDashboardPage />,
    label: "T\u00e0i kho\u1ea3n",
    icon: FiUsers,
    showInSidebar: true,
  },
  {
    path: PATHS.DASHBOARD.STORAGE,
    element: <StorageDashboardPage />,
    label: "L\u01b0u tr\u1eef",
    icon: FiArchive,
    showInSidebar: true,
  },
  {
    path: PATHS.DASHBOARD.HUB_CLIENTS,
    element: <HubClientDashboardPage />,
    label: "Hub Clients",
    icon: FiGrid,
    showInSidebar: true,
  },
];

export const getSidebarNavigation = (role?: Role) =>
  PRIVATE_ROUTES.filter((route) => {
    const hasRole = !route.roles || (role && route.roles.includes(role));
    return route.showInSidebar && hasRole;
  });
