import { useMutation } from "@tanstack/react-query";
import * as searchApi from "@/services/search/search.api";

export function useSearch() {
  return useMutation({
    mutationFn: (query: string) => searchApi.search(query),
  });
}
