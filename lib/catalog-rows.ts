import { createId } from "@/lib/ids";
import {
  CATALOG_KEYS,
  peekCatalog,
  type CatalogKey,
  type CatalogRow,
} from "@/lib/catalog-overlay";
import { chickenDares } from "@/lib/chicken";
import { couponIdeas } from "@/lib/couponIdeas";
import { curiosityQuestions } from "@/lib/curiosityQuestions";
import { dateIdeas, DATE_VIBE_FILTERS } from "@/lib/dateIdeas";
import { discoverQuestions } from "@/lib/discover-questions";
import { fantasyIdeas, FANTASY_CATEGORIES } from "@/lib/fantasy-matcher";
import { getSpicySeeds } from "@/games/get-spicy";
import { photoPrompts } from "@/lib/photo-prompts";
import { roleplays, ROLEPLAY_CATEGORIES } from "@/lib/roleplays";
import { sexPositions, POSITION_CATEGORIES } from "@/lib/sex-positions";
import { spicyDares, SPICY_DARE_CATEGORIES } from "@/lib/spicy-dares";
import { howTechniques, HOW_CHAPTERS } from "@/lib/the-how";
import { CHICKEN_PACKS } from "@/lib/chicken-meta";
import { COUPON_CATEGORIES } from "@/lib/couponIdeas";
import { PHOTO_CATEGORIES } from "@/lib/photo-prompts";
import { STAGE_META, STAGE_ORDER } from "@/games/get-spicy/engine";

export { CATALOG_KEYS };
export type { CatalogKey, CatalogRow };

export function catalogRows(key: CatalogKey): CatalogRow[] {
  switch (key) {
    case "fantasy":
      return fantasyIdeas(true).map((row) => ({
        id: row.id,
        title: row.title,
        body: "",
        group: row.category,
      }));
    case "spicyDares":
      return spicyDares(true).map((row) => ({
        id: row.id,
        title: row.text.slice(0, 72),
        body: row.text,
        group: row.categories.join(", "),
      }));
    case "chicken":
      return chickenDares(true).map((row) => ({
        id: row.id,
        title: row.name,
        body: row.body,
        group: row.pack,
      }));
    case "roleplays":
      return roleplays(true).map((row) => ({
        id: row.id,
        title: row.name,
        body: row.blurb,
        group: row.category,
      }));
    case "positions":
      return sexPositions(true).map((row) => ({
        id: row.id,
        title: row.name,
        body: row.blurb,
        group: row.category,
      }));
    case "dates":
      return dateIdeas(true).map((row) => ({
        id: row.id,
        title: row.title,
        body: `${row.location === "home" ? "At home" : "Out"} · ${row.blurb}`,
        group: row.vibe,
      }));
    case "coupons":
      return couponIdeas(true).map((row) => ({
        id: row.id,
        title: row.title,
        body: "",
        group: row.category,
      }));
    case "discover":
      return discoverQuestions(true).map((row) => ({
        id: row.id,
        title: row.prompt,
        body: "",
        group: row.category,
      }));
    case "curiosity":
      return curiosityQuestions(true).map((row) => ({
        id: row.id,
        title: row.question,
        body: row.options.join("\n"),
        group: row.category,
      }));
    case "how":
      return howTechniques(true).map((row) => ({
        id: row.id,
        title: `${row.number}. ${row.name}`,
        body: row.plain.what,
        group: row.chapter,
      }));
    case "spicySeeds":
      return getSpicySeeds(true).map((row) => ({
        id: row.id,
        title: row.title,
        body: row.description,
        group: row.category,
      }));
    case "photo":
      return photoPrompts(true).map((row) => ({
        id: row.id,
        title: row.title,
        body: row.label,
        group: row.category,
      }));
  }
}

export function catalogGroups(key: CatalogKey): string[] {
  switch (key) {
    case "fantasy":
      return FANTASY_CATEGORIES.map((row) => row.id);
    case "spicyDares":
      return [...SPICY_DARE_CATEGORIES];
    case "chicken":
      return CHICKEN_PACKS.map((row) => row.id);
    case "roleplays":
      return ROLEPLAY_CATEGORIES.map((row) => row.id);
    case "positions":
      return POSITION_CATEGORIES.map((row) => row.id);
    case "dates":
      return DATE_VIBE_FILTERS.filter((row) => row.id !== "all").map((row) => row.id);
    case "coupons":
      return COUPON_CATEGORIES.map((row) => row.id);
    case "discover":
      return [...new Set(discoverQuestions().map((row) => row.category))];
    case "curiosity":
      return ["flirty", "fun", "life", "deep"];
    case "how":
      return HOW_CHAPTERS.map((row) => row.id);
    case "spicySeeds":
      return [...STAGE_ORDER];
    case "photo":
      return PHOTO_CATEGORIES.map((row) => row.id);
  }
}

export type CatalogChip = { id: string; label: string };

function labelize(id: string): string {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function catalogGroupChips(key: CatalogKey): CatalogChip[] {
  switch (key) {
    case "fantasy":
      return FANTASY_CATEGORIES.map((row) => ({ id: row.id, label: row.label }));
    case "spicyDares":
      return SPICY_DARE_CATEGORIES.map((id) => ({ id, label: id }));
    case "chicken":
      return CHICKEN_PACKS.map((row) => ({ id: row.id, label: row.label }));
    case "roleplays":
      return ROLEPLAY_CATEGORIES.map((row) => ({ id: row.id, label: row.label }));
    case "positions":
      return POSITION_CATEGORIES.map((row) => ({ id: row.id, label: row.label }));
    case "dates":
      return DATE_VIBE_FILTERS.filter((row) => row.id !== "all").map((row) => ({
        id: row.id,
        label: row.label,
      }));
    case "coupons":
      return COUPON_CATEGORIES.map((row) => ({ id: row.id, label: row.label }));
    case "discover":
      return catalogGroups("discover").map((id) => ({ id, label: labelize(id) }));
    case "curiosity":
      return catalogGroups("curiosity").map((id) => ({ id, label: labelize(id) }));
    case "how":
      return HOW_CHAPTERS.map((row) => ({ id: row.id, label: row.label }));
    case "spicySeeds":
      return STAGE_ORDER.map((id) => ({ id, label: STAGE_META[id].label }));
    case "photo":
      return PHOTO_CATEGORIES.map((row) => ({ id: row.id, label: row.label }));
  }
}

export function rowInGroup(row: CatalogRow, groupId: string): boolean {
  if (!groupId) return true;
  if (row.group === groupId) return true;
  return row.group
    .split(",")
    .map((part) => part.trim())
    .includes(groupId);
}

export function hiddenIds(key: CatalogKey): string[] {
  return peekCatalog()[key]?.hiddenIds ?? [];
}

export function newCatalogId(key: CatalogKey): string {
  return `${key}-${createId().slice(0, 8)}`;
}
