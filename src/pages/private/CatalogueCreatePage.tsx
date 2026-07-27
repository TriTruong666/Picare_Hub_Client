import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiFileText,
  FiImage,
  FiMove,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { PATHS } from "@/config/paths";
import { useCreateCatalogue } from "@/hooks/data/useCatalogueHooks";
import { toast } from "@/hooks/useToast";
import {
  FieldLabel,
  TextareaInput,
  TextInput,
} from "@/pages/private/contract-form/common/FormPrimitives";

type ImageItem = { id: string; file: File; previewUrl: string };

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
                  {images.length} ảnh đã chọn · Kéo thả card để sắp xếp thứ tự trang
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
                        : "cursor-grab active:cursor-grabbing hover:border-black/30 dark:hover:border-white/30"
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(image.id);
                        }}
                        disabled={disabled}
                        aria-label={`Xóa ${image.file.name}`}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        <FiX size={13} />
                      </button>
                    </div>
                    <div className="border-t border-black/8 bg-white px-2.5 py-2 dark:border-white/8 dark:bg-[#111111]">
                      <p className="truncate text-[11px] font-medium text-black/70 dark:text-white/65">
                        {image.file.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-black/42 dark:text-white/35">
                        {formatFileSize(image.file.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="flex aspect-[210/297] flex-col items-center justify-center border border-dashed border-black/15 text-black/52 transition hover:border-black/30 hover:bg-black/[0.03] disabled:opacity-40 dark:border-white/15 dark:text-white/48"
              >
                <FiUpload className="text-lg" />
                <span className="mt-2 text-[11px] font-medium">Thêm ảnh</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogueCreatePage() {
  const createCatalogue = useCreateCatalogue();
  const [catalogueName, setCatalogueName] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const imagesRef = useRef<ImageItem[]>([]);
  const isSubmitting = createCatalogue.isPending;
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(
    () => () =>
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      ),
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
      })),
    ]);
  };
  const removeImage = (id: string) =>
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  const removeAllImages = () =>
    setImages((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
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
    const response = await createCatalogue.mutateAsync({
      catalogueName: name,
      note: note.trim() || undefined,
      images: images.map((image) => image.file),
    });
    if (response.success) {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setImages([]);
      setCatalogueName("");
      setNote("");
    }
  };
  return (
    <main className="dashboard-theme min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          disabled
          title="Lịch sử catalogue sẽ sớm khả dụng"
          aria-label="Lịch sử catalogue chưa khả dụng"
          className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full border border-black/10 bg-white text-black/35 opacity-70 dark:border-white/10 dark:bg-white dark:text-black/40"
        >
          <FiClock />
        </button>
      </div>
      <div className="mx-auto w-full max-w-5xl px-5 py-6 md:px-8 lg:px-10">
        <header className="relative border-b border-black/10 pb-6 dark:border-white/10">
          <Link
            to={PATHS.HOME}
            className="group mb-5 inline-flex items-center gap-2 text-xs font-medium text-black/55 transition hover:text-black dark:text-white/55 dark:hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] transition group-hover:-translate-x-0.5 dark:bg-white/[0.06]">
              <FiArrowLeft />
            </span>
            Quay về Hub
          </Link>
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-center text-2xl font-medium md:text-3xl">
            Tạo catalogue sản phẩm
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-6 text-black/50 dark:text-white/42">
            Tải lên bộ ảnh để tạo catalogue kỹ thuật số cho sản phẩm của Picare.
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          </section>
          <div className="flex flex-col items-center py-6">
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="inline-flex h-12 min-w-56 items-center justify-center gap-2.5 rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_16px_45px_rgba(0,0,0,0.38)] transition hover:-translate-y-0.5 hover:bg-white/95 disabled:pointer-events-none disabled:bg-white/45 disabled:text-black/50 disabled:shadow-none"
            >
              {isSubmitting ? (
                <Spinner size="sm" color="black" />
              ) : (
                <FiFileText />
              )}
              {isSubmitting ? "Đang tạo..." : "Tạo catalogue"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
