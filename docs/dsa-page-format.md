# DSA Example Page Format

Requirements for DSA (Data Structures & Algorithms) example pages, based on the Depth-First Search (DFS) reference page. Use this as context when creating new examples from the DSA document.

---

## Page structure (top to bottom)

1. **Exercise header** (no accordion)
2. **Key points** (native accordion)
3. **How it works** (native accordion)
4. **Code Samples** (native accordion)
5. **Complexity** (native accordion)
6. **Live Demo** (native accordion)
7. **Problems** (native accordion)

Section spacing: use **`mb-2`** between sections (tight spacing).

---

## 1. Exercise header

- **Exercise badge:** Small label with Zap icon + "Exercise NN" (e.g. "Exercise 04"), `text-sm text-primary font-medium`.
- **Title:** Single `h2`, large and bold (e.g. `text-4xl font-bold`), topic name (e.g. "Depth-First Search (DFS)").
- **Intro paragraph:** One short paragraph, `text-lg text-muted-foreground max-w-2xl`, summarizing the topic and why it matters.
- **Layout:** Optional two-column on larger screens: left = badge + title + intro; right = small **header visual** (e.g. compact complexity chart, no legend). Use `flex flex-col sm:flex-row sm:items-start gap-6`, left column `flex-1 min-w-0`, right column `shrink-0`.

---

## 2. Key points (native accordion)

- **Summary line:** ChevronRight (rotates 90° when open) + **Lightbulb** icon + title "Key points" or "Key points & why [topic] matters".
- **Content:** Bullet list of 3–5 short points; optional closing paragraph on why the topic matters (e.g. interview relevance).
- **Accordion:** Native `<details>` / `<summary>`, border, muted background, `[&::-webkit-details-marker]:hidden`, `list-none` on summary.

---

## 3. How it works (native accordion)

- **Summary line:** ChevronRight + **BookOpen** icon + "How it works".
- **Content:** Grid of **step cards** (e.g. 2×2): numbered circle (1–4), title, short description. Use `bg-card border border-border rounded-lg p-5` per card.
- **Accordion:** Same native pattern as Key points.

---

## 4. Code Samples (native accordion)

- **Summary line:** ChevronRight + **Code2** icon + "Code Samples".
- **Content:** One or more **code blocks**, each with:
  - **Subheading:** e.g. "Recursive DFS (pre-order, tree)" as `h4 text-lg font-semibold mb-3`.
  - **Code block:** Window chrome (three dots) + filename in `bg-code` bar; `<pre>`/`<code>` with syntax-style spans: `text-code-keyword`, `text-code-foreground`, `text-code-tag`, `text-code-string`, `text-code-comment`.
  - Optional short note under a block (e.g. stack order).
- **Accordion:** Same native pattern; content area `space-y-8 pt-4` when multiple blocks.

---

## 5. Complexity (native accordion)

- **Summary line:** ChevronRight + **BarChart2** icon + "Complexity".
- **Content (in order):**
  - Short intro paragraph (e.g. how this algorithm compares to common complexities).
  - **Optional:** D3 (or other) chart showing time/space vs. O(1), O(log n), O(n), etc., with algorithm’s time and space highlighted; legend on full-size chart.
  - **Sub-accordions** for **Time** and **Space:** each is a `<details>` with **Plus/Minus** icons (not chevron). Use **named groups** (e.g. `group/time`, `group/space`) so icons reflect that details’ open state: Plus when closed, Minus when open (`group-open/time:hidden` on Plus, `hidden group-open/time:inline` on Minus). Summary = one-line complexity (e.g. "Time: O(V+E)…"); content = short explanation paragraph.
- **Accordion:** Same native pattern for outer section.

---

## 6. Live Demo (native accordion)

- **Summary line:** ChevronRight + **GitBranch** icon + "Live Demo".
- **Content:** Short description paragraph, then the **demo component** (e.g. from `src/features/<topic>/`). Prefer reusable feature components so the same demo can be used elsewhere.
- **Accordion:** Same native pattern.

---

## 7. Problems (native accordion)

- **Summary line:** ChevronRight + **ListChecks** icon + "Problems".
- **Content:**
  - **LeetCode links:** Subheading "LeetCode links"; one main link to the topic’s problem list (or tag) with ExternalLink icon; short caption.
  - **Key examples:** Subheading "Key LeetCode examples"; list of 4–6 problems: each item = link (title + ExternalLink) + short tag (e.g. "— 2D grid traversal"). Use `target="_blank"` and `rel="noopener noreferrer"`.
- **Accordion:** Same native pattern; content `pt-4 space-y-6`.

---

## Native accordion rules (all sections)

- Use **`<details>`** and **`<summary>`** (no JS for open/close).
- **Summary:** `flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden`.
- **Chevron:** `<ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />` on the parent `<details className="group ...">`.
- **Icon:** One semantic icon per section (Lightbulb, BookOpen, Code2, BarChart2, GitBranch, ListChecks), same size (`w-5 h-5`), `text-primary`, `aria-hidden`.
- **Content wrapper:** `px-4 pb-4 pt-0 border-t border-border`; add `pt-4` for first content block.
- **Nested accordions** (e.g. Time/Space inside Complexity): use **named groups** (`group/time`, `group/space`) and **Plus/Minus** icons so the correct details controls its icon.

---

## Shared / feature components

- Move **live-demo UI and logic** into `src/features/<topic>/` (e.g. `depthFirstSearch/DfsPreOrderDemo.tsx`). Export the component (and any shared types) from an `index.ts`. Use the feature component inside the Live Demo accordion.
- Keep page-level code (charts, code-sample text, copy) in the page; keep interactive demo state and algorithm logic in the feature.

---

## Reference

- **Example page:** `src/pages/DepthFirstSearch.tsx`
- **Example feature:** `src/features/depthFirstSearch/` (DfsPreOrderDemo, TreeNode)
- **DSA content:** `docs/dsa.md`; **ToC for picking topics:** `docs/dsa-toc.md`
