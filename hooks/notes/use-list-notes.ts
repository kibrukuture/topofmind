import { useQuery } from "@tanstack/react-query";
import * as notesApi from "@/services/notes/notes.api";
import { QUERY_KEYS } from "@/lib/tanstack/query-keys";

export function useListNotes() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTES.LIST,
    queryFn: () => notesApi.listNotes(),
  });
}
