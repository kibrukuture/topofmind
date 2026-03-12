import z from "@/configs/zod4";
import { MAX_NOTE_FILE_COUNT } from "@/lib/agent/constants";

export const noteFormSchema = z.object({
  text: z.string(),
  files: z.array(z.instanceof(File)).max(MAX_NOTE_FILE_COUNT),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
