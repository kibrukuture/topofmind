import { tool } from "ai";
import z from "@/configs/zod4";
import { eq } from "@/drizzle";
import type { DATABASE_TYPES } from "@/configs/db";
import { notes } from "@/drizzle/schema";

type Db = DATABASE_TYPES;

export function saveNoteTitleTool(db: Db, noteId: string) {
  return tool({
    description:
      "Set a short, descriptive title for this note (e.g. 'Lunch with Sarah', 'Stripe CTO intro'). Call this once per note.",
    inputSchema: z.object({
      title: z.string().describe("Short title for the note (a few words, no period)"),
    }),
    execute: async ({ title }) => {
      await db.update(notes).set({ title: title.trim() }).where(eq(notes.id, noteId));
      return { saved: true };
    },
  });
}
