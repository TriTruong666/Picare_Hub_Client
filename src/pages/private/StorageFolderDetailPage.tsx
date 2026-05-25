/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiImage,
  FiList,
  FiPlayCircle,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { Navigate, useParams } from "react-router-dom";

import { formatFileSize, formatRelativeTime } from "@/common/format";
import { Badge } from "@/components/custom_ui/Badge";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import IconAction from "@/components/custom_ui/IconAction";
import DeleteS3AssetModal from "@/components/modals/DeleteS3AssetModal";
import UploadS3AssetsModal from "@/components/modals/UploadS3AssetsModal";
import { Pagination } from "@/components/custom_ui/Pagination";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import { PATHS } from "@/config/paths";
import {
  useDownloadS3Asset,
  useS3Assets,
  useS3Folders,
} from "@/hooks/data/useS3Hooks";
import type { S3Asset, S3Folder } from "@/types/S3";
import clsx from "clsx";

type StorageViewMode = "grid" | "table";

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
  const { folderId } = useParams<{ folderId: string }>();

  const [viewMode, setViewMode] = useState<StorageViewMode>("grid");
  const [assetType, setAssetType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [allAssets, setAllAssets] = useState<S3Asset[]>([]);
  const pageSize = 12;

  const [assetToDelete, setAssetToDelete] = useState<S3Asset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const downloadMutation = useDownloadS3Asset();

  const handleDownloadAsset = (asset: S3Asset) => {
    downloadMutation.mutate({
      key: asset.s3Key,
      originalName: asset.originalName,
    });
  };

  const { data: foldersData, isLoading: isLoadingFolders } = useS3Folders();
  const folder = (foldersData as S3Folder[] | undefined)?.find(
    (item) => item.folderId === folderId || item.name === folderId,
  );

  const {
    data: assetsData,
    fullResponse,
    isLoading: isLoadingAssets,
    isFetching: isFetchingAssets,
    isError,
    refetch,
  } = useS3Assets({
    folder: folder?.name || folderId || "",
    assetType: assetType as "image" | "video" | "document" | "audio" | "",
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const currentRows = useMemo(
    () => (assetsData as S3Asset[] | undefined) || [],
    [assetsData],
  );
  const totalAssets = fullResponse?.pagination?.totalRecords || 0;
  const hasMore = allAssets.length < totalAssets;

  useEffect(() => {
    let canceled = false;

    queueMicrotask(() => {
      if (canceled) return;
      setAllAssets([]);
      setPage(1);
    });

    return () => {
      canceled = true;
    };
  }, [folderId, assetType]);

  useEffect(() => {
    let canceled = false;

    queueMicrotask(() => {
      if (canceled) return;

      if (page === 1) {
        setAllAssets(currentRows);
        return;
      }

      if (currentRows.length === 0) return;

      setAllAssets((prev) => {
        const existingIds = new Set(prev.map((asset) => asset.assetId));
        const newUniqueAssets = currentRows.filter(
          (asset) => !existingIds.has(asset.assetId),
        );
        return [...prev, ...newUniqueAssets];
      });
    });

    return () => {
      canceled = true;
    };
  }, [currentRows, page]);

  const refreshAssetsAfterUpload = () => {
    setAllAssets([]);
    setPage(1);
    refetch();
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleViewAsset = (asset: S3Asset) => {
    if (asset.visibility === "public") {
      window.open(asset.s3Url, "_blank");
      return;
    }

    const baseUrl = import.meta.env.VITE_HUB_API_URL;
    window.open(`${baseUrl}/api/v1/s3/view/${asset.s3Key}`, "_blank");
  };

  const pagination = fullResponse?.pagination;

  if (isLoadingFolders) {
    return (
      <div className="page-layout flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!folder && !isLoadingFolders) {
    return <Navigate to={PATHS.DASHBOARD.STORAGE} replace />;
  }

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
              { label: "Lưu trữ", path: PATHS.DASHBOARD.STORAGE },
              { label: folder?.name || "Chi tiết" },
            ]}
          />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            {folder?.name}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
            {folder?.description || "Không có mô tả cho thư mục này."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <GlassSelect
              value={assetType}
              onChange={(value) => setAssetType(value)}
              options={[
                { value: "", label: "Tất cả loại" },
                { value: "image", label: "Hình ảnh" },
                { value: "video", label: "Video" },
                { value: "document", label: "Tài liệu" },
                { value: "audio", label: "Âm thanh" },
              ]}
            />
          </div>

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
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/10 dark:hover:bg-indigo-400"
          >
            <FiUpload />
            Tải lên
          </button>
        </div>
      </div>

      <div className="mt-6 mb-8 flex flex-wrap gap-3">
        <Badge type="info" value={`${folder?.assetCount || 0} tệp`} />
        <Badge type="purple" value={formatFileSize(folder?.totalSize || 0)} />
        <Badge
          type="success"
          value={`Cập nhật: ${formatRelativeTime(folder?.updatedAt || "")}`}
        />
      </div>

      {viewMode === "table" ? (
        <StorageTable
          assets={currentRows}
          isLoading={isLoadingAssets}
          isFetching={isFetchingAssets}
          isError={isError}
          onRefetch={refetch}
          onView={handleViewAsset}
          onDelete={setAssetToDelete}
          onDownload={handleDownloadAsset}
          onUpload={() => setIsUploadModalOpen(true)}
          pagination={
            <Pagination
              page={page}
              pageSize={pageSize}
              total={totalAssets}
              onPageChange={setPage}
            />
          }
        />
      ) : (
        <StorageGridSection
          assets={allAssets}
          hasMore={hasMore}
          isLoading={isLoadingAssets}
          isFetching={isFetchingAssets}
          isError={isError}
          onLoadMore={handleLoadMore}
          onRefetch={refetch}
          onView={handleViewAsset}
          onDelete={setAssetToDelete}
          onDownload={handleDownloadAsset}
          onUpload={() => setIsUploadModalOpen(true)}
          pagination={pagination}
        />
      )}

      <UploadS3AssetsModal
        open={isUploadModalOpen}
        folderName={folder?.name || folderId || ""}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={refreshAssetsAfterUpload}
      />

      {/* Modal xác nhận xóa */}
      <DeleteS3AssetModal
        asset={assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onSuccess={(deletedAsset) => {
          setAllAssets((prev) =>
            prev.filter((item) => item.assetId !== deletedAsset.assetId),
          );
        }}
      />
    </div>
  );
}

function StorageGridSection({
  assets,
  hasMore,
  isLoading,
  isFetching,
  isError,
  onLoadMore,
  onRefetch,
  onView,
  onDelete,
  onDownload,
  onUpload,
  pagination,
}: {
  pagination: any;
  assets: S3Asset[];
  hasMore: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onLoadMore: () => void;
  onRefetch: () => void;
  onView: (asset: S3Asset) => void;
  onDelete: (asset: S3Asset) => void;
  onDownload: (asset: S3Asset) => void;
  onUpload: () => void;
}) {
  if (isLoading && assets.length === 0) {
    return <StorageGridSkeleton />;
  }

  if (isError && assets.length === 0) {
    return (
      <StorageErrorState
        message="Đã xảy ra lỗi khi tải danh sách tệp"
        onRetry={onRefetch}
      />
    );
  }

  if (assets.length === 0) {
    return (
      <StorageEmptyState
        description="Thư mục này hiện chưa có tệp tin nào"
        onUpload={onUpload}
      />
    );
  }

  return (
    <div className="space-y-10">
      <StorageGrid
        assets={assets}
        onView={onView}
        onDelete={onDelete}
        onDownload={onDownload}
      />

      <div className="mt-12 flex flex-col items-center justify-center pb-20">
        {hasMore ? (
          <button
            onClick={onLoadMore}
            disabled={isFetching}
            className={clsx(
              "btn-secondary min-w-50 gap-3 rounded-xl border-gray-300 bg-white py-3 text-xs shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
              isFetching && "cursor-not-allowed opacity-50",
            )}
          >
            {isFetching ? (
              <>
                <Spinner size="sm" color="primary" />
                <span>Đang tải thêm...</span>
              </>
            ) : (
              <>
                <span>Tải thêm files</span>
                <Badge
                  type="info"
                  value={`${assets.length} / ${pagination?.totalRecords || 0}`}
                />
              </>
            )}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-px w-20 bg-gray-300 dark:bg-white/5" />
            <p className="text-[10px] tracking-widest text-gray-500 dark:text-white/20">
              Hiển thị ({assets.length}) files
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StorageGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/5"
        >
          <div className="aspect-square animate-pulse bg-gray-100 dark:bg-white/5" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
              <div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            </div>
            <div className="flex gap-1.5 pt-2">
              <div className="h-4 w-12 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StorageGrid({
  assets,
  onView,
  onDelete,
  onDownload,
}: {
  assets: S3Asset[];
  onView: (asset: S3Asset) => void;
  onDelete: (asset: S3Asset) => void;
  onDownload: (asset: S3Asset) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
      {assets.map((asset, index) => {
        const isPrivate = asset.visibility === "private";

        return (
          <motion.article
            key={asset.assetId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            onClick={() => onView(asset)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 transition-all duration-300 hover:border-gray-400 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="relative aspect-square overflow-hidden border-b border-gray-300 dark:border-white/10">
              {isPrivate ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100/50 dark:bg-white/5">
                  <FiEyeOff className="mb-2 text-3xl text-gray-400" />
                  <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    Private
                  </span>
                </div>
              ) : asset.assetType === "image" ? (
                <img
                  src={asset.presignedUrl || asset.s3Url}
                  alt={asset.originalName}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-white/5">
                  <FiPlayCircle className="text-4xl text-gray-300" />
                </div>
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black/40 text-white backdrop-blur">
                  {asset.assetType === "video" ? <FiPlayCircle /> : <FiImage />}
                </span>
                <Badge
                  type={asset.assetType === "video" ? "purple" : "blue"}
                  value={asset.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                />
              </div>

              {isPrivate && (
                <div className="absolute top-4 right-4">
                  <Badge type="error" value="Private" />
                </div>
              )}
            </div>

            <div className="space-y-3.5 p-4">
              <div className="space-y-2">
                <h2 className="line-clamp-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                  {asset.originalName}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <FileMetaBlock
                    label="Kích thước"
                    value={formatFileSize(asset.fileSize)}
                  />
                  <FileMetaBlock
                    label="Loại"
                    value={asset.assetType === "video" ? "Video" : "Ảnh"}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-300 pt-3 dark:border-white/10">
                <div className="flex flex-wrap gap-1">
                  {asset.tags?.length ? (
                    asset.tags
                      .slice(0, 2)
                      .map((tag) => <Badge key={tag} type="info" value={tag} />)
                  ) : (
                    <span className="text-[10px] text-gray-400">No tags</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip content="Xem">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onView(asset);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <FiEye size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Tải xuống">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDownload(asset);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <FiDownload size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Xóa">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(asset);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

function StorageTable({
  assets,
  isLoading,
  isFetching,
  isError,
  onRefetch,
  onView,
  onDelete,
  onDownload,
  onUpload,
  pagination,
}: {
  assets: S3Asset[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRefetch: () => void;
  onView: (asset: S3Asset) => void;
  onDelete: (asset: S3Asset) => void;
  onDownload: (asset: S3Asset) => void;
  onUpload: () => void;
  pagination: ReactNode;
}) {
  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <StorageErrorState
        message="Đã xảy ra lỗi khi tải danh sách tệp"
        onRetry={onRefetch}
      />
    );
  }

  if (assets.length === 0) {
    return (
      <StorageEmptyState
        description="Thư mục này hiện chưa có tệp tin nào"
        onUpload={onUpload}
      />
    );
  }

  return (
    <div className="relative">
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
            {assets.map((asset) => {
              const isPrivate = asset.visibility === "private";

              return (
                <tr
                  key={asset.assetId}
                  className="group transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5"
                >
                  <td className="border-r border-gray-400 p-4 dark:border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0">
                        <div
                          onClick={() => onView(asset)}
                          className="flex cursor-pointer items-center gap-2 text-gray-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white">
                            {isPrivate ? (
                              <FiEyeOff />
                            ) : asset.assetType === "video" ? (
                              <FiPlayCircle />
                            ) : (
                              <FiImage />
                            )}
                          </span>
                          <p className="truncate text-sm font-semibold hover:underline">
                            {asset.originalName}
                          </p>
                          {isPrivate && <Badge type="error" value="Private" />}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex gap-1">
                            {asset.tags?.map((tag) => (
                              <Badge key={tag} type="info" value={tag} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                    <span className="text-[13px] text-gray-600 dark:text-gray-300">
                      {formatFileSize(asset.fileSize)}
                    </span>
                  </td>

                  <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                    <Badge
                      type={asset.assetType === "video" ? "purple" : "blue"}
                      value={asset.assetType === "video" ? "Video" : "Ảnh"}
                    />
                  </td>

                  <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                    <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300">
                      {asset.mimeType.split("/")[1]?.toUpperCase()}
                    </span>
                  </td>

                  <td
                    className="p-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Xem file">
                        <IconAction
                          icon={<FiEye />}
                          onClick={() => onView(asset)}
                        />
                      </Tooltip>
                      <Tooltip content="Tải xuống">
                        <IconAction
                          icon={<FiDownload />}
                          onClick={() => onDownload(asset)}
                        />
                      </Tooltip>
                      <Tooltip content="Xóa file">
                        <IconAction
                          icon={<FiTrash2 />}
                          danger
                          onClick={() => onDelete(asset)}
                        />
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-gray-400 dark:border-white/10">{pagination}</div>
      </div>
    </div>
  );
}

function StorageErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
      <p className="max-w-md text-center text-sm font-medium text-red-400">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-6 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        Thử lại
      </button>
    </div>
  );
}

function StorageEmptyState({
  description,
  onUpload,
}: {
  description: string;
  onUpload: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Danh sách trống
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
        {description}
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        <FiUpload className="text-lg" />
        Tải lên ngay
      </button>
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
