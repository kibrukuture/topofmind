export const QUERY_KEYS = {
  AGENT: {
    ALL: ["agent"] as const,
    PROCESS: ["agent", "process"] as const,
    LATEST: ["agent", "latest"] as const,
  },
  NOTES: {
    ALL: ["notes"] as const,
    LIST: ["notes", "list"] as const,
  },
  PEOPLE: {
    ALL: ["people"] as const,
    LIST: ["people", "list"] as const,
    DETAIL: (id: string) => ["people", "detail", id] as const,
  },
} as const;
