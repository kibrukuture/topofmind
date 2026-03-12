import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as agentApi from "@/services/agent/agent.api";
import type { ProcessNoteInput } from "@/services/agent/agent.api";
import { QUERY_KEYS } from "@/lib/tanstack/query-keys"; 

export function useProcessNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProcessNoteInput) => agentApi.processNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENT.LATEST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES.LIST });
    },
  });
}

 