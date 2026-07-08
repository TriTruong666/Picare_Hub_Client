import type { ChangeEvent, DragEvent, ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiClock,
  FiExternalLink,
  FiImage,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

import { ProductQRHistoryPanel } from "@/components/product-qr/ProductQRHistoryPanel";
import { Spinner } from "@/components/custom_ui/Spinner";
import { ThemeToggle } from "@/components/custom_ui/ThemeToggle";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { PATHS } from "@/config/paths";
import {
  useCreateProductQR,
  useDeleteProductQR,
  useUpdateProductQR,
} from "@/hooks/data/useProductQRHooks";
import { toast } from "@/hooks/useToast";
import type { ProductQR } from "@/types/QRProduct";

import "@/styles/qr-product-generator-page.scss";

const emptyEditorContent: JSONContent = {
  type: "doc",
  content: [],
};

type QRProductFormMode = "create" | "edit";

function getProductPreviewPath(productId: string) {
  return PATHS.QR_PRODUCT_PREVIEW.replace(":productId", productId);
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-[11px] font-medium tracking-[0.18em] text-black/38 uppercase dark:text-white/38">
      {children}
    </label>
  );
}

type ProductImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
  fileName?: string | null;
};

function ProductImagesUploadField({
  id,
  images,
  onAddFiles,
  onRemoveImage,
  disabled,
}: {
  id: string;
  images: ProductImageItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveImage: (imageId: string) => void;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImages = images.length > 0;

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    onAddFiles(files);
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!files.length) return;
    onAddFiles(files);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!hasImages ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative min-h-[320px] overflow-hidden border border-dashed transition-all duration-200 ${
            isDragging
              ? "border-black/30 bg-white dark:border-white/30 dark:bg-white/[0.05]"
              : "border-black/12 bg-white hover:border-black/24 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
          }`}
        >
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="flex h-full w-full flex-col items-center justify-center px-8 py-10 text-center text-black/42 transition-colors hover:text-black/62 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white/28 dark:hover:text-white/48"
          >
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.03]">
              <FiImage className="text-3xl" />
            </span>
            <span className="text-sm font-medium text-black/88 dark:text-white/82">
              Tải ảnh sản phẩm đầu tiên
            </span>
            <span className="mt-2 max-w-sm text-xs leading-6 text-black/56 dark:text-white/38">
              Có thể kéo thả hoặc bấm để chọn. Khi đã có ảnh, khu vực sẽ đổi
              sang dạng grid để thêm tiếp.
            </span>
            <span className="mt-6 inline-flex items-center gap-2 border border-black/12 bg-black/[0.06] px-4 py-2 text-xs font-medium text-black/78 transition hover:bg-black/[0.1] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/72 dark:hover:bg-white/[0.08]">
              <FiUpload className="text-xs" />
              Chọn ảnh sản phẩm
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-black/84 dark:text-white/84">
                Bộ ảnh sản phẩm
              </p>
              <p className="mt-1 text-[11px] text-black/48 dark:text-white/35">
                {images.length} ảnh sản phẩm
              </p>
            </div>
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className="inline-flex h-9 shrink-0 items-center gap-2 border border-black/10 bg-black/[0.04] px-3 text-xs font-medium text-black/70 transition hover:bg-black/[0.08] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/72 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <FiUpload className="text-xs" />
              Thêm ảnh
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden border border-black/12 bg-white dark:border-white/10 dark:bg-white/[0.02]"
              >
                <div className="aspect-square w-full bg-black/[0.02] dark:bg-white/[0.02]">
                  <img
                    src={image.previewUrl}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-contain p-4"
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onRemoveImage(image.id)}
                    disabled={disabled}
                    className="flex items-center gap-1.5 border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiX className="text-xs" />
                    Xóa ảnh
                  </button>
                </div>

                <div className="border-t border-black/8 px-3 py-2 text-[11px] text-black/58 dark:border-white/8 dark:text-white/38">
                  <span className="block truncate">
                    {image.fileName || `Ảnh ${index + 1}`}
                  </span>
                </div>
              </div>
            ))}

            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex aspect-square overflow-hidden border border-dashed transition-all duration-200 ${
                isDragging
                  ? "border-black/30 bg-white dark:border-white/30 dark:bg-white/[0.05]"
                  : "border-black/12 bg-white hover:border-black/24 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="flex h-full w-full flex-col items-center justify-center px-5 text-center text-black/48 transition-colors hover:text-black/68 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white/35 dark:hover:text-white/55"
              >
                <FiUpload className="mb-3 text-xl" />
                <span className="text-xs font-medium">Thêm ảnh</span>
                <span className="mt-1 text-[11px] text-black/42 dark:text-white/30">
                  Kéo thả hoặc chọn
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isEditorContentEmpty(content: string) {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  return !plainText;
}

function getInitialEditorContent(product?: ProductQR) {
  if (!product?.rawContent?.trim()) {
    return emptyEditorContent;
  }

  return product.rawContent;
}

function getInitialProductImages(product?: ProductQR): ProductImageItem[] {
  return (product?.imageUrl ?? []).filter(Boolean).map((previewUrl, index) => ({
    id: `existing-${product?.productId ?? "new"}-${index}`,
    previewUrl,
    fileName: `image-${index + 1}`,
  }));
}

function CreatedProductQRModal({
  product,
  helperText,
  onClose,
}: {
  product: ProductQR;
  helperText: string;
  onClose: () => void;
}) {
  const qrImageSrc = product.qrImage || product.jsonContent.qrUrl;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Đóng modal QR"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative w-full max-w-md border border-white/10 bg-[#050505] p-6 text-white shadow-[0_32px_80px_rgba(0,0,0,0.52)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center border border-white/10 text-white/55 transition hover:border-white/20 hover:text-white"
          aria-label="Đóng"
        >
          <FiX />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mx-auto w-full max-w-[320px] border border-white/10 bg-white p-5">
            <img
              src={qrImageSrc}
              alt={product.jsonContent.productName || "QR sản phẩm"}
              className="mx-auto aspect-square w-full max-w-[280px] object-contain"
            />
          </div>

          <p className="mt-4 max-w-[320px] text-center text-xs leading-6 text-white/45">
            {helperText}
          </p>

          <a
            href={product.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex w-full max-w-[320px] items-center justify-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <span className="truncate">{product.linkUrl}</span>
            <FiExternalLink className="shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

function DeleteProductQRModal({
  product,
  isDeleting,
  onClose,
  onConfirm,
}: {
  product: ProductQR | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {product ? (
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
                Xóa QR sản phẩm
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
                  Bạn có chắc chắn muốn xóa QR sản phẩm này?
                </p>
                <p className="mt-2 text-sm break-all text-white/45">
                  QR của{" "}
                  <span className="font-semibold text-white">
                    {product.jsonContent.productName || product.productId}
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
                    Xóa QR
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

export function QRProductFormPage({
  mode = "create",
  initialProduct,
  showQrButton = false,
}: {
  mode?: QRProductFormMode;
  initialProduct?: ProductQR;
  showQrButton?: boolean;
}) {
  const navigate = useNavigate();
  const createProductQRMutation = useCreateProductQR();
  const updateProductQRMutation = useUpdateProductQR();
  const deleteProductQRMutation = useDeleteProductQR();
  const [rawContent, setRawContent] = useState(
    initialProduct?.rawContent ?? "",
  );
  const [productImages, setProductImages] = useState<ProductImageItem[]>(
    getInitialProductImages(initialProduct),
  );
  const productImagesRef = useRef<ProductImageItem[]>(
    getInitialProductImages(initialProduct),
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<ProductQR | null>(null);
  const [successModalHelperText, setSuccessModalHelperText] = useState("");
  const [productToDelete, setProductToDelete] = useState<ProductQR | null>(
    null,
  );

  const isEditMode = mode === "edit";
  const isSubmitting = isEditMode
    ? updateProductQRMutation.isPending
    : createProductQRMutation.isPending;
  const isDeleting = deleteProductQRMutation.isPending;

  const revokeImagePreview = (image: ProductImageItem) => {
    if (!image.file) return;
    URL.revokeObjectURL(image.previewUrl);
  };

  useEffect(() => {
    setRawContent(initialProduct?.rawContent ?? "");

    setProductImages((currentImages) => {
      currentImages.forEach(revokeImagePreview);
      return getInitialProductImages(initialProduct);
    });
  }, [initialProduct]);

  useEffect(() => {
    productImagesRef.current = productImages;
  }, [productImages]);

  useEffect(() => {
    return () => {
      productImagesRef.current.forEach(revokeImagePreview);
    };
  }, []);

  const handleAddImages = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const nextImages = imageFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      previewUrl: URL.createObjectURL(file),
      file,
      fileName: file.name,
    }));

    setProductImages((currentImages) => [...currentImages, ...nextImages]);
  };

  const handleRemoveImage = (imageId: string) => {
    setProductImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId);
      if (imageToRemove) {
        revokeImagePreview(imageToRemove);
      }

      return currentImages.filter((image) => image.id !== imageId);
    });
  };

  const handleDelete = async () => {
    if (!initialProduct?.productId || isDeleting) return;

    const response = await deleteProductQRMutation.mutateAsync(
      initialProduct.productId,
    );

    if (response.success) {
      setProductToDelete(null);
      navigate(PATHS.QR_PRODUCT_GENERATOR);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const normalizedContent = rawContent.trim();

    if (!normalizedContent || isEditorContentEmpty(normalizedContent)) {
      toast.warning("Thiếu nội dung", "Vui lòng nhập nội dung trước khi lưu.");
      return;
    }

    if (isEditMode && initialProduct) {
      const response = await updateProductQRMutation.mutateAsync({
        productId: initialProduct.productId,
        data: {
          rawContent: normalizedContent,
          images: productImages.flatMap((image) =>
            image.file ? [image.file] : [],
          ),
          note: initialProduct.note ?? null,
        },
      });

      if (response.success) {
        setSuccessModalHelperText(
          "Đây là mã QR và link preview sản phẩm sau khi cập nhật. Bạn có thể quét mã hoặc mở trực tiếp đường dẫn bên dưới.",
        );
        setCreatedProduct({
          ...initialProduct,
          rawContent: normalizedContent,
          imageUrl:
            response.data?.imageUrl ||
            productImages.map((image) => image.previewUrl),
          qrImage: response.data?.qrImage || initialProduct.qrImage,
          linkUrl: response.data?.linkUrl || initialProduct.linkUrl,
          jsonContent: response.data?.jsonContent || initialProduct.jsonContent,
          updatedAt: response.data?.updatedAt || initialProduct.updatedAt,
          note: initialProduct.note ?? null,
        });
      }
      return;
    }

    const response = await createProductQRMutation.mutateAsync({
      rawContent: normalizedContent,
      images: productImages.flatMap((image) =>
        image.file ? [image.file] : [],
      ),
      note: null,
    });

    if (response.success && response.data) {
      setSuccessModalHelperText(
        "Đây là mã QR và link preview sản phẩm vừa được tạo. Bạn có thể quét mã hoặc mở trực tiếp đường dẫn bên dưới.",
      );
      setCreatedProduct(response.data);
    }
  };

  const productTitle =
    initialProduct?.jsonContent?.productName?.trim() ||
    initialProduct?.productId ||
    "";

  const openCurrentQrModal = () => {
    if (!initialProduct) return;

    setSuccessModalHelperText(
      "Đây là mã QR và link preview sản phẩm sau khi cập nhật. Bạn có thể quét mã hoặc mở trực tiếp đường dẫn bên dưới.",
    );
    setCreatedProduct(initialProduct);
  };

  return (
    <main className="qr-generator-page dashboard-theme min-h-screen bg-[#f6f1e8] text-[#111111] transition-colors dark:bg-[#050505] dark:text-white">
      {!isHistoryOpen ? (
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#111111] shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition duration-250 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-95 dark:border-white/10 dark:bg-white dark:text-black dark:shadow-[0_14px_34px_rgba(0,0,0,0.34)] dark:hover:shadow-[0_18px_44px_rgba(0,0,0,0.42)]"
          aria-label="Mở lịch sử QR sản phẩm"
        >
          <FiClock />
        </button>
      ) : null}

      <div
        className={`mx-auto w-full max-w-5xl px-5 py-6 transition-all duration-300 md:px-8 lg:px-10 ${
          isHistoryOpen ? "lg:max-w-4xl lg:-translate-x-48" : ""
        }`}
      >
        <div className="flex min-w-0 flex-col">
          <header className="relative border-b border-black/10 pb-6 dark:border-white/10">
            <Link
              to={PATHS.HOME}
              className="group mb-5 inline-flex w-fit items-center gap-2 text-xs font-medium text-black/55 transition duration-200 ease-out hover:text-[#111111] dark:text-white/55 dark:hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] transition duration-200 ease-out group-hover:-translate-x-0.5 group-hover:bg-black/[0.08] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.1]">
                <FiArrowLeft />
              </span>
              <span>Quay về Hub</span>
            </Link>
            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
            <h1 className="text-center text-2xl font-medium text-[#111111] md:text-3xl dark:text-white">
              {isEditMode
                ? productTitle || "Chỉnh sửa QR sản phẩm"
                : "Hệ thống soạn nội dung QR sản phẩm - Picare Việt Nam"}
            </h1>
            {isEditMode && initialProduct ? (
              <p className="mt-3 text-center text-xs text-black/48 dark:text-white/35">
                ID: {initialProduct.productId}
              </p>
            ) : null}
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col"
          >
            <section className="border-b border-black/10 py-6 dark:border-white/10">
              <div className="mx-auto w-full max-w-[720px]">
                <ProductImagesUploadField
                  id="product-qr-image"
                  images={productImages}
                  onAddFiles={handleAddImages}
                  onRemoveImage={handleRemoveImage}
                  disabled={isSubmitting || isDeleting}
                />
              </div>

              {isEditMode && initialProduct ? (
                <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-black/48 dark:text-white/35">
                  <span>
                    Tạo lúc:{" "}
                    {new Date(initialProduct.createdAt).toLocaleString("vi-VN")}
                  </span>
                  <span>
                    Cập nhật:{" "}
                    {new Date(initialProduct.updatedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              ) : null}
            </section>

            <section className="border-b border-black/10 py-6 dark:border-white/10">
              <div className="qr-editor-skin overflow-hidden border border-black/12 bg-white dark:border-white/10 dark:bg-[#050505]">
                <SimpleEditor
                  key={initialProduct?.productId ?? "product-qr-create"}
                  content={getInitialEditorContent(initialProduct)}
                  placeholder="Nhập nội dung sản phẩm, hướng dẫn sử dụng, thành phần, thông tin bảo hành..."
                  showThemeToggle={false}
                  wrapperClassName="qr-editor-shell"
                  contentClassName="qr-editor-content"
                  editorClassName="qr-editor-canvas"
                  onChange={({ html }) => setRawContent(html)}
                />
              </div>
            </section>

            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                {isEditMode ? (
                  <button
                    type="button"
                    onClick={() => setProductToDelete(initialProduct ?? null)}
                    disabled={isDeleting || isSubmitting}
                    className="inline-flex h-12 min-w-56 items-center justify-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-6 text-sm font-medium text-red-200 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-red-500/18 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45"
                  >
                    {isDeleting ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <FiTrash2 />
                    )}
                    Xóa
                  </button>
                ) : null}

                {isEditMode && initialProduct ? (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        getProductPreviewPath(initialProduct.productId),
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    disabled={isDeleting || isSubmitting}
                    className="inline-flex h-12 min-w-56 items-center justify-center rounded-full bg-black/[0.08] px-6 text-sm font-medium text-black/84 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-black/[0.12] hover:text-[#111111] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 dark:bg-white/[0.07] dark:text-white/80 dark:hover:bg-white/[0.11] dark:hover:text-white"
                  >
                    Preview
                  </button>
                ) : null}

                {isEditMode && initialProduct && showQrButton ? (
                  <button
                    type="button"
                    onClick={openCurrentQrModal}
                    className="inline-flex h-12 min-w-56 items-center justify-center rounded-full bg-black/[0.07] px-6 text-sm font-medium text-black/80 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-black/[0.11] hover:text-[#111111] active:translate-y-0 active:scale-[0.98] dark:bg-white/[0.07] dark:text-white/80 dark:hover:bg-white/[0.11] dark:hover:text-white"
                  >
                    Xem QR
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isDeleting}
                  className="group relative inline-flex h-12 min-w-56 items-center justify-center overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_16px_45px_rgba(0,0,0,0.38)] transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_22px_60px_rgba(0,0,0,0.46)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:bg-white/45 disabled:text-black/50 disabled:shadow-none"
                >
                  <span className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-black/25 to-transparent opacity-50" />
                  <span className="flex items-center justify-center gap-2.5">
                    {isSubmitting ? <Spinner size="sm" color="black" /> : null}
                    {isEditMode ? "Lưu thay đổi" : "Tạo"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ProductQRHistoryPanel
        activeProductId={initialProduct?.productId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {createdProduct ? (
        <CreatedProductQRModal
          product={createdProduct}
          helperText={successModalHelperText}
          onClose={() => {
            setCreatedProduct(null);
            setSuccessModalHelperText("");
          }}
        />
      ) : null}

      <DeleteProductQRModal
        product={productToDelete}
        isDeleting={isDeleting}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}

export default function QRProductGeneratorPage() {
  return <QRProductFormPage />;
}
