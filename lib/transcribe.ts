import { getDeepgramClient } from "@/configs/deepgram";
import type { ListenV1Response } from "@deepgram/sdk";

function isListenV1Response(value: unknown): value is ListenV1Response {
  return typeof value === "object" && value !== null && "results" in value;
}

export async function transcribeAudio(buffer: Buffer): Promise<string> {
  const client = getDeepgramClient();
  const response = await client.listen.v1.media.transcribeFile(buffer, {
    model: "nova-2",
  });

  if (!isListenV1Response(response)) {
    return "";
  }

  const transcript =
    response.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return transcript;
}
