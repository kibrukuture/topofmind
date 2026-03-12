import { MAX_NOTE_FILE_COUNT, isAllowedAttachmentMime, ATTACHMENT_VALIDATION_MESSAGE } from "@/lib/agent/constants";

export type ParseProcessNoteFormSuccess = {
  ok: true;
  /** Present when user sent text (string). */
  textField: string | null;
  /** Present when user sent audio (File). */
  audioFile: File | null;
  /** Non-empty when user sent files (already validated count and MIME). */
  fileList: File[];
};

export type ParseProcessNoteFormError = {
  ok: false;
  status: 400 | 500;
  error: string;
};

export type ParseProcessNoteFormResult = ParseProcessNoteFormSuccess | ParseProcessNoteFormError;

function isNonEmptyFile(entry: FormDataEntryValue): entry is File {
  return entry instanceof File && entry.size > 0;
}

/**
 * Parse and validate multipart form for process-note. No I/O; returns typed fields or validation error.
 */
export function parseProcessNoteForm(formData: FormData): ParseProcessNoteFormResult {
  const textEntry = formData.get("text");
  const audioEntry = formData.get("audio");
  const fileEntries = formData.getAll("files");
  const fileList = fileEntries.filter(isNonEmptyFile);

  const hasText = typeof textEntry === "string" && textEntry.trim().length > 0;
  const hasAudio = audioEntry instanceof File && audioEntry.size > 0;
  const hasFiles = fileList.length > 0;

  if (hasAudio && (hasText || hasFiles)) {
    return { ok: false, status: 400, error: "provide either audio or text/files, not both" };
  }
  if (!hasText && !hasAudio && !hasFiles) {
    return { ok: false, status: 400, error: "text, audio, or files are required" };
  }
  if (fileList.length > MAX_NOTE_FILE_COUNT) {
    return {
      ok: false,
      status: 400,
      error: `at most ${MAX_NOTE_FILE_COUNT} files allowed`,
    };
  }
  for (const file of fileList) {
    const mime = file.type || "";
    if (!isAllowedAttachmentMime(mime)) {
      return { ok: false, status: 400, error: ATTACHMENT_VALIDATION_MESSAGE };
    }
  }

  const textField = typeof textEntry === "string" ? textEntry : null;
  const audioFile = audioEntry instanceof File ? audioEntry : null;

  return { ok: true, textField, audioFile, fileList };
}
