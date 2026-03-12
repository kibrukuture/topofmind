import { uploadFile } from "@/configs/s3";
import type { NoteAttachment } from "@/validators/note-attachment.validator";
import type { FilePartInput } from "@/lib/extract-content-from-files";

/**
 * Upload files to S3 under attachments/ and return attachment records + inputs for extraction.
 */
export async function uploadNoteAttachments(
  files: File[]
): Promise<{ attachments: NoteAttachment[]; fileInputs: FilePartInput[] }> {
  const attachments: NoteAttachment[] = [];
  const fileInputs: FilePartInput[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const key = `attachments/${crypto.randomUUID()}.${ext}`;
    const mimeType = file.type || "application/octet-stream";
    await uploadFile(buffer, key, mimeType);
    attachments.push({ key, name: file.name, type: mimeType });
    fileInputs.push({ buffer, name: file.name, mimeType });
  }

  return { attachments, fileInputs };
}
