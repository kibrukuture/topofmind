import { index, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { topofmindSchema } from "./topofmind";
import { people } from "./people.schema";
import { notes } from "./notes.schema";

export const personalDetails = topofmindSchema.table(
  "personal_details",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    detail: text("detail").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("personal_details_person_id_idx").on(table.personId),
    index("personal_details_note_id_idx").on(table.noteId),
  ],
);

export type PersonalDetail = typeof personalDetails.$inferSelect;
export type NewPersonalDetail = typeof personalDetails.$inferInsert;
