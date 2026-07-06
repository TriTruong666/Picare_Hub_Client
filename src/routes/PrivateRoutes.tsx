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
          <Route path="accounts" element={<AccountDashboardPage />} />
          <Route path="contracts" element={<ContractDashboardPage />} />
          <Route path="qr-products" element={<QRProductDashboardPage />} />
          <Route
            path="contracts/:contractId"
            element={<ContractDetailDashboardPage />}
          />
          <Route path="storage" element={<StorageDashboardPage />} />
          <Route path="storage/:folderId" element={<StorageFolderDetailPage />} />
          <Route path="hub-clients" element={<HubClientDashboardPage />} />
          <Route path="hub-clients/create" element={<HubClientCreatePage />} />
          <Route path="hub-clients/:clientId/edit" element={<HubClientEditPage />} />
          <Route path="licenses" element={<LicenseListPage />} />
          <Route path="licenses/create" element={<LicenseCreatePage />} />
          <Route path="licenses/:licenseId/edit" element={<LicenseEditPage />} />
          <Route path="licenses/support" element={<LicenseSupportPage />} />
          <Route path="notifications" element={<PrivateStubPage />} />
          <Route path="messages" element={<PrivateStubPage />} />
          <Route path="profile" element={<PrivateStubPage />} />
          <Route path="settings" element={<SettingDashboardLayout />}>
            <Route index element={<ProfileSettingDashboardPage />} />
            <Route path="security" element={<SecuritySettingDashboardPage />} />
            <Route path="system" element={<SystemSettingDashboardPage />} />
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
