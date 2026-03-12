const FALLBACK_NO_CONTENT = "(No text content)";

/**
 * Combine user text and extracted file text. Single source of truth for fallback string.
 */
export function combineNoteText(parts: string[]): string {
  const combined = parts.filter(Boolean).join("\n\n");
  return combined || FALLBACK_NO_CONTENT;
}
