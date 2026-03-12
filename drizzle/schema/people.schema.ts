import { index, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { topofmindSchema } from "./topofmind";

export const people = topofmindSchema.table(
  "people",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    company: text("company"),
    role: text("role"),
    email: text("email"),
    phone: text("phone"),
    summary: text("summary"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("people_updated_at_idx").on(table.updatedAt)],
);

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
