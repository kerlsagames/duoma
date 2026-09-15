import { localDateKey, startOfWeek } from "@/lib/dates";
import { nowIso } from "@/lib/ids";

export type HowChapterId =
  | "arrive"
  | "hands"
  | "mouth"
  | "inside"
  | "pace"
  | "after"
  | "talk";

export type HowFor = "her" | "him" | "both";

export type HowStatus = "want" | "keep" | "skip";

export type HowTechnique = {
  id: string;
  chapter: HowChapterId;
  for: HowFor;
  name: string;
  promise: string;
  how: string;
  firstTry: string;
  adjust: string;
  sayThis: string;
  notice: string;
};

export type HowChapter = {
  id: HowChapterId;
  label: string;
  detail: string;
};

export type HowNote = {
  techniqueId: string;
  status: HowStatus | null;
  note: string;
  updatedAt: string;
};

export type HowWord = {
  id: string;
  word: string;
  meaning: string;
};

export const HOW_CHAPTERS: HowChapter[] = [
  { id: "arrive", label: "Arrive", detail: "Warm the room before anyone is naked" },
  { id: "hands", label: "Hands", detail: "Pressure, place, and the tiny changes that matter" },
  { id: "mouth", label: "Mouth", detail: "Rhythm you can keep, and hands that stay" },
  { id: "inside", label: "Inside", detail: "Shallow, angled, and never only thrusting" },
  { id: "pace", label: "Pace", detail: "How not to snatch a good thing away" },
  { id: "after", label: "After", detail: "The two minutes that teach you next time" },
  { id: "talk", label: "Words", detail: "Specific asks instead of hoping they guess" },
];

export const HOW_WORDS: HowWord[] = [
  { id: "softer", word: "Softer", meaning: "Less pressure. Not slower — lighter." },
  { id: "stay", word: "Stay", meaning: "Do not change a thing. That exact motion." },
  { id: "there", word: "There", meaning: "You found the spot. Park on it." },
  { id: "left", word: "Left a bit", meaning: "A centimetre, not a new technique." },
  { id: "slower", word: "Slower", meaning: "Half the rhythm you just had." },
  { id: "harder", word: "Harder", meaning: "More pressure. Same place." },
  { id: "pause", word: "Pause", meaning: "Hold still, keep contact, breathe." },
  { id: "more-time", word: "More time", meaning: "Do not escalate yet. Stay here longer." },
  { id: "not-that", word: "Not that", meaning: "Kind, fast, no essay required." },
  { id: "again", word: "Again later", meaning: "Good. File it. We can repeat it." },
];

function t(
  id: string,
  chapter: HowChapterId,
  forWho: HowFor,
  name: string,
  promise: string,
  how: string,
  firstTry: string,
  adjust: string,
  sayThis: string,
  notice: string
): HowTechnique {
  return { id, chapter, for: forWho, name, promise, how, firstTry, adjust, sayThis, notice };
}

