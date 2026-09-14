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
  | "home"
  | "club"
  | "rain"
  | "museum"
  | "rooftop"
  | "ski"
  | "fitting"
  | "plane"
  | "train";

const CATEGORY_FALLBACK: Record<RoleplayCategoryId, RoleplayArtKey> = {
  professional: "trades",
  workplace: "office",
  strangers: "hotel",
  medical: "clinic",
  fantasy: "knight",
  authority: "cop",
  domestic: "home",
  scifi: "scifi",
  public: "locker",
  bdsm: "dungeon",
};

/** One still per scene. Mapped to what is actually in the frame. */
const ART_BY_ID: Record<string, RoleplayArtKey> = {
  "the-late-night-electrician": "trades",
  "the-maid-s-inspection": "maid",
  "the-personal-trainer-s-stretch": "trainer",
  "the-massage-therapist-s-upgrade": "massage",
  "the-delivery-driver-s-tip": "delivery",
  "the-pool-cleaner-s-dip": "pool",
  "the-private-chef-s-taste-test": "chef",
  "the-car-detailer-s-inspection": "car",
  "the-tutor-s-extra-credit": "classroom",
  "the-locksmith-s-entry": "trades",
  "the-plumber-under-the-sink": "chef",
  "the-accidental-view": "trades",

  "the-boss-s-after-hours-audit": "office",
  "the-executive-interview": "office",
  "the-performance-review": "office",
  "the-overtime-interruption": "office",
  "the-promotion-contract": "office",
  "the-law-firm-partner": "office",
  "the-receptionist-s-bell": "office",
  "the-ceo-s-private-jet": "plane",
  "the-business-trip-hotel": "hotel",
  "the-photo-studio-shoot": "fitting",
  "the-elevator-malfunction": "office",
  "the-stockroom-inventory": "office",

  "the-hotel-room-miscount": "hotel",
  "the-vip-backstage-pass": "club",
  "the-library-stacks": "library",
  "the-cinema-back-row": "cinema",
  "the-uber-driver-s-extra-route": "car",
  "the-first-class-curtain": "plane",
  "the-train-compartment": "train",
  "the-ski-lift-hold": "ski",
  "the-beach-cabana": "beach",
  "the-fitting-room-slip": "fitting",
  "the-rainy-bus-stop": "rain",
  "the-museum-alcove": "museum",
  "the-rooftop-access": "rooftop",
  "the-sauna-steam": "sauna",
  "the-campground-tent": "tent",
  "the-underground-club-nook": "club",
  "the-house-party-coat-room": "home",
  "the-masked-masquerade": "dungeon",

  "the-bedside-exam": "clinic",
  "the-night-nurse-s-rounds": "clinic",
  "the-physical-therapy-session": "massage",
  "the-chiropractor-s-adjustment": "massage",
  "the-reflexology-session": "massage",
  "the-post-op-sponge-bath": "clinic",
  "the-quarantine-check": "clinic",
  "the-dermatologist-s-skin-check": "clinic",
  "the-ultrasound-friction": "clinic",

  "the-knight-the-queen": "knight",
  "the-captive-the-pirate-captain": "pirate",
  "the-lord-the-governess": "library",
  "the-vampire-s-feeding": "vampire",
  "the-french-maid-the-count": "maid",
  "the-mermaid-s-grotto": "mermaid",
  "the-elven-guard-the-lost-traveler": "garden",
  "the-roman-bath-attendant": "sauna",
  "the-bandit-the-carriage": "pirate",
  "the-princess-the-assassin": "knight",
  "the-sorcerer-the-apprentice": "vampire",
  "the-space-captain-the-alien-envoy": "scifi",

  "the-principal-s-after-school-detention": "classroom",
  "the-police-officer-s-traffic-stop": "cop",
  "the-security-guard-s-shoplifting-search": "fitting",
  "the-prison-guard-s-cell-check": "dungeon",
  "the-military-drill-sergeant-s-inspection": "locker",
  "the-strict-landlord-s-rent-deficit": "home",
  "the-customs-officer-s-private-room": "cop",
  "the-flight-attendant-s-rule-break": "plane",
  "the-judge-s-chambers": "office",
  "the-royal-bodyguard-s-protocol": "knight",
  "the-bouncer-s-back-alley-choice": "club",
  "the-parole-officer-s-home-visit": "home",

  "the-roommate-s-walk-in": "home",
  "the-landlord-s-master-key": "home",
  "the-houseguest-s-late-night": "home",
  "the-gardener-s-shed": "garden",
  "the-butler-s-service": "butler",
  "the-chauffeur-s-partition": "car",
  "the-maid-s-uniform": "maid",
  "the-washing-machine-stuck": "home",
  "the-babysitter-s-bedtime": "home",
  "the-estate-manager-s-tour": "garden",
  "the-best-friend-s-dad": "home",

  "the-alien-abduction-lab": "scifi",
  "the-superhero-the-villain": "hero",
  "the-android-calibration": "clinic",
  "the-werewolf-s-full-moon": "vampire",
  "the-demon-s-possession": "vampire",
  "the-witch-s-love-potion": "vampire",
  "the-genie-s-wish": "hotel",
  "the-holodeck-simulation": "scifi",

  "the-fitness-club-locker-room": "locker",
  "the-tennis-coach-s-serve": "trainer",
  "the-lifeguard-tower": "beach",
  "the-yoga-instructor-s-adjustment": "trainer",
  "the-ski-resort-hot-tub": "sauna",
  "the-equestrian-barn": "garden",
  "the-swimming-pool-night-dip": "pool",
  "the-dance-studio-mirror": "trainer",
  "the-outdoor-shower": "pool",
  "the-camping-hammock": "tent",
  "the-country-club-changing-room": "locker",

  "the-pet-girl-the-handler": "dungeon",
  "the-bondage-furniture-test": "dungeon",
  "the-sensory-deprivation-chamber": "dungeon",
  "the-spanking-bench-audit": "dungeon",
  "the-rope-harness-suspension": "dungeon",
  "the-chastity-keyholder": "dungeon",
  "the-master-the-house-slave": "dungeon",
  "the-dominant-female-male-slave": "dungeon",
  "the-public-leash-walk": "garden",
  "the-cane-submissive-apology": "dungeon",
  "the-heavy-boot-worship": "dungeon",
  "the-latex-suit-enclosure": "dungeon",
};

export function roleplayArtKey(
  id: string,
  category: RoleplayCategoryId
): RoleplayArtKey {
  return ART_BY_ID[id] ?? CATEGORY_FALLBACK[category] ?? "home";
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
  club: require("../assets/roleplays/rp-club.png"),
  rain: require("../assets/roleplays/rp-rain.png"),
  museum: require("../assets/roleplays/rp-museum.png"),
  rooftop: require("../assets/roleplays/rp-rooftop.png"),
  ski: require("../assets/roleplays/rp-ski.png"),
  fitting: require("../assets/roleplays/rp-fitting.png"),
  plane: require("../assets/roleplays/rp-plane.png"),
  train: require("../assets/roleplays/rp-train.png"),
};

export function roleplayArtSource(
  id: string,
  category: RoleplayCategoryId
): ImageSourcePropType {
  return SOURCES[roleplayArtKey(id, category)];
}

export function missingRoleplayArtIds(ids: string[]): string[] {
  return ids.filter((id) => !ART_BY_ID[id]);
}
