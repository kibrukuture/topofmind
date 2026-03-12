import { post } from "@/services";
import { SEARCH_ROUTES } from "@/lib/api/search.routes";
import type { AgentResponse } from "@/validators/agent.validator";

export type SearchResult = {
  summary: string;
  people: AgentResponse["people"];
  commitments: AgentResponse["commitments"];
  personalDetails: AgentResponse["personalDetails"];
};

export async function search(query: string): Promise<SearchResult> {
  return post<SearchResult>(SEARCH_ROUTES.search(), { query });
}
