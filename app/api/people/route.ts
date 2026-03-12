import { getDb } from "@/configs/db"
import { people, commitments, personNotes, personalDetails } from "@/drizzle/schema"
import { desc, eq, and, sql } from "drizzle-orm"
import { apiSuccessResponse } from "@/configs/api"

export async function GET() {
  const db = getDb()

  const [allPeople, noteLinks, commitmentLinks, detailLinks] = await Promise.all([
    db
      .select()
      .from(people)
      .orderBy(desc(people.updatedAt)),
    db.select({ personId: personNotes.personId }).from(personNotes),
    db.select({ personId: commitments.personId }).from(commitments),
    db.select({ personId: personalDetails.personId }).from(personalDetails),
  ])

  const personIdsWithContext = new Set<string>([
    ...noteLinks.map((row) => row.personId),
    ...commitmentLinks.map((row) => row.personId),
    ...detailLinks.map((row) => row.personId),
  ])

  const peopleWithContext = allPeople.filter((person) =>
    personIdsWithContext.has(person.id),
  )

  const result = await Promise.all(
    peopleWithContext.map(async (person) => {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(commitments)
        .where(
          and(
            eq(commitments.personId, person.id),
            eq(commitments.isCompleted, false),
          ),
        )
      return {
        ...person,
        openCommitmentsCount: row?.count ?? 0,
      }
    }),
  )

  return Response.json(apiSuccessResponse(result))
}