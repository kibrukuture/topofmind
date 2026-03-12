import { index, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { topofmindSchema } from "./topofmind";
import { people } from "./people.schema";
import { notes } from "./notes.schema";

export const personNotes = topofmindSchema.table(
  "person_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    extractedContext: text("extracted_context"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("person_notes_person_id_idx").on(table.personId),
    index("person_notes_note_id_idx").on(table.noteId),
  ],
);

export type PersonNote = typeof personNotes.$inferSelect;
export type NewPersonNote = typeof personNotes.$inferInsert;
