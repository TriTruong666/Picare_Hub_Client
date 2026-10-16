import { Navigate, Route, Routes } from "react-router-dom";

import { AuthGuard } from "@/components/guards/AuthGuard";
import { PATHS } from "@/config/paths";
import ServiceSuspendedPage from "@/components/common/ServiceSuspendedPage";
import {
  DIGITAL_CONTRACT_CLIENT_ID,
  isStaticHubClientActive,
} from "@/constants/staticHubClients";
import ContractCreatePage from "@/pages/private/ContractCreatePage";
import ContractEditPage from "@/pages/private/ContractEditPage";
import ContractPreviewPage from "@/pages/private/ContractPreviewPage";

export default function PrivateContractRoutes() {
  if (!isStaticHubClientActive(DIGITAL_CONTRACT_CLIENT_ID)) {
    return <ServiceSuspendedPage clientName="Picare E-Contract" />;
  }

  return (
    <AuthGuard
      allowedRoles={[
        "admin",
        "finance",
        "hr",
        "ceo",
        "supply_chain",
        "admin_brand",
      ]}
    >
      <Routes>
        <Route path="create" element={<ContractCreatePage />} />
        <Route path=":contractId/edit" element={<ContractEditPage />} />
        <Route path=":contractId/preview" element={<ContractPreviewPage />} />
        <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
      </Routes>
    </AuthGuard>
  );
}
