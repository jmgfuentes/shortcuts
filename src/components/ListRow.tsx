// src/components/ListRow.tsx
"use client";

import type { Shortcut } from "@/types";

type Props = {
  s: Shortcut;
  onEdit(id: string): void;
  onDelete(id: string): void;
};

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

          <div className="min-w-0">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate font-medium text-green-200 hover:underline [text-shadow:0_0_10px_rgba(0,255,140,0.18)]"
              title={s.title}
            >
              {s.title}
            </a>

            {/* Mobile helper (because Description/Tags are hidden on small widths) */}
            <div className="mt-0.5 line-clamp-1 text-xs text-green-300/70 md:hidden">
              {s.description ? s.description : s.tags?.length ? s.tags.join(" · ") : ""}
            </div>
          </div>
        </div>
      </td>

      {/* Description (hidden on mobile) */}
      <td className="hidden px-3 py-2 text-green-300/80 md:table-cell">
        {s.description ? s.description : <span className="text-green-700/70">—</span>}
      </td>

      {/* Tags (hidden on xs) */}
      <td className="hidden px-3 py-2 sm:table-cell">
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

      {/* Actions: icons only */}
      <td className="px-3 py-2">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(s.id)}
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
      </td>
    </tr>
  );
}
