import { tool } from "ai";
import z from "@/configs/zod4";
import type { DATABASE_TYPES } from "@/configs/db";
import { people, personNotes } from "@/drizzle/schema";

type Db = DATABASE_TYPES;

export function createPersonTool(db: Db, noteId: string) {
  return tool({
    description: "create a new person. call only when findPerson returns no personId.",
    inputSchema: z.object({
      name: z.string().describe("full name of the person"),
      company: z.string().optional().describe("company they work at"),
      role: z.string().optional().describe("their job title or role"),
      email: z.string().optional(),
      phone: z.string().optional(),
    }),
    execute: async ({ name, company, role, email, phone }) => {
      const [person] = await db
        .insert(people)
        .values({ name, company, role, email, phone })
        .returning();

      if (!person) {
        throw new Error("failed to create person");
      }

      await db.insert(personNotes).values({
        personId: person.id,
        noteId,
      });
      return { personId: person.id };
    },
  });
}
