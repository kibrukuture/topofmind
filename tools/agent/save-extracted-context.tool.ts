import { tool } from "ai";
import z from "@/configs/zod4";
import { eq, and } from "@/drizzle";
import type { DATABASE_TYPES } from "@/configs/db";
import { personNotes } from "@/drizzle/schema";

type Db = DATABASE_TYPES;

export function saveExtractedContextTool(db: Db, noteId: string) {
  return tool({
    description:
      "save what was specifically mentioned or noted about this person in this note",
    inputSchema: z.object({
      personId: z.string().describe("the person id returned by findPerson or createPerson"),
      context: z
        .string()
        .describe("summary of what was mentioned or noted about this person in the note"),
    }),
    execute: async ({ personId, context }) => {
      await db
        .update(personNotes)
        .set({ extractedContext: context })
        .where(and(eq(personNotes.noteId, noteId), eq(personNotes.personId, personId)));
      return { saved: true };
    },
  });
}
