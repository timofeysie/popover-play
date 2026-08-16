import GithubSlugger from "github-slugger";

interface TableOfContentsProps {
  content: string;
}

interface HeadingEntry {
  slug: string;
  text: string;
}

function extractHeadings(content: string): HeadingEntry[] {
  const slugger = new GithubSlugger();
  const headings: HeadingEntry[] = [];
  for (const line of content.split("\n")) {
    const match = /^##\s+(.+)$/.exec(line.trim());
    if (match) {
      const text = match[1].trim();
      headings.push({ slug: slugger.slug(text), text });
    }
  }
  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 rounded-xl border border-border bg-muted/20 p-4 not-prose"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Contents
      </h2>
      <ol className="space-y-1.5 text-sm">
        {headings.map((heading, i) => (
          <li key={heading.slug}>
            <a
              href={`#${heading.slug}`}
              className="text-primary hover:underline"
            >
              {i + 1}. {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
