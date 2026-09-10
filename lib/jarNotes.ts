export const JAR_OPEN_OPTIONS = [
  {
    id: "sunday",
    label: "This Sunday",
    hint: "Read together on Sunday",
  },
  {
    id: "week",
    label: "In a week",
    hint: "Seven days from now",
  },
  {
    id: "month",
    label: "In 30 days",
    hint: "A longer hold",
  },
  {
    id: "together",
    label: "When we both open",
    hint: "No date — you both opt in",
  },
] as const;

export type JarOpenOptionId = (typeof JAR_OPEN_OPTIONS)[number]["id"];

export function openAtForJarOption(
  option: JarOpenOptionId,
  now = new Date()
): string | null {
  if (option === "together") return null;
  const end = new Date(now);
  if (option === "sunday") {
    const day = end.getDay();
    const daysUntilSunday = day === 0 ? 7 : 7 - day;
    end.setDate(end.getDate() + daysUntilSunday);
    end.setHours(18, 0, 0, 0);
    return end.toISOString();
  }
  if (option === "week") {
    end.setDate(end.getDate() + 7);
    end.setHours(18, 0, 0, 0);
    return end.toISOString();
  }
  end.setDate(end.getDate() + 30);
  end.setHours(18, 0, 0, 0);
  return end.toISOString();
}

export function jarOpenOptionLabel(option: string | null | undefined) {
  return JAR_OPEN_OPTIONS.find((row) => row.id === option)?.label ?? "Open later";
}

export function formatJarOpenAt(iso: string | null | undefined) {
  if (!iso) return "When you both open";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "When you both open";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Visual capacity for the jar fill meter. */
export const JAR_FILL_CAPACITY = 12;

export function jarFillRatio(sealedCount: number) {
  return Math.min(1, Math.max(0, sealedCount / JAR_FILL_CAPACITY));
}

/** Notes that may be opened once both partners are ready. */
export function jarNoteIsDue(note: { openAt: string | null }, now = Date.now()) {
  if (!note.openAt) return true;
  const at = new Date(note.openAt).getTime();
  if (Number.isNaN(at)) return true;
  return at <= now;
}
