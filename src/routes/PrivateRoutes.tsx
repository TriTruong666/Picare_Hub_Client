import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PATHS } from "@/config/paths";
import DashboardLayout from "@/layouts/DashboardLayout";
import AccountDashboardPage from "@/pages/private/AccountDashboardPage";
import HubClientDashboardPage from "@/pages/private/HubClientDashboardPage";
import HubClientEditPage from "@/pages/private/HubClientEditPage";
import PrivateStubPage from "@/pages/private/PrivateStubPage";
import StorageDashboardPage from "@/pages/private/StorageDashboardPage";
import StorageFolderDetailPage from "@/pages/private/StorageFolderDetailPage";
import SummaryDashboardPage from "@/pages/private/SummaryDashboardPage";

export default function PrivateRoutes() {
  return (
    <AuthGuard>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<SummaryDashboardPage />} />
          <Route path="summary" element={<SummaryDashboardPage />} />
          <Route path="accounts" element={<AccountDashboardPage />} />
          <Route path="storage" element={<StorageDashboardPage />} />
          <Route path="storage/:folderId" element={<StorageFolderDetailPage />} />
          <Route path="hub-clients" element={<HubClientDashboardPage />} />
          <Route path="hub-clients/:clientId/edit" element={<HubClientEditPage />} />
          <Route path="notifications" element={<PrivateStubPage />} />
          <Route path="messages" element={<PrivateStubPage />} />
          <Route path="profile" element={<PrivateStubPage />} />
          <Route path="settings" element={<PrivateStubPage />} />
          <Route
            path="*"
            element={<Navigate to={PATHS.DASHBOARD.ROOT} replace />}
          />
        </Route>
      </Routes>
    </AuthGuard>
  );
}
