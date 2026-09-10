#!/usr/bin/env node
/**
 * Moves leftover post-sex Finish Off cards into Afterglow, then rewrites
 * every deck so play text uses {player} / {partner} name tokens.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "games", "get-spicy", "cards");

const POST_SEX_TITLES = new Set([
  "Linger Pulse",
  "Afterglow Hug",
  "Whispered Thanks",
  "Warm Towel Care",
  "Chest Rest",
  "Hair Stroke Afterglow",
  "Soft Kisses Only",
  "Hydration Service",
  "Cuddle Lock",
]);

const SPECIAL = {
  "Oral Finale": {
    title: "Finish off with oral",
    description:
      "{player}, finish {partner} off with oral. Stay with your mouth until they come.",
  },
  "Oral Finale Shift": {
    title: "Finish off with oral — stay there",
    description:
      "{player}, finish {partner} off with oral. Switch to your mouth and do not switch back.",
  },
  "Agonizing Oral": {
    description:
      "{player}, use oral on {partner} at an agonizingly slow tempo for 90 seconds.",
  },
  "Tongue Tip Focus": {
    description:
      "{player}, spend 2 minutes giving {partner} oral using only the tip of your tongue in small circles.",
  },
  "Oral / Manual Swap": {
    description:
      "{player}, alternate between fast oral and slow hands on {partner} for 2 minutes.",
  },
};

function isPostSex(card) {
  if (card.category !== "finish_off") return false;
  if (String(card.description).startsWith("Post-Sex:")) return true;
  return POST_SEX_TITLES.has(card.title);
}

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
}

function save(name, cards) {
  fs.writeFileSync(path.join(dir, name), JSON.stringify(cards, null, 2) + "\n");
}

function stripPrefix(text) {
  return String(text)
    .replace(/^Post-Sex:\s*/i, "")
    .replace(/^Position:\s*/i, "")
    .replace(/^Goal:\s*/i, "")
    .replace(/^Tempo:\s*/i, "")
    .replace(/^Touch:\s*/i, "")
    .replace(/^Toy Finish:\s*/i, "")
    .replace(/^Audio:\s*/i, "")
    .replace(/^Command:\s*/i, "")
    .replace(/^Restraint:\s*/i, "")
    .replace(/^Edge Finale:\s*/i, "");
}

function toTemplate(description) {
  let text = stripPrefix(description).trim();
  if (!text) return text;
  if (text.includes("{player}") || text.includes("{partner}")) return text;

  text = text
    .replace(/\byour partner[’']s\b/gi, "{partner}'s")
    .replace(/\bYour partner[’']s\b/g, "{partner}'s")
    .replace(/\byour partner\b/gi, "{partner}")
    .replace(/\bthe receiving partner\b/gi, "{partner}")
    .replace(/\bthe partner on top\b/gi, "{player}")
    .replace(/\btop partner\b/gi, "{player}")
    .replace(/\bone partner\b/gi, "{player}")
    .replace(/\bthe other partner\b/gi, "{partner}")
    .replace(/\bthe partner[’']s\b/gi, "{partner}'s")
    .replace(/\bpartner[’']s\b/gi, "{partner}'s")
    .replace(/\btheir partner\b/gi, "{partner}")
    .replace(/\bthe partner\b/gi, "{partner}")
    .replace(/\ba partner\b/gi, "{partner}");

  if (/^Both of you\b/i.test(text)) {
    text = text.replace(/^Both of you\b/i, "{player} and {partner}");
  } else if (/^Have your partner\b/i.test(text) || /^Have \{partner\}\b/i.test(text)) {
    text = `{player}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  } else if (!text.startsWith("{player}") && !text.startsWith("{player} and")) {
    const lowered = text.charAt(0).toLowerCase() + text.slice(1);
    text = `{player}, ${lowered}`;
  }

  if (!/[.!?]$/.test(text)) text += ".";
  return text;
}

function personalizeCard(card) {
  const special = SPECIAL[card.title];
  const next = {
    ...card,
    title: special?.title ?? card.title,
    description: special?.description ?? toTemplate(card.description),
  };
  return next;
}

function reindex(cards, start = 1) {
  return cards.map((card, i) => ({ ...card, order: start + i }));
}

const finish1 = load("finish-off.json");
const finish2 = load("finish-off-2.json");
const afterglow = load("afterglow.json");
const existingTitles = new Set(afterglow.map((card) => card.title));

const moved = [];
const keep1 = [];
const keep2 = [];

for (const card of finish1) {
  if (isPostSex(card)) moved.push(card);
  else keep1.push(card);
}
for (const card of finish2) {
  if (isPostSex(card)) moved.push(card);
  else keep2.push(card);
}

let nextOrder = afterglow.length + 1;
let added = 0;
for (const card of moved) {
  if (existingTitles.has(card.title)) continue;
  existingTitles.add(card.title);
  afterglow.push({
    category: "afterglow",
    title: card.title,
    description: stripPrefix(card.description),
    order: nextOrder,
  });
  nextOrder += 1;
  added += 1;
}

const extras = [
  {
    category: "finish_off",
    title: "Finish off with oral",
    description:
      "{player}, finish {partner} off with oral. Stay with your mouth until they come.",
  },
  {
    category: "finish_off",
    title: "Hands to finish",
    description: "{player}, finish {partner} off with your hands.",
  },
  {
    category: "finish_off",
    title: "Oral for you",
    description: "{player}, let {partner} finish you off with oral.",
  },
  {
    category: "finish_off",
    title: "Finish from behind",
    description: "{player}, finish {partner} off from behind.",
  },
  {
    category: "finish_off",
    title: "On top to finish",
    description: "{player}, get on top of {partner} and finish them off.",
  },
  {
    category: "finish_off",
    title: "Mouth then hands",
    description:
      "{player}, start finishing {partner} off with oral, then use your hands to take them over.",
  },
  {
    category: "finish_off",
    title: "Eye contact oral",
    description:
      "{player}, finish {partner} off with oral and do not look away from their eyes.",
  },
  {
    category: "finish_off",
    title: "Slow oral finish",
    description:
      "{player}, finish {partner} off with oral, as slow as you can stand.",
  },
];

const extraTitles = new Set(
  [...keep1, ...keep2].map((card) => card.title).concat(Object.values(SPECIAL).map((s) => s.title).filter(Boolean))
);
const extraKeep = extras.filter((card) => !extraTitles.has(card.title));

const allFinish = reindex(
  [...keep1, ...keep2, ...extraKeep].map(personalizeCard)
);
const mid = Math.ceil(allFinish.length / 2);

const files = [
  "pre-foreplay.json",
  "pre-foreplay-2.json",
  "foreplay.json",
  "foreplay-2.json",
  "step-it-up.json",
  "step-it-up-2.json",
];

for (const name of files) {
  const cards = load(name).map(personalizeCard);
  save(name, cards);
}

save("finish-off.json", allFinish.slice(0, mid));
save("finish-off-2.json", allFinish.slice(mid));
save("afterglow.json", afterglow.map(personalizeCard));

console.log(
  JSON.stringify(
    {
      finishOff: allFinish.length,
      afterglow: afterglow.length,
      movedConsidered: moved.length,
      uniqueMovedToAfterglow: added,
      extrasAdded: extraKeep.length,
    },
    null,
    2
  )
);
