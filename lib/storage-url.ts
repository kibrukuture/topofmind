/**
 * Converts an S3/Supabase Storage key to a public URL for client-side use.
 * Set NEXT_PUBLIC_STORAGE_PUBLIC_URL (e.g. https://xxx.supabase.co/storage/v1/object/public/bucket-name)
 */
export function getStoragePublicUrl(key: string | null | undefined): string {
  if (!key?.trim()) return ""
  const base = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL?.trim()
  if (!base) return ""
  const trimmed = base.replace(/\/$/, "")
  return `${trimmed}/${key}`
}
