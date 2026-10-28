import { type FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

import { Spinner } from "@/components/custom_ui/Spinner";
import { useUpdateS3Asset } from "@/hooks/data/useS3Hooks";
import type { S3Asset } from "@/types/S3";

type Props = {
  asset: S3Asset | null;
  onClose: () => void;
  onSuccess?: (asset: S3Asset) => void;
};

export default function EditS3AssetModal({ asset, onClose, onSuccess }: Props) {
  return (
    <AnimatePresence>
      {asset && (
        <EditS3AssetModalContent
          key={asset.assetId}
          asset={asset}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </AnimatePresence>
  );
}

function EditS3AssetModalContent({
  asset,
  onClose,
  onSuccess,
}: {
  asset: S3Asset;
  onClose: () => void;
  onSuccess?: (asset: S3Asset) => void;
}) {
  const mutation = useUpdateS3Asset();
  const [name, setName] = useState(asset.originalName);
  const [visibility, setVisibility] = useState(asset.visibility);
  const [tagText, setTagText] = useState((asset.tags || []).join("\n"));
  const tags = tagText
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const normalizedName = name.trim();
  const duplicateTags =
    new Set(tags.map((tag) => tag.toLowerCase())).size !== tags.length;
  const tagError =
    tags.length > 20
      ? "Tối đa 20 thẻ."
      : tags.some((tag) => tag.length > 50)
        ? "Mỗi thẻ tối đa 50 ký tự."
        : duplicateTags
          ? "Thẻ không được trùng nhau."
          : "";
  const canSubmit =
    normalizedName.length > 0 &&
    normalizedName.length <= 512 &&
    !tagError &&
    !mutation.isPending;

  const handleClose = () => {
    if (!mutation.isPending) onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    mutation.mutate(
      {
        assetId: asset.assetId,
        payload: { originalName: normalizedName, visibility, tags },
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            onSuccess?.({ ...asset, ...response.data });
            onClose();
          }
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        onSubmit={handleSubmit}
        className="dashboard-theme relative flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0b]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
              Chỉnh sửa tệp
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Cập nhật tên, quyền truy cập và thẻ của tệp.
            </p>
          </div>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={handleClose}
            aria-label="Đóng"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
          <div>
            <label
              htmlFor="edit-s3-asset-name"
              className="mb-1.5 block text-[11px] font-semibold text-gray-500 uppercase dark:text-white/40"
            >
              Tên tệp
            </label>
            <input
              id="edit-s3-asset-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={mutation.isPending}
              maxLength={512}
              autoFocus
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 transition-all outline-none hover:border-gray-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-indigo-500/10"
            />
            {!normalizedName && (
              <p className="mt-1.5 text-xs text-red-500">
                Tên tệp không được để trống.
              </p>
            )}
          </div>

          <fieldset disabled={mutation.isPending}>
            <legend className="mb-1.5 text-[11px] font-semibold text-gray-500 uppercase dark:text-white/40">
              Quyền truy cập
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["public", "private"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisibility(value)}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition-all ${
                    visibility === value
                      ? "border-indigo-500/40 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  }`}
                >
                  {value === "public" ? "Công khai" : "Riêng tư"}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="edit-s3-asset-tags"
              className="mb-1.5 block text-[11px] font-semibold text-gray-500 uppercase dark:text-white/40"
            >
              Thẻ
            </label>
            <textarea
              id="edit-s3-asset-tags"
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              disabled={mutation.isPending}
              rows={4}
              placeholder="Mỗi thẻ một dòng hoặc ngăn bằng dấu phẩy"
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-all outline-none placeholder:text-gray-400 hover:border-gray-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:focus:ring-indigo-500/10"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Mỗi thẻ một dòng hoặc cách nhau bằng dấu phẩy. Tối đa 20 thẻ.
            </p>
            {tagError && (
              <p className="mt-1.5 text-xs text-red-500">{tagError}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-300 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Thoát
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 enabled:bg-indigo-600 enabled:hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none dark:enabled:bg-indigo-500 dark:enabled:hover:bg-indigo-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
          >
            {mutation.isPending ? (
              <>
                <Spinner size="sm" /> Đang lưu...
              </>
            ) : (
              <>
                <FiEdit3 size={14} /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
