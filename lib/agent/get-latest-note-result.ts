import type { DATABASE_TYPES } from "@/configs/db";
import { notes, personNotes, people, commitments, personalDetails } from "@/drizzle/schema";
import { desc, eq, inArray } from "@/drizzle";
import type { AgentResponse } from "@/validators/agent.validator";

type Db = DATABASE_TYPES;

/**
 * Fetch the latest note and its linked people, commitments, personal details. Returns null if no notes.
 */
export async function getLatestNoteResult(db: Db): Promise<AgentResponse | null> {
  const [latestNote] = await db
    .select()
    .from(notes)
    .orderBy(desc(notes.createdAt))
    .limit(1);

  if (!latestNote) return null;

  const linkedPersonNotes = await db
    .select({ personId: personNotes.personId })
    .from(personNotes)
    .where(eq(personNotes.noteId, latestNote.id));

  const personIds = [...new Set(linkedPersonNotes.map((pn) => pn.personId))];
  const savedPeople =
    personIds.length > 0
      ? await db.select().from(people).where(inArray(people.id, personIds))
      : [];

  const savedCommitments = await db
    .select()
    .from(commitments)
    .where(eq(commitments.noteId, latestNote.id));

  const savedPersonalDetails = await db
    .select()
    .from(personalDetails)
    .where(eq(personalDetails.noteId, latestNote.id));

  return {
    noteId: latestNote.id,
    toolCallLog: [],
    people: savedPeople,
    commitments: savedCommitments,
    personalDetails: savedPersonalDetails,
  };
}
