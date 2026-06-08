import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import { PATHS } from "@/config/paths";
import PrivateRoutes from "./PrivateRoutes";
import PrivateContractRoutes from "./PrivateContractRoutes";
import ContractPartnerSignPage from "@/pages/public/ContractPartnerSignPage";
import QRProductGeneratorPage from "@/pages/private/QRProductGeneratorPage";
import QRProductEditPage from "@/pages/private/QRProductEditPage";
import { AuthGuard } from "@/components/guards/AuthGuard";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<PrivateRoutes />} />
      <Route path="/contracts/:contractId/sign-partner" element={<ContractPartnerSignPage />} />
      <Route path="/contracts/*" element={<PrivateContractRoutes />} />
      <Route
        path={PATHS.QR_PRODUCT_GENERATOR}
        element={
          <AuthGuard>
            <QRProductGeneratorPage />
          </AuthGuard>
        }
      />
      <Route
        path={PATHS.QR_PRODUCT_EDIT}
        element={
          <AuthGuard>
            <QRProductEditPage />
          </AuthGuard>
        }
      />

      {/* Public Routes (Landing, Login, etc.) */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}
