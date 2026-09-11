export type PositionCategoryId =
  | "face-to-face"
  | "from-behind"
  | "sitting"
  | "standing"
  | "oral"
  | "side-creative";

export type SexPosition = {
  id: string;
  name: string;
  category: PositionCategoryId;
  blurb: string;
  /** Short pose cue for the illustration layout. */
  art: string;
};

export type PositionCategory = {
  id: PositionCategoryId;
  label: string;
  detail: string;
  icon: string;
};

export const POSITION_CATEGORIES: PositionCategory[] = [
  {
    id: "face-to-face",
    label: "Face to Face",
    detail: "Eye contact, closeness, classic heat",
    icon: "heart-outline",
  },
  {
    id: "from-behind",
    label: "From Behind",
    detail: "Depth, control, rhythm",
    icon: "git-commit-outline",
  },
  {
    id: "sitting",
    label: "Sitting & Lap",
    detail: "Chairs, couches, slow rides",
    icon: "cafe-outline",
  },
  {
    id: "standing",
    label: "Standing",
    detail: "Walls, lifts, urgency",
    icon: "resize-outline",
  },
  {
    id: "oral",
    label: "Oral Focus",
    detail: "Mouth-first, teasing, worship",
    icon: "water-outline",
  },
  {
    id: "side-creative",
    label: "Side & Creative",
    detail: "Angles, scissors, furniture play",
    icon: "diamond-outline",
  },
];