/** Original Duoma technique book. Not OMGyes copy or named moves. */
export const HOW_TECHNIQUES: HowTechnique[] = [
  t(
    "long-hello",
    "arrive",
    "both",
    "The long hello",
    "Ten minutes with clothes still on.",
    "Kiss, neck, back, the inside of a wrist. No racing to a zipper. The point is to arrive in the same room as each other.",
    "Set a timer if you have to. Hands stay above the waist until it goes.",
    "If someone is already buzzing, shorten it. If someone is still in the day, lengthen it.",
    "Stay here. Don’t go lower yet.",
    "Breathing slowing down is the green light. Checking the clock is not."
  ),
  t(
    "slow-map",
    "arrive",
    "her",
    "Slow map",
    "Find what she likes before you guess the clit.",
    "With a flat hand, travel her inner thighs, the crease, the outer lips, the mound. Name nothing. Just notice where she leans in.",
    "Lights low. You ask: ‘Tell me when that is a yes.’ She only has to hum.",
    "If she goes quiet, pause on the last yes. Do not hunt.",
    "A little higher. Stay off the middle until I say.",
    "A yes is a hip that meets you, not a performance."
  ),
  t(
    "warm-cool",
    "arrive",
    "both",
    "Warm, then cool",
    "Skin wakes up when temperature changes.",
    "Mouth or a warm palm, then a cooler pass — the back of a hand, a breath. Alternate on the same patch of skin.",
    "Start on a shoulder or stomach, not genitals. Let them ask you closer.",
    "Too sharp? Skip the cool. Just the warm palm, slower.",
    "Do that temperature thing again.",
    "Goosebumps are information. Flinching is too much contrast."
  ),
  t(
    "steady-press",
    "hands",
    "her",
    "Steady press",
    "Stillness with weight, not a fidget.",
    "Two fingers or the pad of a thumb rest on the clitoral hood, not the tip. Press and hold. Count to eight before you move.",
    "Ask her to put your hand where the press should live. You only supply the weight.",
    "Too much? Less of your hand, more of the hood as a cushion. Not enough? Tiny circles on top of the press, not instead of it.",
    "Hold it. Don’t rub yet.",
    "A lot of women get more from pressure than from speed. Watch her belly, not her face."
  ),
  t(
    "tiny-circle",
    "hands",
    "her",
    "Tiny circle",
    "Smaller than you think. Then smaller.",
    "One fingertip, on or beside the hood. A circle the size of a pea. Same size, same speed, for a full minute.",
    "She can rest her hand over yours and shrink the motion if you drift.",
    "If she tenses, go to the side of the clit, not on it. Wetness first if anything catches.",
    "Smaller. That’s too wide.",
    "The mistake is getting bored and making it bigger. Boredom is often the moment it starts working."
  ),
  t(
    "on-off",
    "hands",
    "her",
    "On, off, on",
    "Pressure that pulses instead of rubbing.",
    "Press for two seconds, ease off without leaving the skin, press again. No sliding.",
    "Agree the count out loud the first time so you share the rhythm.",
    "If she chases your hand on the off, shorten the gap. If she winces, longer off, lighter on.",
    "Pulse it. Don’t stroke.",
    "Leaving contact entirely usually kills it. Stay touching even when you ease up."
  ),
  t(
    "two-speeds",
    "hands",
    "her",
    "Two speeds",
    "One slow underneath, one quicker on top.",
    "The heel of your hand or two fingers keep a slow press at the base. A fingertip adds a quicker light motion higher up.",
    "Get the slow layer stable first. Add the second only when she is already with you.",
    "Drop the fast layer if she tightens. Keep the slow one. You can always add it back.",
    "Keep the bottom hand. Speed up the top.",
    "Two jobs, two parts of the hand. If both hands get busy, you lose the floor."
  ),
  t(
    "hold-still",
    "hands",
    "her",
    "Hold still",
    "When it is working, freeze.",
    "The moment her breath changes, lock the exact pressure and place. Do not ‘help’ by going faster.",
    "Practice on a non-sexual spot first — a shoulder — so you both know the cue.",
    "If you freeze too early, she can rock against you. You stay the wall.",
    "Don’t you dare change that.",
    "Most good things get stolen by a partner who means well and speeds up."
  ),
  t(
    "broad-narrow",
    "hands",
    "her",
    "Broad, then narrow",
    "Whole vulva first. Detail later.",
    "Start with a whole-hand cup, heel of the palm over the mound, fingers along the lips. After she is wet and leaning in, shrink to two fingers on the hood.",
    "Two minutes broad, minimum. Then ask before you narrow.",
    "If the narrow is too sharp, go broad again. That is not a failure. It is the volume knob.",
    "Whole hand a bit longer.",
    "Going straight to the tip is why a lot of women feel ‘too sensitive’ — it was never warmed."
  ),
  t(
    "for-him-grip",
    "hands",
    "him",
    "The unhurried grip",
    "A fist that does not chase orgasm.",
    "Wet or lotioned hand, thumb along the underside. Long strokes, pause at the head, squeeze on the way down. Stay slower than porn.",
    "Ask which third of the shaft he actually feels. Spend time there, not on the whole length every time.",
    "Dry catch? More slick. Too tight? Loosen the downstroke, keep the pause at the top.",
    "Slower on the way down. Pause at the top.",
    "A lot of men have never had someone stay at one speed long enough to like it."
  ),
  t(
    "perineum",
    "hands",
    "him",
    "The extra inch",
    "The skin behind the balls is not an accident.",
    "While one hand works the shaft, a thumb or two fingers press the perineum — firm, not a poke. Hold, or tiny pulses.",
    "Short nails. Check in the first time: ‘Too much, or more?’",
    "If he lifts away, lighter. If he presses down, keep it and do not add a finger inside unless he asked.",
    "That pressure under there. Stay.",
    "This is the move a lot of men only discover alone and then never mention."
  ),
  t(
    "soft-hover",
    "mouth",
    "her",
    "Soft hover",
    "Heat before contact.",
    "Breathe on her, lips almost touching, for a few seconds. Then the broad flat of the tongue, not the tip.",
    "Hands on her hips so you feel if she comes to you. You do not dive.",
    "If she is too ticklish, skip the hover and start with a closed-mouth kiss on the mound.",
    "Just the heat. Not the tongue yet.",
    "The hover is a question. Her hips answering is the yes."
  ),
  t(
    "flat-then-point",
    "mouth",
    "her",
    "Flat, then point",
    "Wide tongue first. Tip is a seasoning.",
    "Keep the tongue soft and wide over the hood. After a stretch of that, a few pointed flicks, then back to wide.",
    "Count eight wide, two pointed, repeat. Boring on purpose.",
    "Pointed too soon and she will clamp. Stay wide until she is chasing you.",
    "Flat again. The tip is too much.",
    "Pointy-tongue-as-default is a porn habit. Wide is how a lot of women actually come."
  ),
  t(
    "rhythm-lock",
    "mouth",
    "her",
    "Rhythm lock",
    "Pick a beat and keep it like a song.",
    "Choose a slow, even stroke — side to side or up the hood — and do not improvise. If you need a metronome, use her breath.",
    "Agree: you will not change anything until she moves your head or says so.",
    "Jaw tired? Switch to the steady press with your mouth still on her, or a hand taking the same beat.",
    "Same beat. Don’t get creative.",
    "Creativity is the enemy of a rhythm that was working."
  ),
  t(
    "hands-stay",
    "mouth",
    "her",
    "Hands stay",
    "Mouth for the clit. Hands for everything else.",
    "While your mouth stays simple, a hand cups a breast, holds a thigh open, or rests a palm on her lower belly. The hand is the floor.",
    "Pick one job for the spare hand. Do not wander both.",
    "If she wants a finger inside, that is a separate ask. Do not assume the mouth means she wants both.",
    "Hand on my belly. Mouth stays where it is.",
    "A roaming second hand often yanks her attention off the thing that was building."
  ),
  t(
    "for-him-mouth",
    "mouth",
    "him",
    "The unfancy mouth",
    "Wet, slow, and a hand that does the rest.",
    "Lips covering teeth, a lot of spit, short range on the head and the first inches. Your hand works the rest of the shaft so your jaw does not have to be a hero.",
    "Ask if he wants you looking at him or not. Then stop asking and do the thing.",
    "Gagging is not a review. Back off, more hand, less depth. Slow is still sex.",
    "Hand on the rest. Mouth just here.",
    "Depth is a movie trick. Most of the feeling is not that far down."
  ),
  t(
    "shallow-stay",
    "inside",
    "her",
    "Shallow stay",
    "The first inch is a place, not a hallway.",
    "Enter only as far as the first third. Stay. Tiny rocks, or none. Let her pull you deeper if she wants that.",
    "You can hold the rest of you with a hand so you physically cannot slam in.",
    "If she wants deeper, she will say or pull. Until then, shallow is the technique, not the warm-up.",
    "Stay shallow. I will take more if I want it.",
    "A lot of the nerves worth meeting are near the entrance. Depth can wait."
  ),
  t(
    "rock-not-thrust",
    "inside",
    "her",
    "Rock, don’t thrust",
    "A grind that keeps contact with her clit.",
    "Once you are inside, the motion is a rock of the hips so the base of you — or your pubic bone — stays on her clit. In-and-out is optional.",
    "Try it in a position where you can both feel that contact — her on top, or missionary with her knees higher.",
    "If the clit contact disappears, stop pumping and find the rock again.",
    "Grind on me. Don’t pull out.",
    "Thrusting as the main event is why penetration so often ‘does nothing’ for her."
  ),
  t(
    "both-at-once",
    "inside",
    "her",
    "Both at once",
    "Inside and a hand on the clit, on purpose.",
    "Whatever is inside stays simple. A hand or a small toy keeps a steady external rhythm. They do not have to match.",
    "Get the clit rhythm first. Add inside second, or she will lose the plot.",
    "If she has to choose, keep the clit. Drop the inside for a bit. You can stack them again.",
    "Don’t stop the hand when you go in.",
    "Plenty of women need both. Treating the hand as ‘foreplay’ you abandon is the usual miss."
  ),
  t(
    "angle-hunt",
    "inside",
    "her",
    "Angle hunt",
    "A centimetre of tilt is a different sex.",
    "Change one thing: a pillow under her hips, her knees toward her chest, you a little higher or to one side. Stay there long enough to find out.",
    "Hunt for thirty seconds per angle, not three. Ask ‘better, worse, or different?’",
    "If nothing is better, go back to the last okay angle and add a hand on the clit.",
    "Tilt up a bit and stay. Don’t keep searching.",
    "Endless searching is its own problem. Pick a finalist and commit."
  ),
  t(
    "half-speed",
    "pace",
    "both",
    "Half speed",
    "Whatever you are doing, cut it in half.",
    "Midway through, one of you says ‘half speed’ and you both obey for a full minute. Same place, half the tempo.",
    "Use it as a reset when someone is rushing or disappearing into their head.",
    "If half speed makes it fall apart, that is useful. Switch to hold still instead.",
    "Half speed. One minute.",
    "Rushing is usually anxiety dressed as enthusiasm."
  ),
  t(
    "dont-change-it",
    "pace",
    "both",
    "Don’t change it",
    "The technique where you refuse to improve it.",
    "When something is working, the only allowed move is to keep it. No faster, no extra finger, no new trick.",
    "The receiving partner says the word. The giving partner’s job is to be boring on purpose.",
    "If you lose the exact spot, stop and let them put you back. Do not guess.",
    "Don’t change it.",
    "This is the whole book, compressed. File the word. Use it for years."
  ),
  t(
    "peak-and-park",
    "pace",
    "both",
    "Peak and park",
    "Get close, then stay under the line.",
    "When someone is near the edge, back off to a hold or a slower version for twenty seconds, then return. Repeat once or twice, not ten.",
    "Agree beforehand so backing off does not feel like a tease they did not ask for.",
    "If they hate the retreat, skip this technique forever. Not everyone wants a cliff.",
    "Back off. Stay on me. Then come back.",
    "Consent for edging is the technique. Without it, it is just you grabbing the remote."
  ),
  t(
    "stay-close",
    "after",
    "both",
    "Stay close",
    "Two minutes of skin before anyone grabs a phone.",
    "Stay where you are. Weight, a hand, a forehead. No debrief yet. Let the nervous system land.",
    "If someone needs space, they say ‘air’ and you give it without a face.",
    "Sweaty and stuck? Shift to side-by-side, still touching.",
    "Don’t go yet.",
    "How you leave the bed teaches the body whether that was safe to repeat."
  ),
  t(
    "quiet-check",
    "after",
    "both",
    "Quiet check-in",
    "One specific question, not a performance review.",
    "After the stay close, ask one thing: ‘What should we repeat?’ or ‘Anything to skip next time?’ Then stop talking.",
    "Do this the next morning if the night is too raw. Same two questions.",
    "If they shrug, accept the shrug. Pushing for a TED talk kills the honesty.",
    "What do we keep?",
    "The notebook in this app is for the answer. Write the keep. Do not write an essay about the skip unless they want that."
  ),
  t(
    "traffic-light",
    "talk",
    "both",
    "Traffic lights",
    "Green, yellow, red — in bed, out loud.",
    "Green: keep going. Yellow: change something, don’t stop. Red: full stop, no mood trial. Practice the words with clothes on so they are not new in the dark.",
    "Pick a silly backup word for red if ‘red’ feels stiff. The meaning stays strict.",
    "If yellow is used, the giver asks ‘lighter, slower, or different place?’ — one question.",
    "Yellow. Slower.",
    "A couple that can yellow is a couple that can go further without guessing."
  ),
  t(
    "one-ask",
    "talk",
    "both",
    "One specific ask",
    "Ask for a place and a pressure. Not a vibe.",
    "Instead of ‘be more passionate,’ you say ‘two fingers, left of the clit, slower than that.’ One ask per stretch of time.",
    "Write the ask in a note here if saying it out loud is still hard. Read it. Then try it.",
    "If the ask fails, you do not owe a second speech. Try a different technique card.",
    "Left a bit, and lighter.",
    "Vague coaching (‘like you mean it’) is how people get worse at this. Specific is kind."
  ),
  t(
    "replay-tomorrow",
    "talk",
    "both",
    "Replay tomorrow",
    "Praise is a technique. Do it in daylight.",
    "The next day, name one thing that worked, with the word from this book if you have one. No sandwich of criticism.",
    "Text is allowed. ‘The tiny circles. Again.’ is a complete message.",
    "If nothing worked, skip the replay. Silence is kinder than a fake compliment.",
    "Do the tiny circles again sometime.",
    "Bodies remember being thanked. They also remember being graded."
  ),
];

