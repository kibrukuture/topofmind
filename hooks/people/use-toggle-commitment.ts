import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as peopleApi from "@/services/people/people.api";
import { QUERY_KEYS } from "@/lib/tanstack/query-keys";

type ToggleInput = {
  personId: string;
  commitmentId: string;
  isCompleted: boolean;
};

export function useToggleCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personId, commitmentId, isCompleted }: ToggleInput) =>
      peopleApi.toggleCommitment(personId, commitmentId, isCompleted),
    onSuccess: (_, { personId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PEOPLE.DETAIL(personId) });
    },
  });
}
