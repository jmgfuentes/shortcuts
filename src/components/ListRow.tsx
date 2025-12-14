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
      <td>{s.icon ?? "—"}</td>
      <td>
        <a href={s.url} target="_blank" className="hover:underline">
          {s.title}
        </a>
      </td>
      <td>{s.description ?? "—"}</td>
      <td className="truncate max-w-[200px]">{s.url}</td>
      <td>{s.tags?.join(", ") ?? "—"}</td>
      <td>
        <button onClick={() => onEdit(s.id)}>Edit</button>{" "}
        <button onClick={() => onDelete(s.id)}>Delete</button>
      </td>
    </tr>
  );
}
