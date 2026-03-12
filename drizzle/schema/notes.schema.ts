import { index, jsonb, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";
import { topofmindSchema } from "./topofmind";

export const notes = topofmindSchema.table(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: text("title"),
    rawText: text("raw_text").notNull(),
    audioStorageKey: text("audio_storage_key"),
    embedding: vector("embedding", { dimensions: 768 }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    attachments: jsonb("attachments").default([]),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notes_created_at_idx").on(table.createdAt),
    index("notes_embedding_idx")
      .using("ivfflat", table.embedding.op("vector_cosine_ops"))
      .with({ lists: 100 }),
  ],
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
