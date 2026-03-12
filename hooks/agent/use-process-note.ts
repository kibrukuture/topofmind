import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as agentApi from "@/services/agent/agent.api";
import type { ProcessNoteInput } from "@/validators/agent.validator";
import { QUERY_KEYS } from "@/lib/tanstack/query-keys"; 

export function useProcessNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProcessNoteInput) => agentApi.processNote(input),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.AGENT.LATEST, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES.LIST });
    },
  });
}

 