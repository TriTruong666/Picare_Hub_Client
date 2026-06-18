import { useState } from "react";
import { motion } from "framer-motion";
import { FiExternalLink, FiGlobe, FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import GlassSelect from "@/components/custom_ui/Select";
import { PATHS } from "@/config/paths";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
import type { HubClient } from "@/types/HubClient";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function HubClientCard({ client }: { client: HubClient }) {
  const isActive = client.clientStatus === "active";
  const navigate = useNavigate();

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() =>
        navigate(
          PATHS.DASHBOARD.HUB_CLIENT_EDIT.replace(":clientId", client.clientId),
        )
      }
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 backdrop-blur transition-all duration-300 hover:border-gray-400 hover:bg-white hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-gray-300 bg-gradient-to-br from-gray-100 to-transparent dark:border-white/10 dark:from-white/5">
        {client.clientLogoImage ? (
          <img
            src={client.clientLogoImage}
            alt={client.clientName}
            className="h-16 w-auto max-w-[60%] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-300 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <FiGlobe className="text-2xl text-gray-400 dark:text-white/30" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur ${
              isActive
                ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-gray-300 bg-white text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 dark:bg-emerald-400" : "bg-gray-400 dark:bg-white/30"}`}
            />
            {isActive ? "Hoạt động" : "Tạm dừng"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
            {client.clientName}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {client.clientDescription || "Không có mô tả"}
          </p>
        </div>

        {client.allowedRoles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {client.allowedRoles.slice(0, 3).map((role) => (
              <Badge key={role} value={role} type="info" />
            ))}
            {client.allowedRoles.length > 3 && (
              <Badge value={`+${client.allowedRoles.length - 3}`} type="info" />
            )}
          </div>
        )}

        <div className="h-px bg-gray-300 dark:bg-white/10" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/30">
            {client.clientId.slice(0, 8).toUpperCase()}
          </span>
          <a
            href={client.clientExternalUrl || client.clientInternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/5 dark:bg-white/5 dark:text-white/60 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
            onClick={(event) => event.stopPropagation()}
          >
            <FiExternalLink className="text-xs" />
            Mở
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 opacity-80 dark:border-white/5 dark:bg-white/5 dark:opacity-60">
      <div className="h-36 animate-pulse bg-gray-200 dark:bg-white/5" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-white/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-white/5" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-white/5" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-white/5" />
        </div>
        <div className="h-px bg-gray-300 dark:bg-white/5" />
        <div className="flex justify-between">
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/5" />
          <div className="h-7 w-14 animate-pulse rounded-lg bg-gray-200 dark:bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function HubClientDashboardPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    data: clients,
    isLoading,
    isError,
    refetch,
  } = useHubClients({
    search: search || undefined,
    status: statusFilter || undefined,
    limit: 50,
  });

  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-6 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Hub Clients" },
          ]}
        />
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
              Hub Clients
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(PATHS.DASHBOARD.HUB_CLIENT_CREATE)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-95"
            >
              <FiPlus className="text-sm" />
              Thêm client
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400 dark:text-white/30" />
          <input
            id="hub-client-search"
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-500 bg-white pr-4 pl-9 text-[13px] text-gray-800 placeholder:text-gray-500 outline-none transition hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
          />
        </div>
        <div className="w-48">
          <GlassSelect
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            placeholder="Tất cả trạng thái"
            options={[
              { label: "Hoạt động", value: "active" },
              { label: "Tạm dừng", value: "inactive" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
          <p className="max-w-md text-center text-sm font-medium text-red-400">
            Đã xảy ra lỗi khi tải dữ liệu từ hệ thống
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Thử lại
          </button>
        </div>
      ) : clients && clients.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {clients.map((client) => (
            <HubClientCard key={client.clientId} client={client} />
          ))}
        </motion.div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Danh sách trống</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
            {search
              ? `Không tìm thấy kết quả cho "${search}"`
              : "Chưa có hub client nào trong hệ thống"}
          </p>
          <button
            onClick={() => navigate(PATHS.DASHBOARD.HUB_CLIENT_CREATE)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            <FiPlus className="text-lg" />
            Thêm ngay
          </button>
        </div>
      )}

      {!isLoading && !isError && clients && clients.length > 0 && (
        <div className="mt-6 flex items-center justify-center">
          <span className="tabular-nums text-xs text-gray-400 dark:text-white/30">
            Đang hiển thị <span className="font-semibold text-gray-600 dark:text-white/50">{clients.length}</span>{" "}
            client
          </span>
        </div>
      )}
    </div>
  );
}
