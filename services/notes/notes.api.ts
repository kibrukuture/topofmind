import { get, del } from "@/services";
import { NOTES_ROUTES } from "@/lib/api/notes.routes";

export type NoteWithPeople = {
  id: string;
  rawText: string;
  audioStorageKey: string | null;
  createdAt: string;
  people: { id: string; name: string; role?: string | null; company?: string | null }[];
};

export async function listNotes(): Promise<NoteWithPeople[]> {
  return get<NoteWithPeople[]>(NOTES_ROUTES.list());
}

export async function deleteNote(id: string): Promise<{ deleted: boolean }> {
  return del<{ deleted: boolean }>(NOTES_ROUTES.delete(id))
}
