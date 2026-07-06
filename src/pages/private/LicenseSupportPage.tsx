import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { StateShell } from "@/components/custom_ui/ShellState";
import { PATHS } from "@/config/paths";

export default function LicenseSupportPage() {
  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb
            items={[
              { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
              { label: "Bản quyền" },
              { label: "Hỗ trợ" },
            ]}
          />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Hỗ trợ kỹ thuật
          </h1>
        </div>
      </div>

      <StateShell
        title="Tính năng đang phát triển"
        message="Chức năng hỗ trợ kỹ thuật đang được xây dựng và sẽ sớm ra mắt."
      />
    </div>
  );
}
