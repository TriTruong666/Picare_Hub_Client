import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiShield,
  FiArchive,
  FiUsers,
  FiArrowRight,
  FiLayers,
  FiCpu,
  FiActivity,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { PATHS } from "@/config/paths";

export default function SummaryDashboardPage() {
  const quickModules = [
    {
      title: "Hợp đồng điện tử",
      description: "Tạo lập, quản lý phụ lục livestream và ký kết hợp đồng số pháp lý.",
      icon: FiFileText,
      to: PATHS.DASHBOARD.CONTRACTS,
      badge: "Sẵn sàng",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Bản quyền & License",
      description: "Quản trị danh sách license, kích hoạt và phân phối bản quyền client.",
      icon: FiShield,
      to: "/dashboard/licenses",
      badge: "Sẵn sàng",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Lưu trữ Đám mây S3",
      description: "Quản lý thư mục tài liệu số, giấy phép kinh doanh và chứng thực.",
      icon: FiArchive,
      to: PATHS.DASHBOARD.STORAGE,
      badge: "Sẵn sàng",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Tài khoản & Phân quyền",
      description: "Quản lý tài khoản nội bộ, đối tác kinh doanh và thiết lập vai trò.",
      icon: FiUsers,
      to: PATHS.DASHBOARD.ACCOUNTS,
      badge: "Sẵn sàng",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className="page-layout p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-white/40">
            Hệ sinh thái Picare Hub
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
            Tổng quan hệ thống
          </h1>
        </div>
      </div>

      {/* Main Notice Banner - In Development */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mb-8 overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.02] to-transparent p-6 sm:p-8 backdrop-blur-xl dark:border-amber-500/20 dark:from-amber-500/10 dark:via-transparent"
      >
        {/* Glow ambient */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span>Tính năng đang trong quá trình phát triển</span>
          </div>

          {/* Heading */}
          <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-950 sm:text-2xl lg:text-3xl dark:text-white">
            Trung tâm Báo cáo & Giám sát Số liệu Tập trung
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-[15px] dark:text-white/70">
            Trang tổng quan phân tích số liệu trung tâm hiện đang được nâng cấp
            toàn diện nhằm kết nối đường truyền dữ liệu thời gian thực (Real-time Data
            Pipeline) đồng bộ giữa các phân hệ:{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Picare Hub
            </span>
            ,{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Picare OMS
            </span>
            ,{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Saleforce
            </span>{" "}
            và{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Kho bãi WMS
            </span>
            .
          </p>

          {/* Key Milestones */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/70 p-3.5 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.03]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FiCpu size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 dark:text-white/40">
                  Giai đoạn 1
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  Đồng bộ Real-time SSE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/70 p-3.5 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.03]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FiActivity size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 dark:text-white/40">
                  Giai đoạn 2
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  Biểu đồ phân tích doanh số
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/70 p-3.5 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.03]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <HiSparkles size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 dark:text-white/40">
                  Giai đoạn 3
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  Báo cáo AI tự động
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Available modules section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Các chức năng đang hoạt động
            </h3>
            <p className="text-xs text-gray-500 dark:text-white/40">
              Bạn có thể sử dụng đầy đủ các công cụ nghiệp vụ sẵn có dưới đây
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickModules.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
              >
                <Link
                  to={item.to}
                  className="group relative flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-white/10 dark:bg-[#111113] dark:hover:border-white/20 dark:hover:bg-[#161619]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-white/5 dark:text-white dark:group-hover:bg-white/10">
                        <Icon size={20} />
                      </div>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-white/50">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-700 transition-colors group-hover:text-primary dark:text-white/60 dark:group-hover:text-white">
                    <span>Truy cập</span>
                    <FiArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
