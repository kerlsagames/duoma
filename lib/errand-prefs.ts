import AsyncStorage from "@react-native-async-storage/async-storage";

export const ERRAND_PREFS_KEY = "duoma:errandPrefs:v2";

export type QuickAddItem = {
  emoji: string;
  label: string;
};

export type ErrandPrefs = {
  quickAdd: QuickAddItem[];
};

export const DEFAULT_QUICK_GROCERIES: QuickAddItem[] = [
  { emoji: "🥛", label: "Milk" },
  { emoji: "🍞", label: "Bread" },
  { emoji: "🥩", label: "Mince" },
  { emoji: "🍗", label: "Chicken" },
  { emoji: "🍎", label: "Apples" },
  { emoji: "🍌", label: "Bananas" },
];

/** Settings catalog — plus to put on the pad, minus to take off the pad only. */
export const QUICK_GROCERY_CATALOG: QuickAddItem[] = [
  ...DEFAULT_QUICK_GROCERIES,
  { emoji: "🥚", label: "Eggs" },
  { emoji: "🧈", label: "Butter" },
  { emoji: "🧀", label: "Cheese" },
  { emoji: "🥛", label: "Yoghurt" },
  { emoji: "🥛", label: "Cream" },
  { emoji: "🍓", label: "Berries" },
  { emoji: "🍋", label: "Lemons" },
  { emoji: "🥑", label: "Avocado" },
  { emoji: "🍅", label: "Tomatoes" },
  { emoji: "🧅", label: "Onions" },
  { emoji: "🧄", label: "Garlic" },
  { emoji: "🥔", label: "Potatoes" },
  { emoji: "🥕", label: "Carrots" },
  { emoji: "🥬", label: "Greens" },
  { emoji: "🥦", label: "Broccoli" },
  { emoji: "🥒", label: "Cucumber" },
  { emoji: "🫑", label: "Capsicum" },
  { emoji: "🍄", label: "Mushrooms" },
  { emoji: "🌽", label: "Corn" },
  { emoji: "🫚", label: "Ginger" },
  { emoji: "🥩", label: "Beef" },
  { emoji: "🥓", label: "Bacon" },
  { emoji: "🌭", label: "Sausages" },
  { emoji: "🐟", label: "Salmon" },
  { emoji: "🐟", label: "Tuna" },
  { emoji: "🦐", label: "Prawns" },
  { emoji: "🍝", label: "Pasta" },
  { emoji: "🍜", label: "Noodles" },
  { emoji: "🍚", label: "Rice" },
  { emoji: "🌮", label: "Tortillas" },
  { emoji: "🫘", label: "Beans" },
  { emoji: "🥫", label: "Tinned tomatoes" },
  { emoji: "🥥", label: "Coconut milk" },
  { emoji: "🥣", label: "Stock" },
  { emoji: "🫘", label: "Chickpeas" },
  { emoji: "🌾", label: "Flour" },
  { emoji: "🍯", label: "Honey" },
  { emoji: "🥜", label: "Peanut butter" },
  { emoji: "🫒", label: "Oil" },
  { emoji: "🧂", label: "Salt" },
  { emoji: "🌶️", label: "Chilli" },
  { emoji: "☕", label: "Coffee" },
  { emoji: "🍵", label: "Tea" },
  { emoji: "🧃", label: "Juice" },
  { emoji: "🍷", label: "Wine" },
  { emoji: "🧊", label: "Frozen veg" },
  { emoji: "🍦", label: "Ice cream" },
  { emoji: "🥣", label: "Oats" },
  { emoji: "🥣", label: "Cereal" },
  { emoji: "🍫", label: "Chocolate" },
  { emoji: "🍪", label: "Crackers" },
];

export const QUICK_ADD_EMOJIS = [
  "🛒",
  "🥛",
  "🍞",
  "🥚",
  "🧀",
  "🍎",
  "🍌",
  "🍓",
  "🥬",
  "🥕",
  "🥔",
  "🧄",
  "🍗",
  "🥩",
  "🐟",
  "🍝",
  "🍚",
  "☕",
  "🍫",
  "🧻",
  "🧼",
  "🧊",
];

function asItem(raw: unknown): QuickAddItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<QuickAddItem>;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  if (!label) return null;
  const emoji =
    typeof row.emoji === "string" && row.emoji.trim() ? row.emoji.trim() : "🛒";
  return { emoji, label };
}

export function hydrateQuickAdd(raw: unknown): QuickAddItem[] {
  if (!Array.isArray(raw)) return DEFAULT_QUICK_GROCERIES.map((row) => ({ ...row }));
  const items: QuickAddItem[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    const item = asItem(row);
    if (!item) continue;
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }
  return items;
}

export function defaultErrandPrefs(): ErrandPrefs {
  return { quickAdd: DEFAULT_QUICK_GROCERIES.map((row) => ({ ...row })) };
}

export function itemKey(item: QuickAddItem): string {
  return item.label.trim().toLowerCase();
}

export function isOnQuickPad(pad: QuickAddItem[], item: QuickAddItem): boolean {
  const key = itemKey(item);
  return pad.some((row) => itemKey(row) === key);
}

export async function readErrandPrefs(): Promise<ErrandPrefs> {
  try {
    const raw = await AsyncStorage.getItem(ERRAND_PREFS_KEY);
    if (!raw) return defaultErrandPrefs();
    const parsed = JSON.parse(raw) as Partial<ErrandPrefs>;
    return { quickAdd: hydrateQuickAdd(parsed.quickAdd) };
  } catch {
    return defaultErrandPrefs();
  }
}

export async function writeErrandPrefs(prefs: ErrandPrefs): Promise<void> {
  await AsyncStorage.setItem(ERRAND_PREFS_KEY, JSON.stringify(prefs));
}
