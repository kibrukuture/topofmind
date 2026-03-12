import { tool } from "ai";
import z from "@/configs/zod4";
import { eq, and, ilike } from "@/drizzle";
import type { DATABASE_TYPES } from "@/configs/db";
import { people, personNotes } from "@/drizzle/schema";

type Db = DATABASE_TYPES;

export function findPersonTool(db: Db, noteId: string) {
  return tool({
    description: "find an existing person by name. call this before createPerson or saving commitments/details.",
    inputSchema: z.object({
      name: z.string().describe("full name of the person"),
    }),
    execute: async ({ name }) => {
      const found = await db
        .select()
        .from(people)
        .where(ilike(people.name, `%${name}%`))
        .limit(1);

      if (found.length === 0) {
        return { personId: null };
      }

      const person = found[0];
      const existingLink = await db
        .select()
        .from(personNotes)
        .where(and(eq(personNotes.personId, person.id), eq(personNotes.noteId, noteId)))
        .limit(1);

      if (existingLink.length === 0) {
        await db.insert(personNotes).values({
          personId: person.id,
          noteId,
        });
      }
      return { personId: person.id };
    },
  });
}
