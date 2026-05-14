import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PATHS } from "@/config/paths";
import DashboardLayout from "@/layouts/DashboardLayout";
import SummaryDashboardPage from "@/pages/private/SummaryDashboardPage";
import PrivateStubPage from "@/pages/private/PrivateStubPage";

export default function PrivateRoutes() {
  return (
    <AuthGuard>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<SummaryDashboardPage />} />
          <Route path="summary" element={<SummaryDashboardPage />} />
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
