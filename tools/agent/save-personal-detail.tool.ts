import { tool } from "ai";
import z from "@/configs/zod4";
import type { DATABASE_TYPES } from "@/configs/db";
import { personalDetails } from "@/drizzle/schema";

type Db = DATABASE_TYPES;

export function savePersonalDetailTool(db: Db, noteId: string) {
  return tool({
    description:
      "save an interesting personal detail worth remembering — family, hobbies, preferences, books, recommendations, struggles, goals, anything personal",
    inputSchema: z.object({
      personId: z.string().describe("the person id returned by findPerson or createPerson"),
      detail: z
        .string()
        .describe("the personal detail to remember, written as a clear statement"),
    }),
    execute: async ({ personId, detail }) => {
      await db.insert(personalDetails).values({
        personId,
        noteId,
        detail,
      });
      return { saved: true, detail };
    },
  });
}
