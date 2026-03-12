import { useQuery } from "@tanstack/react-query";
import * as peopleApi from "@/services/people/people.api";
import { QUERY_KEYS } from "@/lib/tanstack/query-keys";

export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.PEOPLE.DETAIL(id ?? ""),
    queryFn: () => peopleApi.getPerson(id!),
    enabled: !!id,
  });
}
