import type { ChangeEvent, DragEvent, RefObject, ReactNode } from "react";
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

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-[11px] font-medium tracking-[0.18em] text-white/38 uppercase">
      {children}
    </label>
  );
}

function ProductImageUploadField({
  id,
  value,
  fileName,
  onSelectFile,
  onClear,
  disabled,
}: {
  id: string;
  value: string;
  fileName?: string | null;
  onSelectFile: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [errorSrc, setErrorSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage = !!value && errorSrc !== value;

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onSelectFile(file);
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

    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onSelectFile(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative min-h-[320px] overflow-hidden border transition-all duration-200 ${
          hasImage
            ? "border-white/10 bg-white/[0.02]"
            : "border-dashed border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        } ${isDragging ? "border-white/30 bg-white/[0.05]" : ""}`}
      >
        {hasImage ? (
          <>
            <img
              src={value}
              alt="Hình ảnh sản phẩm"
              className="h-full w-full object-contain p-5"
              onError={() => setErrorSrc(value)}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/72 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="flex items-center gap-1.5 border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiUpload className="text-xs" />
                Đổi ảnh
              </button>
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="flex items-center gap-1.5 border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiX className="text-xs" />
                Bỏ thay đổi
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="flex h-full w-full flex-col items-center justify-center px-8 py-10 text-center text-white/28 transition-colors hover:text-white/48 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <FiImage className="text-3xl" />
            </span>
            <span className="text-sm font-medium text-white/82">
              Kéo thả ảnh sản phẩm vào đây
            </span>
            <span className="mt-2 max-w-sm text-xs leading-6 text-white/38">
              Hoặc bấm để chọn file từ máy. Ảnh sẽ được gửi cùng nội dung QR
              dưới dạng multipart khi lưu.
            </span>
            <span className="mt-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/72 transition hover:bg-white/[0.08]">
              <FiUpload className="text-xs" />
              Chọn ảnh sản phẩm
            </span>
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-white/35">
        <span className="truncate">
          {fileName
            ? `Đã chọn: ${fileName}`
            : "Hỗ trợ kéo thả hoặc chọn trực tiếp một ảnh sản phẩm"}
        </span>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="shrink-0 text-white/55 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {hasImage ? "Chọn ảnh khác" : "Chọn ảnh"}
        </button>
      </div>
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

function CreatedProductQRModal({
  product,
  onClose,
}: {
  product: ProductQR;
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
            className="dashboard-theme relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]"
          >
            <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Xóa QR sản phẩm
              </h2>

              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <FiAlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Bạn có chắc chắn muốn xóa QR sản phẩm này?
                </p>
                <p className="mt-2 break-all text-sm text-gray-500 dark:text-gray-400">
                  QR của{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {product.jsonContent.productName || product.productId}
                  </span>{" "}
                  sẽ bị xóa vĩnh viễn và hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={onConfirm}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50 dark:bg-red-600 dark:shadow-red-500/10 dark:hover:bg-red-500"
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
}: {
  mode?: QRProductFormMode;
  initialProduct?: ProductQR;
}) {
  const navigate = useNavigate();
  const createProductQRMutation = useCreateProductQR();
  const updateProductQRMutation = useUpdateProductQR();
  const deleteProductQRMutation = useDeleteProductQR();

  const imageObjectUrlRef = useRef<string | null>(null);

  const [rawContent, setRawContent] = useState(
    initialProduct?.rawContent ?? "",
  );
  const [productImage, setProductImage] = useState(
    initialProduct?.imageUrl ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<ProductQR | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductQR | null>(null);

  const isEditMode = mode === "edit";
  const isSubmitting = isEditMode
    ? updateProductQRMutation.isPending
    : createProductQRMutation.isPending;
  const isDeleting = deleteProductQRMutation.isPending;

  const revokeObjectUrl = (ref: RefObject<string | null>) => {
    if (!ref.current) return;
    URL.revokeObjectURL(ref.current);
    ref.current = null;
  };

  useEffect(() => {
    if (!initialProduct) return;

    revokeObjectUrl(imageObjectUrlRef);
    setRawContent(initialProduct.rawContent ?? "");
    setProductImage(initialProduct.imageUrl ?? "");
    setImageFile(null);
  }, [initialProduct]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(imageObjectUrlRef);
    };
  }, []);

  const handleSelectImage = (file: File) => {
    revokeObjectUrl(imageObjectUrlRef);
    imageObjectUrlRef.current = URL.createObjectURL(file);
    setImageFile(file);
    setProductImage(imageObjectUrlRef.current);
  };

  const handleClearImage = () => {
    revokeObjectUrl(imageObjectUrlRef);
    setImageFile(null);
    setProductImage(initialProduct?.imageUrl ?? "");
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
      await updateProductQRMutation.mutateAsync({
        productId: initialProduct.productId,
        data: {
          rawContent: normalizedContent,
          image: imageFile,
          note: initialProduct.note ?? null,
        },
      });
      return;
    }

    const response = await createProductQRMutation.mutateAsync({
      rawContent: normalizedContent,
      image: imageFile,
      note: null,
    });

    if (response.success && response.data) {
      setCreatedProduct(response.data);
    }
  };

  const productTitle =
    initialProduct?.jsonContent?.productName?.trim() ||
    initialProduct?.productId ||
    "";

  return (
    <main className="qr-generator-page dashboard-theme min-h-screen bg-[#050505] text-white">
      {!isHistoryOpen ? (
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-[0_14px_34px_rgba(0,0,0,0.34)] transition duration-250 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.42)] active:translate-y-0 active:scale-95"
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
          <header className="border-b border-white/10 pb-6">
            <Link
              to={PATHS.LOGIN}
              className="group mb-5 inline-flex w-fit items-center gap-2 text-xs font-medium text-white/55 transition duration-200 ease-out hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] transition duration-200 ease-out group-hover:-translate-x-0.5 group-hover:bg-white/[0.1]">
                <FiArrowLeft />
              </span>
              <span>Quay về Hub</span>
            </Link>
            <h1 className="text-center text-2xl font-medium text-white md:text-3xl">
              {isEditMode
                ? productTitle || "Chỉnh sửa QR sản phẩm"
                : "Hệ thống soạn nội dung QR sản phẩm - Picare Việt Nam"}
            </h1>
            {isEditMode && initialProduct ? (
              <p className="mt-3 text-center text-xs text-white/35">
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
            <section className="border-b border-white/10 py-6">
              <div className="mx-auto w-full max-w-[720px]">
                <ProductImageUploadField
                  id="product-qr-image"
                  value={productImage}
                  fileName={imageFile?.name}
                  onSelectFile={handleSelectImage}
                  onClear={handleClearImage}
                  disabled={isSubmitting || isDeleting}
                />
              </div>

              {isEditMode && initialProduct ? (
                <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-white/35">
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

            <section className="border-b border-white/10 py-6">
              <div className="qr-editor-skin overflow-hidden border border-white/10 bg-[#050505]">
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
          onClose={() => setCreatedProduct(null)}
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
