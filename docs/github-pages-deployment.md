# GitHub Pages Deployment

## Why GitHub Pages

For a static Vite/React build with no backend, an app doesn't need a
server-based host (Heroku, etc). GitHub Pages was chosen over Vercel/Netlify
because deployment runs entirely through GitHub Actions using the repo's
built-in `GITHUB_TOKEN` — no third-party account or secret to manage.

## Steps

### 1. `vite.config.ts` — base path

GitHub Pages serves project sites from a subpath, not the domain root, so the Vite `base` needs to
match in production builds:

```ts
base: mode === "production" ? "/popover-play/" : "/",
```

Without this, the built `index.html` would reference assets at `/assets/...`
instead of `/popover-play/assets/...`, and they'd 404 on Pages.

### 2. `src/App.tsx` — router basename

`BrowserRouter` needed to be told about the same subpath so client-side
routing stays consistent with the deployed URL:

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

This matters here in particular: the app's `#navigation` popover nav and
`Dashboard` cards all link via `react-router` `<Link>`s to routes like
`/dfs` or `/javascript-gotchas`, so every one of those needs to resolve
under `/popover-play/...` in production.

### 3. `.github/workflows/deploy.yml` — build & deploy workflow

A GitHub Actions workflow that, on every push to `main`:

1. Checks out the repo
2. Sets up Node 20 and installs dependencies (`npm ci`) — this project is
   developed with npm (a `bun.lockb` is also present but unused; don't switch
   the workflow to Bun)
3. Runs `npm run build`
4. Uploads `dist/` as a Pages artifact
5. Deploys that artifact to GitHub Pages

It can also be triggered manually from the Actions tab (`workflow_dispatch`).

Lint (`npm run lint`) and tests (`npm run test`) are not run in this
workflow — it only builds and deploys. If you want the deploy to fail on
lint/test errors, add those steps before the build step.

### 4. Repo setting — Pages source

One manual, one-time step in the GitHub UI (not something a workflow file can
set): under **Settings → Pages → Build and deployment → Source**, select
**GitHub Actions** rather than "Deploy from a branch". This tells GitHub to
publish whatever the workflow uploads instead of looking for a branch/folder.

Once enabled, the app will be served at:
`https://timofeysie.github.io/popover-play/`

## Redeploying

Nothing extra is needed — pushing to `main` triggers a new build and deploy.
Progress can be watched under the repo's **Actions** tab.
