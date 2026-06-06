import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { PATHS } from "@/config/paths";
import { useCreateProductQR } from "@/hooks/data/useProductQRHooks";
import { toast } from "@/hooks/useToast";

import "./qr-product-generator-page.scss";

const editorContent: JSONContent = {
  type: "doc",
  content: [],
};

function isEditorContentEmpty(content: string) {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  return !plainText;
}

export default function QRProductGeneratorPage() {
  const createProductQRMutation = useCreateProductQR();
  const [rawContent, setRawContent] = useState("");

  const handleCreate = async () => {
    const normalizedContent = rawContent.trim();

    if (!normalizedContent || isEditorContentEmpty(normalizedContent)) {
      toast.warning("Thiếu nội dung", "Vui lòng nhập nội dung trước khi tạo.");
      return;
    }

    const response = await createProductQRMutation.mutateAsync({
      rawContent: normalizedContent,
      note: null,
    });

    if (!response.success) {
      return;
    }
  };

  return (
    <main className="qr-generator-page dashboard-theme min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-5xl px-5 py-6 transition-all duration-300 md:px-8 lg:px-10">
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
              Hệ thống soạn nội dung QR sản phẩm - Picare Việt Nam
            </h1>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col"
          >
            <section className="border-b border-white/10 py-6">
              <div className="qr-editor-skin overflow-hidden border border-white/10 bg-[#080809]">
                <SimpleEditor
                  content={editorContent}
                  showThemeToggle={false}
                  wrapperClassName="qr-editor-shell"
                  contentClassName="qr-editor-content"
                  editorClassName="qr-editor-canvas"
                  onChange={({ html }) => setRawContent(html)}
                />
              </div>
            </section>

            <div className="flex flex-col items-center gap-3 py-6">
              <button
                type="button"
                onClick={handleCreate}
                disabled={createProductQRMutation.isPending}
                className="group relative inline-flex h-12 min-w-56 items-center justify-center overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_16px_45px_rgba(0,0,0,0.38)] transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_22px_60px_rgba(0,0,0,0.46)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:bg-white/45 disabled:text-black/50 disabled:shadow-none"
              >
                <span className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-black/25 to-transparent opacity-50" />
                <span className="flex items-center justify-center gap-2.5">
                  {createProductQRMutation.isPending ? (
                    <Spinner size="sm" color="black" />
                  ) : null}
                  Tạo
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
