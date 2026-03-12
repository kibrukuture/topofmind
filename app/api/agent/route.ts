import { embed, generateText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { getDb } from "@/configs/db";
import { uploadFile } from "@/configs/s3";
import { agentTools } from "@/tools/agent";
import { notes, personNotes, people, commitments, personalDetails } from "@/drizzle/schema";
import { desc, eq, inArray } from "@/drizzle";
import { buildToolCallLog } from "@/lib/agent-tool-call-log";
import { transcribeAudio } from "@/lib/transcribe";
import { agentBodySchema } from "@/validators/agent.validator";
import { ErrorCode, apiSuccessResponse, apiErrorResponse } from "@/configs/api";

export async function GET() {
  try {
    const db = getDb();
    const [latestNote] = await db
    .select()
    .from(notes)
    .orderBy(desc(notes.createdAt))
    .limit(1);

  if (!latestNote) {
    return Response.json(apiSuccessResponse(null));
  }

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

    return Response.json(
      apiSuccessResponse({
        noteId: latestNote.id,
        toolCallLog: [],
        people: savedPeople,
        commitments: savedCommitments,
        personalDetails: savedPersonalDetails,
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch latest note";
    return Response.json(apiErrorResponse(ErrorCode.INTERNAL_ERROR, message), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const isFormData = contentType.includes("multipart/form-data");

    let text: string;
    let audioStorageKey: string | undefined;

    if (isFormData) {
    const formData = await req.formData();
    const textField = formData.get("text");
    const audioFile = formData.get("audio");

    const hasText = typeof textField === "string" && textField.trim().length > 0;
    const hasAudio = audioFile instanceof File && audioFile.size > 0;

    if (hasText && hasAudio) {
      return Response.json(apiErrorResponse(ErrorCode.BAD_REQUEST, "provide either text or audio, not both"), { status: 400 });
    }
    if (!hasText && !hasAudio) {
      return Response.json(apiErrorResponse(ErrorCode.BAD_REQUEST, "text or audio is required"), { status: 400 });
    }

    if (hasText) {
      text = (textField as string).trim();
    } else {
      const buffer = Buffer.from(await (audioFile as File).arrayBuffer());
      audioStorageKey = await uploadFile(buffer, `voice-notes/${crypto.randomUUID()}.webm`, "audio/webm");
      try {
        text = await transcribeAudio(buffer);
      } catch {
        return Response.json(apiErrorResponse(ErrorCode.EXTRACTION_FAILED, "failed to transcribe audio"), { status: 500 });
      }
      if (!text.trim()) {
        return Response.json(apiErrorResponse(ErrorCode.BAD_REQUEST, "audio produced no transcript"), { status: 400 });
      }
    }
  } else {
    const parsed = agentBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(apiErrorResponse(ErrorCode.VALIDATION_ERROR, "text is required and must be non-empty"), { status: 400 });
    }
    text = parsed.data.text;
  }
  const db = getDb();

  const [note] = await db
    .insert(notes)
    .values({ rawText: text, audioStorageKey: audioStorageKey ?? null })
    .returning();
  if (!note) {
    return Response.json(apiErrorResponse(ErrorCode.INTERNAL_ERROR, "failed to save note"), { status: 500 });
  }

  const tools = agentTools(db, note.id);
  const generation = await generateText({
    model: google("gemini-2.5-flash"),
    system: `You are a relationship memory assistant. Process raw notes about meetings, conversations, and interactions. Extract all people mentioned, their details, any commitments or follow-up actions, and any personal details worth remembering. Be thorough. If multiple people are mentioned, save each one separately. Always use the tools to save data — never just return text. Call saveNoteTitle once with a short, descriptive title for the note (e.g. "Lunch with Sarah", "Stripe CTO intro"). Call findPerson first; if it returns personId null, call createPerson.`,
    prompt: `Process this note and extract everything important: ${text}`,
    tools,
    stopWhen: stepCountIs(10),
  });

  const toolCallLog = buildToolCallLog(generation.steps);

  const { embedding } = await embed({
    model: google.embedding("gemini-embedding-001"),
    value: text,
    providerOptions: {
      google: { outputDimensionality: 768 },
    },
  });
  await db.update(notes).set({ embedding }).where(eq(notes.id, note.id));

  const linkedPersonNotes = await db
    .select({ personId: personNotes.personId })
    .from(personNotes)
    .where(eq(personNotes.noteId, note.id));

  const personIds = [...new Set(linkedPersonNotes.map((pn) => pn.personId))];
  const savedPeople =
    personIds.length > 0
      ? await db.select().from(people).where(inArray(people.id, personIds))
      : [];

  const savedCommitments = await db
    .select()
    .from(commitments)
    .where(eq(commitments.noteId, note.id));

  const savedPersonalDetails = await db
    .select()
    .from(personalDetails)
    .where(eq(personalDetails.noteId, note.id));

    return Response.json(
      apiSuccessResponse({
        noteId: note.id,
        toolCallLog,
        people: savedPeople,
        commitments: savedCommitments,
        personalDetails: savedPersonalDetails,
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process note";
    return Response.json(apiErrorResponse(ErrorCode.INTERNAL_ERROR, message), { status: 500 });
  }
}
 