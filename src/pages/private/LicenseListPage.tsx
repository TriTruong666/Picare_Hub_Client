import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { StateShell } from "@/components/custom_ui/ShellState";
import { PATHS } from "@/config/paths";

export default function LicenseListPage() {
  const navigate = useNavigate();

  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-8 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Bản quyền" },
            { label: "Danh sách" },
          ]}
        />
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
              Danh sách bản quyền
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">
              Quản lý và theo dõi thông tin bản quyền của các khách hàng
            </p>
          </div>
          <button
            onClick={() => navigate(PATHS.DASHBOARD.LICENSE_CREATE)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-95"
          >
            <FiPlus className="text-sm" />
            Tạo bản quyền
          </button>
        </div>
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

