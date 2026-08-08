# M3 — Routing skeleton

**Goal:** make the URL the source of truth for wizard position — real routes for each step, a shared layout, an index redirect, and a guard that turns a store precondition into an actual navigation.

**Files:** `WizardShell.tsx`, `steps/ReviewStep.tsx` (guard only — content lands in M6), `App.tsx`

## Layout-only nested routes

React Router v6 lets a route contribute a layout (via `<Outlet />`) without contributing a URL segment. That's how three of the four `/mccm/*` pages share a progress-indicator shell while a fourth (`/mccm/plan`, the write-up page from before the wizard existed) stays outside it:

```tsx
<Route path="mccm">
  <Route index element={<Navigate to="cargo" replace />} />
  <Route path="plan" element={<MissionControlCargoManifest />} />
  <Route element={<MccmWizardShell />}>
    <Route path="cargo" element={<MccmCargoStep />} />
    <Route path="destination" element={<MccmDestinationStep />} />
    <Route path="review" element={<MccmReviewStep />} />
  </Route>
</Route>
```

The `<Route element={<MccmWizardShell />}>` with no `path` is the layout route — `cargo`, `destination`, and `review` all render inside its `<Outlet />`, but `plan` is a sibling that skips it entirely. `/mccm` itself has no content of its own; `<Navigate to="cargo" replace />` on the index route sends it straight to step one, and `replace` keeps the redirect out of browser history so the back button doesn't get stuck on it.

## The shell: progress indicator + `<Outlet />`

```tsx
const STEPS = [
  { path: "cargo", label: "Cargo Manifest" },
  { path: "destination", label: "Destination & Clearance" },
  { path: "review", label: "Review & Launch" },
] as const;

export function WizardShell() {
  const location = useLocation();
  const activeIndex = STEPS.findIndex((step) => location.pathname.endsWith(`/${step.path}`));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* header + "About this demo" link to /mccm/plan */}
      <ol className="flex items-center gap-2 mb-8">
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = activeIndex !== -1 && index < activeIndex;
          return (
            <li key={step.path} className="flex items-center gap-2 flex-1">
              <div className={/* active / complete / upcoming styles */}>
                <span className="font-mono">{index + 1}</span>
                {step.label}
              </div>
              {index < STEPS.length - 1 && <span aria-hidden="true">→</span>}
            </li>
          );
        })}
      </ol>

      <Outlet />
    </div>
  );
}
```

`activeIndex` is derived entirely from `location.pathname` — there's no local "current step" state to keep in sync with the URL, because the URL *is* the state. Deep-linking straight to `/mccm/destination`, refreshing mid-wizard, or using browser back/forward all "just work" because nothing about step position lives outside the router.

*(A later polish pass added a `motion.div layoutId` shared-element animation to the active-step highlight — nice to know if you're reading the current file and see `motion` imports, but that's cosmetic and came after this milestone, not part of the routing mechanics above.)*

## The guard: a store read that becomes a redirect

`ReviewStep` is still a placeholder at this milestone (its real content lands in M6), but the guard logic was built here because it's a routing concern, not a review-content concern:

```tsx
export function ReviewStep() {
  const hasCargo = useMccmStore((state) => state.lines.length > 0);

  if (!hasCargo) {
    return <Navigate to="/mccm/cargo" replace />;
  }

  return (
    <div className="rounded-xl border border-dashed border-border p-6 md:p-8">
      {/* placeholder content */}
    </div>
  );
}
```

This is the same pattern as the index redirect — `<Navigate>` returned from a component instead of declared on a `<Route>` — but the destination depends on runtime state (the Zustand store from M2) rather than being fixed. Visiting `/mccm/review` directly with an empty manifest bounces you back to `/mccm/cargo` instead of showing an empty review; there's no way to reach the review step except by actually having something to review.

## What this bought later milestones

M4's "Continue to Destination" link and M5's "Continue to Review" submit are just `<Link>`/`navigate()` calls into routes that already existed and already knew how to render themselves — no wizard-specific navigation plumbing had to be invented once a step's content was ready.
