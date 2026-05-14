/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatResponseMarkdownProps = {
  content: string;
};

export default function ChatResponseMarkdown({
  content,
}: ChatResponseMarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // paragraph
          p: ({ ...props }) => <p className="text-white/90" {...props} />,

          // heading
          h1: ({ ...props }) => (
            <h1 className="mb-3 text-lg font-semibold" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="mb-3 text-base font-semibold" {...props} />
          ),

          // list
          ul: ({ ...props }) => (
            <ul className="mb-3 list-disc pl-5 text-white/85" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="mb-3 list-decimal pl-5 text-white/85" {...props} />
          ),

          // inline and block code
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-black/40 p-4 text-xs">
              {children}
            </pre>
          ),
          code: ({ className, children }) => {
            const isInline = !className;

            if (isInline) {
              return (
                <code className="rounded bg-white/10 px-1 py-0.5 text-xs">
                  {children}
                </code>
              );
            }

            return <code className="text-white/90">{children}</code>;
          },

          // blockquote
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="mb-3 border-l-2 border-white/20 pl-4 text-white/70"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
