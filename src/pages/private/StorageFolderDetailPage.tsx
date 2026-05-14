import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiEye,
  FiGrid,
  FiImage,
  FiList,
  FiMoreHorizontal,
  FiPlayCircle,
  FiUpload,
} from "react-icons/fi";
import { Navigate, useParams } from "react-router-dom";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import IconAction from "@/components/custom_ui/IconAction";
import { Pagination } from "@/components/custom_ui/Pagination";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { PATHS } from "@/config/paths";
import { getStorageFolder } from "./StorageDashboardPage";

type StorageViewMode = "grid" | "table";
type StorageFile = NonNullable<
  ReturnType<typeof getStorageFolder>
>["files"][number];

const viewTabs: Array<{
  value: StorageViewMode;
  label: string;
  icon: typeof FiGrid;
}> = [
  { value: "grid", label: "Thẻ", icon: FiGrid },
  { value: "table", label: "Bảng", icon: FiList },
];

const columns = [
  { key: "name", label: "Tên file", width: "w-[40%]", align: "left" },
  { key: "size", label: "Kích thước", width: "w-[16%]", align: "center" },
  { key: "type", label: "Loại file", width: "w-[12%]", align: "center" },
  { key: "format", label: "Định dạng", width: "w-[12%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[20%]", align: "center" },
] as const;

export default function StorageFolderDetailPage() {
  const { folderId } = useParams();
  const folder = getStorageFolder(folderId);
  const [viewMode, setViewMode] = useState<StorageViewMode>("grid");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  if (!folder) {
    return <Navigate to={PATHS.DASHBOARD.STORAGE} replace />;
  }

  const totalFiles = folder.files.length;
  const paginatedFiles = folder.files.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
              { label: "Lưu trữ", path: PATHS.DASHBOARD.STORAGE },
              { label: folder.name },
            ]}
          />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            {folder.name}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
            {folder.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50/50 p-1 dark:border-white/10 dark:bg-white/5">
            {viewTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.value === viewMode;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setViewMode(tab.value)}
                  className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-white/10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <Icon className="relative z-10 text-[14px]" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
          >
            <FiUpload />
            Tải lên
          </button>
        </div>
      </div>

      <div className="mt-6 mb-8 flex flex-wrap gap-3">
        <Badge type="info" value={`${folder.files.length} tệp`} />
        <Badge type="purple" value={folder.totalSize} />
        <Badge type="success" value={folder.lastUpdated} />
      </div>

      {viewMode === "grid" ? (
        <>
          <StorageGrid files={paginatedFiles} />
          <div className="mt-8">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={totalFiles}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : (
        <StorageTable
          files={paginatedFiles}
          pagination={
            <Pagination
              page={page}
              pageSize={pageSize}
              total={totalFiles}
              onPageChange={setPage}
            />
          }
        />
      )}
    </div>
  );
}

function StorageGrid({ files }: { files: StorageFile[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {files.map((file, index) => (
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
                <FileMetaBlock label="Kích thước" value={file.size} />
                <FileMetaBlock
                  label="Loại"
                  value={file.type === "video" ? "Video" : "Ảnh"}
                />
                <FileMetaBlock label="Định dạng" value={file.mimeLabel} />
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
  );
}

function StorageTable({
  files,
  pagination,
}: {
  files: StorageFile[];
  pagination: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] table-fixed border-collapse border-x border-t border-gray-400 text-left dark:border-white/10">
        <thead>
          <tr className="bg-gray-100/50 dark:bg-white/5">
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`border-b border-gray-400 p-4 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:border-white/10 dark:text-gray-400 ${
                  column.width
                } ${column.align === "center" ? "text-center" : "text-left"} ${
                  index < columns.length - 1
                    ? "border-r border-gray-400 dark:border-white/10"
                    : ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 dark:divide-white/10">
          {files.map((file) => (
            <tr
              key={file.id}
              className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5"
            >
              <td className="border-r border-gray-400 p-4 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white">
                        {file.type === "video" ? <FiPlayCircle /> : <FiImage />}
                      </span>
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {file.duration
                          ? `Thời lượng ${file.duration}`
                          : "Ảnh tĩnh"}
                      </p>
                      <div className="flex gap-1">
                        {file.tags.map((tag) => (
                          <Badge key={tag} type="info" value={tag} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <span className="text-[13px] text-gray-600 dark:text-gray-300">
                  {file.size}
                </span>
              </td>

              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <Badge
                  type={file.type === "video" ? "purple" : "blue"}
                  value={file.type === "video" ? "Video" : "Ảnh"}
                />
              </td>

              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300">
                  {file.mimeLabel}
                </span>
              </td>

              <td className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <Tooltip content="Xem file">
                    <IconAction icon={<FiEye />} />
                  </Tooltip>
                  <Tooltip content="Tải xuống">
                    <IconAction icon={<FiDownload />} />
                  </Tooltip>
                  <Tooltip content="Tùy chọn">
                    <IconAction icon={<FiMoreHorizontal />} />
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-gray-400 dark:border-white/10">{pagination}</div>
    </div>
  );
}

function FileMetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
        {value}
      </p>
    </div>
  );
}
