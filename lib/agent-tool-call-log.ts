export type ToolCallEntry = {
  tool: string;
  action?: string;
  name?: string;
  id?: string;
  dueDate?: string;
  detail?: string;
  context?: string;
};

type ToolCall = {
  toolName: string;
  toolCallId: string;
};

type ToolResult = {
  toolCallId: string;
  output?: unknown;
};

type StepWithToolCalls = {
  toolCalls: ToolCall[];
  toolResults?: ToolResult[];
};

function entryFromOutput(out: Record<string, unknown>): Partial<ToolCallEntry> {
  const entry: Partial<ToolCallEntry> = {};
  if ("personId" in out && out.personId != null) entry.id = String(out.personId);
  if ("action" in out && out.action != null) entry.action = String(out.action);
  if ("name" in out && out.name != null) entry.name = String(out.name);
  if ("dueDate" in out && out.dueDate != null) entry.dueDate = String(out.dueDate);
  if ("detail" in out && out.detail != null) entry.detail = String(out.detail);
  if ("context" in out && out.context != null) entry.context = String(out.context);
  return entry;
}

export function buildToolCallLog(steps: StepWithToolCalls[]): ToolCallEntry[] {
  const pairs = steps.flatMap((step) =>
    step.toolCalls.map((call) => ({
      call,
      result: step.toolResults?.find((r) => r.toolCallId === call.toolCallId),
    }))
  );
  return pairs.map(({ call, result }) => {
    const entry: ToolCallEntry = { tool: call.toolName };
    if (result && "output" in result && result.output != null && typeof result.output === "object") {
      Object.assign(entry, entryFromOutput(result.output as Record<string, unknown>));
    }
    return entry;
  });
}
