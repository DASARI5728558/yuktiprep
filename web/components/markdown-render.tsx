"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRenderProps {
  content: string;
  className?: string;
}

export const MarkdownRender: React.FC<MarkdownRenderProps> = ({
  content,
  className = "",
}) => {
  return (
    <div
      className={`markdown-content prose prose-sm max-w-none text-[#1D2B45] leading-relaxed 
        prose-headings:text-[#172E55] prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base 
        prose-p:my-2 prose-p:leading-relaxed
        prose-strong:text-[#172E55] prose-strong:font-semibold
        prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
        prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
        prose-li:my-0.5
        prose-blockquote:border-l-4 prose-blockquote:border-[#17898A] prose-blockquote:bg-[#E9F7F7]/60 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-blockquote:italic
        prose-pre:bg-[#1E293B] prose-pre:text-neutral-100 prose-pre:p-3.5 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:my-3
        prose-code:text-[#17898A] prose-code:bg-[#E9F7F7] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-xs
        prose-table:w-full prose-table:border-collapse prose-table:my-3 prose-table:text-xs md:prose-table:text-sm
        prose-th:border prose-th:border-neutral-200 prose-th:bg-[#E9F7F7] prose-th:text-[#172E55] prose-th:p-2.5 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-neutral-200 prose-td:p-2.5 prose-td:text-[#334155]
        prose-hr:my-4 prose-hr:border-[#E1E5EA]
        ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-neutral-200 shadow-xs">
              <table className="w-full border-collapse text-left text-xs md:text-sm" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border-b border-neutral-200 bg-[#E9F7F7] px-3 py-2.5 text-xs font-semibold text-[#172E55]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border-b border-neutral-100 px-3 py-2 text-xs md:text-sm text-neutral-700" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="overflow-x-auto rounded-xl bg-[#1E293B] p-4 text-xs md:text-sm font-mono text-neutral-100 shadow-xs my-3" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="rounded bg-[#E9F7F7] px-1.5 py-0.5 font-mono text-xs font-medium text-[#17898A]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRender;
