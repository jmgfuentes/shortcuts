// src/lib/validators.ts
import { z } from "zod";

/**
 * Validate user input fields.
 * We don't include 'id' or timestamps because the app generates them.
 */
export const shortcutInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Max 100 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  url: z
    .string()
    .url("Must be a valid URL")
    .max(2048, "URL is too long")
    .refine((val) => !val.toLowerCase().startsWith("javascript:"), {
      message: "URL not allowed",
    }),
  icon: z.string().max(256, "Icon is too long").optional(),
  // Tags are stored as an array (already parsed from comma-separated input)
  tags: z.array(z.string().min(1).max(30)).max(10, "Max 10 tags").optional(),
});

export type ShortcutInput = z.infer<typeof shortcutInputSchema>;
