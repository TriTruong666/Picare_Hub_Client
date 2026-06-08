import { useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
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
      <main className="dashboard-theme flex min-h-screen items-center justify-center gap-3 bg-[#050505] text-white">
        <Spinner size="lg" color="white" />
        <p className="text-sm text-white/45">Đang tải sản phẩm QR...</p>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Không tải được sản phẩm QR</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Vui lòng kiểm tra lại mã sản phẩm hoặc thử tải lại trang.
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

  return <QRProductFormPage mode="edit" initialProduct={product} />;
}
