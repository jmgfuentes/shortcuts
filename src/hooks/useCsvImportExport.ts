// src/hooks/useCsvImportExport.ts
"use client";

import type { Shortcut } from "@/types";

type ImportResult = {
  imported: number;
  skipped: number;
};

const DEFAULT_HEADERS = ["title", "url", "description", "tags", "icon"] as const;

function escapeCsvField(value: string) {
  const needsQuotes = /[;"\n\r]/.test(value);
  const v = value.replace(/"/g, '""');
  return needsQuotes ? `"${v}"` : v;
}

function normalizeUrl(u: string) {
  const t = (u || "").trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function parseCsvSemicolon(text: string) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  const rows: string[][] = [];

  for (const raw of lines) {
    if (!raw.trim()) continue;

    const row: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];

      if (ch === '"') {
        if (inQuotes && raw[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (ch === ";" && !inQuotes) {
        row.push(cur.trim());
        cur = "";
        continue;
      }

      cur += ch;
    }

    row.push(cur.trim());
    rows.push(row);
  }

  return rows;
}

function downloadTextFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useCsvImportExport() {
  function exportToCsv(shortcuts: Shortcut[], filename = "shortcuts.csv") {
    const rows: string[] = [];

    rows.push(DEFAULT_HEADERS.join(";"));

    for (const s of shortcuts) {
      rows.push(
        [
          s.title ?? "",
          s.url ?? "",
          s.description ?? "",
          (s.tags ?? []).join(","),
          s.icon ?? "",
        ]
          .map(escapeCsvField)
          .join(";")
      );
    }

    // BOM para Excel + UTF-8
    const csv = "\uFEFF" + rows.join("\n");
    downloadTextFile(filename, csv, "text/csv;charset=utf-8");
  }

  function importFromTextReplace(text: string): { shortcuts: Shortcut[]; result: ImportResult } {
    const rows = parseCsvSemicolon(text);
    if (!rows.length) return { shortcuts: [], result: { imported: 0, skipped: 0 } };

    const first = rows[0].map((x) => x.toLowerCase());
    const hasHeader = first.includes("title") && first.includes("url");

    const header = hasHeader ? first : null;

    const idx = (name: string, fallback: number) =>
      header ? header.indexOf(name) : fallback;

    const now = new Date().toISOString();

    // Replace: construimos NUEVO array desde cero y deduplicamos por URL (última gana).
    const byUrl = new Map<string, Shortcut>();

    let imported = 0;
    let skipped = 0;

    const start = hasHeader ? 1 : 0;

    for (let r = start; r < rows.length; r++) {
      const row = rows[r];

      const title = (row[idx("title", 0)] ?? "").trim();
      const url = normalizeUrl(row[idx("url", 1)] ?? "");
      const description = (row[idx("description", 2)] ?? "").trim();
      const tagsRaw = (row[idx("tags", 3)] ?? "").trim();
      const icon = (row[idx("icon", 4)] ?? "").trim();

      if (!title || !url) {
        skipped++;
        continue;
      }

      const tags = tagsRaw
        ? tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const item: Shortcut = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        title,
        url,
        description: description || undefined,
        tags: tags.length ? tags : undefined,
        icon: icon || undefined,
      };

      byUrl.set(url.toLowerCase(), item); // si URL repetida, sobreescribe
      imported++;
    }

    return {
      shortcuts: Array.from(byUrl.values()),
      result: { imported, skipped },
    };
  }

  async function importFromFileReplace(file: File) {
    const text = await file.text();
    return importFromTextReplace(text);
  }

  return {
    exportToCsv,
    importFromTextReplace,
    importFromFileReplace,
  };
}
