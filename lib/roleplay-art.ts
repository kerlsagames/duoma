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
  | "train"
  | "accidental-view"
  | "android-lab"
  | "babysitter"
  | "bandit-carriage"
  | "bedside-exam"
  | "best-friends-dad"
  | "boot-worship"
  | "boss-audit"
  | "chauffeur"
  | "chiropractor"
  | "coat-room"
  | "customs"
  | "dance-studio"
  | "demon"
  | "dermatologist"
  | "detention"
  | "electrician"
  | "elevator"
  | "executive-interview"
  | "fitness-locker"
  | "french-maid"
  | "judge-chambers"
  | "landlord"
  | "law-firm"
  | "locksmith"
  | "maid-uniform"
  | "masquerade"
  | "military-drill"
  | "night-nurse"
  | "night-pool"
  | "outdoor-shower"
  | "overtime"
  | "performance-review"
  | "pet-handler"
  | "physical-therapy"
  | "plumber"
  | "princess-assassin"
  | "prison-cell"
  | "promotion"
  | "quarantine"
  | "receptionist"
  | "reflexology"
  | "royal-bodyguard"
  | "security-search"
  | "sensory-chamber"
  | "ski-lift"
  | "sorcerer"
  | "spanking-bench"
  | "sponge-bath"
  | "stockroom"
  | "tennis-coach"
  | "traffic-stop"
  | "uber"
  | "ultrasound"
  | "washing-machine"
  | "werewolf"
  | "witch"
  | "yoga-studio"
  | "country-club"
  | "houseguest";

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

