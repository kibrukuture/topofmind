import { DeepgramClient } from "@deepgram/sdk" 


let deepgramClient: DeepgramClient | null = null;

export function getDeepgramClient() {
  if (deepgramClient) return deepgramClient;

  deepgramClient = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY! })
  return deepgramClient;
}

 