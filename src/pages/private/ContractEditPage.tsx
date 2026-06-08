import { useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
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
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <Spinner size="lg" color="white" />
        <p className="text-sm text-black/45 dark:text-white/45">Đang tải hợp đồng...</p>
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Không tải được hợp đồng</h1>
          <p className="mt-3 text-sm leading-6 text-black/45 dark:text-white/45">
            Vui lòng kiểm tra lại mã hợp đồng hoặc thử tải lại trang.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-black/15 px-5 py-2 text-sm text-black/80 transition hover:border-black/30 hover:text-[#111111] dark:border-white/15 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  if (contract.status !== "draft") {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Hợp đồng đã được xuất bản</h1>
          <p className="mt-3 text-sm leading-6 text-black/45 dark:text-white/45">
            Bạn không thể chỉnh sửa những bản hợp đồng đã qua quá trình xuất bản
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-black/15 px-5 py-2 text-sm text-black/80 transition hover:border-black/30 hover:text-[#111111] dark:border-white/15 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  return <ContractFormPage mode="edit" initialContract={contract} />;
}
