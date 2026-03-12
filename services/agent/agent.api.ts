import { AGENT_ROUTES } from "@/lib/api/agent.routes";
import { get, postFormData } from "@/services";
import type { AgentResponse, ProcessNoteInput } from "@/validators/agent.validator";

export async function processNote(input: ProcessNoteInput): Promise<AgentResponse> {
  const formData = new FormData();
  if (input.text !== undefined) formData.append("text", input.text);
  if (input.audio) formData.append("audio", input.audio, "recording.webm");
  if (input.files?.length) {
    for (const file of input.files) formData.append("files", file, file.name);
  }
  return postFormData<AgentResponse>(AGENT_ROUTES.process(), formData);
}

export async function getLatestNoteResult(): Promise<AgentResponse | null> {
  return get<AgentResponse | null>(AGENT_ROUTES.latest());
}


 