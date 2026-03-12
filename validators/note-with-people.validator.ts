import z from "@/configs/zod4";
import { noteAttachmentSchema } from "@/validators/note-attachment.validator";

const notePersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
});

/** Single source of truth for note list item (API response). */
export const noteWithPeopleSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  rawText: z.string(),
  audioStorageKey: z.string().nullable(),
  attachments: z.array(noteAttachmentSchema),
  createdAt: z.string(),
  people: z.array(notePersonSchema),
});

export type NoteWithPeople = z.infer<typeof noteWithPeopleSchema>;
