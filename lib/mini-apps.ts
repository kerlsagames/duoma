import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { emptyMiniState, hydrateMiniState, type MiniState } from "@/lib/mini-content";

const KEY = "duoma:miniApps:v1";

let cache: MiniState | null = null;
const listeners = new Set<(state: MiniState) => void>();

function emit(state: MiniState) {
  cache = state;
  listeners.forEach((fn) => fn(state));
}

export async function loadMiniState(): Promise<MiniState> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? hydrateMiniState(JSON.parse(raw)) : emptyMiniState();
  } catch {
    cache = emptyMiniState();
  }
  return cache;
}

export async function patchMini(
  fn: (state: MiniState) => MiniState
): Promise<MiniState> {
  const current = await loadMiniState();
  const next = fn(current);
  emit(next);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Keep the in-memory update even if disk fails.
  }
  return next;
}

export async function wipeMiniApps(): Promise<MiniState> {
  cache = emptyMiniState();
  emit(cache);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // In-memory empty still applies.
  }
  return cache;
}

export async function reloadMiniFromDisk(): Promise<MiniState> {
  cache = null;
  return loadMiniState();
}

export function useMiniApps() {
  const [data, setData] = useState<MiniState>(cache ?? emptyMiniState());
  const [ready, setReady] = useState(Boolean(cache));

  useEffect(() => {
    const onChange = (state: MiniState) => setData(state);
    listeners.add(onChange);
    let alive = true;
    loadMiniState().then((state) => {
      if (!alive) return;
      setData(state);
      setReady(true);
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key !== KEY && event.key !== "duoma:safety:event") return;
      void reloadMiniFromDisk().then((state) => {
        if (alive) setData(state);
      });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      alive = false;
      listeners.delete(onChange);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);

  const patch = useCallback((fn: (state: MiniState) => MiniState) => {
    return patchMini(fn);
  }, []);

  return { data, ready, patch };
}
