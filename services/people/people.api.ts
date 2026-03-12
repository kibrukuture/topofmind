import { get, patch } from "@/services";
import { PEOPLE_ROUTES } from "@/lib/api/people.routes";

export type Person = {
  id: string;
  name: string;
  company?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Commitment = {
  id: string;
  action: string;
  dueDate?: string | null;
  isCompleted: boolean;
  createdAt: string;
};

export type PersonalDetail = {
  id: string;
  detail: string;
  createdAt: string;
};

export type NoteContext = {
  id: string;
  noteId: string;
  extractedContext?: string | null;
  createdAt: string;
  note: { id: string; rawText: string; createdAt: string };
};

export type PersonData = {
  person: Person;
  commitments: Commitment[];
  personalDetails: PersonalDetail[];
  notes: NoteContext[];
};

export async function getPerson(id: string): Promise<PersonData> {
  return get<PersonData>(PEOPLE_ROUTES.detail(id));
}

export async function toggleCommitment(
  personId: string,
  commitmentId: string,
  isCompleted: boolean
): Promise<{ ok: boolean }> {
  return patch<{ ok: boolean }>(PEOPLE_ROUTES.detail(personId), {
    commitmentId,
    isCompleted,
  });
}
