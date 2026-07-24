/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import {
  FiArchive,
  FiLayout,
  FiUsers,
  FiGrid,
  FiFileText,
  FiBox,
  FiShield,
} from "react-icons/fi";
import type { Role } from "@/hooks/useAuth";
import { canAccessDashboard } from "@/config/dashboardAccess";
import LandingPage from "@/pages/public/LandingPage";
import LandingPageTest from "@/pages/public/LandingPageTest";
import LoginPage from "@/pages/public/LoginPage";
import LoginClientPage from "@/pages/public/LoginClientPage";
import LoginHubPage from "@/pages/public/LoginHubPage";
import QRProductPreviewPage from "@/pages/public/QRProductPreviewPage";
import ContractCreatePage from "@/pages/private/ContractCreatePage";
import ContractDashboardPage from "@/pages/private/ContractDashboardPage";
import ContractEditPage from "@/pages/private/ContractEditPage";
import ContractPreviewPage from "@/pages/private/ContractPreviewPage";
import QRProductGeneratorPage from "@/pages/private/QRProductGeneratorPage";
import QRProductEditPage from "@/pages/private/QRProductEditPage";
import QRProductDashboardPage from "@/pages/private/QRProductDashboardPage";
import AccountDashboardPage from "@/pages/private/AccountDashboardPage";
import StorageDashboardPage from "@/pages/private/StorageDashboardPage";
import SummaryDashboardPage from "@/pages/private/SummaryDashboardPage";
import HubClientDashboardPage from "@/pages/private/HubClientDashboardPage";
import ContractPartnerSignPage from "@/pages/public/ContractPartnerSignPage";
import LicenseCreatePage from "@/pages/private/LicenseCreatePage";
import LicenseEditPage from "@/pages/private/LicenseEditPage";
import LicenseDetailPage from "@/pages/private/LicenseDetailPage";
import LicenseListPage from "@/pages/private/LicenseListPage";
import LicenseSupportPage from "@/pages/private/LicenseSupportPage";
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
    path: PATHS.TEST,
    element: <LandingPageTest />,
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
  // {
  //   path: PATHS.MY_PAGE,
  //   element: <MyPage />,
  // },
  {
    path: PATHS.PARTNER_SIGN,
    element: <ContractPartnerSignPage />,
  },
  {
    path: PATHS.QR_PRODUCT_PREVIEW,
    element: <QRProductPreviewPage />,
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
    path: PATHS.DASHBOARD.CONTRACTS,
    element: <ContractDashboardPage />,
    label: "Hợp đồng",
    icon: FiFileText,
    showInSidebar: true,
    roles: ["admin", "ceo", "hr", "finance"],
  },
  {
    path: PATHS.DASHBOARD.QR_PRODUCTS,
    element: <QRProductDashboardPage />,
    label: "QR Sản phẩm",
    icon: FiBox,
    showInSidebar: true,
    roles: ["admin", "ceo", "business_development"],
  },
  {
    path: PATHS.DASHBOARD.STORAGE,
    element: <StorageDashboardPage />,
    label: "Lưu trữ",
    icon: FiArchive,
    showInSidebar: true,
    roles: ["admin"],
  },
  {
    path: PATHS.DASHBOARD.HUB_CLIENTS,
    element: <HubClientDashboardPage />,
    label: "Hub Clients",
    icon: FiGrid,
    showInSidebar: true,
    roles: ["admin"],
  },
  {
    path: "/dashboard/licenses",
    label: "Bản quyền",
    icon: FiShield,
    showInSidebar: true,
    roles: ["admin"],
    children: [
      {
        path: PATHS.DASHBOARD.LICENSE_CREATE,
        element: <LicenseCreatePage />,
        label: "Tạo bản quyền",
        showInSidebar: true,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_EDIT,
        element: <LicenseEditPage />,
        showInSidebar: false,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_DETAIL,
        element: <LicenseDetailPage />,
        showInSidebar: false,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_LIST,
        element: <LicenseListPage />,
        label: "Danh sách",
        showInSidebar: true,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_SUPPORT,
        element: <LicenseSupportPage />,
        label: "Hỗ trợ",
        showInSidebar: true,
      },
    ],
  },
  {
    path: PATHS.CONTRACT_CREATE,
    element: <ContractCreatePage />,
    showInSidebar: false,
  },
  {
    path: PATHS.CONTRACT_EDIT,
    element: <ContractEditPage />,
    showInSidebar: false,
  },
  {
    path: PATHS.CONTRACT_PREVIEW,
    element: <ContractPreviewPage />,
    showInSidebar: false,
  },
  {
    path: PATHS.QR_PRODUCT_GENERATOR,
    element: <QRProductGeneratorPage />,
    showInSidebar: false,
  },
  {
    path: PATHS.QR_PRODUCT_EDIT,
    element: <QRProductEditPage />,
    showInSidebar: false,
  },
];

export const getSidebarNavigation = (role?: Role) =>
  PRIVATE_ROUTES.filter((route) => {
    if (!canAccessDashboard(role)) return false;
    const hasRole = !route.roles || (role && route.roles.includes(role));
    return route.showInSidebar && hasRole;
  });
