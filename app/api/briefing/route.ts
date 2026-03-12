import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { getDb } from "@/configs/db"
import { people, commitments, personalDetails, personNotes, notes } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { apiSuccessResponse, apiErrorResponse, ErrorCode } from "@/configs/api"

export async function POST(req: Request) {
  const { personId } = await req.json()

  if (!personId) {
    return Response.json(
      apiErrorResponse(ErrorCode.VALIDATION_ERROR, "personId is required"),
      { status: 400 }
    )
  }

  const db = getDb()

  // fetch the person
  const [person] = await db
    .select()
    .from(people)
    .where(eq(people.id, personId))
    .limit(1)

  if (!person) {
    return Response.json(
      apiErrorResponse(ErrorCode.NOT_FOUND, "person not found"),
      { status: 404 }
    )
  }

  // fetch all open commitments
  const allCommitments = await db
    .select()
    .from(commitments)
    .where(eq(commitments.personId, personId))

  // fetch all personal details
  const allDetails = await db
    .select()
    .from(personalDetails)
    .where(eq(personalDetails.personId, personId))

  // fetch all note contexts linked to this person
  const allPersonNotes = await db
    .select({
      extractedContext: personNotes.extractedContext,
      rawText: notes.rawText,
      createdAt: notes.createdAt,
    })
    .from(personNotes)
    .innerJoin(notes, eq(personNotes.noteId, notes.id))
    .where(eq(personNotes.personId, personId))

  // build rich context string — this is the RAG part
  const context = `
person: ${person.name}
${person.role ? `role: ${person.role}` : ""}
${person.company ? `company: ${person.company}` : ""}
${person.email ? `email: ${person.email}` : ""}

past interactions (${allPersonNotes.length} notes):
${allPersonNotes
  .map((n) =>
    n.extractedContext
      ? `- ${n.extractedContext}`
      : `- ${n.rawText.slice(0, 200)}`
  )
  .join("\n")}

personal details remembered:
${allDetails.length > 0
  ? allDetails.map((d) => `- ${d.detail}`).join("\n")
  : "- none recorded yet"
}

open commitments:
${allCommitments.filter((c) => !c.isCompleted).length > 0
  ? allCommitments
      .filter((c) => !c.isCompleted)
      .map((c) => `- ${c.action}${c.dueDate ? ` (due: ${c.dueDate})` : ""}`)
      .join("\n")
  : "- none"
}

completed commitments:
${allCommitments.filter((c) => c.isCompleted).length > 0
  ? allCommitments
      .filter((c) => c.isCompleted)
      .map((c) => `- ${c.action}`)
      .join("\n")
  : "- none"
}
  `.trim()

  // generate briefing with gemini
  const { text: briefing } = await generateText({
    model: google("gemini-2.0-flash"),
    system: `you are a relationship intelligence assistant. 
generate a concise pre-meeting briefing about this person based on everything known about them. 
write in second person ("you met", "they mentioned", "you promised"). 
be warm, human, and practical. 
structure it naturally — who they are, what you know about them personally, what you owe them, what they owe you. 
keep it under 100 words. no bullet points. flowing prose only.`,
    prompt: `generate a pre-meeting briefing for this person:\n\n${context}`,
  })

  // save the briefing as the person summary
  await db
    .update(people)
    .set({ summary: briefing, updatedAt: new Date() })
    .where(eq(people.id, personId))

  return Response.json(
    apiSuccessResponse({
      briefing,
      person: { ...person, summary: briefing },
    })
  )
}