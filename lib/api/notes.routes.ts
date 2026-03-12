export const NOTES_ROUTES = {
  base: "/api/notes",
  list: () => "/api/notes",
  delete: (id: string) => `/api/notes/${id}`,
} as const;
