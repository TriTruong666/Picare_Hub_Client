/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, Suspense, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
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
import {
  canAccessDashboard,
  canAccessDashboardPath,
  ADMIN_ACCESS_ROLES,
  QR_DASHBOARD_ROLES,
  CONTRACT_DASHBOARD_ROLES,
  DASHBOARD_OVERVIEW_ROLES,
} from "@/config/dashboardAccess";
import LandingPage from "@/pages/public/LandingPage";
import ClientOmsPage from "@/pages/public/client_products/ClientOmsPage";
import BlogUpdatesPage from "@/pages/public/BlogUpdatesPage";
import LoginHubPage from "@/pages/public/LoginHubPage";
import QRProductPreviewPage from "@/pages/public/QRProductPreviewPage";
import SepTrungBirthPage from "@/pages/public/birthdate/SepTrungBirthPage";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { FullScreenSpinner } from "@/components/custom_ui/Spinner";
import ContractPartnerSignPage from "@/pages/public/ContractPartnerSignPage";
import {
  DIGITAL_CONTRACT_CLIENT_ID,
  QR_CODE_GENERATOR_CLIENT_ID,
  isStaticHubClientActive,
} from "@/constants/staticHubClients";
import { PATHS } from "./paths";

// AuthGuard must render successfully before React requests this private chunk.
const PimoryPage = lazy(() => import("@/pages/authenticated/PimoryPage"));

export interface RouteConfig {
  path: string;
  element?: ReactNode;
  label?: string;
  icon?: any;
  showInSidebar?: boolean;
  roles?: Role[];
  children?: RouteConfig[];
  index?: boolean;
  staticClientId?: string;
}

export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: PATHS.HOME,
    element: <LandingPage />,
    index: true,
  },
  {
    path: PATHS.TEST,
    element: <Navigate to={PATHS.HOME} replace />,
  },
  {
    path: PATHS.CLIENT_OMS,
    element: <ClientOmsPage />,
  },
  {
    path: PATHS.CHANGES,
    element: <BlogUpdatesPage />,
  },
  {
    path: "/login/hub",
    element: <Navigate to={PATHS.LOGIN} replace />,
  },
  {
    path: "/login/*",
    element: <LoginHubPage />,
  },
  {
    path: PATHS.PARTNER_SIGN,
    element: <ContractPartnerSignPage />,
  },
  {
    path: PATHS.QR_PRODUCT_PREVIEW,
    element: <QRProductPreviewPage />,
  },
  {
    path: PATHS.BIRTHDATE_SEPTRUNG,
    element: <SepTrungBirthPage />,
  },
  {
    path: "/birthdate/septrung",
    element: <Navigate to={PATHS.BIRTHDATE_SEPTRUNG} replace />,
  },
  {
    path: PATHS.PIMORY,
    element: (
      <AuthGuard requireDashboardAccess={false}>
        <Suspense fallback={<FullScreenSpinner />}>
          <PimoryPage />
        </Suspense>
      </AuthGuard>
    ),
  },
];

export const PRIVATE_ROUTES: RouteConfig[] = [
  {
    path: PATHS.DASHBOARD.ROOT,
    label: "Tổng quan",
    roles: DASHBOARD_OVERVIEW_ROLES,
    icon: FiLayout,
    showInSidebar: true,
    index: true,
  },
  {
    path: PATHS.DASHBOARD.SUMMARY,
    label: "Tổng quan",
    roles: DASHBOARD_OVERVIEW_ROLES,
    icon: FiLayout,
    showInSidebar: false,
  },
  {
    path: PATHS.DASHBOARD.ACCOUNTS,
    label: "Tài khoản",
    roles: ADMIN_ACCESS_ROLES,
    icon: FiUsers,
    showInSidebar: true,
  },
  {
    path: PATHS.DASHBOARD.CONTRACTS,
    label: "Hợp đồng",
    icon: FiFileText,
    showInSidebar: true,
    roles: CONTRACT_DASHBOARD_ROLES,
    staticClientId: DIGITAL_CONTRACT_CLIENT_ID,
  },
  {
    path: PATHS.DASHBOARD.QR_PRODUCTS,
    label: "QR Sản phẩm",
    icon: FiBox,
    showInSidebar: true,
    roles: QR_DASHBOARD_ROLES,
    staticClientId: QR_CODE_GENERATOR_CLIENT_ID,
  },
  {
    path: PATHS.DASHBOARD.STORAGE,
    label: "Lưu trữ",
    icon: FiArchive,
    showInSidebar: true,
    roles: ADMIN_ACCESS_ROLES,
  },
  {
    path: PATHS.DASHBOARD.HUB_CLIENTS,
    label: "Hub Clients",
    icon: FiGrid,
    showInSidebar: true,
    roles: ADMIN_ACCESS_ROLES,
  },
  {
    path: "/dashboard/licenses",
    label: "Bản quyền",
    icon: FiShield,
    showInSidebar: true,
    roles: ADMIN_ACCESS_ROLES,
    children: [
      {
        path: PATHS.DASHBOARD.LICENSE_CREATE,

        label: "Tạo bản quyền",
        showInSidebar: true,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_EDIT,

        showInSidebar: false,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_DETAIL,

        showInSidebar: false,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_LIST,

        label: "Danh sách",
        showInSidebar: true,
      },
      {
        path: PATHS.DASHBOARD.LICENSE_SUPPORT,

        label: "Hỗ trợ",
        showInSidebar: true,
      },
    ],
  },
  {
    path: PATHS.CONTRACT_CREATE,
    showInSidebar: false,
  },
  {
    path: PATHS.CONTRACT_EDIT,
    showInSidebar: false,
  },
  {
    path: PATHS.CONTRACT_PREVIEW,
    showInSidebar: false,
  },
  {
    path: PATHS.QR_PRODUCT_GENERATOR,
    showInSidebar: false,
  },
  {
    path: PATHS.CATALOGUE.CREATE,
    showInSidebar: false,
  },
  {
    path: PATHS.CATALOGUE.EDIT,
    showInSidebar: false,
  },
  {
    path: PATHS.QR_PRODUCT_EDIT,
    showInSidebar: false,
  },
];

export function getSidebarNavigation(role?: Role): RouteConfig[] {
  if (!canAccessDashboard(role)) return [];
  const filter = (routes: RouteConfig[]): RouteConfig[] =>
    routes
      .filter(
        (route) =>
          route.showInSidebar &&
          canAccessDashboardPath(role, route.path) &&
          (!route.roles || (!!role && route.roles.includes(role))) &&
          (!route.staticClientId ||
            isStaticHubClientActive(route.staticClientId)),
      )
      .map((route) => ({
        ...route,
        ...(route.children ? { children: filter(route.children) } : {}),
      }));
  return filter(PRIVATE_ROUTES);
}
