import { lazy } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  ADMIN_ACCESS_ROLES,
  QR_DASHBOARD_ROLES,
  CONTRACT_DASHBOARD_ROLES,
  DASHBOARD_OVERVIEW_ROLES,
  getDashboardHomePath,
} from "@/config/dashboardAccess";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PATHS } from "@/config/paths";
import ServiceSuspendedPage from "@/components/common/ServiceSuspendedPage";
import {
  DIGITAL_CONTRACT_CLIENT_ID,
  QR_CODE_GENERATOR_CLIENT_ID,
  isStaticHubClientActive,
} from "@/constants/staticHubClients";
import DashboardLayout from "@/layouts/DashboardLayout";
const ModalContainer = lazy(() => import("@/components/ModalContainer"));
const AccountDashboardPage = lazy(
  () => import("@/pages/private/AccountDashboardPage"),
);
const ContractDetailDashboardPage = lazy(
  () => import("@/pages/private/ContractDetailDashboardPage"),
);
const ContractDashboardPage = lazy(
  () => import("@/pages/private/ContractDashboardPage"),
);
const HubClientCreatePage = lazy(
  () => import("@/pages/private/HubClientCreatePage"),
);
const HubClientDashboardPage = lazy(
  () => import("@/pages/private/HubClientDashboardPage"),
);
const HubClientEditPage = lazy(
  () => import("@/pages/private/HubClientEditPage"),
);
const QRProductDashboardPage = lazy(
  () => import("@/pages/private/QRProductDashboardPage"),
);
const PrivateStubPage = lazy(() => import("@/pages/private/PrivateStubPage"));
const StorageDashboardPage = lazy(
  () => import("@/pages/private/StorageDashboardPage"),
);
const StorageFolderDetailPage = lazy(
  () => import("@/pages/private/StorageFolderDetailPage"),
);
const SummaryDashboardPage = lazy(
  () => import("@/pages/private/SummaryDashboardPage"),
);
const LicenseCreatePage = lazy(
  () => import("@/pages/private/LicenseCreatePage"),
);
const LicenseEditPage = lazy(() => import("@/pages/private/LicenseEditPage"));
const LicenseDetailPage = lazy(
  () => import("@/pages/private/LicenseDetailPage"),
);
const LicenseListPage = lazy(() => import("@/pages/private/LicenseListPage"));
const LicenseSupportPage = lazy(
  () => import("@/pages/private/LicenseSupportPage"),
);
import SettingDashboardLayout from "@/layouts/SettingDashboardLayout";
const ProfileSettingDashboardPage = lazy(() =>
  import("@/pages/private/SettingDashboardPage").then((module) => ({
    default: module.ProfileSettingDashboardPage,
  })),
);
const SecuritySettingDashboardPage = lazy(() =>
  import("@/pages/private/SettingDashboardPage").then((module) => ({
    default: module.SecuritySettingDashboardPage,
  })),
);
const SystemSettingDashboardPage = lazy(
  () => import("@/pages/private/SystemSettingDashboardPage"),
);

export default function PrivateRoutes() {
  const { user } = useAuth();
  return (
    <AuthGuard>
      {user?.role === "admin" && <ModalContainer />}
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            index
            element={
              user?.role && !DASHBOARD_OVERVIEW_ROLES.includes(user.role) ? (
                <Navigate to={getDashboardHomePath(user.role)} replace />
              ) : (
                <SummaryDashboardPage />
              )
            }
          />
          <Route
            path="summary"
            element={
              <AuthGuard allowedRoles={DASHBOARD_OVERVIEW_ROLES}>
                <SummaryDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="accounts"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <AccountDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="contracts"
            element={
              <AuthGuard allowedRoles={CONTRACT_DASHBOARD_ROLES}>
                {isStaticHubClientActive(DIGITAL_CONTRACT_CLIENT_ID) ? (
                  <ContractDashboardPage />
                ) : (
                  <ServiceSuspendedPage
                    clientName="Picare E-Contract"
                    isDashboard
                  />
                )}
              </AuthGuard>
            }
          />
          <Route
            path="qr-products"
            element={
              <AuthGuard allowedRoles={QR_DASHBOARD_ROLES}>
                {isStaticHubClientActive(QR_CODE_GENERATOR_CLIENT_ID) ? (
                  <QRProductDashboardPage />
                ) : (
                  <ServiceSuspendedPage
                    clientName="Picare QR Generator"
                    isDashboard
                  />
                )}
              </AuthGuard>
            }
          />
          <Route
            path="contracts/:contractId"
            element={
              <AuthGuard allowedRoles={CONTRACT_DASHBOARD_ROLES}>
                {isStaticHubClientActive(DIGITAL_CONTRACT_CLIENT_ID) ? (
                  <ContractDetailDashboardPage />
                ) : (
                  <ServiceSuspendedPage
                    clientName="Picare E-Contract"
                    isDashboard
                  />
                )}
              </AuthGuard>
            }
          />
          <Route
            path="storage"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <StorageDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="storage/:folderId"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <StorageFolderDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="hub-clients"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <HubClientDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="hub-clients/create"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <HubClientCreatePage />
              </AuthGuard>
            }
          />
          <Route
            path="hub-clients/:clientId/edit"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <HubClientEditPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <LicenseListPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/create"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <LicenseCreatePage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/:licenseId"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <LicenseDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/:licenseId/edit"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <LicenseEditPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/support"
            element={
              <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                <LicenseSupportPage />
              </AuthGuard>
            }
          />
          <Route path="profile" element={<PrivateStubPage />} />
          <Route path="help" element={<PrivateStubPage />} />
          <Route path="settings" element={<SettingDashboardLayout />}>
            <Route index element={<ProfileSettingDashboardPage />} />
            <Route path="security" element={<SecuritySettingDashboardPage />} />
            <Route
              path="system"
              element={
                <AuthGuard allowedRoles={ADMIN_ACCESS_ROLES}>
                  <SystemSettingDashboardPage />
                </AuthGuard>
              }
            />
          </Route>
          <Route
            path="*"
            element={<Navigate to={PATHS.DASHBOARD.ROOT} replace />}
          />
        </Route>
      </Routes>
    </AuthGuard>
  );
}
