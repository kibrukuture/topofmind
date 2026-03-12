import z from "@/configs/zod4";

export const noteFormSchema = z.object({
  text: z.string().min(1, "Enter a note or record one"),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
