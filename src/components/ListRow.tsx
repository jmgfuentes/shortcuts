// src/components/ListRow.tsx
"use client";

import type { Shortcut } from "@/types";

type Props = {
  s: Shortcut;
  onEdit(id: string): void;
  onDelete(id: string): void;
};

export function ListRow({ s, onEdit, onDelete }: Props) {
  return (
    <tr className="border-t border-green-700/30 hover:bg-green-500/5">
      {/* Title: icon + title link */}
      <td className="px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
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
      </td>

      {/* Description */}
      <td className="px-3 py-2 text-green-300/80">
        {s.description ? s.description : <span className="text-green-700/70">—</span>}
      </td>

      {/* Tags */}
      <td className="px-3 py-2">
        {s.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {s.tags.map((t) => (
              <span
                key={t}
                className="rounded border border-green-700/40 bg-black/40 px-2 py-0.5 text-xs text-green-300"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-green-700/70">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(s.id)}
            className="rounded border border-green-700/40 bg-black/40 px-2 py-1 text-xs text-green-300 hover:bg-green-500/10"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="rounded border border-red-500/30 bg-black/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
