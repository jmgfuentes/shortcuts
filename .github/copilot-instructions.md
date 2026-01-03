<!-- .github/copilot-instructions.md -->
# Shortcuts — Copilot instructions

This file contains concise, actionable guidance for AI coding agents working on this repository.

1. Big picture
- This is a small Next.js (app router) single-page app that stores a user-maintained list of shortcuts in browser `localStorage` and exposes CSV import/export. Primary entry: `src/app/page.tsx`.
- UI components live under `src/components/*` (client components use `"use client"`). Hooks are in `src/hooks/*`, reusable logic in `src/lib/*`, and types in `src/types.ts`.

2. Key files to inspect before changes
- `src/app/page.tsx` — main UI, state management, CSV import hook usage.
- `src/components/AddShortcutDialog.tsx` — form handling, uses `shortcutInputSchema` for validation.
- `src/lib/validators.ts` — Zod schema; keep edits backwards-compatible with client code.
- `src/lib/storage.ts` — read/write helpers for `localStorage` (STORAGE_KEY = `shortcuts:v1`).
- `src/hooks/useCsvImportExport.ts` — CSV format: semicolon-delimited, BOM for Excel, header tolerant; import replaces dataset and deduplicates by URL (last wins).

3. Important conventions & patterns
- Client vs server: components with `"use client"` are purely client-side. Avoid adding server-only APIs inside them.
- Immutability & persistence: storage helpers return new arrays and call `saveShortcuts(...)` internally; preserve immutability when updating shortcuts.
- IDs and timestamps: new items use `crypto.randomUUID()` and ISO timestamps with `new Date().toISOString()` — keep this pattern for compatibility.
- Storage versioning: `STORAGE_KEY` is versioned (`shortcuts:v1`). If changing stored shape, bump the suffix (v2) and implement migration logic in `loadShortcuts()`.

4. CSV behavior to respect when editing import/export
- Exports use `;` as delimiter and emit a UTF-8 BOM. Headers are `title;url;description;tags;icon`.
- `importFromTextReplace` builds a fresh array and deduplicates by URL (case-insensitive). If you change parsing logic, update the UI import flow in `src/app/page.tsx` where the file input handler calls the hook.

5. Validation rules
- Fields are validated by `shortcutInputSchema` (Zod). Title (required), URL (required & no `javascript:`), optional `description`, `icon` and `tags` (array, max 10).
- When modifying schema, update any UI error messages in `src/components/AddShortcutDialog.tsx` to match new constraint text.

6. Dev workflows / commands
- Run dev server: `npm run dev` (uses Next.js dev). Build: `npm run build`. Start production: `npm run start`. Lint: `npm run lint`.
- This repo uses Next 16 with Turbopack; `next.config.ts` sets `turbopack.root`.

7. Style and small UX notes
- Styling uses Tailwind via `src/app/globals.css` (it imports `tailwindcss`) and CSS variables for theme. Avoid changing global color variables unless intentionally changing the app theme.
- Small, hand-tuned utility classes are used for spacing and compactness; prefer editing class lists over wholesale refactors for minor UI tweaks.

8. Safety & non-goals for AI edits
- Do not migrate stored data silently; implement a migration path and preserve user data (bump `STORAGE_KEY` and provide migration in `loadShortcuts()`).
- Avoid replacing the CSV import semantics without updating the UI and documentation.

9. Examples to reference in PRs or changes
- Add a shortcut: see `onCreate` in `src/app/page.tsx` — uses `crypto.randomUUID()` and `createdAt`/`updatedAt` ISO timestamps.
- Storage key definition: `src/lib/storage.ts` contains `STORAGE_KEY = "shortcuts:v1"`.
- Validation: `src/lib/validators.ts` defines `shortcutInputSchema` used by `AddShortcutDialog.tsx`.

If anything in these notes is unclear or you want more detail about a specific area (migration strategy, CSV format tests, or extending the schema), tell me which part and I'll expand or adjust the instructions.
