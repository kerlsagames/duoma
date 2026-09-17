import { HUBS, type HubId } from "@/lib/hubs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const NOTIFICATION_PREFS_KEY = "duoma:notificationPrefs";

export type NotificationSection =
  | "connect"
  | "desire"
  | "play"
  | "home_base"
  | "calendar"
  | "check_in";

/** @deprecated use NotificationSection */
export type NotificationKind = NotificationSection;

export type NotificationInbox = "bell" | "cards";

export type NotificationPrefs = {
  enabled: Record<NotificationSection, boolean>;
  apps: Record<string, boolean>;
  dismissed: string[];
  /** bell = list behind the Home bell. cards = swipe deck on Home. */
  inbox: NotificationInbox;
};

export const NOTIFICATION_SECTION_OPTIONS: {
  kind: NotificationSection;
  group: "hubs" | "also";
  hubId?: HubId;
  label: string;
  detail: string;
}[] = [
  {
    kind: "connect",
    group: "hubs",
    hubId: "connect",
    label: "Connect",
    detail: "Open to pick which apps ping you",
  },
  {
    kind: "desire",
    group: "hubs",
    hubId: "desire",
    label: "Desire",
    detail: "Open to pick which apps ping you",
  },
  {
    kind: "play",
    group: "hubs",
    hubId: "play",
    label: "Fun",
    detail: "Open to pick which apps ping you",
  },
  {
    kind: "home_base",
    group: "hubs",
    hubId: "home-base",
    label: "Home Base",
    detail: "Open to pick which apps ping you",
  },
  {
    kind: "calendar",
    group: "also",
    label: "Calendar",
    detail: "Dates, countdowns, and planned nights",
  },
  {
    kind: "check_in",
    group: "also",
    label: "Check-ins",
    detail: "Their daily check-in and check-in requests",
  },
];

/** @deprecated use NOTIFICATION_SECTION_OPTIONS */
export const NOTIFICATION_KIND_OPTIONS = NOTIFICATION_SECTION_OPTIONS;

const OLD_KIND_TO_SECTION: Record<string, NotificationSection> = {
  spicy_game: "desire",
  up_for_it: "desire",
  check_in: "check_in",
  curiosity: "connect",
  talk: "connect",
  jar: "connect",
  lists: "connect",
  coupons: "play",
  milestones: "home_base",
  date_night: "calendar",
};

const OLD_KIND_TO_APP: Record<string, string> = {
  spicy_game: "spicy",
  up_for_it: "up-for-it",
  check_in: "check-in",
  curiosity: "curiosity",
  talk: "talk",
  jar: "jar",
  lists: "lists",
  coupons: "coupons",
  milestones: "countdowns",
  date_night: "date-night",
};

export function appsForHub(hubId: HubId) {
  return HUBS.find((hub) => hub.id === hubId)?.features ?? [];
}

export function allNotifiableAppIds(): string[] {
  return [
    ...HUBS.flatMap((hub) => hub.features.map((feature) => feature.id)),
    "check-in",
    "calendar",
    "notepad",
  ];
}

