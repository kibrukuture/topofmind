
CREATE TABLE "topofmind"."db_pingers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "topofmind"."db_pingers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "topofmind"."people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"role" text,
	"email" text,
	"phone" text,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topofmind"."notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_text" text NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topofmind"."person_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"note_id" uuid NOT NULL,
	"extracted_context" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topofmind"."commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"note_id" uuid NOT NULL,
	"action" text NOT NULL,
	"due_date" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topofmind"."personal_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"note_id" uuid NOT NULL,
	"detail" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "topofmind"."person_notes" ADD CONSTRAINT "person_notes_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "topofmind"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topofmind"."person_notes" ADD CONSTRAINT "person_notes_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "topofmind"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topofmind"."commitments" ADD CONSTRAINT "commitments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "topofmind"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topofmind"."commitments" ADD CONSTRAINT "commitments_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "topofmind"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topofmind"."personal_details" ADD CONSTRAINT "personal_details_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "topofmind"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topofmind"."personal_details" ADD CONSTRAINT "personal_details_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "topofmind"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "people_updated_at_idx" ON "topofmind"."people" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "notes_created_at_idx" ON "topofmind"."notes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "person_notes_person_id_idx" ON "topofmind"."person_notes" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "person_notes_note_id_idx" ON "topofmind"."person_notes" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "commitments_person_id_idx" ON "topofmind"."commitments" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "commitments_note_id_idx" ON "topofmind"."commitments" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "commitments_person_id_is_completed_idx" ON "topofmind"."commitments" USING btree ("person_id","is_completed");--> statement-breakpoint
CREATE INDEX "personal_details_person_id_idx" ON "topofmind"."personal_details" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "personal_details_note_id_idx" ON "topofmind"."personal_details" USING btree ("note_id");