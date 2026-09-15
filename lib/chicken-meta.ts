export type ChickenYardId = "out" | "home";

export type ChickenPackId =
  | "talk"
  | "move"
  | "shop"
  | "park"
  | "dine"
  | "ride"
  | "kitchen"
  | "couch"
  | "bed"
  | "bath"
  | "chores"
  | "banter";

export type ChickenYard = {
  id: ChickenYardId;
  label: string;
  detail: string;
  emoji: string;
};

export type ChickenPack = {
  id: ChickenPackId;
  yard: ChickenYardId;
  label: string;
  detail: string;
  range: string;
};

export const CHICKEN_YARDS: ChickenYard[] = [
  {
    id: "out",
    label: "Out & About",
    detail: "Shops, parks, cafés, the car. Mild public nonsense.",
    emoji: "🗺",
  },
  {
    id: "home",
    label: "At Home",
    detail: "Kitchen to hallway. No audience required.",
    emoji: "🏠",
  },
];

export const CHICKEN_PACKS: ChickenPack[] = [
  {
    id: "talk",
    yard: "out",
    label: "Talking to strangers",
    detail: "Ordering, complimenting, Shakespeare at the till",
    range: "1–25",
  },
  {
    id: "move",
    yard: "out",
    label: "Moving in public",
    detail: "Tightropes, robots, victory laps",
    range: "26–50",
  },
  {
    id: "shop",
    yard: "out",
    label: "Supermarket antics",
    detail: "Trolleys, cereal debates, produce whispers",
    range: "51–75",
  },
  {
    id: "park",
    yard: "out",
    label: "Parks & streets",
    detail: "Birds, trees, benches, weather reports",
    range: "76–100",
  },
  {
    id: "dine",
    yard: "out",
    label: "Cafés & restaurants",
    detail: "Pinkies, toasts, napkin swans",
    range: "101–125",
  },
  {
    id: "ride",
    yard: "out",
    label: "Car & transit",
    detail: "DJ intros, GPS voice, car-wash terror",
    range: "126–150",
  },
  {
    id: "kitchen",
    yard: "home",
    label: "Kitchen",
    detail: "Toasters, mitts, fridge diplomacy",
    range: "151–175",
  },
  {
    id: "couch",
    yard: "home",
    label: "Couch & TV",
    detail: "Trailer voice, blanket burritos, snack tax",
    range: "176–200",
  },
  {
    id: "bed",
    yard: "home",
    label: "Bedroom",
    detail: "Pillow thrones, sock puppets, duvet weather",
    range: "201–225",
  },
  {
    id: "bath",
    yard: "home",
    label: "Bathroom",
    detail: "Mirror pep talks, toothbrush solos",
    range: "226–250",
  },
  {
    id: "chores",
    yard: "home",
    label: "Chores",
    detail: "Vacuum guitars, mop waltzes, chore medals",
    range: "251–275",
  },
  {
    id: "banter",
    yard: "home",
    label: "House banter",
    detail: "Lava, plants, hallway runways",
    range: "276–300",
  },
];