export function chapterMeta(id: HowChapterId) {
  return HOW_CHAPTERS.find((row) => row.id === id) ?? HOW_CHAPTERS[0]!;
}

export function techniqueById(id: string): HowTechnique | null {
  return HOW_TECHNIQUES.find((row) => row.id === id) ?? null;
}

export function techniquesInChapter(id: HowChapterId): HowTechnique[] {
  return HOW_TECHNIQUES.filter((row) => row.chapter === id);
}

export function forLabel(who: HowFor): string {
  if (who === "her") return "For her";
  if (who === "him") return "For him";
  return "For both of you";
}

export function statusLabel(status: HowStatus | null): string {
  if (status === "want") return "Want to try";
  if (status === "keep") return "Keep this";
  if (status === "skip") return "Not for us";
  return "Untried";
}

export function noteFor(
  notes: HowNote[],
  techniqueId: string
): HowNote | null {
  return notes.find((row) => row.techniqueId === techniqueId) ?? null;
}

export function upsertHowNote(
  notes: HowNote[],
  techniqueId: string,
  patch: Partial<Pick<HowNote, "status" | "note">>
): HowNote[] {
  const current = noteFor(notes, techniqueId);
  const next: HowNote = {
    techniqueId,
    status: patch.status !== undefined ? patch.status : current?.status ?? null,
    note: patch.note !== undefined ? patch.note : current?.note ?? "",
    updatedAt: nowIso(),
  };
  if (!current) return [...notes, next];
  return notes.map((row) => (row.techniqueId === techniqueId ? next : row));
}

