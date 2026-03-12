import { eq } from "drizzle-orm";
import { getDb } from "@/configs/db";
import { people, personNotes, notes, commitments, personalDetails } from "@/drizzle/schema";
import { ErrorCode, apiSuccessResponse, apiErrorResponse } from "@/configs/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const [person] = await db.select().from(people).where(eq(people.id, id));
    if (!person) {
      return Response.json(apiErrorResponse(ErrorCode.NOT_FOUND, "Person not found"), {
        status: 404,
      });
    }

    const [personCommitments, personDetails, personNoteLinks] = await Promise.all([
      db.select().from(commitments).where(eq(commitments.personId, id)),
      db.select().from(personalDetails).where(eq(personalDetails.personId, id)),
      db.select().from(personNotes).where(eq(personNotes.personId, id)),
    ]);

    const notesWithNoteData = await Promise.all(
      personNoteLinks.map(async (pn) => {
        const [noteRow] = await db
          .select({ id: notes.id, rawText: notes.rawText, createdAt: notes.createdAt })
          .from(notes)
          .where(eq(notes.id, pn.noteId));
        return {
          id: pn.id,
          noteId: pn.noteId,
          extractedContext: pn.extractedContext,
          createdAt: pn.createdAt.toISOString(),
          note: noteRow
            ? {
                id: noteRow.id,
                rawText: noteRow.rawText,
                createdAt: noteRow.createdAt.toISOString(),
              }
            : { id: pn.noteId, rawText: "", createdAt: "" },
        };
      })
    );

    const payload = {
      person: {
        ...person,
        createdAt: person.createdAt.toISOString(),
        updatedAt: person.updatedAt.toISOString(),
      },
      commitments: personCommitments.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      personalDetails: personDetails.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      })),
      notes: notesWithNoteData,
    };

    return Response.json(apiSuccessResponse(payload));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch person";
    return Response.json(apiErrorResponse(ErrorCode.INTERNAL_ERROR, message), { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const commitmentId = body?.commitmentId;
    const isCompleted = body?.isCompleted === true;

    if (!commitmentId || typeof isCompleted !== "boolean") {
      return Response.json(
        apiErrorResponse(ErrorCode.BAD_REQUEST, "commitmentId and isCompleted required"),
        { status: 400 }
      );
    }

    const db = getDb();

    const [updated] = await db
      .update(commitments)
      .set({ isCompleted })
      .where(eq(commitments.id, commitmentId))
      .returning();

    if (!updated || updated.personId !== id) {
      return Response.json(apiErrorResponse(ErrorCode.NOT_FOUND, "Commitment not found"), {
        status: 404,
      });
    }

    return Response.json(apiSuccessResponse({ ok: true }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update commitment";
    return Response.json(apiErrorResponse(ErrorCode.INTERNAL_ERROR, message), { status: 500 });
  }
}
