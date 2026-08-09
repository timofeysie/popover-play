# M7 — Polish & nav

**Goal:** fold the pre-wizard `/mccm/plan` write-up page into the step shell as
a short disclosure, sweep for styling consistency, and make every user action
across the wizard give visible motion feedback.

**Files:** `WizardShell.tsx`, `steps/CargoManifestStep.tsx`,
`steps/DestinationStep.tsx`, `steps/ReviewStep.tsx`, `App.tsx`

## Retiring the plan page instead of updating it

`/mccm/plan` (`pages/MissionControlCargoManifest.tsx` + `PlanOverview.tsx`)
was the M0-era "here's the plan" page, written before any of the wizard
existed. By M6 its copy was actively wrong ("Plan only — no wizard code yet")
sitting one click away from a fully working wizard. Rather than rewrite it in
place, it's gone — deleted along with its route in `App.tsx` — and replaced
with a collapsible "About this demo" panel inside `WizardShell` itself:

```tsx
const [aboutOpen, setAboutOpen] = useState(false);
// ...
<motion.button onClick={() => setAboutOpen((open) => !open)} aria-expanded={aboutOpen}>
  About this demo
  <motion.span animate={{ rotate: aboutOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
    <ChevronDown className="w-3 h-3" />
  </motion.span>
</motion.button>

<AnimatePresence initial={false}>
  {aboutOpen && (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
      {/* condensed blurb, same height/opacity reveal pattern as the M5 hazmat banner */}
    </motion.div>
  )}
</AnimatePresence>
```

A toggle beats a navigation: the visitor never leaves wizard state to read
about the wizard. The docs write-up (`docs/mission-control-cargo-manifest.md`)
is cited as inline `<code>` text, same as it was in the old `PlanOverview` —
this SPA has no route that serves markdown files, so it was never a real link,
just a path reference.

## Motion feedback on every actionable control

The brief for this milestone: any user action should visibly acknowledge
itself. Before now, most buttons/links across the three steps had only a CSS
`hover:` color change — functional, but static. Every clickable control that
changes state now gets a `motion.button` (or `motion.create(Link)` for
in-step navigation) with `whileHover`/`whileTap`, using one shared spring
(`{ type: "spring", stiffness: 500, damping: 30 }`) so the feel is consistent
across all three steps rather than each button inventing its own timing:

```tsx
const TAP_TRANSITION = { type: "spring", stiffness: 500, damping: 30 } as const;
const MotionLink = motion.create(Link);
```

Disabled controls (pagination at a page boundary) skip the hover/tap
animation entirely (`whileHover={atBoundary ? undefined : {...}}`) rather than
animating toward a state the click can't reach.

## The Launch button gets a real "something is happening" moment

Everywhere else, motion is instantaneous feedback on an instant action. Launch
is different — it's the one irreversible-feeling action in the wizard — so it
gets an actual time-boxed phase instead of just a tap animation:

```tsx
const [launching, setLaunching] = useState(false);
const handleLaunch = () => {
  setLaunching(true);
  setTimeout(() => setLaunched(true), LAUNCH_DELAY_MS); // 700ms
};
```

While `launching` is true the button disables itself, swaps its icon for a
spinner, and reads "Launching…" — so the click reads as *doing* something,
not just toggling a view.

## A store/React batching trap in the launch → confirmation handoff

The first version of this also called `reset()` in that same `setTimeout`
callback, right alongside `setLaunched(true)`. That's a race: `ReviewStep`'s
empty-manifest guard (from M3) reads `hasCargo` from the Zustand store, and
Zustand's `useSyncExternalStore`-based subscription re-renders the component
on `reset()` independently of React's batching for the sibling `useState`
call — so `hasCargo` could flip to `false` in a render where `launched` hadn't
visibly taken effect yet, and the guard would redirect to `/mccm/cargo`
*before the confirmation screen ever painted*. Caught this by actually driving
it in a browser rather than trusting the e2e test's `toBeVisible()` retry
window — the redirect was consistent and fast enough that it wasn't a flake
you'd sometimes get; it was a guarantee.

The fix isn't reordering the two calls (that's still racy) — it's not
resetting the store as part of the launch transition at all. `handleLaunch`
now only ever sets `launching`/`launched`; the manifest lines stay in the
store, invisible behind `LaunchConfirmation`. `reset()` moves to the
confirmation screen's "Start a new manifest" link, so it only ever fires as
part of *leaving* the review step, never while `ReviewStep` itself is still
mounted and re-evaluating its own guard:

```tsx
function LaunchConfirmation() {
  const reset = useMccmStore((state) => state.reset);
  return (
    // ...
    <MotionLink to="/mccm/cargo" onClick={() => reset()}>
      Start a new manifest
    </MotionLink>
  );
}
```

## Testing this step

`e2e/mccm.spec.ts`'s launch test is what caught the regression in CI-shaped
form (`toBeVisible()` timing out waiting for "Manifest launched" because the
page had already bounced to `/mccm/cargo`) — worth keeping in mind if this
handoff is ever touched again: a passing *component* test wouldn't have caught
this, since the bug only shows up in the interaction between two different
state containers (Zustand store + React `useState`) racing during a real
render cycle. Full suite (unit + e2e + `tsc --noEmit` + `npm run build`) is
green; lint has the same three pre-existing, unrelated errors
(`textarea.tsx`, `tailwind.config.ts`) that predate this project.
