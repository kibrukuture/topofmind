import z from "@/configs/zod4";

export const agentBodySchema = z.object({
  text: z.string().min(1),
});

export type AgentBody = z.infer<typeof agentBodySchema>;

export const agentResponseSchema = z.object({
  noteId: z.string(),
  toolCallLog: z.array(
    z.object({
      tool: z.string(),
      action: z.string().optional(),
      name: z.string().optional(),
      id: z.string().optional(),
      dueDate: z.string().optional(),
      detail: z.string().optional(),
      context: z.string().optional(),
    })
  ),
  people: z.array(z.object({
    id: z.string(),
    name: z.string(),
    company: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
  })),
  commitments: z.array(z.object({
    id: z.string(),
    personId: z.string(),
    noteId: z.string(),
    action: z.string(),
    dueDate: z.string().nullable().optional(),
    isCompleted: z.boolean().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })),
  personalDetails: z.array(z.object({
    id: z.string(),
    personId: z.string(),
    noteId: z.string(),
    detail: z.string(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })),
});

export type AgentResponse = z.infer<typeof agentResponseSchema>;


export type StreamEvent =
  | { type: "tool_call"; tool: string; args: Record<string, unknown> }
  | { type: "done"; data: AgentResponse }
  | { type: "error"; message: string }