import { useParams } from "react-router-dom";

import { StateShell, StateLoadingContainer } from "@/components/custom_ui/ShellState";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { useProductQRDetail } from "@/hooks/data/useProductQRHooks";
import { QRProductFormPage } from "./QRProductGeneratorPage";

export default function QRProductEditPage() {
  const { productId = "" } = useParams();
  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useProductQRDetail(productId);

  if (isLoading) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <StateLoadingContainer message="Đang tải sản phẩm QR..." />
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-black dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <StateShell
          title="Không tải được sản phẩm QR"
          message="Vui lòng kiểm tra lại mã sản phẩm hoặc thử tải lại trang."
          actionLabel="Tải lại"
          onAction={() => refetch()}
        />
      </main>
    );
  }

  return (
    <QRProductFormPage
      mode="edit"
      initialProduct={product}
      showQrButton
    />
  );
}

