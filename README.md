# Code Lab

Demo App for Data Structures and Algorithm examples and other code and math pages.

This app began with the native css/html Popover Play example code and grew from there.

## Workflow

```bash
npm install
npm run dev          # start the dev server at http://localhost:8080
npm run build        # production build
npm run preview      # preview the production build locally
npm run lint         # ESLint
npm run test         # run unit tests once (vitest)
npm run test:watch   # run unit tests in watch mode
npm run test:e2e     # run Playwright e2e smoke tests (auto-starts the dev server)
```

To run a single unit test file: `npx vitest run src/test/example.test.ts`.

The e2e suite (`e2e/`) is a small Playwright smoke suite, not a full regression suite — currently
it only covers the Mission Control Cargo Manifest wizard. The first run needs Chromium installed
once via `npx playwright install chromium`.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
