import { AGENT_ROUTES } from "@/lib/api/agent.routes"; 
import { get, postFormData } from "@/services";
import type { AgentResponse} from "@/validators/agent.validator";
export type ProcessNoteInput = { text?: string; audio?: Blob };

export async function processNote(input: ProcessNoteInput): Promise<AgentResponse> {
  const formData = new FormData();
  if (input.text) formData.append("text", input.text);
  if (input.audio) formData.append("audio", input.audio, "recording.webm");

  return postFormData<AgentResponse>(AGENT_ROUTES.process(), formData);
}

export async function getLatestNoteResult(): Promise<AgentResponse | null> {
  return get<AgentResponse | null>(AGENT_ROUTES.latest());
}


 