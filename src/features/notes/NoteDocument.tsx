import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "./code-highlight.css";

interface NoteDocumentProps {
  content: string;
}

export function NoteDocument({ content }: NoteDocumentProps) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
