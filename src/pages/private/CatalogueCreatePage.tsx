import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBookOpen,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiImage,
  FiMove,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

import { CatalogueHistoryPanel } from "@/components/catalogue/CatalogueHistoryPanel";
import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { PATHS } from "@/config/paths";
import {
  useCreateCatalogue,
  useDeleteCatalogue,
  useUpdateCatalogue,
} from "@/hooks/data/useCatalogueHooks";
import { toast } from "@/hooks/useToast";
import {
  FieldLabel,
  TextareaInput,
  TextInput,
} from "@/pages/private/contract-form/common/FormPrimitives";
import type { Catalogue } from "@/types/Catalogue";

export type CatalogueFormMode = "create" | "edit";

type ImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
  catalogueDetailId?: string;
  fileName?: string;
};

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CatalogueImagesField({
  images,
  onAddFiles,
  onRemove,
  onRemoveAll,
  onReorder,
  disabled,
}: {
  images: ImageItem[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const autoScrollAnimationFrameRef = useRef<number | null>(null);
  const mouseYRef = useRef<number | null>(null);

  const startAutoScroll = useCallback(() => {
    if (autoScrollAnimationFrameRef.current !== null) return;

    const scrollStep = () => {
      const currentY = mouseYRef.current;
      if (currentY !== null) {
        const threshold = 140;
        const maxSpeed = 24;

        if (currentY < threshold) {
          const intensity = (threshold - currentY) / threshold;
          const speed = Math.max(5, Math.round(intensity * maxSpeed));
          window.scrollBy(0, -speed);
        } else if (currentY > window.innerHeight - threshold) {
          const intensity =
            (currentY - (window.innerHeight - threshold)) / threshold;
          const speed = Math.max(5, Math.round(intensity * maxSpeed));
          window.scrollBy(0, speed);
        }
      }

      autoScrollAnimationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    autoScrollAnimationFrameRef.current = requestAnimationFrame(scrollStep);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollAnimationFrameRef.current);
      autoScrollAnimationFrameRef.current = null;
    }
    mouseYRef.current = null;
  }, []);

  useEffect(() => {
    if (draggedIndex === null) {
      stopAutoScroll();
      return;
    }

    const handleWindowDragOver = (e: globalThis.DragEvent) => {
      mouseYRef.current = e.clientY;
    };

    window.addEventListener("dragover", handleWindowDragOver);
    startAutoScroll();

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      stopAutoScroll();
    };
  }, [draggedIndex, startAutoScroll, stopAutoScroll]);

  const openPicker = () => !disabled && inputRef.current?.click();
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAddFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (!disabled && files.length > 0) {
      onAddFiles(files);
    }
  };
  const dragClasses = isDragging
    ? "border-black/35 bg-black/[0.04] dark:border-white/40 dark:bg-white/[0.07]"
    : "border-black/15 bg-white dark:border-white/10 dark:bg-white/[0.02]";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled && e.dataTransfer.types.includes("Files")) {
            setIsDragging(true);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            setIsDragging(false);
        }}
        onDrop={onDrop}
        className={`relative border border-dashed transition-colors duration-200 ${dragClasses}`}
      >
        {images.length === 0 ? (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="flex min-h-[310px] w-full flex-col items-center justify-center px-6 py-10 text-center transition hover:bg-black/[0.02] disabled:cursor-not-allowed dark:hover:bg-white/[0.02]"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-2xl text-black/65 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65">
              <FiImage />
            </span>
            <span className="mt-5 text-sm font-medium text-black/88 dark:text-white/85">
              Thả bộ ảnh catalogue vào đây
            </span>
            <span className="mt-2 max-w-sm text-xs leading-6 text-black/50 dark:text-white/42">
              Hoặc bấm để chọn nhiều hình cùng lúc. Bạn có thể thêm ảnh sau khi
              đã chọn.
            </span>
            <span className="mt-6 inline-flex items-center gap-2 border border-black/12 bg-black/[0.05] px-4 py-2 text-xs font-medium text-black/75 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/75">
              <FiUpload /> Chọn ảnh
            </span>
          </button>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-black/85 dark:text-white/85">
                  Bộ ảnh catalogue
                </p>
                <p className="mt-1 text-xs text-black/48 dark:text-white/40">
                  {images.length} ảnh đã chọn · Kéo thả card để sắp xếp thứ tự
                  trang
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRemoveAll}
                  disabled={disabled}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 border border-red-500/20 bg-red-50 px-3 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-40 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                >
                  <FiTrash2 /> Xóa tất cả
                </button>
                <button
                  type="button"
                  onClick={openPicker}
                  disabled={disabled}
                  className="inline-flex h-9 shrink-0 items-center gap-2 border border-black/12 bg-black/[0.05] px-3 text-xs font-medium text-black/75 transition hover:bg-black/[0.1] disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/75"
                >
                  <FiPlus /> Thêm ảnh
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => {
                const isBeingDragged = draggedIndex === index;
                const isTargetDrop =
                  dragOverIndex === index && draggedIndex !== index;

                return (
                  <div
                    key={image.id}
                    draggable={!disabled}
                    onDragStart={(e) => {
                      if (disabled) return;
                      e.dataTransfer.setData("text/plain", index.toString());
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedIndex(index);
                    }}
                    onDragOver={(e) => {
                      if (disabled) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDragEnter={() => {
                      if (
                        !disabled &&
                        draggedIndex !== null &&
                        draggedIndex !== index
                      ) {
                        setDragOverIndex(index);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (
                        !e.currentTarget.contains(
                          e.relatedTarget as Node | null,
                        )
                      ) {
                        if (dragOverIndex === index) {
                          setDragOverIndex(null);
                        }
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (disabled || draggedIndex === null) return;
                      onReorder(draggedIndex, index);
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`group relative overflow-hidden border transition-all duration-200 ${
                      disabled
                        ? ""
                        : "cursor-grab hover:border-black/30 active:cursor-grabbing dark:hover:border-white/30"
                    } ${
                      isBeingDragged
                        ? "scale-95 bg-black/[0.05] opacity-30 dark:bg-white/[0.05]"
                        : isTargetDrop
                          ? "scale-[1.02] border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/50 dark:bg-indigo-500/10"
                          : "border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="relative aspect-[210/297] w-full overflow-hidden bg-black/[0.04] dark:bg-white/[0.04]">
                      <img
                        src={image.previewUrl}
                        alt={`Ảnh catalogue ${index + 1}`}
                        className="pointer-events-none h-full w-full object-contain"
                      />

                      <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                        <FiMove className="text-[9px] text-white/70" />
                        <span>Trang {index + 1}</span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onRemove(image.id)}
                          disabled={disabled}
                          className="flex items-center gap-1 border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-500/30"
                        >
                          <FiX /> Xóa
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-black/8 px-3 py-2 text-[11px] text-black/60 dark:border-white/8 dark:text-white/40">
                      <p className="truncate font-medium">
                        {image.fileName || image.file?.name || `Trang ${index + 1}`}
                      </p>
                      {image.file ? (
                        <p className="mt-0.5 text-[10px] text-black/40 dark:text-white/30">
                          {formatFileSize(image.file.size)}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-black/40 dark:text-white/30">
                          Ảnh đã tải lên
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getInitialImages(catalogue?: Catalogue): ImageItem[] {
  if (!catalogue?.details) return [];
  return catalogue.details
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((detail) => ({
      id: detail.catalogueDetailId,
      previewUrl: detail.imageUrl,
      catalogueDetailId: detail.catalogueDetailId,
      fileName: detail.imageKey.split("/").pop() || "image",
    }));
}

function DeleteCatalogueModal({
  catalogue,
  isDeleting,
  onClose,
  onConfirm,
}: {
  catalogue: Catalogue | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {catalogue ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDeleting && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="dashboard-theme relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#050505] text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
              <h2 className="text-base font-semibold text-white">
                Xóa Catalogue
              </h2>

              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <FiAlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Bạn có chắc chắn muốn xóa catalogue này?
                </p>
                <p className="mt-2 text-sm break-all text-white/45">
                  Catalogue{" "}
                  <span className="font-semibold text-white">
                    {catalogue.catalogueName || catalogue.catalogueId}
                  </span>{" "}
                  sẽ bị xóa vĩnh viễn và hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={onConfirm}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={14} />
                    Xóa Catalogue
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function CatalogueFormPage({
  mode = "create",
  initialCatalogue,
}: {
  mode?: CatalogueFormMode;
  initialCatalogue?: Catalogue;
}) {
  const navigate = useNavigate();
  const createCatalogueMutation = useCreateCatalogue();
  const updateCatalogueMutation = useUpdateCatalogue();
  const deleteCatalogueMutation = useDeleteCatalogue();

  const isEditMode = mode === "edit";
  const [catalogueName, setCatalogueName] = useState(
    initialCatalogue?.catalogueName ?? "",
  );
  const [note, setNote] = useState(initialCatalogue?.note ?? "");
  const [removedDetailIds, setRemovedDetailIds] = useState<string[]>([]);
  const [images, setImages] = useState<ImageItem[]>(() =>
    getInitialImages(initialCatalogue),
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const imagesRef = useRef<ImageItem[]>(images);
  const isSubmitting = isEditMode
    ? updateCatalogueMutation.isPending
    : createCatalogueMutation.isPending;
  const isDeleting = deleteCatalogueMutation.isPending;

  useEffect(() => {
    if (initialCatalogue) {
      setCatalogueName(initialCatalogue.catalogueName ?? "");
      setNote(initialCatalogue.note ?? "");
      setRemovedDetailIds([]);
      setImages((current) => {
        current.forEach((image) => {
          if (image.file) URL.revokeObjectURL(image.previewUrl);
        });
        return getInitialImages(initialCatalogue);
      });
    }
  }, [initialCatalogue]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.previewUrl);
      });
    },
    [],
  );

  const addFiles = (files: File[]) => {
    const validImages = files.filter((file) => file.type.startsWith("image/"));
    if (!validImages.length) {
      toast.warning(
        "Chưa có ảnh hợp lệ",
        "Vui lòng chọn tệp hình ảnh để tạo catalogue.",
      );
      return;
    }
    setImages((current) => [
      ...current,
      ...validImages.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${file.size}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file),
        fileName: file.name,
      })),
    ]);
  };

  const removeImage = (id: string) =>
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image?.file) URL.revokeObjectURL(image.previewUrl);
      if (image?.catalogueDetailId) {
        setRemovedDetailIds((prev) => [...prev, image.catalogueDetailId!]);
      }
      return current.filter((item) => item.id !== id);
    });

  const removeAllImages = () =>
    setImages((current) => {
      current.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.previewUrl);
        if (item.catalogueDetailId) {
          setRemovedDetailIds((prev) => [...prev, item.catalogueDetailId!]);
        }
      });
      return [];
    });

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setImages((prev) => {
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  };

  const handleDelete = async () => {
    if (!initialCatalogue?.catalogueId || isDeleting) return;

    const response = await deleteCatalogueMutation.mutateAsync(
      initialCatalogue.catalogueId,
    );

    if (response.success) {
      setIsDeleteModalOpen(false);
      navigate(PATHS.CATALOGUE.CREATE);
    }
  };

  const submit = async () => {
    const name = catalogueName.trim();
    if (!name) {
      toast.warning("Thiếu tên catalogue", "Vui lòng nhập tên để tiếp tục.");
      return;
    }
    if (!images.length) {
      toast.warning("Thiếu ảnh catalogue", "Vui lòng chọn ít nhất một ảnh.");
      return;
    }

    if (isEditMode && initialCatalogue) {
      const newFiles = images.flatMap((item) => (item.file ? [item.file] : []));
      const response = await updateCatalogueMutation.mutateAsync({
        catalogueId: initialCatalogue.catalogueId,
        payload: {
          catalogueName: name,
          note: note.trim() || undefined,
          images: newFiles,
          removeDetailIds: removedDetailIds as any,
        },
      });

      if (response.success) {
        setRemovedDetailIds([]);
      }
      return;
    }

    const response = await createCatalogueMutation.mutateAsync({
      catalogueName: name,
      note: note.trim() || undefined,
      images: images.flatMap((item) => (item.file ? [item.file] : [])),
    });

    if (response.success) {
      images.forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.previewUrl);
      });
      setImages([]);
      setCatalogueName("");
      setNote("");
    }
  };

  return (
    <main className="dashboard-theme min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
      {!isHistoryOpen ? (
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#111111] shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition duration-250 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-95 dark:border-white/10 dark:bg-white dark:text-black dark:shadow-[0_14px_34px_rgba(0,0,0,0.34)] dark:hover:shadow-[0_18px_44px_rgba(0,0,0,0.42)]"
          aria-label="Mở lịch sử catalogue"
        >
          <FiClock />
        </button>
      ) : null}

      <div
        className={`mx-auto w-full max-w-5xl px-5 py-6 transition-all duration-300 md:px-8 lg:px-10 ${
          isHistoryOpen ? "lg:max-w-4xl lg:-translate-x-48" : ""
        }`}
      >
        <header className="relative border-b border-black/10 pb-6 dark:border-white/10">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to={PATHS.HOME}
              className="group inline-flex items-center gap-2 text-xs font-medium text-black/55 transition hover:text-black dark:text-white/55 dark:hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] transition group-hover:-translate-x-0.5 dark:bg-white/[0.06]">
                <FiArrowLeft />
              </span>
              Quay về Hub
            </Link>

            {isEditMode && initialCatalogue?.catalogueId ? (
              <Link
                to={`/catalogue/public/${initialCatalogue.catalogueId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-300"
              >
                <FiBookOpen className="h-3.5 w-3.5" />
                <span>Xem Preview 3D</span>
                <FiExternalLink className="h-3 w-3 opacity-70" />
              </Link>
            ) : null}
          </div>

          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-center text-2xl font-medium text-[#111111] md:text-3xl dark:text-white">
            {isEditMode ? catalogueName || "Chỉnh sửa catalogue" : "Tạo catalogue sản phẩm"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-6 text-black/50 dark:text-white/42">
            {isEditMode && initialCatalogue
              ? `ID: ${initialCatalogue.catalogueId}`
              : "Tải lên bộ ảnh để tạo catalogue kỹ thuật số cho sản phẩm của Picare."}
          </p>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <section className="border-b border-black/10 py-6 dark:border-white/10">
            <div className="mx-auto grid max-w-[720px] gap-5">
              <div>
                <FieldLabel>Tên catalogue</FieldLabel>
                <TextInput
                  id="catalogue-name"
                  value={catalogueName}
                  onChange={setCatalogueName}
                  disabled={isSubmitting || isDeleting}
                  placeholder="Ví dụ: Catalogue sản phẩm Picare 2026"
                  required
                />
              </div>
              <div>
                <FieldLabel>
                  Ghi chú <span className="normal-case">(không bắt buộc)</span>
                </FieldLabel>
                <TextareaInput
                  id="catalogue-note"
                  value={note}
                  onChange={setNote}
                  disabled={isSubmitting || isDeleting}
                  placeholder="Thêm mô tả ngắn cho catalogue..."
                />
              </div>
            </div>
          </section>
          <section className="border-b border-black/10 py-6 dark:border-white/10">
            <div className="mx-auto max-w-[720px]">
              <CatalogueImagesField
                images={images}
                onAddFiles={addFiles}
                onRemove={removeImage}
                onRemoveAll={removeAllImages}
                onReorder={reorderImages}
                disabled={isSubmitting || isDeleting}
              />
            </div>
          </section>
          <div className="flex flex-col items-center py-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isEditMode && initialCatalogue?.catalogueId ? (
                <Link
                  to={`/catalogue/public/${initialCatalogue.catalogueId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-5 text-sm font-medium text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-500/20 active:translate-y-0 dark:text-rose-300"
                >
                  <FiBookOpen className="h-4 w-4" />
                  <span>Xem Preview 3D</span>
                  <FiExternalLink className="h-3.5 w-3.5 opacity-60" />
                </Link>
              ) : null}

              {isEditMode ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting || isSubmitting}
                  className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-6 text-sm font-medium text-red-600 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-red-500/18 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 dark:text-red-200"
                >
                  {isDeleting ? <Spinner size="sm" color="white" /> : <FiTrash2 />}
                  Xóa Catalogue
                </button>
              ) : null}

              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting || isDeleting}
                className="inline-flex h-12 min-w-56 items-center justify-center gap-2.5 rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_16px_45px_rgba(0,0,0,0.38)] transition hover:-translate-y-0.5 hover:bg-white/95 disabled:pointer-events-none disabled:bg-white/45 disabled:text-black/50 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <Spinner size="sm" color="black" />
                ) : (
                  <FiFileText />
                )}
                {isSubmitting
                  ? "Đang lưu..."
                  : isEditMode
                    ? "Lưu thay đổi"
                    : "Tạo catalogue"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <CatalogueHistoryPanel
        activeCatalogueId={initialCatalogue?.catalogueId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <DeleteCatalogueModal
        catalogue={isDeleteModalOpen ? (initialCatalogue ?? null) : null}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}

export default function CatalogueCreatePage() {
  return <CatalogueFormPage mode="create" />;
}
