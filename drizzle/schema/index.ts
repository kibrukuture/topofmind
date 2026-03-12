 
import * as peopleSchema from "./people.schema";
import * as notesSchema from "./notes.schema";
import * as personNotesSchema from "./person-notes.schema";
import * as commitmentsSchema from "./commitments.schema";
import * as personalDetailsSchema from "./personal-details.schema";

export * from "./topofmind";
export * from "./people.schema";
export * from "./notes.schema";
export * from "./person-notes.schema";
export * from "./commitments.schema";
export * from "./personal-details.schema";

export const schema = {
  ...peopleSchema,
  ...notesSchema,
  ...personNotesSchema,
  ...commitmentsSchema,
  ...personalDetailsSchema,
};