export function defaultNotificationPrefs(): NotificationPrefs {
  const enabled = {} as Record<NotificationSection, boolean>;
  for (const row of NOTIFICATION_SECTION_OPTIONS) {
    enabled[row.kind] = true;
  }
  const apps: Record<string, boolean> = {};
  for (const id of allNotifiableAppIds()) apps[id] = true;
  return { enabled, apps, dismissed: [], inbox: "bell" };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function hydrateNotificationPrefs(raw: unknown): NotificationPrefs {
  const base = defaultNotificationPrefs();
  const incoming = asRecord(raw);
  const enabledRaw = asRecord(incoming.enabled);
  const appsRaw = asRecord(incoming.apps);
  const enabled = { ...base.enabled };
  const apps = { ...base.apps };

  for (const row of NOTIFICATION_SECTION_OPTIONS) {
    if (typeof enabledRaw[row.kind] === "boolean") {
      enabled[row.kind] = enabledRaw[row.kind] as boolean;
    }
  }

  for (const row of NOTIFICATION_SECTION_OPTIONS) {
    if (typeof enabledRaw[row.kind] === "boolean") continue;
    const oldVals = Object.entries(OLD_KIND_TO_SECTION)
      .filter(([, section]) => section === row.kind)
      .map(([old]) => enabledRaw[old])
      .filter((value): value is boolean => typeof value === "boolean");
    if (oldVals.length) {
      enabled[row.kind] = oldVals.some((value) => value !== false);
    }
  }

  for (const id of allNotifiableAppIds()) {
    if (typeof appsRaw[id] === "boolean") {
      apps[id] = appsRaw[id] as boolean;
    }
  }

  for (const [old, appId] of Object.entries(OLD_KIND_TO_APP)) {
    if (typeof appsRaw[appId] === "boolean") continue;
    if (typeof enabledRaw[old] === "boolean") {
      apps[appId] = enabledRaw[old] as boolean;
    }
  }

  for (const row of NOTIFICATION_SECTION_OPTIONS) {
    if (!row.hubId || enabled[row.kind] !== false) continue;
    const anyAppSet = row.hubId
      ? appsForHub(row.hubId).some((feature) => typeof appsRaw[feature.id] === "boolean")
      : false;
    if (anyAppSet) continue;
    for (const feature of appsForHub(row.hubId)) {
      if (typeof appsRaw[feature.id] !== "boolean") apps[feature.id] = false;
    }
  }

  const dismissed = Array.isArray(incoming.dismissed)
    ? incoming.dismissed.filter((id): id is string => typeof id === "string")
    : [];

  const inbox: NotificationInbox =
    incoming.inbox === "cards" ? "cards" : "bell";

  return { enabled, apps, dismissed, inbox };
}

export async function readNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
      return hydrateNotificationPrefs(raw ? JSON.parse(raw) : null);
    }
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    return hydrateNotificationPrefs(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultNotificationPrefs();
  }
}

export async function writeNotificationPrefs(
  prefs: NotificationPrefs
): Promise<void> {
  const raw = JSON.stringify(prefs);
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, raw);
  } else {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, raw);
  }
  emitNotificationPrefs(prefs);
}

type PrefsListener = (prefs: NotificationPrefs) => void;
const prefsListeners = new Set<PrefsListener>();

function emitNotificationPrefs(prefs: NotificationPrefs) {
  for (const listener of prefsListeners) listener(prefs);
}

export function subscribeNotificationPrefs(listener: PrefsListener) {
  prefsListeners.add(listener);
  return () => {
    prefsListeners.delete(listener);
  };
}

export function dismissNotificationIds(
  prefs: NotificationPrefs,
  ids: string[]
): NotificationPrefs {
  const next = new Set(prefs.dismissed);
  for (const id of ids) next.add(id);
  return { ...prefs, dismissed: [...next] };
}

export function setInboxStyle(
  prefs: NotificationPrefs,
  inbox: NotificationInbox
): NotificationPrefs {
  return { ...prefs, inbox };
}

export function setHubApps(
  prefs: NotificationPrefs,
  hubId: HubId,
  on: boolean
): NotificationPrefs {
  const apps = { ...prefs.apps };
  for (const feature of appsForHub(hubId)) apps[feature.id] = on;
  const section = NOTIFICATION_SECTION_OPTIONS.find((row) => row.hubId === hubId);
  return {
    ...prefs,
    apps,
    enabled: section
      ? { ...prefs.enabled, [section.kind]: on }
      : prefs.enabled,
  };
}

export function setAppEnabled(
  prefs: NotificationPrefs,
  appId: string,
  on: boolean
): NotificationPrefs {
  const apps = { ...prefs.apps, [appId]: on };
  const hub = HUBS.find((row) => row.features.some((feature) => feature.id === appId));
  let enabled = prefs.enabled;
  if (hub) {
    const section = NOTIFICATION_SECTION_OPTIONS.find((row) => row.hubId === hub.id);
    if (section) {
      const anyOn = appsForHub(hub.id).some((feature) => apps[feature.id] !== false);
      enabled = { ...enabled, [section.kind]: anyOn };
    }
  }
  if (appId === "check-in") enabled = { ...enabled, check_in: on };
  if (appId === "calendar") enabled = { ...enabled, calendar: on };
  return { ...prefs, apps, enabled };
}

