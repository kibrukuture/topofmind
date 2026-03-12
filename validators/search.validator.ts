import z from "@/configs/zod4"

export const noteSimilarityHitSchema = z.object({
  id: z.string(),
  raw_text: z.string(),
  created_at: z.union([z.string(), z.date()]),
  similarity: z.number(),
})

export type NoteSimilarityHit = z.infer<typeof noteSimilarityHitSchema>

export function parseNoteSimilarityHits(raw: unknown): NoteSimilarityHit[] {
  if (!Array.isArray(raw)) return []
  const hits: NoteSimilarityHit[] = []
  for (const item of raw) {
    const parsed = noteSimilarityHitSchema.safeParse(item)
    if (parsed.success) {
      hits.push(parsed.data)
    }
  }
  return hits
}
