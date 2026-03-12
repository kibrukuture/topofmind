import { desc } from "drizzle-orm";
import { getDb } from "@/configs/db";
import { notes, personNotes, people } from "@/drizzle/schema";
import { eq, inArray } from "@/drizzle";
import { apiSuccessResponse, apiErrorResponse, ErrorCode } from "@/configs/api";

export type NoteWithPeople = {
  id: string;
  rawText: string;
  audioStorageKey: string | null;
  createdAt: string;
  people: { id: string; name: string; role?: string | null; company?: string | null }[];
};

export async function GET() {
  try {
    const db = getDb();
  const allNotes = await db
    .select()
    .from(notes)
    .orderBy(desc(notes.createdAt))
    .limit(50);

  if (allNotes.length === 0) {
    return Response.json(apiSuccessResponse([]));
  }

  const noteIds = allNotes.map((n) => n.id);
  const linked = await db
    .select({ personId: personNotes.personId, noteId: personNotes.noteId })
    .from(personNotes)
    .where(inArray(personNotes.noteId, noteIds));

  const personIds = [...new Set(linked.map((l) => l.personId))];
  const peopleList =
    personIds.length > 0
      ? await db.select().from(people).where(inArray(people.id, personIds))
      : [];

  const notesWithPeople: NoteWithPeople[] = allNotes.map((note) => {
    const notePersonIds = linked
      .filter((l) => l.noteId === note.id)
      .map((l) => l.personId);
    const notePeople = peopleList
      .filter((p) => notePersonIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role ?? undefined,
        company: p.company ?? undefined,
      }));

    return {
      id: note.id,
      rawText: note.rawText,
      audioStorageKey: note.audioStorageKey,
      createdAt: note.createdAt.toISOString(),
      people: notePeople,
    };
  });

    return Response.json(apiSuccessResponse(notesWithPeople));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch notes";
    return Response.json(apiErrorResponse(ErrorCode.INTERNAL_ERROR, message), { status: 500 });
  }
}
