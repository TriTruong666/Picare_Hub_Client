import { useParams } from "react-router-dom";

import { StateLoadingContainer, StateShell } from "@/components/custom_ui/ShellState";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { useCatalogueDetail } from "@/hooks/data/useCatalogueHooks";
import { CatalogueFormPage } from "./CatalogueCreatePage";

export default function CatalogueEditPage() {
  const { catalogueId = "" } = useParams<{ catalogueId: string }>();
  const {
    data: catalogue,
    isLoading,
    isError,
    refetch,
  } = useCatalogueDetail(catalogueId);

  if (isLoading) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <StateLoadingContainer message="Đang tải dữ liệu catalogue..." />
      </main>
    );
  }

  if (isError || !catalogue) {
    return (
      <main className="dashboard-theme relative flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#111111] dark:bg-[#050505] dark:text-white">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <StateShell
          title="Không tải được catalogue"
          message="Vui lòng kiểm tra lại đường dẫn hoặc thử tải lại trang."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      </main>
    );
  }

  return (
    <CatalogueFormPage
      mode="edit"
      initialCatalogue={catalogue}
    />
  );
}
