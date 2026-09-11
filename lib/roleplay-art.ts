import type { ImageSourcePropType } from "react-native";
import type { RoleplayCategoryId } from "@/lib/roleplays";

export type RoleplayArtKey =
  | "pool"
  | "maid"
  | "office"
  | "trades"
  | "trainer"
  | "massage"
  | "delivery"
  | "hotel"
  | "car"
  | "clinic"
  | "knight"
  | "pirate"
  | "vampire"
  | "cop"
  | "classroom"
  | "locker"
  | "dungeon"
  | "tent"
  | "butler"
  | "garden"
  | "sauna"
  | "library"
  | "chef"
  | "hero"
  | "mermaid"
  | "scifi"
  | "cinema"
  | "beach"
  | "home";

const CATEGORY_FALLBACK: Record<RoleplayCategoryId, RoleplayArtKey> = {
  professional: "trades",
  workplace: "office",
  strangers: "cinema",
  medical: "clinic",
  fantasy: "knight",
  authority: "cop",
  domestic: "home",
  scifi: "scifi",
  public: "locker",
  bdsm: "dungeon",
};

const RULES: [RegExp, RoleplayArtKey][] = [
  [/pool-boy|pool-cleaner|swimming-pool|lifeguard|surf|scuba|outdoor-shower/, "pool"],
  [/maid/, "maid"],
  [/butler|chauffeur|valet/, "butler"],
  [/gardener|garden|estate|flowers/, "garden"],
  [/chef|taste-test|kitchen|milkman/, "chef"],
  [/delivery|package|neighbor|uber/, "delivery"],
  [/massage|reflexology|chiropractor|physical-therapy/, "massage"],
  [/trainer|yoga|fitness|tennis|dance|climbing|equestrian|archery|golf|marathon/, "trainer"],
  [/electrician|plumber|handyman|cable|carpet|locksmith|pest|window-washer|decorator|architect|lube/, "trades"],
  [/hotel|business-trip|first-class|vip-backstage|house-party-coat|flight-attendant/, "hotel"],
  [/car-|garage|tailgate|cart-path|train-compartment/, "car"],
  [/nurse|exam|dental|quarantine|ultrasound|sleep-lab|asylum|phlebotomist|emergency|oxygen|home-health|optometrist|sanctuary|post-op|dermatologist|mental-health|bedside/, "clinic"],
  [/pirate|captive/, "pirate"],
  [/vampire|werewolf|ghost|demon|witch|angel/, "vampire"],
  [/mermaid|siren/, "mermaid"],
  [/knight|queen|governess|lord|princess|tudor|elven|roman|priestess|jester|sultan|geisha|samurai|gladiator|viking|bandit|sorcerer|count/, "knight"],
  [/superhero|villain/, "hero"],
  [/alien|android|cyber|clone|holodeck|portal|time-travel|telepath|invisible|shape-shifter|zombie|genie|space-captain/, "scifi"],
  [/police|traffic-stop|security-guard|prison|warden|parole|probation|bouncer|border|customs|interrogator|judge|military|guard-s-escort|royal-bodyguard/, "cop"],
  [/principal|detention|headmaster|tutor/, "classroom"],
  [/locker|changing-room|country-club|stadium/, "locker"],
  [/sauna|hot-tub|ski-resort/, "sauna"],
  [/library|museum|fitting-room/, "library"],
  [/tent|camp|hammock|hiking/, "tent"],
  [/cinema|masked|underground-club|rooftop/, "cinema"],
  [/beach|cabana|ski-lift/, "beach"],
  [/bondage|spanking|latex|collar|leash|hood|gag|cane|boot|slave|pet-girl|wax|tickle|milking|wand|restraints|chastity|master|dominant|sensory-deprivation|french-hood/, "dungeon"],
  [/office|boss|ceo|hr-|secretarial|boardroom|law-firm|receptionist|janitor|stockroom|promotion|dictation|performance|overtime|interview|audit|laboratory|photo-studio|soundproof|elevator|security-guard-s-monitor/, "office"],
];

export function roleplayArtKey(
  id: string,
  category: RoleplayCategoryId
): RoleplayArtKey {
  for (const [pattern, key] of RULES) {
    if (pattern.test(id)) return key;
  }
  return CATEGORY_FALLBACK[category] ?? "home";
}

const SOURCES: Record<RoleplayArtKey, ImageSourcePropType> = {
  pool: require("../assets/roleplays/rp-pool.png"),
  maid: require("../assets/roleplays/rp-maid.png"),
  office: require("../assets/roleplays/rp-office.png"),
  trades: require("../assets/roleplays/rp-trades.png"),
  trainer: require("../assets/roleplays/rp-trainer.png"),
  massage: require("../assets/roleplays/rp-massage.png"),
  delivery: require("../assets/roleplays/rp-delivery.png"),
  hotel: require("../assets/roleplays/rp-hotel.png"),
  car: require("../assets/roleplays/rp-car.png"),
  clinic: require("../assets/roleplays/rp-clinic.png"),
  knight: require("../assets/roleplays/rp-knight.png"),
  pirate: require("../assets/roleplays/rp-pirate.png"),
  vampire: require("../assets/roleplays/rp-vampire.png"),
  cop: require("../assets/roleplays/rp-cop.png"),
  classroom: require("../assets/roleplays/rp-classroom.png"),
  locker: require("../assets/roleplays/rp-locker.png"),
  dungeon: require("../assets/roleplays/rp-dungeon.png"),
  tent: require("../assets/roleplays/rp-tent.png"),
  butler: require("../assets/roleplays/rp-butler.png"),
  garden: require("../assets/roleplays/rp-garden.png"),
  sauna: require("../assets/roleplays/rp-sauna.png"),
  library: require("../assets/roleplays/rp-library.png"),
  chef: require("../assets/roleplays/rp-chef.png"),
  hero: require("../assets/roleplays/rp-hero.png"),
  mermaid: require("../assets/roleplays/rp-mermaid.png"),
  scifi: require("../assets/roleplays/rp-scifi.png"),
  cinema: require("../assets/roleplays/rp-cinema.png"),
  beach: require("../assets/roleplays/rp-beach.png"),
  home: require("../assets/roleplays/rp-home.png"),
};

export function roleplayArtSource(
  id: string,
  category: RoleplayCategoryId
): ImageSourcePropType {
  return SOURCES[roleplayArtKey(id, category)];
}
