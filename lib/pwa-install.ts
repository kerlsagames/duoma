import { isIosChrome, isIosDevice, isStandalonePwa, isWebPushRuntime } from "@/lib/push";
import { useEffect, useState } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallListener = () => void;

let deferred: BeforeInstallPromptEvent | null = null;
let capturing = false;
const listeners = new Set<InstallListener>();

function notify() {
  for (const listener of listeners) listener();
}

/** Listen as early as possible so Chrome's install event is not missed. */
export function captureInstallPrompt() {
  if (!isWebPushRuntime() || capturing) return;
  capturing = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

export function subscribeInstallPrompt(listener: InstallListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function deferredInstallPrompt() {
  return deferred;
}

export async function promptPwaInstall(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  if (!deferred) return "unavailable";
  const event = deferred;
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferred = null;
  notify();
  return outcome;
}

export function usePwaInstallState() {
  const [standalone, setStandalone] = useState(isStandalonePwa);
  const [canPrompt, setCanPrompt] = useState(() =>
    Boolean(deferredInstallPrompt())
  );
  const [ios] = useState(isIosDevice);
  const [iosChrome] = useState(isIosChrome);

  useEffect(() => {
    if (!isWebPushRuntime()) return;
    captureInstallPrompt();
    const sync = () => {
      setStandalone(isStandalonePwa());
      setCanPrompt(Boolean(deferredInstallPrompt()));
    };
    const media = window.matchMedia?.("(display-mode: standalone)");
    media?.addEventListener?.("change", sync);
    const off = subscribeInstallPrompt(sync);
    window.addEventListener("appinstalled", sync);
    sync();
    return () => {
      media?.removeEventListener?.("change", sync);
      window.removeEventListener("appinstalled", sync);
      off();
    };
  }, []);

  return { standalone, canPrompt, ios, iosChrome };
}
