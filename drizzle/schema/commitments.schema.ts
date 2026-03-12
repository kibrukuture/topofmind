import { boolean, index, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { topofmindSchema } from "./topofmind";
import { people } from "./people.schema";
import { notes } from "./notes.schema";

export const commitments = topofmindSchema.table(
  "commitments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    action: text("action").notNull(),
    dueDate: text("due_date"),
    isCompleted: boolean("is_completed").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("commitments_person_id_idx").on(table.personId),
    index("commitments_note_id_idx").on(table.noteId),
    index("commitments_person_id_is_completed_idx").on(
      table.personId,
      table.isCompleted,
    ),
  ],
);

export type Commitment = typeof commitments.$inferSelect;
export type NewCommitment = typeof commitments.$inferInsert;
