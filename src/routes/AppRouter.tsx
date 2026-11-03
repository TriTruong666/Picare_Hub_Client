import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import { PATHS } from "@/config/paths";
import ContractPartnerSignPage from "@/pages/public/ContractPartnerSignPage";
import QRProductPreviewPage from "@/pages/public/QRProductPreviewPage";
import { FullScreenSpinner } from "@/components/custom_ui/Spinner";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { StaticClientGuard } from "@/components/guards/StaticClientGuard";
import {
  DIGITAL_CONTRACT_CLIENT_ID,
  QR_CODE_GENERATOR_CLIENT_ID,
  DIGITAL_CATALOGUE_CLIENT_ID,
} from "@/constants/staticHubClients";

// These imports run only after StaticClientGuard has validated the session.
const CataloguePublicPreviewPage = lazy(
  () => import("@/pages/authenticated/CataloguePublicPreviewPage"),
);
const CataloguePublicGalleryPage = lazy(
  () => import("@/pages/authenticated/CataloguePublicGalleryPage"),
);

const PrivateRoutes = lazy(() => import("./PrivateRoutes"));

const PrivateContractRoutes = lazy(() => import("./PrivateContractRoutes"));

const QRProductGeneratorPage = lazy(
  () => import("@/pages/private/QRProductGeneratorPage"),
);

const CatalogueCreatePage = lazy(
  () => import("@/pages/private/CatalogueCreatePage"),
);

const CatalogueEditPage = lazy(
  () => import("@/pages/private/CatalogueEditPage"),
);

const QRProductEditPage = lazy(
  () => import("@/pages/private/QRProductEditPage"),
);

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <AuthGuard>
            <PrivateRoutes />
          </AuthGuard>
        }
      />
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
      <Route
        path="/contracts/*"
        element={
          <StaticClientGuard clientId={DIGITAL_CONTRACT_CLIENT_ID}>
            <PrivateContractRoutes />
          </StaticClientGuard>
        }
      />
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
            <Suspense fallback={<FullScreenSpinner />}>
              <CataloguePublicGalleryPage />
            </Suspense>
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
            <Suspense fallback={<FullScreenSpinner />}>
              <CataloguePublicPreviewPage />
            </Suspense>
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
