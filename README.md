# LocalPass — Password Generator

A local-first password generator and vault built with React and Vite. The app source lives in the `localpass` directory.

## Requirements
- Node.js 18+ and npm

## Quick Start

```bash
# from the repo root
cd localpass

# install dependencies
npm install

# start dev server
npm run dev

# run unit tests (Vitest)
npm test
# or watch mode
npm run test:watch

# build for production
npm run build

# preview the production build locally
npm run preview
```

## Project Structure

```
Password Generator/
└─ localpass/
   ├─ index.html
   ├─ src/
   │  ├─ App.jsx
   │  ├─ index.css
   │  ├─ main.jsx
   │  ├─ components/
   │  │  ├─ Entry.jsx
   │  │  ├─ Generator.jsx
   │  │  └─ Vault.jsx
   │  └─ utils/
   │     ├─ crypto.js
   │     └─ pwgen.js
   ├─ __tests__/ (under src)
   │  └─ pwgen.test.js
   ├─ vite.config.js
   ├─ tailwind.config.cjs
   ├─ postcss.config.cjs
   └─ package.json
```

## Scripts (from `localpass/package.json`)
- `npm run dev`: Start Vite dev server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build
- `npm test`: Run tests once with Vitest
- `npm run test:watch`: Run tests in watch mode

## Technology
- React 18
- Vite 5
- Tailwind CSS 3
- Vitest

## Notes
- The app runs fully in the browser; no backend is required.
- Tailwind CSS is configured via `tailwind.config.cjs` and `postcss.config.cjs`.

## AI Generate (Local-only)

- Adds an optional "AI Generate" button next to "Generate" in `Generator.jsx`.
- All computation runs locally in your browser using Web Crypto (`crypto.getRandomValues` and `crypto.subtle.digest('SHA-512')`).
- No network calls, no telemetry. The optional prompt is never stored or sent.
- Respects the same options as the standard generator (length, lowercase, uppercase, numbers, symbols, avoid ambiguous).
- For long passwords, the generator re-hashes the last hash to deterministically derive additional bytes.

Usage:
1. Click "AI Generate".
2. Optionally describe what you want (e.g., "strong with symbols", "no confusing characters"). You can leave it blank.
3. The password is generated locally and placed into the field so you can copy or save it like usual.

