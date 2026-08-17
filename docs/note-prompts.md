# Prompts for adding notes


## Starting a fresh session on this folder

This folder and its companion feature (`/attention-limits`) grew over a long
conversation — which is a little on-the-nose, since [`docs/llm-attention-limits.md`](../../llm-attention-limits.md)
is literally about how a single long session degrades. The fix documented
there is [the repetition hack](../../llm-attention-limits.md#the-repetition-hack):
repeat the instructions fresh rather than trusting a diluted context window to
still be attending to them. In practice, that means starting a **new session**
with the prompt below instead of continuing an old one indefinitely.

```
This repo tracks React/AI-generated-code flaws in docs/react/ai-flaws/,
sourced from real articles (never fabricated) — one .md file per category,
e.g. "Code Quality and Maintainability.md", "Performance and Reliability.md",
"Security and Usability.md". When asked to fill in or update one:
1. Fetch the actual source article (see the Source link in index.md) and
   pull real content — if it doesn't cover something (e.g. security), say so
   explicitly rather than inventing bullet points.
2. Match the existing format: a heading per issue, a short paragraph, then
   worked examples as TWO SEPARATE code blocks (❌ bad, ✅ good) each followed
   by an italic caption below it — not inline `// ❌`/`// ✅` comments in one
   block, and not a caption above the code.
3. These docs are also rendered as app pages via src/features/notes/
   (NoteDocument + TableOfContents) and listed in the Notes popover menu
   (src/pages/Index.tsx `notes` array) — if you add a new doc file, wire up
   a matching src/pages/*Note.tsx + route in App.tsx + Notes menu entry too.
4. Cross-references between docs should be real links to
   /notes/<slug>#<heading-slug>, not just backticked filenames.

Separately, docs/llm-attention-limits.md's glossary is illustrated at
/attention-limits (src/features/attentionLimits/) — one card + one small SVG
chart per concept. If asked to add/adjust an illustration: load the dataviz
skill first, match the existing chart style (inline SVG, Tailwind's
fill-primary/stroke-border/text-code-* tokens, a legend-free single-hue line
or the "emphasis" bar pattern, always-visible data-point dots — not
hover-only, they're hard to find — a hover tooltip, a collapsible "View chart
data" table, and an italic "illustrative, not real data" caption).

Whatever you change, verify it for real before calling it done: run the dev
server, drive it with a throwaway Playwright script (chromium-cli isn't
installed here — copy a small script into the repo root so node resolves the
local @playwright/test, screenshot, then delete the script/screenshots and
kill the dev server), and actually look at the screenshot.

Three gotchas already paid for in this repo, don't re-discover them:
- CSS margin collapsing: adjacent block margins collapse to the larger one,
  not the sum — tightening a paragraph's margin-top does nothing if the
  preceding element's margin-bottom is still larger. Shrink both sides.
- @tailwindcss/typography's `DEFAULT`, `sm`, and `base` are independent style
  trees. NoteDocument uses `prose prose-sm sm:prose-base` — a typography
  override only under `DEFAULT` silently doesn't apply; add it to `sm` and
  `base` too.
- SPA fragment links (`/notes/x#heading`) land at the top of the page, not
  the heading, because the browser tries to scroll-to-hash before React has
  rendered it. NoteDocument already handles this (scrolls on `location.hash`
  once content/fonts are ready) — new note-rendering surfaces need the same.
```
