import { useDeferredValue, useState } from "react";
import type { ProductQR } from "@/types/QRProduct";
import { motion } from "framer-motion";
import {
  FiChevronRight,
  FiClock,
  FiFileText,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { formatDateTime } from "@/common/format";
import { PATHS } from "@/config/paths";
import { useProductQRList } from "@/hooks/data/useProductQRHooks";

function getProductEditPath(productId: string) {
  return PATHS.QR_PRODUCT_EDIT.replace(":productId", productId);
}

function stripHtmlContent(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ProductQRHistoryPanel({
  activeProductId,
  isOpen,
  onClose,
}: {
  activeProductId?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const {
    data,
    isLoading,
    isError,
  } = useProductQRList({
    page: 1,
    limit: 20,
    search: deferredSearch,
  });
  const products = data ?? [];

  return (
    <motion.aside
      initial={false}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 360, damping: 34 }}
      className="fixed top-0 right-0 z-40 flex h-screen w-[min(410px,calc(100vw-2.5rem))] flex-col border-l border-white/10 bg-[#050505] text-white shadow-[-24px_0_60px_rgba(0,0,0,0.35)]"
      aria-hidden={!isOpen}
    >
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/60">
            <FiClock />
          </span>
          <div>
            <h2 className="text-sm font-medium text-white">
              Lịch sử QR sản phẩm
            </h2>
            <p className="mt-1 text-xs text-white/40">
              Tìm nhanh và mở lại bản đã tạo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/45 transition hover:border-white/25 hover:text-white"
          aria-label="Đóng lịch sử QR sản phẩm"
        >
          <FiX />
        </button>
      </div>

      <div className="shrink-0 border-b border-white/10 p-4">
        <label className="flex h-9 items-center gap-3 border border-white/10 bg-white/[0.03] px-4 text-white/60 transition focus-within:border-white/20 focus-within:text-white">
          <FiSearch className="shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên sản phẩm"
            className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/25"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-5 py-8 text-sm text-white/40">
            Đang tải danh sách QR sản phẩm...
          </div>
        ) : null}

        {isError ? (
          <div className="px-5 py-8 text-sm text-red-200/80">
            Không thể tải danh sách QR sản phẩm.
          </div>
        ) : null}

        {!isLoading && !isError && products.length === 0 ? (
          <div className="px-5 py-8 text-sm text-white/35">
            {deferredSearch
              ? "Không tìm thấy sản phẩm phù hợp."
              : "Chưa có QR sản phẩm nào."}
          </div>
        ) : null}

        <div>
          {products.map((product) => {
            const active = activeProductId === product.productId;
            const productName =
              product.jsonContent?.productName?.trim() ||
              "Chưa có tên sản phẩm";
            const summary =
              stripHtmlContent(product.rawContent) ||
              "Chưa có nội dung hiển thị";

            return (
              <button
                key={product.productId}
                type="button"
                onClick={() => navigate(getProductEditPath(product.productId))}
                className={`group w-full border-b px-5 py-4 text-left transition ${
                  active
                    ? "border-white/15 bg-white/6"
                    : "border-white/10 hover:bg-white/[0.035]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                      active
                        ? "border-white/35 text-white"
                        : "border-white/10 text-white/45"
                    }`}
                  >
                    <FiFileText />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {productName}
                        </p>
                        <p className="mt-1 text-[11px] text-white/35">
                          ID: {product.productId}
                        </p>
                      </div>
                      <FiChevronRight className="mt-0.5 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" />
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/45">
                      {summary}
                    </p>

                    <p className="mt-3 text-[11px] text-white/35">
                      Cập nhật: {formatDateTime(product.updatedAt)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => navigate(PATHS.QR_PRODUCT_GENERATOR)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white/95 active:translate-y-0 active:scale-[0.98]"
        >
          <FiPlus />
          Tạo QR mới
        </button>
      </div>
    </motion.aside>
  );
}
