import { useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useContractDetail } from "@/hooks/data/useContractHooks";
import { ContractFormPage } from "./ContractCreatePage";

export default function ContractEditPage() {
  const { contractId = "" } = useParams();
  const { data: contract, isLoading, isError } = useContractDetail(contractId);

  if (isLoading) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <Spinner size="lg" color="white" />
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="max-w-md border border-white/10 bg-white/[0.02] p-6 text-center">
          <h1 className="text-lg font-medium">Không tìm thấy hợp đồng</h1>
          <p className="mt-2 text-sm text-white/45">
            Hợp đồng nháp này không tồn tại hoặc không thể tải dữ liệu.
          </p>
        </div>
      </main>
    );
  }

  return <ContractFormPage mode="edit" initialContract={contract} />;
}
