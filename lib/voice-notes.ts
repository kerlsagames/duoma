const DB_NAME = "duoma-voice-notes";
const STORE = "clips";
const VERSION = 1;

export const MAX_VOICE_SECONDS = 90;
const DATA_URL_FALLBACK_BYTES = 400_000;

export function canRecordAudio(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

export function pickRecorderMime(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/ogg;codecs=opus",
  ];
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return "";
  }
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function explainMicError(error: unknown): string {
  const name = error && typeof error === "object" && "name" in error ? String(error.name) : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "The browser blocked the microphone. Allow mic access for this site and try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No microphone found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The microphone is already in use by another tab or app.";
  }
  if (name === "SecurityError") {
    return "Voice notes need a secure page (https or localhost).";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not start the microphone.";
}

export async function startVoiceRecorder(): Promise<{
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: Blob[];
}> {
  if (!canRecordAudio()) {
    throw new Error("This browser cannot record audio.");
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
    },
  });
  const mime = pickRecorderMime();
  const recorder = mime
    ? new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 48000 })
    : new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };
  try {
    recorder.start(250);
  } catch {
    recorder.start();
  }
  return { stream, recorder, chunks };
}

export function stopVoiceRecorder(
  stream: MediaStream,
  recorder: MediaRecorder,
  chunks: Blob[]
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const finish = () => {
      stream.getTracks().forEach((track) => track.stop());
      const type = recorder.mimeType || pickRecorderMime() || "audio/webm";
      const blob = new Blob(chunks, { type });
      if (blob.size < 32) {
        reject(new Error("That take was empty. Hold the mic closer and try again."));
        return;
      }
      resolve(blob);
    };
    recorder.onerror = () => {
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("The recorder stopped unexpectedly."));
    };
    if (recorder.state === "inactive") {
      finish();
      return;
    }
    recorder.addEventListener("stop", finish, { once: true });
    recorder.stop();
  });
}

export function abandonRecorder(stream: MediaStream | null, recorder: MediaRecorder | null) {
  try {
    if (recorder && recorder.state !== "inactive") recorder.stop();
  } catch {
    // already stopped
  }
  stream?.getTracks().forEach((track) => track.stop());
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("no-idb"));
      return;
    }
    const open = indexedDB.open(DB_NAME, VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    open.onerror = () => reject(open.error ?? new Error("idb-open"));
    open.onsuccess = () => {
      const db = open.result;
      try {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error ?? new Error("idb-op"));
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("idb-tx"));
        };
      } catch (error) {
        db.close();
        reject(error);
      }
    };
  });
}

export async function putVoiceClip(id: string, blob: Blob): Promise<void> {
  await withStore("readwrite", (store) => store.put(blob, id));
}

export async function getVoiceClip(id: string): Promise<Blob | null> {
  try {
    const row = await withStore<Blob | undefined>("readonly", (store) => store.get(id));
    return row instanceof Blob ? row : null;
  } catch {
    return null;
  }
}

export async function deleteVoiceClip(id: string): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(id));
  } catch {
    // ignore
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

/** Persist the clip in IndexedDB, or as a short data URL if IDB is unavailable. */
export async function persistVoiceClip(
  id: string,
  blob: Blob
): Promise<{ hasAudio: true; mimeType: string; uri?: string }> {
  const mimeType = blob.type || pickRecorderMime() || "audio/webm";
  try {
    await putVoiceClip(id, blob);
    return { hasAudio: true, mimeType };
  } catch {
    if (blob.size > DATA_URL_FALLBACK_BYTES) {
      throw new Error("This note is too large to keep on this device. Record a shorter take.");
    }
    const uri = await blobToDataUrl(blob);
    return { hasAudio: true, mimeType, uri };
  }
}

export async function resolveVoiceSrc(id: string, fallbackUri?: string): Promise<string | null> {
  const blob = await getVoiceClip(id);
  if (blob) return URL.createObjectURL(blob);
  if (fallbackUri && fallbackUri.startsWith("data:audio")) return fallbackUri;
  return null;
}

export function formatTapeTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function defaultVoiceTitle(at = new Date()): string {
  const time = at.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `Voice note · ${time}`;
}
