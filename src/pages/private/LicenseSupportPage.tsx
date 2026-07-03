import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { PATHS } from "@/config/paths";

export default function LicenseSupportPage() {
  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-8 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Bản quyền" },
            { label: "Hỗ trợ" },
          ]}
        />
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
              Hỗ trợ kỹ thuật
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">
              Yêu cầu hỗ trợ liên quan đến cấu hình máy chủ, kích hoạt và gia hạn bản quyền
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-300 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-gray-500 dark:text-white/40">
          Chức năng hỗ trợ đang được phát triển.
        </p>
      </div>
    </div>
  );
}
