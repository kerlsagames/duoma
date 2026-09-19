import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const KEY = "duoma:inbox-clears:v1";

type Store = Record<string, string[]>;

async function readStore(): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(next: Store) {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

function keyFor(userId: string) {
  return userId;
}

export function useInboxClears(userId: string | null | undefined) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setIds(new Set());
      return;
    }
    let alive = true;
    void readStore().then((store) => {
      if (!alive) return;
      setIds(new Set(store[keyFor(userId)] ?? []));
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  const persist = useCallback(
    async (next: Set<string>) => {
      if (!userId) return;
      setIds(next);
      const store = await readStore();
      store[keyFor(userId)] = [...next];
      await writeStore(store);
    },
    [userId]
  );

  const hidden = useCallback((id: string) => ids.has(id), [ids]);

  const hide = useCallback(
    (id: string) => {
      if (!id || ids.has(id)) return;
      const next = new Set(ids);
      next.add(id);
      void persist(next);
    },
    [ids, persist]
  );

  const hideAll = useCallback(
    (targetIds: string[]) => {
      const next = new Set(ids);
      let changed = false;
      for (const id of targetIds) {
        if (!id || next.has(id)) continue;
        next.add(id);
        changed = true;
      }
      if (changed) void persist(next);
    },
    [ids, persist]
  );

  const visible = useCallback(
    <T extends { id: string }>(rows: T[]) => rows.filter((row) => !ids.has(row.id)),
    [ids]
  );

  return { ids, hidden, hide, hideAll, visible };
}
