# Security and Usability

## Non-functional interactive elements

AI-generated UI often "looks done" while the wiring underneath is incomplete —
buttons with empty `onClick` handlers, links that point to the wrong route or a
404. It renders without error, so it's easy to miss in review.

**Example — a button that renders correctly but does nothing:**

```tsx
function AddToCartButton() {
  return <button onClick={() => {}}>Add to cart</button>;
}
```
*❌ AI-generated — renders fine, silently does nothing*

```tsx
function AddToCartButton({ onAdd }: { onAdd: () => void }) {
  return <button onClick={onAdd}>Add to cart</button>;
}
```
*✅ Wired to the actual handler*

One reported case had **8 buttons** across an app that literally did nothing —
each one a plausible-looking dead end.

## Non-semantic, query-param-based routing

AI tends to reach for query parameters to carry state instead of proper routes,
which hurts discoverability, shareability, and SEO.

```tsx
navigate(`/products?id=${productId}`);
```
*❌ AI-generated — state lives in a query param, not a route*

```tsx
navigate(`/products/${productId}`);
```
*✅ A semantic, indexable route*

Switching from query-param to path-based routing in one reported case increased
organic search traffic **40% within two months** — a real cost of shipping the
"it works" version.

## Design inconsistencies

Colors, fonts, and spacing drift from whatever design spec exists, because AI
fills gaps with plausible-looking defaults instead of reading a design system —
the same failure mode as the [architectural drift](/notes/code-quality-and-maintainability#architectural-design)
covered in `Code Quality and Maintainability.md`, applied to visual design
instead of code structure.

## Accessibility and standards

- **Email templates.** AI defaults to modern div-based flexbox/grid layouts,
  which break in Outlook and other clients that still need table-based layouts.
- **Meta tags.** Wrong or missing Open Graph tags — incorrect site name, no
  preview image — quietly breaks social sharing and SEO.
- **CSS units.** Inconsistent mixing of `px` with relative units (`rem`, `em`,
  `%`). Beyond visual inconsistency, this is an accessibility issue directly —
  a user who increases their browser's base font size sees no change in text
  set with a fixed `px` value.

```tsx
<p style={{ fontSize: "14px" }}>Body copy</p>
```
*❌ Fixed px — ignores the user's font-size preference*

```tsx
<p className="text-sm">Body copy</p> {/* text-sm = 0.875rem */}
```
*✅ Relative to the root font size — respects browser zoom/accessibility settings*

## The security gap

The source article this folder is based on has **no security section at all**
— no XSS, no exposed secrets, no injection, no auth review. That's worth
naming explicitly rather than leaving this doc looking complete: AI-generated
frontend code is just as capable of shipping `dangerouslySetInnerHTML` with
unsanitized input, a hardcoded API key, or a route with no auth check as it is
of shipping a dead button — those failure modes just aren't covered by this
particular source. Treat this doc's silence on security as "not evaluated,"
not "not a problem."
