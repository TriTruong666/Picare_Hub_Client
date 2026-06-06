import type { ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { PATHS } from "@/config/paths";

import "./qr-product-generator-page.scss";

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 text-sm font-medium text-white">{children}</h2>;
}

const editorContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Serum phục hồi Picare Bio Reset" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Landing QR này dùng để giới thiệu nhanh sản phẩm, truyền tải điểm nổi bật và kéo người dùng sang bước đặt hàng hoặc liên hệ tư vấn.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Điểm nhấn chính" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Làm dịu da sau treatment, giảm khô rát và bong tróc.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Công thức dễ tư vấn cho nhà thuốc, clinic và đội sale.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Có thể gắn video hướng dẫn, bảng thành phần và CTA mua hàng.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "CTA đề xuất: " },
        { type: "text", marks: [{ type: "bold" }], text: "Quét để xem chi tiết" },
        { type: "text", text: " hoặc " },
        { type: "text", marks: [{ type: "bold" }], text: "Liên hệ tư vấn ngay" },
        { type: "text", text: "." },
      ],
    },
  ],
};

export default function QRProductGeneratorPage() {
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
              <SectionTitle>Nội dung landing</SectionTitle>

              <div className="qr-editor-skin overflow-hidden border border-white/10 bg-[#080809]">
                <SimpleEditor
                  content={editorContent}
                  showThemeToggle={false}
                  wrapperClassName="qr-editor-shell"
                  contentClassName="qr-editor-content"
                  editorClassName="qr-editor-canvas"
                />
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
