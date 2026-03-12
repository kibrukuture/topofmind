import { get, del } from "@/services";
import { NOTES_ROUTES } from "@/lib/api/notes.routes";
import type { NoteWithPeople } from "@/validators/note-with-people.validator";

export async function listNotes(): Promise<NoteWithPeople[]> {
  return get<NoteWithPeople[]>(NOTES_ROUTES.list());
}

export async function deleteNote(id: string): Promise<{ deleted: boolean }> {
  return del<{ deleted: boolean }>(NOTES_ROUTES.delete(id))
}
