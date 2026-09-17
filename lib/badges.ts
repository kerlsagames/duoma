import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import {
  activityDateKeys,
  currentStreak,
  pairAgeDays,
  type CoupleStatInput,
  type StatSectionId,
} from "@/lib/couple-stats";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type BadgeLevel = 1 | 2 | 3;

export const BADGE_LEVEL_MARK: Record<BadgeLevel, string> = {
  1: "I",
  2: "II",
  3: "III",
};

export type BadgeDef = {
  id: string;
  family: string;
  familyTitle: string;
  level: BadgeLevel;
  title: string;
  blurb: string;
  icon: IconName;
  emoji: string;
  lane: StatSectionId;
  target: number;
  progress: (input: CoupleStatInput) => number;
};

export type BadgeStatus = BadgeDef & {
  count: number;
  unlocked: boolean;
};

type LevelCopy = {
  title: string;
  blurb: string;
  target: number;
  icon?: IconName;
  emoji?: string;
};

function track(
  family: string,
  familyTitle: string,
  lane: StatSectionId,
  icon: IconName,
  emoji: string,
  progress: (input: CoupleStatInput) => number,
  levels: [LevelCopy, LevelCopy, LevelCopy]
): BadgeDef[] {
  return levels.map((level, index) => ({
    id: `${family}-${index + 1}`,
    family,
    familyTitle,
    level: (index + 1) as BadgeLevel,
    title: level.title,
    blurb: level.blurb,
    icon: level.icon ?? icon,
    emoji: level.emoji ?? emoji,
    lane,
    target: level.target,
    progress,
  }));
}

const checkInsYou = (input: CoupleStatInput) =>
  input.checkIns.filter((row) => row.userId === input.user?.id).length;

const sameMorningDays = (input: CoupleStatInput) => {
  const yours = new Set(
    input.checkIns.filter((row) => row.userId === input.user?.id).map((row) => row.date)
  );
  const days = new Set<string>();
  for (const row of input.checkIns) {
    if (row.userId === input.partner?.id && yours.has(row.date)) days.add(row.date);
  }
  return days.size;
};

