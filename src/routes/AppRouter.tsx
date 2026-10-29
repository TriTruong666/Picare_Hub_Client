import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import { PATHS } from "@/config/paths";
import PrivateRoutes from "./PrivateRoutes";
import PrivateContractRoutes from "./PrivateContractRoutes";
import ContractPartnerSignPage from "@/pages/public/ContractPartnerSignPage";
import QRProductPreviewPage from "@/pages/public/QRProductPreviewPage";
import CataloguePublicPreviewPage from "@/pages/public/CataloguePublicPreviewPage";
import CataloguePublicGalleryPage from "@/pages/public/CataloguePublicGalleryPage";
import QRProductGeneratorPage from "@/pages/private/QRProductGeneratorPage";
import CatalogueCreatePage from "@/pages/private/CatalogueCreatePage";
import CatalogueEditPage from "@/pages/private/CatalogueEditPage";
import QRProductEditPage from "@/pages/private/QRProductEditPage";
import { StaticClientGuard } from "@/components/guards/StaticClientGuard";
import {
  DIGITAL_CONTRACT_CLIENT_ID,
  QR_CODE_GENERATOR_CLIENT_ID,
  DIGITAL_CATALOGUE_CLIENT_ID,
} from "@/constants/staticHubClients";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<PrivateRoutes />} />
      <Route
        path="/contracts/:contractId/sign-partner"
        element={
          <StaticClientGuard
            clientId={DIGITAL_CONTRACT_CLIENT_ID}
            requireAuth={false}
          >
            <ContractPartnerSignPage />
          </StaticClientGuard>
        }
      />
      <Route path="/contracts/*" element={<PrivateContractRoutes />} />
      <Route
        path={PATHS.CATALOGUE.CREATE}
        element={
          <StaticClientGuard clientId={DIGITAL_CATALOGUE_CLIENT_ID}>
            <CatalogueCreatePage />
          </StaticClientGuard>
        }
      />
      <Route
        path={PATHS.CATALOGUE.EDIT}
        element={
          <StaticClientGuard clientId={DIGITAL_CATALOGUE_CLIENT_ID}>
            <CatalogueEditPage />
          </StaticClientGuard>
        }
      />
      <Route
        path={PATHS.QR_PRODUCT_GENERATOR}
        element={
          <StaticClientGuard clientId={QR_CODE_GENERATOR_CLIENT_ID}>
            <QRProductGeneratorPage />
          </StaticClientGuard>
        }
      />
      <Route
        path={PATHS.QR_PRODUCT_EDIT}
        element={
          <StaticClientGuard clientId={QR_CODE_GENERATOR_CLIENT_ID}>
            <QRProductEditPage />
          </StaticClientGuard>
        }
      />
      <Route
        path={PATHS.QR_PRODUCT_PREVIEW}
        element={
          <StaticClientGuard
            clientId={QR_CODE_GENERATOR_CLIENT_ID}
            requireAuth={false}
          >
            <QRProductPreviewPage />
          </StaticClientGuard>
        }
      />
      <Route
        path={PATHS.CATALOGUE.PUBLIC_GALLERY}
        element={
          <StaticClientGuard
            clientId={DIGITAL_CATALOGUE_CLIENT_ID}
            requireDashboardAccess={false}
            checkRoles={false}
          >
            <CataloguePublicGalleryPage />
          </StaticClientGuard>
        }
      />
      <Route
        path={PATHS.CATALOGUE.PUBLIC_PREVIEW}
        element={
          <StaticClientGuard
            clientId={DIGITAL_CATALOGUE_CLIENT_ID}
            requireDashboardAccess={false}
            checkRoles={false}
          >
            <CataloguePublicPreviewPage />
          </StaticClientGuard>
        }
      />

      {/* Public Routes (Landing, Login, etc.) */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}
