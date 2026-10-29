import { Navigate, Route, Routes } from "react-router-dom";
import { StaticClientGuard } from "@/components/guards/StaticClientGuard";
import { PATHS } from "@/config/paths";
import { DIGITAL_CONTRACT_CLIENT_ID } from "@/constants/staticHubClients";
import ContractCreatePage from "@/pages/private/ContractCreatePage";
import ContractEditPage from "@/pages/private/ContractEditPage";
import ContractPreviewPage from "@/pages/private/ContractPreviewPage";

export default function PrivateContractRoutes() {
  return (
    <StaticClientGuard clientId={DIGITAL_CONTRACT_CLIENT_ID}>
      <Routes>
        <Route path="create" element={<ContractCreatePage />} />
        <Route path=":contractId/edit" element={<ContractEditPage />} />
        <Route path=":contractId/preview" element={<ContractPreviewPage />} />
        <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
      </Routes>
    </StaticClientGuard>
  );
}
