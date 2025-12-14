// src/components/AddShortcutDialog.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { shortcutInputSchema, type ShortcutInput } from "@/lib/validators";

type Props = {
  open: boolean;
  onClose(): void;
  onSave(input: ShortcutInput): void;
};

const typeOptions = [
  { value: "link", label: "Link" },
  { value: "app", label: "App" },
  { value: "doc", label: "Document" },
  { value: "dashboard", label: "Dashboard" },
  { value: "other", label: "Other" },
] as const;

export function AddShortcutDialog({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [type, setType] = useState<typeof typeOptions[number]["value"]>("link");
  const [tagsText, setTagsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  function parseTags(text: string): string[] | undefined {
    const arr = text.split(",").map((t) => t.trim()).filter(Boolean);
    return arr.length ? arr : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const candidate = {
      title,
      description: description.trim() ? description.trim() : undefined,
      url: url.trim(),
      icon: icon.trim() ? icon.trim() : undefined,
      type,
      tags: parseTags(tagsText),
    };

    const parsed = shortcutInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setError("Check the fields: Title and URL are required. Tags must be comma-separated.");
      return;
    }

    try {
      setSubmitting(true);
      onSave(parsed.data);

      // Clear after save
      setTitle("");
      setDescription("");
      setUrl("");
      setIcon("");
      setType("link");
      setTagsText("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      className="rounded-lg border border-green-700/40 bg-black/70 p-0 text-green-300 shadow-2xl backdrop:bg-black/70"
    >
      <form onSubmit={handleSubmit} className="min-w-[360px] space-y-4 p-4 font-mono">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-green-200 [text-shadow:0_0_12px_rgba(0,255,140,0.25)]">
            New shortcut
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-green-700/40 bg-black/40 px-2 py-1 text-xs text-green-300 hover:bg-green-500/10"
            aria-label="Close"
            title="Close"
          >
            ESC
          </button>
        </div>

        {/* Subtle CRT line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

        <div className="space-y-2">
          <label className="block text-sm text-green-200">Title *</label>
          <input
            className="w-full rounded border border-green-700/50 bg-black/40 px-3 py-2 text-green-200 placeholder:text-green-700/80 outline-none focus:border-green-400/70 focus:ring-2 focus:ring-green-500/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Analytics"'
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-green-200">Description</label>
          <input
            className="w-full rounded border border-green-700/50 bg-black/40 px-3 py-2 text-green-200 placeholder:text-green-700/80 outline-none focus:border-green-400/70 focus:ring-2 focus:ring-green-500/20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-green-200">URL *</label>
          <input
            type="url"
            className="w-full rounded border border-green-700/50 bg-black/40 px-3 py-2 text-green-200 placeholder:text-green-700/80 outline-none focus:border-green-400/70 focus:ring-2 focus:ring-green-500/20"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-green-200">Icon (emoji or URL)</label>
          <input
            className="w-full rounded border border-green-700/50 bg-black/40 px-3 py-2 text-green-200 placeholder:text-green-700/80 outline-none focus:border-green-400/70 focus:ring-2 focus:ring-green-500/20"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="📊 or https://.../favicon.ico"
          />
          <p className="text-[11px] text-green-700/80">
            Tip: Use an emoji for a classic terminal vibe.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-green-200">Type</label>
          <select
            className="w-full rounded border border-green-700/50 bg-black/40 px-3 py-2 text-green-200 outline-none focus:border-green-400/70 focus:ring-2 focus:ring-green-500/20"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-black text-green-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-green-200">Tags (comma-separated)</label>
          <input
            className="w-full rounded border border-green-700/50 bg-black/40 px-3 py-2 text-green-200 placeholder:text-green-700/80 outline-none focus:border-green-400/70 focus:ring-2 focus:ring-green-500/20"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="HR, Marketing, Comms"
          />
        </div>

        {error && (
          <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-green-700/40 bg-black/40 px-3 py-2 text-green-300 hover:bg-green-500/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded border border-green-400/60 bg-green-500/15 px-3 py-2 text-green-200 hover:bg-green-500/25 disabled:opacity-60 [text-shadow:0_0_10px_rgba(0,255,140,0.25)]"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
