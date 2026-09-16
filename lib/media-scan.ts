/**
 * Pre-persist inspection for uploads.
 *
 * Duoma is an adults-only couples app — consensual intimate photos are allowed.
 * CSAM / anyone under 18 is never allowed. Without a scan service URL we cannot
 * hash against PhotoDNA; we still block bad types/sizes and require an 18+ attest.
 *
 * Set EXPO_PUBLIC_MEDIA_SCAN_URL to a backend that accepts { mimeType } and
 * returns { blocked: boolean, reason?: string } (Rekognition, PhotoDNA, etc.).
 */

export type ScanInput = {
  mimeType: string;
  byteSize: number;
  attestedAdults: boolean;
};

export type ScanResult =
  | { ok: true; via: "local" | "service" }
  | { ok: false; reason: string };

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

/** Build a scan payload from a sandboxed data URL (Photo Memory). */
export function scanInputFromDataUrl(
  dataUrl: string,
  attestedAdults: boolean
): ScanInput {
  const header = /^data:([^;,]+)/i.exec(dataUrl);
  const mimeType = (header?.[1] || "image/jpeg").toLowerCase();
  const comma = dataUrl.indexOf(",");
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : "";
  const compact = payload.replace(/\s/g, "");
  const byteSize = dataUrl.includes(";base64,")
    ? Math.floor((compact.length * 3) / 4)
    : compact.length;
  return { mimeType, byteSize, attestedAdults };
}

export function scanUploadLocally(input: ScanInput): ScanResult {
  const mime = (input.mimeType || "").toLowerCase();
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  if (!isImage && !isVideo) {
    return { ok: false, reason: "Only photos and clips can be stored in the vault." };
  }
  if (isImage && input.byteSize > MAX_IMAGE_BYTES) {
    return { ok: false, reason: "That photo is too large to keep in the app sandbox." };
  }
  if (isVideo && input.byteSize > MAX_VIDEO_BYTES) {
    return { ok: false, reason: "Keep clips under 20 MB." };
  }
  if (!input.attestedAdults) {
    return {
      ok: false,
      reason: "Confirm everyone in this photo or clip is 18 or older.",
    };
  }
  return { ok: true, via: "local" };
}

export async function scanUpload(input: ScanInput): Promise<ScanResult> {
  const local = scanUploadLocally(input);
  if (!local.ok) return local;

  const endpoint = process.env.EXPO_PUBLIC_MEDIA_SCAN_URL?.trim();
  if (!endpoint) return local;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mimeType: input.mimeType,
        byteSize: input.byteSize,
      }),
    });
    if (!response.ok) return local;
    const body = (await response.json()) as { blocked?: boolean; reason?: string };
    if (body.blocked) {
      return {
        ok: false,
        reason:
          body.reason?.trim() ||
          "This file was blocked by the safety scan and was not saved.",
      };
    }
    return { ok: true, via: "service" };
  } catch {
    return local;
  }
}