export const BADGES: BadgeDef[] = [
  ...track("pulse", "Check-ins", "connect", "heart", "💓", checkInsYou, [
    { title: "Pulse intern", blurb: "First check-in. HR has been notified.", target: 1 },
    { title: "Mood meteorologist", blurb: "Five forecasts. They pack a jacket.", target: 5, icon: "rainy", emoji: "🌧️" },
    { title: "Emotional Wikipedia", blurb: "Twenty-five check-ins on the record.", target: 25, icon: "book", emoji: "📖" },
  ]),
  ...track("same-morning", "Same morning", "connect", "sunny", "☕", sameMorningDays, [
    { title: "Matching coffee", blurb: "You both check in on the same day.", target: 1 },
    { title: "Twin sunrise", blurb: "Seven days you both showed up.", target: 7, icon: "partly-sunny", emoji: "🌅" },
    { title: "Hive mind", blurb: "Thirty days you both checked in.", target: 30, icon: "sync", emoji: "🧠" },
  ]),
  ...track("dates", "Date nights", "connect", "wine", "🍷", (input) =>
    input.dateNightAsks.filter((row) => row.fromUserId === input.user?.id).length, [
    { title: "Smooth operator", blurb: "Ask them out once.", target: 1 },
    { title: "Reservation shark", blurb: "Start three date nights.", target: 3, icon: "calendar", emoji: "📅" },
    { title: "Regulars at us", blurb: "Start twelve date nights.", target: 12, icon: "star", emoji: "⭐" },
  ]),
  ...track("jar", "Gratitude jar", "connect", "file-tray", "💌", (input) =>
    input.jarNotes.filter((row) => row.fromUserId === input.user?.id).length, [
    { title: "Note in a bottle", blurb: "Write one jar note.", target: 1 },
    { title: "Soft archive", blurb: "Five notes in the jar.", target: 5, icon: "file-tray-full", emoji: "📦" },
    { title: "Keepsake goblin", blurb: "Twenty notes. You collect feelings.", target: 20, icon: "gift", emoji: "🎁" },
  ]),
  ...track("talk", "Talk cards", "connect", "chatbubbles", "💬", (input) => input.talkDraws.length, [
    { title: "Keep talking", blurb: "Draw five Talk cards.", target: 5 },
    { title: "Long conversation", blurb: "Draw fifteen Talk cards.", target: 15, icon: "chatbox-ellipses", emoji: "🗯️" },
    { title: "Never out of words", blurb: "Draw forty Talk cards.", target: 40, icon: "mic", emoji: "🎤" },
  ]),
  ...track("lists", "Shared lists", "connect", "checkbox", "✅", (input) =>
    input.listEntries.filter((row) => row.completedAt).length, [
    { title: "Tick of approval", blurb: "Tick off five list items together.", target: 5 },
    { title: "Getting through it", blurb: "Tick off fifteen list items.", target: 15, icon: "checkmark-done", emoji: "☑️" },
    { title: "Nothing left hanging", blurb: "Tick off forty list items.", target: 40, icon: "albums", emoji: "🧾" },
  ]),
  ...track("curiosity", "Curiosity", "connect", "help-circle", "🔮", (input) =>
    input.curiosityAnswers.filter((row) => row.userId === input.user?.id).length, [
    { title: "First guess", blurb: "Answer five curiosity cards.", target: 5 },
    { title: "Getting warmer", blurb: "Answer twenty curiosity cards.", target: 20, icon: "help", emoji: "🔥" },
    { title: "I know you", blurb: "Answer fifty curiosity cards.", target: 50, icon: "sparkles", emoji: "✨" },
  ]),
  ...track("streak", "Showing up", "general", "flame", "🔥", (input) =>
    currentStreak(activityDateKeys(input)), [
    { title: "Three nights on", blurb: "Any activity three days in a row.", target: 3 },
    { title: "Campfire couple", blurb: "Any activity five days in a row.", target: 5, icon: "bonfire", emoji: "🏕️" },
    { title: "Fortnight fire", blurb: "Fourteen days in a row.", target: 14, icon: "flash", emoji: "⚡" },
  ]),
  ...track("hours", "Time in the app", "general", "hourglass", "⏳", (input) =>
    Math.floor((input.user?.activeSeconds ?? 0) / 60), [
    { title: "One hour in", blurb: "Spend an hour in the app.", target: 60 },
    { title: "Evening in", blurb: "Spend five hours in the app.", target: 300, icon: "time", emoji: "🌙" },
    { title: "Lived-in", blurb: "Spend twelve hours in the app.", target: 720, icon: "timer", emoji: "🏠" },
  ]),
  ...track("paired", "Days paired", "general", "infinite", "♾️", (input) => pairAgeDays(input.couple), [
    { title: "Week of us", blurb: "Stay paired for seven days.", target: 7 },
    { title: "A month in", blurb: "Stay paired for thirty days.", target: 30, icon: "heart-circle", emoji: "💗" },
    { title: "Hundred days", blurb: "Stay paired for a hundred days.", target: 100, icon: "ribbon", emoji: "🏅" },
  ]),
  ...track("nights", "Spicy nights", "desire", "moon", "🌙", (input) =>
    input.nights.filter((row) => row.gameKey === "get-spicy").length, [
    { title: "Lights down", blurb: "Play Get Spicy once.", target: 1 },
    { title: "Afterglow club", blurb: "Finish five spicy nights.", target: 5, icon: "sparkles", emoji: "✨" },
    { title: "Regulars", blurb: "Play fifteen spicy nights.", target: 15, icon: "flame", emoji: "🔥" },
  ]),
  ...track("cards", "Spicy cards", "desire", "albums", "🃏", (input) =>
    input.deck.filter((row) => row.status === "played").length, [
    { title: "First hand", blurb: "Play ten spicy cards.", target: 10 },
    { title: "Card shark", blurb: "Play twenty-five spicy cards.", target: 25, icon: "layers", emoji: "🦈" },
    { title: "Whole deck", blurb: "Play sixty spicy cards.", target: 60, icon: "copy", emoji: "📚" },
  ]),
  ...track("positions-try", "Positions tried", "desire", "body", "🗺️", (input) =>
    input.positionSaves.filter((row) => row.doneAt).length, [
    { title: "New map", blurb: "Try one position.", target: 1 },
    { title: "Getting around", blurb: "Try five positions.", target: 5, icon: "navigate", emoji: "🧭" },
    { title: "Atlas", blurb: "Try fifteen positions.", target: 15, icon: "map", emoji: "🌍" },
  ]),
  ...track("positions-save", "Positions saved", "desire", "bookmark", "🔖", (input) =>
    input.positionSaves.length, [
    { title: "Bookmark the body", blurb: "Save three positions to try.", target: 3 },
    { title: "Shortlist", blurb: "Save ten positions.", target: 10, icon: "bookmarks", emoji: "📑" },
    { title: "The list", blurb: "Save twenty-five positions.", target: 25, icon: "library", emoji: "📚" },
  ]),
  ...track("dares", "Dare Me", "desire", "megaphone", "🫦", (input) =>
    input.spicyDares.filter((row) => row.fromUserId === input.user?.id).length, [
    { title: "Say it", blurb: "Send one Dare Me play.", target: 1 },
    { title: "Louder", blurb: "Send five Dare Me plays.", target: 5, icon: "volume-high", emoji: "🔊" },
    { title: "No filter", blurb: "Send twenty Dare Me plays.", target: 20, icon: "flash", emoji: "⚡" },
  ]),
  ...track("fantasies", "Fantasy likes", "desire", "eye", "👀", (input) =>
    input.fantasySwipes.filter((row) => row.userId === input.user?.id && row.liked).length, [
    { title: "Hungry eyes", blurb: "Like five fantasies.", target: 5 },
    { title: "Want list", blurb: "Like fifteen fantasies.", target: 15, icon: "heart", emoji: "💘" },
    { title: "Wide open", blurb: "Like forty fantasies.", target: 40, icon: "color-wand", emoji: "🪄" },
  ]),
  ...track("fantasy-done", "Fantasies done", "desire", "checkmark-circle", "✔️", (input) =>
    input.fantasyCompletions.length, [
    { title: "Tried it", blurb: "Mark one fantasy done.", target: 1 },
    { title: "A few off the list", blurb: "Mark five fantasies done.", target: 5, icon: "checkmark-done-circle", emoji: "🏆" },
    { title: "Living it", blurb: "Mark fifteen fantasies done.", target: 15, icon: "trophy", emoji: "🎉" },
  ]),
  ...track("roleplays", "Roleplays", "desire", "color-wand", "🎭", (input) =>
    input.roleplaySaves.length, [
    { title: "Costume in the drawer", blurb: "Save a roleplay.", target: 1 },
    { title: "Casting call", blurb: "Save five roleplays.", target: 5, icon: "film", emoji: "🎬" },
    { title: "Repertoire", blurb: "Save fifteen roleplays.", target: 15, icon: "easel", emoji: "🎪" },
  ]),
  ...track("chicken", "Chicken", "fun", "egg", "🐔", (input) =>
    input.chickenPlays.filter((row) => row.fromUserId === input.user?.id).length, [
    { title: "Egg-mergency", blurb: "Send a Chicken dare. Cluck or commit.", target: 1, emoji: "🐣" },
    { title: "Cluck yeah", blurb: "Send ten Chicken dares.", target: 10, icon: "paw", emoji: "🐔" },
    { title: "Coop Napoleon", blurb: "Send thirty. The yard is yours.", target: 30, icon: "happy", emoji: "🐓" },
  ]),
  ...track("coupons", "Coupons", "fun", "ticket", "🎟️", (input) =>
    input.coupons.filter((row) => row.fromUserId === input.user?.id).length, [
    { title: "IOU goblin", blurb: "Give one coupon.", target: 1 },
    { title: "Tear-off king", blurb: "Give five coupons.", target: 5, icon: "pricetag", emoji: "🏷️" },
    { title: "Walking booklet", blurb: "Give fifteen coupons. Generous menace.", target: 15, icon: "gift", emoji: "🎁" },
  ]),
  ...track("know-me", "How Well Do You Know Me", "fun", "help-circle", "🔮", (input) =>
    input.knowMeGuesses, [
    { title: "Mind intern", blurb: "Guess one How Well Do You Know Me pack.", target: 1 },
    { title: "Soul Google", blurb: "Guess five packs. Unsettling accuracy.", target: 5, icon: "sparkles", emoji: "🧠" },
    { title: "Human Wikipedia", blurb: "Guess fifteen packs. They have no secrets.", target: 15, icon: "library", emoji: "🧿" },
  ]),
  ...track("lovebetz", "LoveBetz", "fun", "cash", "🎲", (input) =>
    input.predictionsSent, [
    { title: "Tiny gambler", blurb: "Send your first LoveBetz slip.", target: 1 },
    { title: "Stakeholder", blurb: "Send five slips. The house is watching.", target: 5, icon: "wallet", emoji: "💸" },
    { title: "House bank", blurb: "Send fifteen slips. Legend of the slip.", target: 15, icon: "trophy", emoji: "🏆" },
  ]),
  ...track("photos", "Photo Memory", "fun", "camera", "📸", (input) =>
    input.photoMemories, [
    { title: "Say cheese intern", blurb: "Add one Photo Memory shot.", target: 1 },
    { title: "Polaroid pest", blurb: "Add five shots to the clothesline.", target: 5, icon: "images", emoji: "🖼️" },
    { title: "The album", blurb: "Add fifteen shots. Family historian, spicy edition.", target: 15, icon: "film", emoji: "📷" },
  ]),
  ...track("daily-word", "Daily Word", "fun", "grid", "🔤", (input) =>
    input.wordleSolved, [
    { title: "Five-letter fling", blurb: "Solve one Daily Word.", target: 1 },
    { title: "Word nerd", blurb: "Solve seven Daily Words.", target: 7, icon: "book", emoji: "🧩" },
    { title: "Dictionary duo", blurb: "Solve thirty. The grid fears you.", target: 30, icon: "school", emoji: "📖" },
  ]),
  ...track("doodle", "Draw It", "fun", "brush", "✏️", (input) =>
    input.doodleRounds, [
    { title: "Stick figure", blurb: "Finish one Draw It round.", target: 1 },
    { title: "Fridge Picasso", blurb: "Finish five rounds. The fridge is jealous.", target: 5, icon: "color-palette", emoji: "🎨" },
    { title: "Guess this", blurb: "Finish fifteen rounds. Abstract legend.", target: 15, icon: "easel", emoji: "🖌️" },
  ]),
  ...track("fair-share", "Fair Share", "fun", "sync", "🎡", (input) =>
    input.fairSpins, [
    { title: "Wheel of chores", blurb: "Spin Fair Share once.", target: 1 },
    { title: "Fair-ish", blurb: "Spin ten times. Diplomacy, sort of.", target: 10, icon: "swap-horizontal", emoji: "⚖️" },
    { title: "Domestic diplomat", blurb: "Spin twenty-five. UN of the laundry.", target: 25, icon: "home", emoji: "🧹" },
  ]),
  ...track("calendar", "Calendar", "home", "calendar-outline", "📅", (input) =>
    input.calendarEvents.length, [
    { title: "On the fridge", blurb: "Add a calendar note.", target: 1 },
    { title: "Busy week", blurb: "Add eight calendar notes.", target: 8, icon: "calendar", emoji: "🗓️" },
    { title: "House calendar", blurb: "Add twenty calendar notes.", target: 20, icon: "today", emoji: "🏠" },
  ]),
  ...track("errands", "Errands", "home", "bag-check", "🛍️", (input) =>
    input.errandItems.filter((row) => row.doneAt).length, [
    { title: "Bag packed", blurb: "Tick off a grocery or errand.", target: 1 },
    { title: "Weekly shop", blurb: "Tick off ten errands.", target: 10, icon: "cart", emoji: "🛒" },
    { title: "Stocked", blurb: "Tick off thirty errands.", target: 30, icon: "cube", emoji: "📦" },
  ]),
  ...track("meals", "Meals", "home", "restaurant", "🍽️", (input) =>
    input.mealRounds.filter((row) => row.status === "agreed").length, [
    { title: "What's for dinner", blurb: "Agree a meal round.", target: 1 },
    { title: "Menu for the week", blurb: "Agree five meal rounds.", target: 5, icon: "fast-food", emoji: "🍜" },
    { title: "House cooks", blurb: "Agree fifteen meal rounds.", target: 15, icon: "pizza", emoji: "🍕" },
  ]),
  ...track("rituals", "Rituals", "home", "leaf", "🍃", (input) => input.ritualChecks.length, [
    { title: "First ritual", blurb: "Check off one household ritual.", target: 1 },
    { title: "Habit", blurb: "Check off ten rituals.", target: 10, icon: "flower", emoji: "🌸" },
    { title: "The way we live", blurb: "Check off twenty-five rituals.", target: 25, icon: "home", emoji: "🏡" },
  ]),
];

export function evaluateBadges(input: CoupleStatInput): BadgeStatus[] {
  return BADGES.map((badge) => {
    const count = Math.max(0, badge.progress(input));
    return {
      ...badge,
      count,
      unlocked: count >= badge.target,
    };
  });
}

export function badgeFamilies(badges: BadgeStatus[]): BadgeStatus[][] {
  const map = new Map<string, BadgeStatus[]>();
  for (const badge of badges) {
    const list = map.get(badge.family) ?? [];
    list.push(badge);
    map.set(badge.family, list);
  }
  return [...map.values()].map((rows) =>
    [...rows].sort((left, right) => left.level - right.level)
  );
}
