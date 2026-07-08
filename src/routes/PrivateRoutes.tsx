import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PATHS } from "@/config/paths";
import DashboardLayout from "@/layouts/DashboardLayout";
import AccountDashboardPage from "@/pages/private/AccountDashboardPage";
import ContractDetailDashboardPage from "@/pages/private/ContractDetailDashboardPage";
import ContractDashboardPage from "@/pages/private/ContractDashboardPage";
import HubClientCreatePage from "@/pages/private/HubClientCreatePage";
import HubClientDashboardPage from "@/pages/private/HubClientDashboardPage";
import HubClientEditPage from "@/pages/private/HubClientEditPage";
import QRProductDashboardPage from "@/pages/private/QRProductDashboardPage";
import PrivateStubPage from "@/pages/private/PrivateStubPage";
import StorageDashboardPage from "@/pages/private/StorageDashboardPage";
import StorageFolderDetailPage from "@/pages/private/StorageFolderDetailPage";
import SummaryDashboardPage from "@/pages/private/SummaryDashboardPage";
import LicenseCreatePage from "@/pages/private/LicenseCreatePage";
import LicenseEditPage from "@/pages/private/LicenseEditPage";
import LicenseDetailPage from "@/pages/private/LicenseDetailPage";
import LicenseListPage from "@/pages/private/LicenseListPage";
import LicenseSupportPage from "@/pages/private/LicenseSupportPage";
import SettingDashboardLayout from "@/layouts/SettingDashboardLayout";
import {
  ProfileSettingDashboardPage,
  SecuritySettingDashboardPage,
  SystemSettingDashboardPage,
} from "@/pages/private/SettingDashboardPage";

export default function PrivateRoutes() {
  return (
    <AuthGuard>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<SummaryDashboardPage />} />
          <Route path="summary" element={<SummaryDashboardPage />} />
          <Route
            path="accounts"
            element={
              <AuthGuard allowedRoles={["admin", "ceo"]}>
                <AccountDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="contracts"
            element={
              <AuthGuard allowedRoles={["admin", "ceo", "hr", "finance"]}>
                <ContractDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="qr-products"
            element={
              <AuthGuard
                allowedRoles={["admin", "ceo", "business_development"]}
              >
                <QRProductDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="contracts/:contractId"
            element={
              <AuthGuard allowedRoles={["admin", "ceo", "hr", "finance"]}>
                <ContractDetailDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="storage"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <StorageDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="storage/:folderId"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <StorageFolderDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="hub-clients"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <HubClientDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="hub-clients/create"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <HubClientCreatePage />
              </AuthGuard>
            }
          />
          <Route
            path="hub-clients/:clientId/edit"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <HubClientEditPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <LicenseListPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/create"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <LicenseCreatePage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/:licenseId"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <LicenseDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/:licenseId/edit"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <LicenseEditPage />
              </AuthGuard>
            }
          />
          <Route
            path="licenses/support"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <LicenseSupportPage />
              </AuthGuard>
            }
          />
          <Route path="notifications" element={<PrivateStubPage />} />
          <Route path="messages" element={<PrivateStubPage />} />
          <Route path="profile" element={<PrivateStubPage />} />
          <Route path="settings" element={<SettingDashboardLayout />}>
            <Route index element={<ProfileSettingDashboardPage />} />
            <Route path="security" element={<SecuritySettingDashboardPage />} />
            <Route
              path="system"
              element={
                <AuthGuard allowedRoles={["admin"]}>
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
