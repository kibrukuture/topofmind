 
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as notesApi from "@/services/notes/notes.api"
import { QUERY_KEYS } from "@/lib/tanstack/query-keys"

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notesApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES.LIST })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENT.LATEST })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PEOPLE.ALL })
    },
  })
}