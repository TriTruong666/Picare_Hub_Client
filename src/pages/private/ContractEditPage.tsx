import { useParams } from "react-router-dom";

import { StateShell, StateLoadingContainer } from "@/components/custom_ui/ShellState";
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
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <StateLoadingContainer message="Đang tải hợp đồng..." />
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <StateShell
          title="Không tải được hợp đồng"
          message="Vui lòng kiểm tra lại mã hợp đồng hoặc thử tải lại trang."
          actionLabel="Tải lại"
          onAction={() => refetch()}
        />
      </main>
    );
  }

  if (contract.status !== "draft") {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <StateShell
          title="Hợp đồng đã được xuất bản"
          message="Bạn không thể chỉnh sửa những bản hợp đồng đã qua quá trình xuất bản"
          actionLabel="Tải lại"
          onAction={() => refetch()}
        />
      </main>
    );
  }

  return (
    <ContractFormPage
      key={contract.contractId}
      mode="edit"
      initialContract={contract}
      showQrButton={false}
    />
  );
}

