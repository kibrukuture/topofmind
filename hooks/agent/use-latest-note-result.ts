import { useQuery } from "@tanstack/react-query";
import * as agentApi from "@/services/agent/agent.api";
import { QUERY_KEYS } from "@/lib/tanstack/query-keys";

export function useLatestNoteResult() {
  return useQuery({
    queryKey: QUERY_KEYS.AGENT.LATEST,
    queryFn: () => agentApi.getLatestNoteResult(),
  });
}
