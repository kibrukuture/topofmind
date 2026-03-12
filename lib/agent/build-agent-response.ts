import type { AgentResponse } from "@/validators/agent.validator";

export function buildAgentResponse(params: {
  noteId: string;
  toolCallLog: AgentResponse["toolCallLog"];
  people: AgentResponse["people"];
  commitments: AgentResponse["commitments"];
  personalDetails: AgentResponse["personalDetails"];
}): AgentResponse {
  return {
    noteId: params.noteId,
    toolCallLog: params.toolCallLog,
    people: params.people,
    commitments: params.commitments,
    personalDetails: params.personalDetails,
  };
}