export function hubAppsOnCount(prefs: NotificationPrefs, hubId: HubId) {
  const features = appsForHub(hubId);
  return features.filter((feature) => prefs.apps[feature.id] !== false).length;
}

/** Map a home-feed row id to a hub app or home widget. */
export function featureFromStatusId(id: string): string | null {
  if (id === "game" || id.startsWith("game")) return "spicy";
  if (id.startsWith("dare")) return "up-for-it";
  if (id.startsWith("chicken")) return "chicken";
  if (id.startsWith("fantasy")) return "fantasy-matcher";
  if (id.startsWith("sexy")) return "sexy-vault";
  if (id.startsWith("checkin")) return "check-in";
  if (id.startsWith("curiosity")) return "curiosity";
  if (id.startsWith("talk")) return "talk";
  if (id === "jar" || id.startsWith("jar")) return "jar";
  if (id.startsWith("list")) return "lists";
  if (id.startsWith("coupon") || id.startsWith("scratch")) return "coupons";
  if (id.startsWith("milestone") || id.startsWith("cal-remind")) return "calendar";
  if (id.startsWith("date") || id.startsWith("bucket")) return "date-night";
  if (id.startsWith("position")) return "positions";
  if (id.startsWith("roleplay")) return "roleplays";
  if (id.startsWith("ping") || id.startsWith("thought")) return "thought-pings";
  return null;
}

export function notificationAppLabel(id: string): string {
  const app = featureFromStatusId(id);
  if (app === "check-in") return "Check-in";
  if (app === "calendar") return "Calendar";
  if (app === "notepad") return "Notepad";
  for (const hub of HUBS) {
    const feature = hub.features.find((row) => row.id === app);
    if (feature) return feature.label;
  }
  return "that app";
}

export function notificationGoLabel(id: string): string {
  return `Go to ${notificationAppLabel(id)}`;
}

/** Map a home-feed row id to a preference section. */
export function kindFromStatusId(id: string): NotificationSection | null {
  const app = featureFromStatusId(id);
  if (app === "check-in") return "check_in";
  if (app === "calendar") return "calendar";
  if (app === "date-night") return "connect";
  const hub = HUBS.find((row) => row.features.some((feature) => feature.id === app));
  if (hub?.id === "connect") return "connect";
  if (hub?.id === "desire") return "desire";
  if (hub?.id === "play") return "play";
  if (hub?.id === "home-base") return "home_base";
  if (id === "game" || id.startsWith("game")) return "desire";
  if (id.startsWith("dare") || id.startsWith("fantasy") || id.startsWith("sexy")) {
    return "desire";
  }
  if (id.startsWith("checkin")) return "check_in";
  if (
    id.startsWith("curiosity") ||
    id.startsWith("talk") ||
    id === "jar" ||
    id.startsWith("jar") ||
    id.startsWith("list")
  ) {
    return "connect";
  }
  if (id.startsWith("coupon") || id.startsWith("scratch")) return "play";
  if (id.startsWith("milestone") || id.startsWith("date") || id.startsWith("bucket") || id.startsWith("cal-remind")) {
    return "calendar";
  }
  return null;
}

export function prefsAllowStatusId(
  prefs: NotificationPrefs,
  id: string
): boolean {
  const app = featureFromStatusId(id);
  if (app && prefs.apps[app] === false) return false;
  const kind = kindFromStatusId(id);
  if (!kind) return true;
  return prefs.enabled[kind] !== false;
}

export function prefsShowStatusId(
  prefs: NotificationPrefs,
  id: string
): boolean {
  if (prefs.dismissed.includes(id)) return false;
  return prefsAllowStatusId(prefs, id);
}
