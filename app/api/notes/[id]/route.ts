import { getDb } from "@/configs/db"
import { notes, personNotes, commitments, personalDetails, people } from "@/drizzle/schema"
import { eq, inArray } from "@/drizzle"
import { deleteFile } from "@/configs/s3"
import { apiSuccessResponse, apiErrorResponse, ErrorCode } from "@/configs/api"
import { parseNoteAttachments } from "@/validators/note-attachment.validator"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return Response.json(
      apiErrorResponse(ErrorCode.VALIDATION_ERROR, "note id is required"),
      { status: 400 }
    )
  }

  const db = getDb()

  // fetch note first to get audioStorageKey
  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1)

  if (!note) {
    return Response.json(
      apiErrorResponse(ErrorCode.NOT_FOUND, "note not found"),
      { status: 404 }
    )
  }

  // delete audio from storage if exists
  if (note.audioStorageKey) {
    await deleteFile(note.audioStorageKey).catch(() => undefined)
  }

  // delete attachment files from storage
  const attachments = parseNoteAttachments(note.attachments)
  await Promise.all(
    attachments.map((att) => deleteFile(att.key).catch(() => undefined))
  )

  // person IDs linked to this note (before we remove person_notes)
  const linked = await db
    .select({ personId: personNotes.personId })
    .from(personNotes)
    .where(eq(personNotes.noteId, id))
  const affectedPersonIds = [...new Set(linked.map((r) => r.personId))]

  // delete all related records first (fk constraints)
  await db.delete(personNotes).where(eq(personNotes.noteId, id))
  await db.delete(commitments).where(eq(commitments.noteId, id))
  await db.delete(personalDetails).where(eq(personalDetails.noteId, id))

  // delete the note
  await db.delete(notes).where(eq(notes.id, id))

  // when the last note linking a person is removed, delete that person (no orphan people)
  if (affectedPersonIds.length > 0) {
    const stillLinked = await db
      .select({ personId: personNotes.personId })
      .from(personNotes)
      .where(inArray(personNotes.personId, affectedPersonIds))
    const stillLinkedSet = new Set(stillLinked.map((r) => r.personId))
    const orphanIds = affectedPersonIds.filter((pid) => !stillLinkedSet.has(pid))
    if (orphanIds.length > 0) {
      await db.delete(people).where(inArray(people.id, orphanIds))
    }
  }

  return Response.json(apiSuccessResponse({ deleted: true }))
}