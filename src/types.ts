
export type ShortcutType =
  | "link"        // enlace estándar
  | "app"         // aplicación (SaaS, interna)
  | "doc"         // documento (Drive, Notion, etc.)
  | "dashboard"   // panel de control/analytics
  | "other";      // otros

export type Shortcut = {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;           // emoji ("📎") o URL ("https://.../favicon.ico")
  type: ShortcutType;
  tags?: string[];         // etiquetas libres
  createdAt: string;       // ISO
  updatedAt?: string;      // ISO
};
