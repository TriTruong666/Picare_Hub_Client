import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { StateShell } from "@/components/custom_ui/ShellState";
import { PATHS } from "@/config/paths";

export default function LicenseListPage() {
  const navigate = useNavigate();

  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb
            items={[
              { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
              { label: "Bản quyền" },
              { label: "Danh sách" },
            ]}
          />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Danh sách bản quyền
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate(PATHS.DASHBOARD.LICENSE_CREATE)}
          className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
        >
          <FiPlus />
          Tạo bản quyền
        </button>
      </div>

      <StateShell
        title="Danh sách trống"
        message='Chưa có dữ liệu hiển thị. Bấm "Tạo bản quyền" để thêm bản ghi mới.'
        actionLabel="Tạo bản quyền"
        onAction={() => navigate(PATHS.DASHBOARD.LICENSE_CREATE)}
      />
    </div>
  );
}
