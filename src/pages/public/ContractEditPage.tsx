import { Link, useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { useContractDetail } from "@/hooks/data/useContractHooks";
import { ContractFormPage } from "./ContractCreatePage";

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

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

  if (contract.status !== "draft") {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Không thể chỉnh sửa
          </p>
          <h1 className="mt-3 text-lg font-medium">
            Hợp đồng đã được xuất bản
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Hợp đồng ở trạng thái {contract.status} không thể chỉnh sửa. Vui
            lòng quay lại trang xem trước để tiếp tục quy trình ký.
          </p>
          <Link
            to={getPreviewPath(contract.contractId)}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95"
          >
            Quay lại xem hợp đồng
          </Link>
        </div>
      </main>
    );
  }

  return <ContractFormPage mode="edit" initialContract={contract} />;
}
