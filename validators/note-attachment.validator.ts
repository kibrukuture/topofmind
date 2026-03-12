import z from "@/configs/zod4";

/** Single source of truth for note attachment shape (DB jsonb + API). */
export const noteAttachmentSchema = z.object({
  key: z.string(),
  name: z.string(),
  type: z.string(),
});

export const noteAttachmentsSchema = z.array(noteAttachmentSchema);

export type NoteAttachment = z.infer<typeof noteAttachmentSchema>;

/** Parse jsonb attachments from DB (unknown) to typed array. */
export function parseNoteAttachments(value: unknown): NoteAttachment[] {
  const parsed = noteAttachmentsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}
