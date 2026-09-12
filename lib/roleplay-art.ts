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

/** One still per scene. Never guess from a fuzzy title. */
const ART_BY_ID: Record<string, RoleplayArtKey> = {
  "the-accidental-view": "trades",
  "the-maid-s-inspection": "maid",
  "the-late-night-electrician": "trades",
  "the-personal-trainer-s-stretch": "trainer",
  "the-cable-guy-s-signal-check": "trades",
  "the-decorator-s-measurements": "trades",
  "the-massage-therapist-s-upgrade": "massage",
  "the-plumber-under-the-sink": "trades",
  "the-delivery-driver-s-tip": "delivery",
  "the-pool-cleaner-s-dip": "pool",
  "the-private-chef-s-taste-test": "chef",
  "the-locksmith-s-entry": "trades",
  "the-car-detailer-s-inspection": "car",
  "the-tutor-s-extra-credit": "classroom",
  "the-architect-s-blueprint": "trades",
  "the-carpet-cleaner-s-spot-test": "trades",
  "the-handyman-s-lube": "trades",
  "the-pest-control-spray": "trades",
  "the-window-washer-s-view": "trades",
  "the-valet-s-garage-pause": "car",

  "the-boss-s-after-hours-audit": "office",
  "the-executive-interview": "office",
  "the-performance-review": "office",
  "the-overtime-interruption": "office",
  "the-dictation-session": "office",
  "the-boardroom-projection": "office",
  "the-janitor-s-keyring": "office",
  "the-secretarial-search": "office",
  "the-promotion-contract": "office",
  "the-security-guard-s-monitor": "office",
  "the-ceo-s-private-jet": "plane",
  "the-stockroom-inventory": "office",
  "the-hr-complaint": "office",
  "the-business-trip-hotel": "hotel",
  "the-law-firm-partner": "office",
  "the-receptionist-s-bell": "office",
  "the-laboratory-protocol": "clinic",
  "the-elevator-malfunction": "office",
  "the-photo-studio-shoot": "fitting",
  "the-soundproof-studio": "office",

  "the-hotel-room-miscount": "hotel",
  "the-vip-backstage-pass": "club",
  "the-neighbor-s-package-delivery": "delivery",
  "the-tailgate-hitchhiker": "car",
  "the-library-stacks": "library",
  "the-cinema-back-row": "cinema",
  "the-uber-driver-s-extra-route": "car",
  "the-first-class-curtain": "plane",
  "the-train-compartment": "train",
  "the-ski-lift-hold": "ski",
  "the-beach-cabana": "beach",
  "the-fitting-room-slip": "fitting",
  "the-house-party-coat-room": "home",
  "the-masked-masquerade": "hotel",
  "the-underground-club-nook": "club",
  "the-rainy-bus-stop": "rain",
  "the-museum-alcove": "museum",
  "the-rooftop-access": "rooftop",
  "the-sauna-steam": "sauna",
  "the-campground-tent": "tent",

  "the-night-nurse-s-rounds": "clinic",
  "the-bedside-exam": "clinic",
  "the-physical-therapy-session": "massage",
  "the-optometrist-s-dark-room": "clinic",
  "the-dental-chair-restraints": "clinic",
  "the-quarantine-check": "clinic",
  "the-sanctuary-retreat": "hotel",
  "the-ultrasound-friction": "clinic",
  "the-chiropractor-s-adjustment": "massage",
  "the-sleep-lab-monitor": "clinic",
  "the-dermatologist-s-skin-check": "clinic",
  "the-mental-health-intake": "clinic",
  "the-reflexology-session": "massage",
  "the-post-op-sponge-bath": "clinic",
  "the-private-asylum-specialist": "clinic",
  "the-phlebotomist-s-comfort": "clinic",
  "the-vip-recovery-suite": "hotel",
  "the-emergency-room-curtain": "clinic",
  "the-oxygen-bar-relaxation": "clinic",
  "the-home-health-visit": "home",

  "the-knight-the-queen": "knight",
  "the-captive-the-pirate-captain": "pirate",
  "the-lord-the-governess": "knight",
  "the-vampire-s-feeding": "vampire",
  "the-gladiator-s-reward": "knight",
  "the-tavern-keeper-s-wench": "pirate",
  "the-princess-the-assassin": "knight",
  "the-viking-raid-claim": "knight",
  "the-geisha-the-samurai": "knight",
  "the-sultan-s-harem-favorite": "knight",
  "the-french-maid-the-count": "maid",
  "the-sorcerer-the-apprentice": "vampire",
  "the-bandit-the-carriage": "pirate",
  "the-roman-bath-attendant": "sauna",
  "the-high-priestess-the-sacrifice": "knight",
  "the-court-jester-s-trick": "knight",
  "the-space-captain-the-alien-envoy": "scifi",
  "the-cyberpunk-hacker-the-corporate-spec": "scifi",
  "the-tudor-executioner-s-reprieve": "knight",
  "the-elven-guard-the-lost-traveler": "garden",

  "the-principal-s-after-school-detention": "classroom",
  "the-police-officer-s-traffic-stop": "cop",
  "the-security-guard-s-shoplifting-search": "cop",
  "the-prison-guard-s-cell-check": "dungeon",
  "the-military-drill-sergeant-s-inspection": "cop",
  "the-strict-landlord-s-rent-deficit": "home",
  "the-customs-officer-s-private-room": "cop",
  "the-warden-s-office-order": "office",
  "the-parole-officer-s-home-visit": "home",
  "the-probation-officer-s-drug-test": "clinic",
  "the-bouncer-s-back-alley-choice": "club",
  "the-border-guard-s-outpost": "cop",
  "the-flight-attendant-s-rule-break": "plane",
  "the-judge-s-chambers": "office",
  "the-strict-father-in-law-s-lecture": "home",
  "the-royal-bodyguard-s-protocol": "knight",
  "the-headmaster-s-study": "classroom",
  "the-guard-s-escort": "cop",
  "the-tax-inspector-s-audit": "office",
  "the-interrogator-s-light": "cop",

  "the-stepbrother-s-secret": "home",
  "the-babysitter-s-bedtime": "home",
  "the-pool-boy-s-summer-job": "pool",
  "the-roommate-s-walk-in": "home",
  "the-au-pair-s-lessons": "home",
  "the-best-friend-s-dad": "home",
  "the-sister-s-boyfriend": "home",
  "the-landlord-s-master-key": "home",
  "the-houseguest-s-late-night": "home",
  "the-gardener-s-shed": "garden",
  "the-nanny-s-night-off": "home",
  "the-step-mother-s-discipline": "home",
  "the-butler-s-service": "butler",
  "the-chauffeur-s-partition": "car",
  "the-milkman-s-morning": "chef",
  "the-cousin-s-reunion": "home",
  "the-maid-s-uniform": "maid",
  "the-tenant-s-sublet": "home",
  "the-estate-manager-s-tour": "garden",
  "the-washing-machine-stuck": "home",

  "the-alien-abduction-lab": "scifi",
  "the-superhero-the-villain": "hero",
  "the-android-calibration": "scifi",
  "the-werewolf-s-full-moon": "vampire",
  "the-time-traveler-s-pause": "scifi",
  "the-demon-s-possession": "vampire",
  "the-telepathic-command": "scifi",
  "the-ghost-in-the-manor": "vampire",
  "the-cybernetic-upgrade": "scifi",
  "the-shape-shifter-s-game": "scifi",
  "the-clone-experiment": "scifi",
  "the-siren-s-call": "mermaid",
  "the-invisible-man": "scifi",
  "the-mermaid-s-grotto": "mermaid",
  "the-witch-s-love-potion": "vampire",
  "the-portal-transporter": "scifi",
  "the-zombie-apocalypse-bunker": "scifi",
  "the-angel-s-temptation": "vampire",
  "the-holodeck-simulation": "scifi",
  "the-genie-s-wish": "scifi",

  "the-fitness-club-locker-room": "locker",
  "the-tennis-coach-s-serve": "trainer",
  "the-lifeguard-tower": "beach",
  "the-golf-course-cart-path": "garden",
  "the-hiking-trail-overlook": "tent",
  "the-yoga-instructor-s-adjustment": "trainer",
  "the-ski-resort-hot-tub": "sauna",
  "the-scuba-boat-cabin": "beach",
  "the-rock-climbing-belay": "tent",
  "the-equestrian-barn": "garden",
  "the-swimming-pool-night-dip": "pool",
  "the-stadium-box-suite": "locker",
  "the-surf-shop-backroom": "beach",
  "the-dance-studio-mirror": "trainer",
  "the-camping-hammock": "tent",
  "the-ice-skating-rink": "ski",
  "the-marathon-massage-tent": "massage",
  "the-archery-range-stance": "trainer",
  "the-country-club-changing-room": "locker",
  "the-outdoor-shower": "pool",

  "the-pet-girl-the-handler": "dungeon",
  "the-bondage-furniture-test": "dungeon",
  "the-sensory-deprivation-chamber": "dungeon",
  "the-latex-suit-enclosure": "dungeon",
  "the-spanking-bench-audit": "dungeon",
  "the-rope-harness-suspension": "dungeon",
  "the-chastity-keyholder": "dungeon",
  "the-medical-restraints-speculum": "clinic",
  "the-master-the-house-slave": "dungeon",
  "the-wax-ice-contrast": "dungeon",
  "the-tickle-torture-frame": "dungeon",
  "the-french-hood-gilded-cage": "dungeon",
  "the-cane-submissive-apology": "dungeon",
  "the-milking-machine-lab": "clinic",
  "the-electric-wand-stimulation": "dungeon",
  "the-leather-hood-forced-silence": "dungeon",
  "the-ball-gag-nipple-clamps": "dungeon",
  "the-dominant-female-male-slave": "dungeon",
  "the-heavy-boot-worship": "dungeon",
  "the-public-leash-walk": "garden",
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
