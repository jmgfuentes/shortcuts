// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AddShortcutDialog } from "@/components/AddShortcutDialog";
import { ListRow } from "@/components/ListRow";
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

export default function Page() {
  const [open, setOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("card");

  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Initial load
  useEffect(() => {
    setShortcuts(loadShortcuts());
  }, []);

  // Persist shortcuts
  useEffect(() => {
    saveShortcuts(shortcuts);
  }, [shortcuts]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    shortcuts.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [shortcuts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shortcuts.filter((s) => {
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesTags =
        activeTags.length === 0 ||
        (s.tags && activeTags.every((t) => s.tags!.includes(t)));

      return matchesQuery && matchesTags;
    });
  }, [shortcuts, query, activeTags]);

  const editingItem = editingId
    ? shortcuts.find((s) => s.id === editingId)
    : null;

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
  }

  function handleSave(input: ShortcutInput) {
    if (editingId) {
      setShortcuts((prev) =>
        updateShortcutLocal(prev, editingId, {
          ...input,
          updatedAt: new Date().toISOString(),
        })
      );
    } else {
      const now = new Date().toISOString();
      const newItem: Shortcut = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setShortcuts((prev) => addShortcutLocal(prev, newItem));
    }

    closeModal();
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this shortcut?")) return;
    setShortcuts((prev) => removeShortcutLocal(prev, id));
  }

  function toggleView() {
    setView((v) => (v === "card" ? "list" : "card"));
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setQuery("");
    setActiveTags([]);
  }

  return (
    <main className="relative min-h-screen w-full px-6 py-6 font-mono text-green-400">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-10 [background:repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,rgba(0,0,0,0.6)_3px,rgba(0,0,0,0.6)_4px)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background:radial-gradient(ellipse_at_center,rgba(0,255,140,0.1)_0%,rgba(0,0,0,0.9)_70%)]" />

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold [text-shadow:0_0_12px_rgba(0,255,140,0.35)]">
            My Shortcuts
          </h1>

          <div className="flex gap-2">
            <button
              onClick={toggleView}
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
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-green-300/80">
          Now save a lot of time every day thanks to ‘My Shortcuts’. Manage your
          shortcuts to your favourite applications.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, URL or tags…"
            className="w-full rounded border border-green-700/50 bg-black/40 px-3 py-2 outline-none"
          />
          {(query || activeTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="rounded border border-green-700/50 bg-black/40 px-3 py-2"
            >
              Clear
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => {
              const active = activeTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={
                    active
                      ? "rounded-full border border-green-300/60 bg-green-500/15 px-3 py-1 text-xs"
                      : "rounded-full border border-green-700/50 bg-black/40 px-3 py-1 text-xs hover:bg-green-500/10"
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal */}
      <AddShortcutDialog
        open={open}
        onClose={closeModal}
        onSave={handleSave}
        initialValues={editingItem ?? undefined}
        titleText={editingItem ? "Edit shortcut" : "New shortcut"}
      />

      {/* Content */}
      {view === "card" ? (
        <section className="grid gap-4 py-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="group rounded border border-green-700/40 bg-black/40 p-4 hover:border-green-400/60"
            >
              <div className="flex justify-between gap-2">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-semibold text-green-200 hover:underline"
                >
                  {s.icon && <span className="mr-1">{s.icon}</span>}
                  {s.title}
                </a>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s.id)}>✎</button>
                  <button onClick={() => handleDelete(s.id)}>✕</button>
                </div>
              </div>

              <p className="mt-2 text-sm text-green-300/80 min-h-[2.5rem]">
                {s.description || "—"}
              </p>

              <p className="mt-2 truncate text-xs text-green-600">{s.url}</p>

              {s.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[11px] opacity-70">
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : (
        <section className="py-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-green-500/5">
              <tr className="text-left">
                <th className="px-3 py-2">Shortcut</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Tags</th>
                <th className="px-3 py-2 w-32">Actions</th>
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

      {/* Footer */}
      <footer className="mt-12 text-center text-[11px] text-green-700/80">
        © {new Date().getFullYear()} Jesús M. Fuentes · Beta · Local-only data
      </footer>
    </main>
  );
}
