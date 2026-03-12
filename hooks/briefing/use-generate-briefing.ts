import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as briefingApi from "@/services/briefing/briefing.api";
import { QUERY_KEYS } from "@/lib/tanstack/query-keys";

export function useGenerateBriefing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personId: string) => briefingApi.generateBriefing(personId),
    onSuccess: (_, personId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PEOPLE.DETAIL(personId) });
    },
  });
}
