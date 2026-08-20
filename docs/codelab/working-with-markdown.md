# Working with Markdown in the Notes Feature

The Notes menu (`docs/codelab/*.md`, `docs/react/*.md`, etc.) renders plain markdown files as styled web pages. This is the pipeline from `.md` file to what you see on screen.

## Loading: Vite `?raw` imports

Each note has a thin page wrapper under `src/pages/` that imports its markdown file as a raw string, using Vite's built-in `?raw` import suffix:

```tsx
// src/pages/AppVersionNote.tsx
import content from "../../docs/codelab/app-version.md?raw";

export default function AppVersionNote() {
  return <NoteDocument content={content} />;
}
```

`?raw` is native Vite behavior — no plugin required. It inlines the file's contents as a plain string at build time. There's no glob/auto-discovery: adding a note means creating a page wrapper, a route in `src/App.tsx`, and an entry in the `notes` array in `src/pages/Index.tsx` (see `CLAUDE.md`).

## Rendering: react-markdown + remark/rehype plugins

`src/features/notes/NoteDocument.tsx` turns that raw string into React elements with [`react-markdown`](https://github.com/remarkjs/react-markdown), which parses markdown into an AST (via `remark`) and converts it to a HAST/React tree (via `rehype`) rather than dumping in raw HTML:

- `remark-gfm` — GitHub-flavored markdown: tables, task lists, strikethrough, autolinks.
- `rehype-highlight` — syntax highlighting for fenced code blocks (` ```tsx `). It only touches code with a `language-*` class, i.e. fenced blocks with a language tag — plain inline `` `code` `` spans are left untouched as bare `<code>` elements.
- `rehype-slug` — adds `id` attributes to headings so the table of contents (`TableOfContents.tsx`) can link/scroll to them.

Because raw HTML in markdown is stripped by default (no `rehype-raw` is configured), only standard markdown syntax renders — `![alt](src)` for images, not `<img>` tags; `` `code` `` / ` ``` ` for code, not `<code>` tags typed directly into the `.md` file.

## Styling: Tailwind Typography (`prose`)

`NoteDocument` wraps everything in `<div className="prose prose-sm sm:prose-base max-w-none">`. The [`@tailwindcss/typography`](https://github.com/tailwindlabs/tailwindcss-typography) plugin is what turns unstyled `<h2>`, `<p>`, `<code>`, `<table>`, etc. into something readable — react-markdown emits plain semantic HTML with no classes, and `prose` supplies the CSS.

The plugin is themed in `tailwind.config.ts` (`theme.extend.typography.DEFAULT.css`), mapping its `--tw-prose-*` custom properties onto this app's own design tokens (`--foreground`, `--code-bg`, etc. from `src/index.css`) so notes match the rest of the UI instead of using the plugin's defaults:

```ts
"--tw-prose-headings": "hsl(var(--foreground))",
"--tw-prose-code": "hsl(var(--code-foreground))",
code: {
  backgroundColor: "hsl(var(--code-bg))",
  borderRadius: "0.25rem",
  padding: "0.15rem 0.4rem",
  fontWeight: "400",
},
```

Fenced code blocks get further per-token coloring from `rehype-highlight`'s `hljs-*` classes, mapped onto the same tokens in `src/features/notes/code-highlight.css` (imported by `NoteDocument.tsx`) — so a keyword in a code block and `--code-keyword` used elsewhere in the app are the same color.

## Gotcha: inline code inside headings can go invisible

Tailwind Typography ships default rules that make inline `` `code` `` **inside a heading** inherit the heading's own color instead of using `--tw-prose-code`:

```css
.prose :where(h1 code) { color: inherit; }
.prose :where(h2 code) { color: inherit; }
.prose :where(h3 code) { color: inherit; }
.prose :where(h4 code) { color: inherit; }
```

This is normally a sensible default (code inside a heading usually just wants the heading's weight/size, not a jarring color change). But `code` *also* always gets `background-color: hsl(var(--code-bg))` from this project's override, regardless of whether it's in a heading. In this app, `--foreground` (`220 20% 10%`) and `--code-bg` (`220 20% 12%`) are both near-black — so inline code in a heading rendered as near-black text on a near-black background, i.e. invisible ("black on black"). This is exactly what happened with `` ## The gotcha: `export {}` turns the file into a module `` in `docs/codelab/app-version.md`.

The fix, in `tailwind.config.ts`, adds an explicit override that comes after Typography's defaults in the generated stylesheet (same `:where()` specificity, so source order decides the winner):

```ts
"h1 code, h2 code, h3 code, h4 code, h5 code, h6 code": {
  color: "hsl(var(--code-foreground))",
},
```

This forces heading-nested inline code back to the same readable color/background combo used everywhere else, instead of inheriting the heading's near-black text color.

**Takeaway:** if inline code (or any other element) looks broken only in a specific context (inside a heading, inside a link, inside a blockquote, etc.), suspect a Typography plugin context-specific override before assuming the design tokens themselves are wrong — `@tailwindcss/typography` ships many `:where(<context> <element>)` rules like this, and they take precedence over the generic element rule by source order, not by being "more specific" in an obvious way.

## Images

See `public/notes/` for static assets referenced from notes — root-relative paths (`/notes/...`) get rewritten with the correct base path (`import.meta.env.BASE_URL`) by an `img` override in `NoteDocument.tsx`, since this site's base path differs between dev (`/`) and the GitHub Pages production build (`/popover-play/`). Keep image filenames space-free and extensioned (kebab-case), since bare markdown image syntax breaks on spaces in the URL — see `docs/codelab/app-version.md` for a worked example of both the folder convention and that specific gotcha.
