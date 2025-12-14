
// src/lib/storage.ts
import type { Shortcut } from "@/types";

/**
 * Clave única en localStorage para guardar la colección.
 * Si en el futuro cambiamos el formato, podemos versionar (v2, v3...).
 */
const STORAGE_KEY = "shortcuts:v1";

/**
 * Carga todos los shortcuts desde localStorage.
 * Devuelve [] si no hay nada o si el JSON está corrupto.
 */
export function loadShortcuts(): Shortcut[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    // Validación superficial: asegura campos mínimos para evitar crasheos
    return data.filter(
      (item: any) =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.url === "string"
    );
  } catch {
    // Si el parse falla, devolvemos lista vacía (robustez)
    return [];
  }
}

/**
 * Guarda la lista completa en localStorage.
 */
export function saveShortcuts(list: Shortcut[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Añade un shortcut al inicio de la lista.
 * Devuelve la lista nueva (patrón inmutable).
 */
export function addShortcutLocal(list: Shortcut[], s: Shortcut): Shortcut[] {
  const next = [s, ...list];
  saveShortcuts(next);
  return next;
}

/**
 * Elimina un shortcut por id.
 * Devuelve la lista nueva.
 */
export function removeShortcutLocal(list: Shortcut[], id: string): Shortcut[] {
  const next = list.filter((s) => s.id !== id);
  saveShortcuts(next);
  return next;
}

/**
 * Actualiza un shortcut por id con campos parciales.
 * No permite cambiar 'id' ni 'createdAt'.
 * Devuelve la lista nueva.
 */
export function updateShortcutLocal(
  list: Shortcut[],
  id: string,
  patch: Partial<Omit<Shortcut, "id" | "createdAt">>
): Shortcut[] {
  const next = list.map((s) =>
    s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
  );
  saveShortcuts(next);
  return next;
}

/**
 * Limpia todos los shortcuts (útil para debug o reset).
 */
export function clearShortcuts() {
  localStorage.removeItem(STORAGE_KEY);
}
