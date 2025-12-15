// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AddShortcutDialog } from "@/components/AddShortcutDialog";
import { ListRow } from "@/components/ListRow";
import { useCsvImportExport } from "@/hooks/useCsvImportExport";

import type { Shortcut } from "@/types";
import {
  loadShortcuts,
  addShortcutLocal,
  removeShortcutLocal,
  saveShortcuts,
  updateShortcutLocal,
} from "@/lib/storage";
import type { ShortcutInput } from "@/lib/validators";


type ViewMode = "card" | "list";

type SortKey = "title" | "description" | "tags";
type SortDir = "asc" | "desc";

function normalize(s: string) {
  return (s ?? "").toLowerCase().trim();
}

function IconPencil(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
    </svg>
  );
}

function IconTrash(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function Page() {
  const [open, setOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("card");

  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // V3 sorting
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // CSV import/export
  const csv = useCsvImportExport();

  // Initial load
  useEffect(() => {
    setShortcuts(loadShortcuts());
  }, []);

  // Persist
  useEffect(() => {
    saveShortcuts(shortcuts);
  }, [shortcuts]);

  const editingShortcut = useMemo(() => {
    if (!editingId) return null;
    return shortcuts.find((s) => s.id === editingId) ?? null;
  }, [editingId, shortcuts]);

  const startEdit = (id: string) => {
    setEditingId(id);
    setOpen(true);
  };

  const onDelete = (id: string) => {
    setShortcuts((prev) => removeShortcutLocal(prev, id));
  };

 const onCreate = (data: ShortcutInput) => {
  const now = new Date().toISOString();

  const item: Shortcut = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    title: data.title,
    url: data.url,
    description: data.description,
    icon: data.icon,
    tags: data.tags,
  };

  setShortcuts((prev) => [...prev, item]);
  setOpen(false);
};

  const onUpdate = (data: ShortcutInput) => {
    if (!editingId) return;
    setShortcuts((prev) => updateShortcutLocal(prev, editingId, data));
    setEditingId(null);
    setOpen(false);
  };

  // Tag chips
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const s of shortcuts) {
      for (const t of s.tags ?? []) set.add(t);
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [shortcuts]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setActiveTags([]);

  // Filtering
  const filteredShortcuts = useMemo(() => {
    const q = normalize(query);

    return shortcuts.filter((s) => {
      const tagsText = (s.tags ?? []).join(" ");
      const haystack = normalize(
        `${s.title ?? ""} ${s.description ?? ""} ${s.url ?? ""} ${tagsText}`
      );

      const matchesQuery = !q || haystack.includes(q);

      const matchesTags =
        activeTags.length === 0 ||
        (s.tags ?? []).some((t) => activeTags.includes(t));

      return matchesQuery && matchesTags;
    });
  }, [shortcuts, query, activeTags]);

  // Sorting toggle: 1st click asc, 2nd click desc
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const sortedShortcuts = useMemo(() => {
    const arr = [...filteredShortcuts];

    const getValue = (s: Shortcut) => {
      if (sortKey === "title") return s.title ?? "";
      if (sortKey === "description") return s.description ?? "";
      // tags: ordena por el primero
      return s.tags?.[0] ?? "";
    };

    arr.sort((a, b) => {
      const va = String(getValue(a));
      const vb = String(getValue(b));
      const cmp = va.localeCompare(vb, undefined, { sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [filteredShortcuts, sortKey, sortDir]);

  return (
    <main className="w-full px-4 py-6">
        {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-green-200">
            Shortcuts
          </h1>
          <p className="text-sm text-green-300/70">
            V3: sortable list + responsive columns + compact actions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View switch */}
          <button
            type="button"
            onClick={() => setView("card")}
            className={[
              "rounded-md border px-3 py-2 text-sm",
              "border-green-700/40 bg-black/40 text-green-200 hover:bg-green-500/10",
              view === "card" ? "ring-1 ring-green-500/30" : "",
            ].join(" ")}
          >
            Cards
          </button>

          <button
            type="button"
            onClick={() => setView("list")}
            className={[
              "rounded-md border px-3 py-2 text-sm",
              "border-green-700/40 bg-black/40 text-green-200 hover:bg-green-500/10",
              view === "list" ? "ring-1 ring-green-500/30" : "",
            ].join(" ")}
          >
            List
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={() => csv.exportToCsv(shortcuts, "shortcuts.csv")}
            className="rounded-md border border-green-700/40 bg-black/40 px-3 py-2 text-sm text-green-200 hover:bg-green-500/10"
            title="Export CSV"
          >
            Export
          </button>

          {/* Import */}
          <label
            className="cursor-pointer rounded-md border border-green-700/40 bg-black/40 px-3 py-2 text-sm text-green-200 hover:bg-green-500/10"
            title="Import CSV"
          >
            Import
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const { shortcuts: imported, result } = await csv.importFromFileReplace(
                  file
                );
                setShortcuts(imported);

                // allow re-import same file
                e.currentTarget.value = "";

                alert(`Imported: ${result.imported} | Skipped: ${result.skipped}`);
              }}
            />
          </label>

          {/* Add */}
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setOpen(true);
            }}
            className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-100 hover:bg-green-500/20"
          >
            Add
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (title, url, description, tags)…"
          className="w-full rounded-md border border-green-700/40 bg-black/40 px-3 py-2 text-sm text-green-200 placeholder:text-green-700/70 outline-none focus:ring-1 focus:ring-green-500/30 sm:max-w-md"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {allTags.length > 0 && (
            <>
              <button
                type="button"
                onClick={clearTags}
                className="rounded-md border border-green-700/40 bg-black/40 px-2 py-1 text-xs text-green-300 hover:bg-green-500/10"
              >
                Clear tags
              </button>

              {allTags.map((t) => {
                const active = activeTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={[
                      "rounded-full border px-3 py-1 text-xs",
                      active
                        ? "border-green-500/40 bg-green-500/10 text-green-100"
                        : "border-green-700/40 bg-black/40 text-green-300 hover:bg-green-500/10",
                    ].join(" ")}
                    title={t}
                  >
                    {t}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {view === "list" ? (
        <div className="overflow-x-auto rounded-lg border border-green-700/30 bg-black/20">
          <table className="w-full table-fixed">
            <thead className="border-b border-green-700/30 bg-black/40">
              <tr className="text-left text-xs text-green-300/80">
                <th className="w-[70%] px-3 py-2 sm:w-[46%]">
                  <button
                    type="button"
                    onClick={() => toggleSort("title")}
                    className="font-medium hover:text-green-200"
                    title="Sort by Title"
                  >
                    Title{sortIndicator("title")}
                  </button>
                </th>

                <th className="hidden px-3 py-2 md:table-cell md:w-[34%]">
                  <button
                    type="button"
                    onClick={() => toggleSort("description")}
                    className="font-medium hover:text-green-200"
                    title="Sort by Description"
                  >
                    Description{sortIndicator("description")}
                  </button>
                </th>

                <th className="hidden px-3 py-2 sm:table-cell sm:w-[14%]">
                  <button
                    type="button"
                    onClick={() => toggleSort("tags")}
                    className="font-medium hover:text-green-200"
                    title="Sort by Tags"
                  >
                    Tags{sortIndicator("tags")}
                  </button>
                </th>

                <th className="w-[30%] px-3 py-2 text-right sm:w-[6%]" />
              </tr>
            </thead>

            <tbody>
              {sortedShortcuts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-sm text-green-700/70">
                    No results.
                  </td>
                </tr>
              ) : (
                sortedShortcuts.map((s) => (
                  <ListRow
                    key={s.id}
                    s={s}
                    onEdit={(id) => startEdit(id)}
                    onDelete={(id) => onDelete(id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedShortcuts.length === 0 ? (
            <div className="rounded-lg border border-green-700/30 bg-black/20 p-4 text-sm text-green-700/70">
              No results.
            </div>
          ) : (
            sortedShortcuts.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-green-700/30 bg-black/20 p-4 hover:bg-green-500/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {s.icon ? (
                        /^https?:\/\//.test(s.icon) ? (
                          <img src={s.icon} alt="" className="h-5 w-5 rounded" />
                        ) : (
                          <span className="text-lg text-green-200" aria-hidden="true">
                            {s.icon}
                          </span>
                        )
                      ) : (
                        <span className="text-green-700/70" aria-hidden="true">
                          ▣
                        </span>
                      )}

                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate font-medium text-green-200 hover:underline [text-shadow:0_0_10px_rgba(0,255,140,0.18)]"
                        title={s.title}
                      >
                        {s.title}
                      </a>
                    </div>

                    {s.description ? (
                      <div className="mt-2 line-clamp-2 text-sm text-green-300/70">
                        {s.description}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-green-700/70">—</div>
                    )}

                    {s.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {s.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded border border-green-700/40 bg-black/40 px-2 py-0.5 text-xs text-green-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* icon actions in Cards */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => startEdit(s.id)}
                      title="Edit"
                      aria-label="Edit"
                      className="rounded border border-green-700/40 bg-black/40 p-1.5 text-green-300 hover:bg-green-500/10"
                    >
                      <IconPencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDelete(s.id)}
                      title="Delete"
                      aria-label="Delete"
                      className="rounded border border-red-500/30 bg-black/40 p-1.5 text-red-300 hover:bg-red-500/10"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dialog: works with your AddShortcutDialog API */}
      <AddShortcutDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingId(null);
        }}
        onSave={editingId ? onUpdate : onCreate}
        initialValues={editingShortcut ?? undefined}
        titleText={editingId ? "Edit shortcut" : "New shortcut"}
      />
    </main>
  );
}
