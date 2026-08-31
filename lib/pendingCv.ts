/**
 * Buying a pass sends the tab to Stripe, and coming back is a fresh page load:
 * every `File` picked during onboarding is gone by then. The CV can only be
 * uploaded once the profile exists, which happens after paying, so the bytes are
 * parked here as base64 — a string, the only thing that survives the round trip —
 * and the billing success page finishes the upload.
 */

const PENDING_CV_KEY = "onboarding_cv_file";

/** sessionStorage caps out near 5 MB per origin and base64 inflates by a third. */
const MAX_BYTES = 3 * 1024 * 1024;

interface PendingCv {
  name: string;
  type: string;
  /** File contents, base64 encoded, without the data URL prefix. */
  base64: string;
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // readAsDataURL yields "data:<mime>;base64,<payload>"
      const [, payload] = String(reader.result).split(",", 2);
      if (payload) resolve(payload);
      else reject(new Error("Unreadable CV contents"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** False when the file could not be parked, so the caller stops promising it. */
export async function savePendingCvFile(file: File): Promise<boolean> {
  if (file.size === 0 || file.size > MAX_BYTES) return false;
  try {
    const entry: PendingCv = {
      name: file.name,
      type: file.type,
      base64: await readAsBase64(file),
    };
    sessionStorage.setItem(PENDING_CV_KEY, JSON.stringify(entry));
    return true;
  } catch {
    // Quota or a read error: the purchase matters more than the attachment.
    clearPendingCvFile();
    return false;
  }
}

/** Rebuilds the parked CV and drops it, or returns null when none is waiting. */
export function takePendingCvFile(): File | null {
  let entry: PendingCv | null = null;
  try {
    const raw = sessionStorage.getItem(PENDING_CV_KEY);
    entry = raw === null ? null : JSON.parse(raw);
  } catch {
    entry = null;
  }
  clearPendingCvFile();
  if (!entry?.base64 || !entry.name) return null;
  try {
    const binary = atob(entry.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], entry.name, { type: entry.type || undefined });
  } catch {
    return null;
  }
}

export function clearPendingCvFile(): void {
  try {
    sessionStorage.removeItem(PENDING_CV_KEY);
  } catch {
    // Nothing was stored in the first place.
  }
}
