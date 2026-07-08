import { Navigate, Route, Routes } from "react-router-dom";

import { AuthGuard } from "@/components/guards/AuthGuard";
import { PATHS } from "@/config/paths";
import ContractCreatePage from "@/pages/private/ContractCreatePage";
import ContractEditPage from "@/pages/private/ContractEditPage";
import ContractPreviewPage from "@/pages/private/ContractPreviewPage";

export default function PrivateContractRoutes() {
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
