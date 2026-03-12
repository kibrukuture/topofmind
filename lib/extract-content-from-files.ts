import { generateText, type ImagePart, type FilePart, type TextPart } from "ai";
import { google } from "@ai-sdk/google";

export type FilePartInput = { buffer: Buffer; name: string; mimeType: string };

const EXTRACT_PROMPT =
  "Extract all text and any relevant information from this document or image. Return only the extracted content as plain text.";

function toContentParts(files: FilePartInput[]): Array<TextPart | ImagePart | FilePart> {
  const parts: Array<TextPart | ImagePart | FilePart> = [{ type: "text", text: EXTRACT_PROMPT }];
  for (const f of files) {
    const mt = f.mimeType.toLowerCase();
    if (mt.startsWith("image/")) {
      parts.push({ type: "image", image: f.buffer, mediaType: f.mimeType });
    } else {
      parts.push({ type: "file", data: f.buffer, mediaType: mt });
    }
  }
  return parts;
}

export async function extractContentFromFiles(files: FilePartInput[]): Promise<string> {
  if (files.length === 0) return "";

  const content = toContentParts(files);

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    messages: [{ role: "user", content }],
  });

  return (text ?? "").trim();
}
