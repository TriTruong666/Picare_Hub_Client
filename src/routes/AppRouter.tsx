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
import { AuthGuard } from "@/components/guards/AuthGuard";
import ServiceSuspendedPage from "@/components/common/ServiceSuspendedPage";
import {
  DIGITAL_CONTRACT_CLIENT_ID,
  QR_CODE_GENERATOR_CLIENT_ID,
  DIGITAL_CATALOGUE_CLIENT_ID,
  isStaticHubClientActive,
} from "@/constants/staticHubClients";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<PrivateRoutes />} />
      <Route
        path="/contracts/:contractId/sign-partner"
        element={
          isStaticHubClientActive(DIGITAL_CONTRACT_CLIENT_ID) ? (
            <ContractPartnerSignPage />
          ) : (
            <ServiceSuspendedPage clientName="Picare E-Contract" />
          )
        }
      />
      <Route path="/contracts/*" element={<PrivateContractRoutes />} />
      <Route
        path={PATHS.CATALOGUE.CREATE}
        element={
          !isStaticHubClientActive(DIGITAL_CATALOGUE_CLIENT_ID) ? (
            <ServiceSuspendedPage clientName="Picare Catalogue" />
          ) : (
            <AuthGuard
              allowedRoles={["admin", "business_development", "marketing"]}
            >
              <CatalogueCreatePage />
            </AuthGuard>
          )
        }
      />
      <Route
        path={PATHS.CATALOGUE.EDIT}
        element={
          !isStaticHubClientActive(DIGITAL_CATALOGUE_CLIENT_ID) ? (
            <ServiceSuspendedPage clientName="Picare Catalogue" />
          ) : (
            <AuthGuard
              allowedRoles={["admin", "business_development", "marketing"]}
            >
              <CatalogueEditPage />
            </AuthGuard>
          )
        }
      />
      <Route
        path={PATHS.QR_PRODUCT_GENERATOR}
        element={
          !isStaticHubClientActive(QR_CODE_GENERATOR_CLIENT_ID) ? (
            <ServiceSuspendedPage clientName="Picare QR Generator" />
          ) : (
            <AuthGuard allowedRoles={["admin", "business_development"]}>
              <QRProductGeneratorPage />
            </AuthGuard>
          )
        }
      />
      <Route
        path={PATHS.QR_PRODUCT_EDIT}
        element={
          !isStaticHubClientActive(QR_CODE_GENERATOR_CLIENT_ID) ? (
            <ServiceSuspendedPage clientName="Picare QR Generator" />
          ) : (
            <AuthGuard allowedRoles={["admin", "business_development"]}>
              <QRProductEditPage />
            </AuthGuard>
          )
        }
      />
      <Route
        path={PATHS.QR_PRODUCT_PREVIEW}
        element={
          isStaticHubClientActive(QR_CODE_GENERATOR_CLIENT_ID) ? (
            <QRProductPreviewPage />
          ) : (
            <ServiceSuspendedPage clientName="Picare QR Generator" />
          )
        }
      />
      <Route
        path={PATHS.CATALOGUE.PUBLIC_GALLERY}
        element={
          !isStaticHubClientActive(DIGITAL_CATALOGUE_CLIENT_ID) ? (
            <ServiceSuspendedPage clientName="Picare Catalogue" />
          ) : (
            <AuthGuard requireDashboardAccess={false}>
              <CataloguePublicGalleryPage />
            </AuthGuard>
          )
        }
      />
      <Route
        path={PATHS.CATALOGUE.PUBLIC_PREVIEW}
        element={
          !isStaticHubClientActive(DIGITAL_CATALOGUE_CLIENT_ID) ? (
            <ServiceSuspendedPage clientName="Picare Catalogue" />
          ) : (
            <AuthGuard requireDashboardAccess={false}>
              <CataloguePublicPreviewPage />
            </AuthGuard>
          )
        }
      />

      {/* Public Routes (Landing, Login, etc.) */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}