export const SEX_POSITIONS: SexPosition[] = [
  // Face to Face
  {
    id: "missionary",
    name: "Missionary",
    category: "face-to-face",
    blurb:
      "She lies on her back, he between her legs, chests close. Classic, intimate, easy to kiss and adjust pace.",
    art: "missionary",
  },
  {
    id: "lotus",
    name: "Lotus",
    category: "face-to-face",
    blurb:
      "He sits cross-legged; she straddles his lap, legs wrapped around him. Slow, deep, full-body hold.",
    art: "lotus",
  },
  {
    id: "cowgirl",
    name: "Cowgirl",
    category: "face-to-face",
    blurb:
      "He on his back; she straddles facing him and sets the rhythm. Great for eye contact and her control.",
    art: "cowgirl",
  },
  {
    id: "folded-missionary",
    name: "Folded Missionary",
    category: "face-to-face",
    blurb:
      "Her knees drawn toward her chest while he stays face-to-face. Deeper angle, still intimate.",
    art: "folded",
  },
  {
    id: "seated-embrace",
    name: "Seated Embrace",
    category: "face-to-face",
    blurb:
      "Both upright, her in his lap facing him, arms around shoulders. Slow grind and long kisses.",
    art: "embrace",
  },
  {
    id: "legs-up",
    name: "Legs Up",
    category: "face-to-face",
    blurb:
      "Her ankles on his shoulders while face-to-face. Intense angle with full view of each other.",
    art: "legsup",
  },

  // From Behind
  {
    id: "doggy",
    name: "Doggy Style",
    category: "from-behind",
    blurb:
      "She on hands and knees; he kneels behind. Strong depth and easy hand placement on hips.",
    art: "doggy",
  },
  {
    id: "spooning",
    name: "Spooning",
    category: "from-behind",
    blurb:
      "Both on your sides, him behind her. Lazy, close, perfect for sleepy or sensual nights.",
    art: "spoon",
  },
  {
    id: "prone-bone",
    name: "Prone Bone",
    category: "from-behind",
    blurb:
      "She flat on her stomach; he on top from behind. Tight angle, full-body pressure.",
    art: "prone",
  },
  {
    id: "kneeling-lean",
    name: "Kneeling Lean",
    category: "from-behind",
    blurb:
      "She kneels and leans onto forearms or a pillow; he kneels behind. Stable and deep.",
    art: "kneel",
  },
  {
    id: "edge-rear",
    name: "Edge of Bed Rear",
    category: "from-behind",
    blurb:
      "She bent over the edge of the bed; he stands or kneels behind. Furniture does the bracing.",
    art: "edgerear",
  },
  {
    id: "standing-doggy",
    name: "Standing Doggy",
    category: "from-behind",
    blurb:
      "She bent forward holding a wall or dresser; he stands behind. Fast and urgent.",
    art: "standdog",
  },

  // Sitting
  {
    id: "chair-ride",
    name: "Chair Ride",
    category: "sitting",
    blurb:
      "He sits on a sturdy chair; she straddles facing him. Hands free for hair, back, and pacing.",
    art: "chair",
  },
  {
    id: "lap-straddle",
    name: "Lap Straddle",
    category: "sitting",
    blurb:
      "On the couch: he seated, she across his lap facing him. Casual room, serious friction.",
    art: "straddle",
  },
  {
    id: "throne",
    name: "The Throne",
    category: "sitting",
    blurb:
      "He sits; she sits on him facing away (reverse cowgirl seated). His hands guide her hips.",
    art: "throne",
  },
  {
    id: "couch-lean",
    name: "Couch Lean",
    category: "sitting",
    blurb:
      "She kneels on the couch facing the backrest; he behind. Soft landing, strong angle.",
    art: "couch",
  },
  {
    id: "counter-sit",
    name: "Counter Sit",
    category: "sitting",
    blurb:
      "She sits on a kitchen counter or sturdy table; he stands between her legs. Spontaneous and high.",
    art: "counter",
  },

  // Standing
  {
    id: "wall-press",
    name: "Against the Wall",
    category: "standing",
    blurb:
      "She backed to the wall, one leg hooked around him; he presses in close. Classic urgent energy.",
    art: "wall",
  },
  {
    id: "lifted-hold",
    name: "Lifted Hold",
    category: "standing",
    blurb:
      "He lifts her; legs wrapped around his waist. Strength move — use a wall for support.",
    art: "lift",
  },
  {
    id: "bent-over-stand",
    name: "Bent Over Stand",
    category: "standing",
    blurb:
      "She stands and folds forward onto a table or windowsill; he stands behind. Quick and deep.",
    art: "bentstand",
  },
  {
    id: "shower-stance",
    name: "Shower Stance",
    category: "standing",
    blurb:
      "In the shower: one foot raised on a ledge, bodies slick and close. Wet, slippery teamwork.",
    art: "shower",
  },

  // Oral
  {
    id: "kneeling-oral",
    name: "Kneeling Oral",
    category: "oral",
    blurb:
      "One partner kneels while the other stands or sits at the edge. Classic worship pose.",
    art: "oral-kneel",
  },
  {
    id: "face-sitting",
    name: "Face Sitting",
    category: "oral",
    blurb:
      "She kneels over his face; he focuses entirely on her. Full control for her, full access for him.",
    art: "facesit",
  },
  {
    id: "sixty-nine",
    name: "Sixty-Nine",
    category: "oral",
    blurb:
      "Head-to-toe mutual oral, on your sides or stacked. Simultaneous give and take.",
    art: "sixtynine",
  },
  {
    id: "edge-sit-oral",
    name: "Edge Sit Oral",
    category: "oral",
    blurb:
      "She sits on the edge of the bed; he kneels between her thighs. Perfect height, easy eye contact.",
    art: "edgeoral",
  },

  // Side & Creative
  {
    id: "scissors",
    name: "Scissors",
    category: "side-creative",
    blurb:
      "On your sides, legs interleaved for grinding contact. Great for clit-focused friction.",
    art: "scissors",
  },
  {
    id: "sideways-spoon",
    name: "Sideways Cross",
    category: "side-creative",
    blurb:
      "She on her back, he on his side perpendicular — her legs over him. Unusual angle, deep reach.",
    art: "cross",
  },
  {
    id: "bridge",
    name: "The Bridge",
    category: "side-creative",
    blurb:
      "She arches hips up (feet planted); he kneels between. Athletic, dramatic, intense.",
    art: "bridge",
  },
  {
    id: "table-edge",
    name: "Table Edge",
    category: "side-creative",
    blurb:
      "She perched on a table edge, legs open; he standing. Dining room energy, bedroom intent.",
    art: "table",
  },
  {
    id: "butterfly",
    name: "Butterfly",
    category: "side-creative",
    blurb:
      "She on the bed edge, hips at the corner, legs open wide; he standing. Open, accessible, visual.",
    art: "butterfly",
  },
  {
    id: "pile-driver-lite",
    name: "Folded Press",
    category: "side-creative",
    blurb:
      "Her hips elevated, knees toward shoulders, he kneeling over. Advanced angle — go slow and check in.",
    art: "foldedpress",
  },
];

export function positionsInCategories(
  enabled: PositionCategoryId[] | "all"
): SexPosition[] {
  if (enabled === "all" || enabled.length === 0) return SEX_POSITIONS;
  const set = new Set(enabled);
  return SEX_POSITIONS.filter((row) => set.has(row.category));
}

export function positionById(id: string): SexPosition | null {
  return SEX_POSITIONS.find((row) => row.id === id) ?? null;
}

export function categoryMeta(id: PositionCategoryId): PositionCategory | null {
  return POSITION_CATEGORIES.find((row) => row.id === id) ?? null;
}

export function pickRandomPosition(
  enabled: PositionCategoryId[] | "all",
  avoidId?: string | null
): SexPosition | null {
  const pool = positionsInCategories(enabled);
  if (!pool.length) return null;
  if (pool.length === 1) return pool[0];
  let next = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (avoidId && next.id === avoidId && guard < 8) {
    next = pool[Math.floor(Math.random() * pool.length)];
    guard += 1;
  }
  return next;
}
