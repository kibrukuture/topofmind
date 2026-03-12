import { tool } from "ai";
import z from "@/configs/zod4";
import type { DATABASE_TYPES } from "@/configs/db";
import { commitments } from "@/drizzle/schema";

type Db = DATABASE_TYPES;

export function saveCommitmentTool(db: Db, noteId: string) {
  return tool({
    description:
      "save a commitment, follow up action, or promise — either something you need to do for them or something they promised to do",
    inputSchema: z.object({
      personId: z.string().describe("the person id returned by findPerson or createPerson"),
      action: z.string().describe("clear description of what needs to happen"),
      dueDate: z
        .string()
        .optional()
        .describe("when this needs to happen, in natural language like 'next monday' or '2 weeks'"),
    }),
    execute: async ({ personId, action, dueDate }) => {
      await db.insert(commitments).values({
        personId,
        noteId,
        action,
        dueDate,
      });
      return { saved: true, action };
    },
  });
}
