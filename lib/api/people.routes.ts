export const PEOPLE_ROUTES = {
  base: "/api/people",
  list: () => "/api/people",
  detail: (id: string) => `/api/people/${id}`,
} as const;
