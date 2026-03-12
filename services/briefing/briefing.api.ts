import { post } from "@/services";
import { BRIEFING_ROUTES } from "@/lib/api/briefing.routes";

export type GenerateBriefingResponse = {
  briefing: string;
  person: { summary: string };
};

export async function generateBriefing(personId: string): Promise<GenerateBriefingResponse> {
  return post<GenerateBriefingResponse>(BRIEFING_ROUTES.generate(), { personId });
}
