import { motion } from "framer-motion";
import { FiArrowLeft, FiImage, FiPlayCircle } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { Badge } from "@/components/custom_ui/Badge";
import { PATHS } from "@/config/paths";
import { getStorageFolder } from "./StorageDashboardPage";

export type StorageFileType = "image" | "video";

export type StorageFileRecord = {
  id: string;
  name: string;
  size: string;
  mimeLabel: string;
  type: StorageFileType;
  tags: string[];
  thumbnail: string;
  duration?: string;
};

export type StorageFolder = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  totalSize: string;
  lastUpdated: string;
  accent: string;
  cover: string;
  files: StorageFileRecord[];
};

export default function StorageFolderDetailPage() {
  const { folderId } = useParams();
  const folder = getStorageFolder(folderId);

  if (!folder) {
    return <Navigate to={PATHS.DASHBOARD.STORAGE} replace />;
  }

  return (
    <div className="page-layout">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
            { label: "Lưu trữ", path: PATHS.DASHBOARD.STORAGE },
            { label: folder.name },
          ]}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
              {folder.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {folder.files.map((file, index) => (
          <motion.article
            key={file.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 transition-all duration-300 hover:border-gray-400 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden border-b border-gray-300 dark:border-white/10">
              <img
                src={file.thumbnail}
                alt={file.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black/40 text-white backdrop-blur">
                  {file.type === "video" ? <FiPlayCircle /> : <FiImage />}
                </span>
                <Badge
                  type={file.type === "video" ? "purple" : "blue"}
                  value={file.mimeLabel}
                />
              </div>

              {file.duration ? (
                <span className="absolute right-4 bottom-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white tabular-nums backdrop-blur">
                  {file.duration}
                </span>
              ) : null}
            </div>

            <div className="space-y-3.5 p-4">
              <div className="space-y-2">
                <h2 className="line-clamp-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                  {file.name}
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Kích thước
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {file.size}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Loại
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {file.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Định dạng
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {file.mimeLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-gray-300 pt-3 dark:border-white/10">
                {file.tags.map((tag) => (
                  <Badge key={tag} type="info" value={tag} />
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
