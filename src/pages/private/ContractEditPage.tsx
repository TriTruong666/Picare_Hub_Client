import { useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useContractDetail } from "@/hooks/data/useContractHooks";
import { ContractFormPage } from "./ContractCreatePage";

export default function ContractEditPage() {
  const { contractId = "" } = useParams();
  const {
    data: contract,
    isLoading,
    isError,
    refetch,
  } = useContractDetail(contractId);

  if (isLoading) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <Spinner size="lg" color="white" />
        <p className="text-sm text-white/45">Đang tải hợp đồng...</p>
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Không tải được hợp đồng</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Vui lòng kiểm tra lại mã hợp đồng hoặc thử tải lại trang.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-white/15 px-5 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  if (contract.status !== "draft") {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Hợp đồng đã được xuất bản</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Bạn không thể chỉnh sửa những bản hợp đồng đã qua quá trình xuất bản
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-white/15 px-5 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  return <ContractFormPage mode="edit" initialContract={contract} />;
}
