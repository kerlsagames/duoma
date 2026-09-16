const settings = new Set<() => void>();
const stats = new Set<() => void>();

export function subscribeHomeSettings(listener: () => void): () => void {
  settings.add(listener);
  return () => settings.delete(listener);
}

export function requestHomeSettings(): void {
  settings.forEach((listener) => listener());
}

export function subscribeHomeStats(listener: () => void): () => void {
  stats.add(listener);
  return () => stats.delete(listener);
}

export function requestHomeStats(): void {
  stats.forEach((listener) => listener());
}
