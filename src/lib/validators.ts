
// src/lib/validators.ts
import { z } from "zod";

/**
 * Validamos los campos que el usuario puede introducir.
 * No incluimos 'id' ni 'createdAt' porque los generamos nosotros.
 */
export const shortcutInputSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  url: z
    .string()
    .url("Debe ser una URL válida")
    .max(2048, "URL demasiado larga")
    .refine((val) => !val.toLowerCase().startsWith("javascript:"), {
      message: "URL no permitida",
    }),
  icon: z
    .string()
    .max(256, "Icono demasiado largo")
    .optional(),
  type: z.enum(["link", "app", "doc", "dashboard", "other"], {
    required_error: "Selecciona un tipo",
  }),
  // Etiquetas separadas por comas que luego convertiremos en array; aquí validamos el array final
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, "Como máximo 10 etiquetas")
    .optional(),
});

export type ShortcutInput = z.infer<typeof shortcutInputSchema>;
