import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { TableOfContents } from "./TableOfContents";
import "./code-highlight.css";

interface NoteDocumentProps {
  content: string;
}

export function NoteDocument({ content }: NoteDocumentProps) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const scrollToHash = () => document.getElementById(hash.slice(1))?.scrollIntoView();
    document.fonts.ready.then(scrollToHash);
  }, [hash, content]);

  return (
    <div className="prose prose-sm sm:prose-base max-w-none">
      <TableOfContents content={content} />
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
