// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AddShortcutDialog } from "@/components/AddShortcutDialog";
import { ListRow } from "@/components/ListRow";
import type { Shortcut, ShortcutType } from "@/types";
import {
  loadShortcuts,
  addShortcutLocal,
  removeShortcutLocal,
  saveShortcuts,
  updateShortcutLocal,
} from "@/lib/storage";
import { type ShortcutInput } from "@/lib/validators";

type ViewMode = "card" | "list";
const VIEW_STORAGE_KEY = "shortcuts:view";
const QUERY_STORAGE_KEY = "shortcuts:query";
const TAGS_FILTER_STORAGE_KEY = "shortcuts:tagsFilter";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("card");
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    setShortcuts(loadShortcuts());

    const v = localStorage.getItem(VIEW_STORAGE_KEY);
    if (v === "card" || v === "list") setView(v);

    const q = localStorage.getItem(QUERY_STORAGE_KEY);
    if (q) setQuery(q);

    const t = localStorage.getItem(TAGS_FILTER_STORAGE_KEY);
    if (t) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) setActiveTags(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    saveShortcuts(shortcuts);
  }, [shortcuts]);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(QUERY_STORAGE_KEY, query);
  }, [query]);

  useEffect(() => {
    localStorage.setItem(TAGS_FILTER_STORAGE_KEY, JSON.stringify(activeTags));
  }, [activeTags]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    shortcuts.forEach((s) => (s.tags ?? []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [shortcuts]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return shortcuts.filter((s) => {
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesTags =
        activeTags.length === 0 ||
        (s.tags && activeTags.every((t) => s.tags!.includes(t)));

      return matchesQuery && matchesTags;
    });
  }, [shortcuts, query, activeTags]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function handleSave(input: ShortcutInput) {
    if (editingId) {
      setShortcuts((prev) =>
        updateShortcutLocal(prev, editingId, input)
      );
      setEditingId(null);
    } else {
      const now = new Date().toISOString();
      const item: Shortcut = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...input,
        type: input.type as ShortcutType,
      };
      setShortcuts((prev) => addShortcutLocal(prev, item));
    }
    setOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this shortcut?")) {
      setShortcuts((prev) => removeShortcutLocal(prev, id));
    }
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <main
  className="relative min-h-screen w-full p-4 sm:p-6 lg:p-8 text-green-400"
  style={{
    fontFamily:
      '"Courier New", Courier, "IBM Plex Mono", Menlo, Consolas, monospace',
  }}
>
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-10 [background:repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,rgba(0,0,0,0.6)_3px,rgba(0,0,0,0.6)_4px)]" />

      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <h1 className="text-3xl font-bold [text-shadow:0_0_12px_rgba(0,255,140,0.35)]">
          My Shortcuts
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView(view === "card" ? "list" : "card")}
            className="rounded border border-green-700/50 bg-black/40 px-3 py-2 text-sm hover:bg-green-500/10"
          >
            {view === "card" ? "List view" : "Card view"}
          </button>
          <button
            onClick={openCreate}
            className="rounded border border-green-500/60 bg-green-500/10 px-4 py-2 hover:bg-green-500/20"
          >
            +
          </button>
        </div>
      </header>

      {/* Filters */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="mb-4 w-full rounded border border-green-700/50 bg-black/40 px-3 py-2"
      />

      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`rounded-full px-3 py-1 text-xs ${
                activeTags.includes(t)
                  ? "bg-green-500/20 text-green-200"
                  : "bg-black/40 text-green-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <AddShortcutDialog open={open} onClose={() => setOpen(false)} onSave={handleSave} />

      {/* Content */}
      {view === "card" ? (
        <section className="grid gap-4 py-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="group rounded-lg border border-green-700/40 bg-black/40 p-4 hover:border-green-400/60"
            >
              <div className="flex justify-between gap-2">
                <div className="truncate font-semibold text-green-200">
                    <a
    href={s.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block truncate font-semibold text-green-200 hover:underline [text-shadow:0_0_10px_rgba(0,255,140,0.22)]"
    title={s.title}
  >
    {s.icon ? (
      /^https?:\/\//.test(s.icon) ? (
        <img
          src={s.icon}
          alt=""
          className="mr-2 inline-block h-5 w-5 rounded align-[-3px]"
        />
      ) : (
        <span className="mr-2 inline-block text-xl text-green-200" aria-hidden="true">
          {s.icon}
        </span>
      )
    ) : (
      <span className="mr-2 text-green-700/70" aria-hidden="true">
        ▣
      </span>
    )}
    {s.title}
  </a>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s.id)}>✎</button>
                  <button onClick={() => handleDelete(s.id)}>✕</button>
                </div>
              </div>

              <p className="mt-2 text-sm text-green-300/80 min-h-[2.5rem]">
                {s.description || "—"}
              </p>

              <p className="mt-2 truncate text-xs text-green-600">{s.url}</p>

              {s.tags?.length && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[11px] opacity-70">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-2 text-[11px] text-green-700">Type: {s.type}</p>
            </div>
          ))}
        </section>
      ) : (
        <section className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>Description</th>
                <th>URL</th>
                <th>Tags</th>
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <ListRow
                  key={s.id}
                  s={s}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="mt-12 text-center text-[11px] text-green-700">
        © {new Date().getFullYear()} Jesús Manuel González Fuentes · Beta · Local-only data
      </footer>
    </main>
  );
}
