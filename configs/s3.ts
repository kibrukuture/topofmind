import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

function getS3Client() {
  if (s3Client) return s3Client;

  const endpoint = process.env.S3_ENDPOINT;
  const bucketName = process.env.BUCKET_NAME;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint) throw new Error("S3_ENDPOINT is not set");
  if (!bucketName) throw new Error("BUCKET_NAME is not set");
  if (!accessKeyId) throw new Error("S3_ACCESS_KEY_ID is not set");
  if (!secretAccessKey) throw new Error("S3_SECRET_ACCESS_KEY is not set");

  s3Client = new S3Client({
    endpoint,
    region: "auto",
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
}

/**
 * Upload a file to Supabase Storage (S3-compatible).
 * @param buffer - File contents (Buffer or Uint8Array)
 * @param key - Storage path/key (e.g. "voice-notes/abc123.webm")
 * @param contentType - Optional MIME type (e.g. "audio/webm")
 * @returns The storage key (path) for storing in DB
 */
export async function uploadFile(
  buffer: Buffer | Uint8Array,
  key: string,
  contentType?: string
): Promise<string> {
  const client = getS3Client();
  const bucketName = process.env.BUCKET_NAME!;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return key;
}

/**
 * Delete a file from Supabase Storage (S3-compatible).
 * @param key - Storage path/key (same as returned by uploadFile)
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();
  const bucketName = process.env.BUCKET_NAME!;

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}
