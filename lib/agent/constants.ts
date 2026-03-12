/** Max number of files per note (single source of truth). */
export const MAX_NOTE_FILE_COUNT = 2;

/** MIME prefix for allowed note attachments: PDF and images. */
const ALLOWED_ATTACHMENT_MIME_PREFIXES = ["application/pdf", "image/"] as const;

export function isAllowedAttachmentMime(mime: string): boolean {
  const normalized = mime.toLowerCase().trim();
  return ALLOWED_ATTACHMENT_MIME_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(prefix));
}

export const ATTACHMENT_VALIDATION_MESSAGE = "files must be PDF or image (jpeg, png, webp, gif)";
