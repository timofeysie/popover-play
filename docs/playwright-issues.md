# Playwright Issues

Notes from using Playwright to drive a headless Chromium against the Vite dev server for one-off
UI verification (no e2e suite exists in this repo yet — see below). This project has no
`playwright` dependency of its own; these are environment/tooling gotchas hit while scripting
verification ad hoc.

## `chromium-cli` isn't always available

The `run` skill's browser-driven pattern assumes a `chromium-cli` REPL binary. It wasn't present
in this sandbox, so verification fell back to hand-writing a Playwright script instead. If this
keeps recurring, `/run-skill-generator` can capture a proper project "run" skill so the fallback
doesn't have to be rediscovered each session.

## `npx -p playwright node script.mjs` doesn't work for ESM imports

`npx --yes playwright --version` works fine — the CLI binary resolves. But a script that does
`import { chromium } from "playwright-core"` fails with `ERR_MODULE_NOT_FOUND`, even when invoked
as `npx --yes -p playwright node script.mjs`. npx's temporary install isn't added to Node's ESM
resolution path (unlike CJS `require`, which respects `NODE_PATH` more forgivingly).

**Fix:** set up an isolated npm project next to the script (`npm init -y && npm install
playwright-core`) and run it with a plain `node script.mjs` from that directory. This also keeps
the throwaway dependency out of the repo's own `package.json`.

## Browser binaries need an explicit, one-time install

`playwright-core` doesn't ship browser binaries. First use needs:

```bash
npx --yes playwright install-deps chromium
npx --yes playwright install chromium
```

This downloads ~270MB (Chrome for Testing + headless shell) to `~/Library/Caches/ms-playwright`
on macOS. The cache persists across sessions/runs, so this is only slow the first time in a given
environment.

## Don't pass `channel` if only the default build is installed

`chromium.launch({ channel: "chromium" })` doesn't match the binary installed by `playwright
install chromium` above (that's for opting into a separately-installed "Chrome for Testing"
channel). Passing an unmatched channel silently produces a broken launch. Just call
`chromium.launch({ args: ["--no-sandbox"] })` with no `channel` to use the default installed build.

## `text=` locators don't match `<input placeholder>`

`page.waitForSelector("text=Search the cargo catalog")` timed out even though that exact string
was visibly rendered as an `<input placeholder="...">` on screen. Playwright's `text=` engine
matches rendered text *content*, not the `placeholder` attribute (or other ARIA-only strings).

**Fix:** use `page.getByPlaceholder("...")`, `page.getByRole(...)`, or wait on an element that
actually renders as text/DOM content instead.

## On a real e2e suite

No `playwright/` or `e2e/` directory exists here — the above was throwaway tooling for one manual
check, not a maintained suite. If one gets added later, bake these fixes in from the start:
`getByRole`/`getByPlaceholder` over `text=`/CSS selectors, no `channel` override, and a
`playwright install chromium` step documented (e.g. in `CLAUDE.md`) so it isn't rediscovered per
environment.