export function keptTechniques(notes: HowNote[]): HowTechnique[] {
  const ids = new Set(
    notes.filter((row) => row.status === "keep" || row.status === "want").map((row) => row.techniqueId)
  );
  return HOW_TECHNIQUES.filter((row) => ids.has(row.id));
}

export function thisWeekKey(from = new Date()): string {
  return startOfWeek(localDateKey(from));
}

function hashKey(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function weekTechnique(notes: HowNote[], weekKey: string): HowTechnique {
  const skipped = new Set(
    notes.filter((row) => row.status === "skip").map((row) => row.techniqueId)
  );
  const tried = new Set(
    notes.filter((row) => row.status === "keep" || row.status === "want").map((row) => row.techniqueId)
  );
  const fresh = HOW_TECHNIQUES.filter((row) => !skipped.has(row.id) && !tried.has(row.id));
  const pool = fresh.length ? fresh : HOW_TECHNIQUES.filter((row) => !skipped.has(row.id));
  const list = pool.length ? pool : HOW_TECHNIQUES;
  return list[hashKey(weekKey) % list.length]!;
}

export function emptyHowNotes(): HowNote[] {
  return [];
}

export function emptyHowWords(): string[] {
  return [];
}

export function hydrateHowNote(raw: unknown): HowNote | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<HowNote>;
  if (typeof row.techniqueId !== "string" || !row.techniqueId) return null;
  if (!techniqueById(row.techniqueId)) return null;
  const status =
    row.status === "want" || row.status === "keep" || row.status === "skip"
      ? row.status
      : null;
  return {
    techniqueId: row.techniqueId,
    status,
    note: typeof row.note === "string" ? row.note : "",
    updatedAt: typeof row.updatedAt === "string" && row.updatedAt ? row.updatedAt : nowIso(),
  };
}

export function hydrateHowNotes(raw: unknown): HowNote[] {
  return (Array.isArray(raw) ? raw : [])
    .map(hydrateHowNote)
    .filter((row): row is HowNote => Boolean(row));
}

export function hydrateHowWordsOn(raw: unknown): string[] {
  const known = new Set(HOW_WORDS.map((row) => row.id));
  return (Array.isArray(raw) ? raw : []).filter(
    (id): id is string => typeof id === "string" && known.has(id)
  );
}