/** One still per scene when a unique frame exists. */
const ART_BY_ID: Record<string, RoleplayArtKey> = {
  "the-late-night-electrician": "electrician",
  "the-maid-s-inspection": "maid",
  "the-personal-trainer-s-stretch": "trainer",
  "the-massage-therapist-s-upgrade": "massage",
  "the-delivery-driver-s-tip": "delivery",
  "the-pool-cleaner-s-dip": "pool",
  "the-private-chef-s-taste-test": "chef",
  "the-car-detailer-s-inspection": "car",
  "the-tutor-s-extra-credit": "classroom",
  "the-locksmith-s-entry": "locksmith",
  "the-plumber-under-the-sink": "plumber",
  "the-accidental-view": "accidental-view",

  "the-boss-s-after-hours-audit": "boss-audit",
  "the-executive-interview": "executive-interview",
  "the-performance-review": "performance-review",
  "the-overtime-interruption": "overtime",
  "the-promotion-contract": "promotion",
  "the-law-firm-partner": "law-firm",
  "the-receptionist-s-bell": "receptionist",
  "the-ceo-s-private-jet": "plane",
  "the-business-trip-hotel": "hotel",
  "the-photo-studio-shoot": "fitting",
  "the-elevator-malfunction": "elevator",
  "the-stockroom-inventory": "stockroom",

  "the-hotel-room-miscount": "office",
  "the-vip-backstage-pass": "club",
  "the-library-stacks": "library",
  "the-cinema-back-row": "cinema",
  "the-uber-driver-s-extra-route": "uber",
  "the-first-class-curtain": "trades",
  "the-train-compartment": "train",
  "the-ski-lift-hold": "ski-lift",
  "the-beach-cabana": "beach",
  "the-fitting-room-slip": "cop",
  "the-rainy-bus-stop": "rain",
  "the-museum-alcove": "museum",
  "the-rooftop-access": "rooftop",
  "the-sauna-steam": "sauna",
  "the-campground-tent": "tent",
  "the-underground-club-nook": "clinic",
  "the-house-party-coat-room": "coat-room",
  "the-masked-masquerade": "masquerade",

  "the-bedside-exam": "bedside-exam",
  "the-night-nurse-s-rounds": "night-nurse",
  "the-physical-therapy-session": "physical-therapy",
  "the-chiropractor-s-adjustment": "chiropractor",
  "the-reflexology-session": "reflexology",
  "the-post-op-sponge-bath": "sponge-bath",
  "the-quarantine-check": "quarantine",
  "the-dermatologist-s-skin-check": "dermatologist",
  "the-ultrasound-friction": "ultrasound",

  "the-knight-the-queen": "knight",
  "the-captive-the-pirate-captain": "pirate",
  "the-lord-the-governess": "ski",
  "the-vampire-s-feeding": "vampire",
  "the-french-maid-the-count": "french-maid",
  "the-mermaid-s-grotto": "mermaid",
  "the-elven-guard-the-lost-traveler": "garden",
  "the-roman-bath-attendant": "locker",
  "the-bandit-the-carriage": "bandit-carriage",
  "the-princess-the-assassin": "princess-assassin",
  "the-sorcerer-the-apprentice": "sorcerer",
  "the-space-captain-the-alien-envoy": "scifi",

  "the-principal-s-after-school-detention": "detention",
  "the-police-officer-s-traffic-stop": "traffic-stop",
  "the-security-guard-s-shoplifting-search": "security-search",
  "the-prison-guard-s-cell-check": "prison-cell",
  "the-military-drill-sergeant-s-inspection": "military-drill",
  "the-strict-landlord-s-rent-deficit": "landlord",
  "the-customs-officer-s-private-room": "customs",
  "the-flight-attendant-s-rule-break": "dungeon",
  "the-judge-s-chambers": "judge-chambers",
  "the-royal-bodyguard-s-protocol": "royal-bodyguard",
  "the-bouncer-s-back-alley-choice": "home",
  "the-parole-officer-s-home-visit": "office",

  "the-roommate-s-walk-in": "trades",
  "the-landlord-s-master-key": "cop",
  "the-houseguest-s-late-night": "houseguest",
  "the-gardener-s-shed": "locker",
  "the-butler-s-service": "butler",
  "the-chauffeur-s-partition": "chauffeur",
  "the-maid-s-uniform": "maid-uniform",
  "the-washing-machine-stuck": "washing-machine",
  "the-babysitter-s-bedtime": "babysitter",
  "the-estate-manager-s-tour": "ski",
  "the-best-friend-s-dad": "best-friends-dad",

  "the-alien-abduction-lab": "dungeon",
  "the-superhero-the-villain": "hero",
  "the-android-calibration": "android-lab",
  "the-werewolf-s-full-moon": "werewolf",
  "the-demon-s-possession": "demon",
  "the-witch-s-love-potion": "witch",
  "the-genie-s-wish": "home",
  "the-holodeck-simulation": "office",

  "the-fitness-club-locker-room": "fitness-locker",
  "the-tennis-coach-s-serve": "tennis-coach",
  "the-lifeguard-tower": "trades",
  "the-yoga-instructor-s-adjustment": "yoga-studio",
  "the-ski-resort-hot-tub": "cop",
  "the-equestrian-barn": "clinic",
  "the-swimming-pool-night-dip": "night-pool",
  "the-dance-studio-mirror": "dance-studio",
  "the-outdoor-shower": "outdoor-shower",
  "the-camping-hammock": "locker",
  "the-country-club-changing-room": "country-club",

  "the-pet-girl-the-handler": "pet-handler",
  "the-bondage-furniture-test": "dungeon",
  "the-sensory-deprivation-chamber": "sensory-chamber",
  "the-spanking-bench-audit": "spanking-bench",
  "the-rope-harness-suspension": "ski",
  "the-chastity-keyholder": "home",
  "the-master-the-house-slave": "office",
  "the-dominant-female-male-slave": "trades",
  "the-public-leash-walk": "garden",
  "the-cane-submissive-apology": "cop",
  "the-heavy-boot-worship": "boot-worship",
  "the-latex-suit-enclosure": "clinic",
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
  "accidental-view": require("../assets/roleplays/rp-accidental-view.png"),
  "android-lab": require("../assets/roleplays/rp-android-lab.png"),
  babysitter: require("../assets/roleplays/rp-babysitter.png"),
  "bandit-carriage": require("../assets/roleplays/rp-bandit-carriage.png"),
  "bedside-exam": require("../assets/roleplays/rp-bedside-exam.png"),
  "best-friends-dad": require("../assets/roleplays/rp-best-friends-dad.png"),
  "boot-worship": require("../assets/roleplays/rp-boot-worship.png"),
  "boss-audit": require("../assets/roleplays/rp-boss-audit.png"),
  chauffeur: require("../assets/roleplays/rp-chauffeur.png"),
  chiropractor: require("../assets/roleplays/rp-chiropractor.png"),
  "coat-room": require("../assets/roleplays/rp-coat-room.png"),
  customs: require("../assets/roleplays/rp-customs.png"),
  "dance-studio": require("../assets/roleplays/rp-dance-studio.png"),
  demon: require("../assets/roleplays/rp-demon.png"),
  dermatologist: require("../assets/roleplays/rp-dermatologist.png"),
  detention: require("../assets/roleplays/rp-detention.png"),
  electrician: require("../assets/roleplays/rp-electrician.png"),
  elevator: require("../assets/roleplays/rp-elevator.png"),
  "executive-interview": require("../assets/roleplays/rp-executive-interview.png"),
  "fitness-locker": require("../assets/roleplays/rp-fitness-locker.png"),
  "french-maid": require("../assets/roleplays/rp-french-maid.png"),
  "judge-chambers": require("../assets/roleplays/rp-judge-chambers.png"),
  landlord: require("../assets/roleplays/rp-landlord.png"),
  "law-firm": require("../assets/roleplays/rp-law-firm.png"),
  locksmith: require("../assets/roleplays/rp-locksmith.png"),
  "maid-uniform": require("../assets/roleplays/rp-maid-uniform.png"),
  masquerade: require("../assets/roleplays/rp-masquerade.png"),
  "military-drill": require("../assets/roleplays/rp-military-drill.png"),
  "night-nurse": require("../assets/roleplays/rp-night-nurse.png"),
  "night-pool": require("../assets/roleplays/rp-night-pool.png"),
  "outdoor-shower": require("../assets/roleplays/rp-outdoor-shower.png"),
  overtime: require("../assets/roleplays/rp-overtime.png"),
  "performance-review": require("../assets/roleplays/rp-performance-review.png"),
  "pet-handler": require("../assets/roleplays/rp-pet-handler.png"),
  "physical-therapy": require("../assets/roleplays/rp-physical-therapy.png"),
  plumber: require("../assets/roleplays/rp-plumber.png"),
  "princess-assassin": require("../assets/roleplays/rp-princess-assassin.png"),
  "prison-cell": require("../assets/roleplays/rp-prison-cell.png"),
  promotion: require("../assets/roleplays/rp-promotion.png"),
  quarantine: require("../assets/roleplays/rp-quarantine.png"),
  receptionist: require("../assets/roleplays/rp-receptionist.png"),
  reflexology: require("../assets/roleplays/rp-reflexology.png"),
  "royal-bodyguard": require("../assets/roleplays/rp-royal-bodyguard.png"),
  "security-search": require("../assets/roleplays/rp-security-search.png"),
  "sensory-chamber": require("../assets/roleplays/rp-sensory-chamber.png"),
  "ski-lift": require("../assets/roleplays/rp-ski-lift.png"),
  sorcerer: require("../assets/roleplays/rp-sorcerer.png"),
  "spanking-bench": require("../assets/roleplays/rp-spanking-bench.png"),
  "sponge-bath": require("../assets/roleplays/rp-sponge-bath.png"),
  stockroom: require("../assets/roleplays/rp-stockroom.png"),
  "tennis-coach": require("../assets/roleplays/rp-tennis-coach.png"),
  "traffic-stop": require("../assets/roleplays/rp-traffic-stop.png"),
  uber: require("../assets/roleplays/rp-uber.png"),
  ultrasound: require("../assets/roleplays/rp-ultrasound.png"),
  "washing-machine": require("../assets/roleplays/rp-washing-machine.png"),
  werewolf: require("../assets/roleplays/rp-werewolf.png"),
  witch: require("../assets/roleplays/rp-witch.png"),
  "yoga-studio": require("../assets/roleplays/rp-yoga-studio.png"),
  "country-club": require("../assets/roleplays/rp-country-club.png"),
  houseguest: require("../assets/roleplays/rp-houseguest.png"),
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
