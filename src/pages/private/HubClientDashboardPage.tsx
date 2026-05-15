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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur transition-all duration-300 hover:border-white/10 hover:bg-white/8"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
        {client.clientLogoImage ? (
          <img
            src={client.clientLogoImage}
            alt={client.clientName}
            className="h-16 w-auto max-w-[60%] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <FiGlobe className="text-2xl text-white/30" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur ${
              isActive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/5 text-white/40"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-white/30"}`}
            />
            {isActive ? "Hoạt động" : "Tạm dừng"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-white">
            {client.clientName}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">
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

        <div className="h-px bg-white/5" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-white/30">
            {client.clientId.slice(0, 8).toUpperCase()}
          </span>
          <a
            href={client.clientExternalUrl || client.clientInternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400"
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 opacity-60">
      <div className="h-36 animate-pulse bg-white/5" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-white/5" />
        </div>
        <div className="h-px bg-white/5" />
        <div className="flex justify-between">
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          <div className="h-7 w-14 animate-pulse rounded-lg bg-white/5" />
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
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
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
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-white/30" />
          <input
            id="hub-client-search"
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/8"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            className="mt-6 rounded-lg border border-white/5 bg-white/5 px-6 py-2.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            Thử lại
          </button>
        </div>
      ) : clients && clients.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {clients.map((client) => (
            <HubClientCard key={client.clientId} client={client} />
          ))}
        </motion.div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
          <h3 className="text-lg font-semibold text-white">Danh sách trống</h3>
          <p className="mt-2 text-sm text-white/50">
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
          <span className="tabular-nums text-xs text-white/30">
            Đang hiển thị <span className="font-semibold text-white/50">{clients.length}</span>{" "}
            client
          </span>
        </div>
      )}
    </div>
  );
}
