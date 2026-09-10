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

keep1.forEach((card, i) => {
  card.order = i + 1;
});
keep2.forEach((card, i) => {
  card.order = keep1.length + i + 1;
});

let nextOrder = afterglow.length + 1;
for (const card of moved) {
  if (existingTitles.has(card.title)) continue;
  existingTitles.add(card.title);
  afterglow.push({
    category: "afterglow",
    title: card.title,
    description: String(card.description).replace(/^Post-Sex:\s*/, ""),
    order: nextOrder,
  });
  nextOrder += 1;
}

save("finish-off.json", keep1);
save("finish-off-2.json", keep2);
save("afterglow.json", afterglow);

console.log(
  `finish-off ${keep1.length}+${keep2.length}, afterglow ${afterglow.length}, skipped duplicates ${moved.length - (nextOrder - 1 - 50)}`
);
