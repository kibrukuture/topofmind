import { generateText, tool, embed, stepCountIs } from "ai"
import { google } from "@ai-sdk/google"
import z from "@/configs/zod4"
import { getDb } from "@/configs/db"
import { personNotes, people, commitments, personalDetails } from "@/drizzle/schema"
import { inArray, ilike, sql } from "drizzle-orm"
import type { Person, Commitment, PersonalDetail } from "@/drizzle/schema"
import { parseNoteSimilarityHits, type NoteSimilarityHit } from "@/validators/search.validator"
import { ErrorCode, apiErrorResponse, apiSuccessResponse } from "@/configs/api"

type SearchAccumulator = {
  people: Person[]
  commitments: Commitment[]
  personalDetails: PersonalDetail[]
  notes: NoteSimilarityHit[]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const query = typeof body?.query === "string" ? body.query : ""
    if (!query?.trim()) {
      return Response.json(apiErrorResponse(ErrorCode.BAD_REQUEST, "query required"), { status: 400 })
    }

    const db = getDb()

    const { embedding: queryEmbedding } = await embed({
      model: google.embedding("gemini-embedding-001"),
      value: query,
      providerOptions: {
        google: { outputDimensionality: 768 },
      },
    })
  const embeddingStr = `[${queryEmbedding.join(",")}]`

  let accumulatedSearch: SearchAccumulator = {
    people: [],
    commitments: [],
    personalDetails: [],
    notes: [],
  }

  const generation = await generateText({
    model: google("gemini-2.0-flash"),
    system: `you are a relationship memory search assistant. 
    the user is searching their personal notes and relationship memory. 
    use the available tools to find relevant information. 
    always call searchNotesBySimilarity first. 
    then optionally call searchPeopleByName if the query seems to be about a specific person. 
    after gathering data, synthesize everything into a warm concise summary.`,
    prompt: `search query: "${query}"`,
    stopWhen: stepCountIs(5),
    tools: {

      searchNotesBySimilarity: tool({
        description: "search notes using semantic vector similarity — use this for any topic, concept, or context based search",
        inputSchema: z.object({
          limit: z.number().default(5).describe("how many notes to retrieve"),
        }),
        execute: async ({ limit }) => {
          const similarNotesQuery = await db.execute(sql`
            select id, raw_text, created_at,
                   1 - (embedding <=> ${embeddingStr}::vector) as similarity
            from topofmind.notes
            where embedding is not null
            order by embedding <=> ${embeddingStr}::vector
            limit ${limit}
          `)

          const notesWithSimilarity = parseNoteSimilarityHits(similarNotesQuery.rows)
          if (notesWithSimilarity.length === 0) return { notes: [], people: [], commitments: [], personalDetails: [] }

          const noteIds = notesWithSimilarity.map((n) => n.id)

          const linkedPersonNotes = await db.select({ personId: personNotes.personId, noteId: personNotes.noteId })
            .from(personNotes)
            .where(inArray(personNotes.noteId, noteIds))

          const personIds = [...new Set(linkedPersonNotes.map((l) => l.personId))]

          const foundPeople = personIds.length > 0
            ? await db.select().from(people).where(inArray(people.id, personIds))
            : []

          const foundCommitments = await db.select().from(commitments).where(inArray(commitments.noteId, noteIds))
          const foundDetails = await db.select().from(personalDetails).where(inArray(personalDetails.noteId, noteIds))

          accumulatedSearch = {
            people: foundPeople,
            commitments: foundCommitments,
            personalDetails: foundDetails,
            notes: notesWithSimilarity,
          }

          return accumulatedSearch
        },
      }),

      searchPeopleByName: tool({
        description: "search for a specific person by name — use when query contains a person's name",
        inputSchema: z.object({
          name: z.string().describe("the person name to search for"),
        }),
        execute: async ({ name }) => {
          const foundPeople = await db.select().from(people).where(ilike(people.name, `%${name}%`))
          if (foundPeople.length === 0) return { people: [] }

          const personIds = foundPeople.map((p) => p.id)
          const foundCommitments = await db.select().from(commitments).where(inArray(commitments.personId, personIds))
          const foundDetails = await db.select().from(personalDetails).where(inArray(personalDetails.personId, personIds))

          accumulatedSearch = {
            ...accumulatedSearch,
            people: [...accumulatedSearch.people, ...foundPeople].filter(
              (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
            ),
            commitments: [...accumulatedSearch.commitments, ...foundCommitments],
            personalDetails: [...accumulatedSearch.personalDetails, ...foundDetails],
          }

          return accumulatedSearch
        },
      }),

      searchCommitments: tool({
        description: "search for commitments or follow up actions — use when query is about tasks, follow ups, or promises",
        inputSchema: z.object({
          keyword: z.string().describe("keyword to search in commitment actions"),
        }),
        execute: async ({ keyword }) => {
          const found = await db.select().from(commitments).where(ilike(commitments.action, `%${keyword}%`))
          accumulatedSearch = {
            ...accumulatedSearch,
            commitments: [...accumulatedSearch.commitments, ...found].filter(
              (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
            ),
          }
          return { commitments: found }
        },
      }),

    },
  })

    const summary = generation.text

    return Response.json(
      apiSuccessResponse({
        summary,
        people: accumulatedSearch.people,
        commitments: accumulatedSearch.commitments,
        personalDetails: accumulatedSearch.personalDetails,
        notes: accumulatedSearch.notes,
      })
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed"
    return Response.json(apiErrorResponse(ErrorCode.INTERNAL_ERROR, message), { status: 500 })
  }
}