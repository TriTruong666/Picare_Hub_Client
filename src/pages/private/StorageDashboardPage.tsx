import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiFolder, FiFolderPlus } from "react-icons/fi";
import { Link } from "react-router-dom";

import { formatFileSize, formatRelativeTime } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { Spinner } from "@/components/custom_ui/Spinner";
import CreateS3FolderModal from "@/components/modals/CreateS3FolderModal";
import { PATHS } from "@/config/paths";
import { useS3Folders } from "@/hooks/data/useS3Hooks";
import type { S3Folder } from "@/types/S3";

const ACCENTS = [
  "from-indigo-500/20 to-purple-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-rose-500/20 to-pink-500/20",
  "from-sky-500/20 to-blue-500/20",
];

export default function StorageDashboardPage() {
  const { data: foldersData, isLoading, isError, refetch } = useS3Folders();
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  // useFetch đã giải nén data: response.data, nên foldersData chính là mảng S3Folder[]
  const folders: S3Folder[] = (foldersData as S3Folder[] | undefined) || [];

  const openCreateFolderModal = () => setIsCreateFolderModalOpen(true);
  const closeCreateFolderModal = () => setIsCreateFolderModalOpen(false);

  if (isLoading) {
    return (
      <div className="page-layout flex min-h-[400px] flex-col items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-layout flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
        <p className="max-w-md text-center text-sm font-medium text-red-400">
          Đã xảy ra lỗi khi tải danh sách thư mục
        </p>
        <button
          onClick={() => refetch()}
          className="mt-6 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
              { label: "Lưu trữ" },
            ]}
          />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Lưu trữ
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateFolderModal}
          className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
        >
          <FiFolderPlus />
          Tạo thư mục
        </button>
      </div>

      {folders.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danh sách trống
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
            Hệ thống hiện tại chưa có thư mục lưu trữ nào
          </p>
          <button
            type="button"
            onClick={openCreateFolderModal}
            className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <FiFolderPlus className="text-lg" />
            Tạo thư mục ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {folders.map((folder, index) => {
            const accent = ACCENTS[index % ACCENTS.length];

            return (
              <motion.div
                key={folder.folderId}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Link
                  to={`${PATHS.DASHBOARD.STORAGE}/${folder.folderId}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 transition-all duration-300 hover:border-gray-400 hover:bg-white hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
                >
                  <div
                    className={`relative overflow-hidden bg-gradient-to-br p-5 ${accent} border-b border-gray-300 dark:border-white/10`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 text-gray-900 shadow-sm backdrop-blur dark:bg-black/40 dark:text-white">
                          <FiFolder className="text-xl" />
                        </span>
                        <Badge
                          type="info"
                          value={`${folder.assetCount} files`}
                        />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-gray-600 uppercase tabular-nums dark:text-gray-400">
                        {formatFileSize(folder.totalSize)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="space-y-1.5">
                      <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                        {folder.name}
                      </h2>
                      <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {folder.description || "Không có mô tả"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-300 pt-3 dark:border-white/10">
                      <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                        {formatRelativeTime(folder.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white">
                        Truy cập
                        <FiArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <CreateS3FolderModal
        open={isCreateFolderModalOpen}
        onClose={closeCreateFolderModal}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
