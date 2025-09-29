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

