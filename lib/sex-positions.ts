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

function pose(
  id: string,
  name: string,
  category: PositionCategoryId,
  blurb: string
): SexPosition {
  return { id, name, category, blurb };
}

export const SEX_POSITIONS: SexPosition[] = [
  // Face to Face
  pose(
    "missionary",
    "Missionary",
    "face-to-face",
    "She lies on her back, he between her legs, chests close. Classic, intimate, easy to kiss and adjust pace."
  ),
  pose(
    "lotus",
    "Lotus",
    "face-to-face",
    "He sits cross-legged; she straddles his lap, legs wrapped around him. Slow, deep, full-body hold."
  ),
  pose(
    "cowgirl",
    "Cowgirl",
    "face-to-face",
    "He on his back; she straddles facing him and sets the rhythm. Great for eye contact and her control."
  ),
  pose(
    "folded-missionary",
    "Folded Missionary",
    "face-to-face",
    "Her knees drawn toward her chest while he stays face-to-face. Deeper angle, still intimate."
  ),
  pose(
    "seated-embrace",
    "Seated Embrace",
    "face-to-face",
    "Both upright, her in his lap facing him, arms around shoulders. Slow grind and long kisses."
  ),
  pose(
    "legs-up",
    "Legs Up",
    "face-to-face",
    "Her ankles on his shoulders while face-to-face. Intense angle with full view of each other."
  ),
  pose(
    "closed-missionary",
    "Closed Missionary",
    "face-to-face",
    "Her legs together, his thighs outside hers. Tighter, more friction, still face-to-face."
  ),
  pose(
    "happy-baby",
    "Happy Baby",
    "face-to-face",
    "She on her back, holding her own feet or shins; he kneels in close. Open hips, easy eye contact."
  ),
  pose(
    "coital-alignment",
    "Coital Alignment",
    "face-to-face",
    "Missionary with his body shifted up so the grind hits her clit. Less thrust, more rock."
  ),
  pose(
    "pretzel",
    "Pretzel",
    "face-to-face",
    "One of her legs between his, the other hooked over his hip. Twisty, close, good for a new angle without acrobatics."
  ),
  pose(
    "anvil",
    "The Anvil",
    "face-to-face",
    "Her ankles by his head, hips lifted. Deep and visual — go slow and keep checking in."
  ),
  pose(
    "amazon",
    "Amazon",
    "face-to-face",
    "He on his back with legs together; she squats or kneels over him facing him. She owns the depth."
  ),

  // From Behind
  pose(
    "doggy",
    "Doggy Style",
    "from-behind",
    "She on hands and knees; he kneels behind. Strong depth and easy hand placement on hips."
  ),
  pose(
    "spooning",
    "Spooning",
    "from-behind",
    "Both on your sides, him behind her. Lazy, close, perfect for sleepy or sensual nights."
  ),
  pose(
    "prone-bone",
    "Prone Bone",
    "from-behind",
    "She flat on her stomach; he on top from behind. Tight angle, full-body pressure."
  ),
  pose(
    "kneeling-lean",
    "Kneeling Lean",
    "from-behind",
    "She kneels and leans onto forearms or a pillow; he kneels behind. Stable and deep."
  ),
  pose(
    "edge-rear",
    "Edge of Bed Rear",
    "from-behind",
    "She bent over the edge of the bed; he stands or kneels behind. Furniture does the bracing."
  ),
  pose(
    "standing-doggy",
    "Standing Doggy",
    "from-behind",
    "She bent forward holding a wall or dresser; he stands behind. Fast and urgent."
  ),
  pose(
    "leapfrog",
    "Leapfrog",
    "from-behind",
    "Chest lower than hips, knees a little wider. A doggy variant with a steeper angle."
  ),
  pose(
    "turtle",
    "Turtle",
    "from-behind",
    "Knees tucked under, chest toward the mattress, arms forward. Compact, deep, easy to hold."
  ),
  pose(
    "flatiron",
    "Flatiron",
    "from-behind",
    "Prone, but a pillow under her hips so they lift a few inches. Tight like prone bone, easier on the back."
  ),
  pose(
    "sideways-doggy",
    "Sideways Doggy",
    "from-behind",
    "She on her side, knees stacked; he kneels behind. Less wrist strain, still that from-behind feel."
  ),
  pose(
    "standing-spoon",
    "Standing Spoon",
    "from-behind",
    "Both standing, him behind, her slightly bent with a wall or counter for a hand. Close and unhurried."
  ),
  pose(
    "bed-knee-tuck",
    "Bed Knee-Tuck",
    "from-behind",
    "She on the bed, knees tucked under her, chest down; he stands on the floor behind. Height does the work."
  ),

  // Sitting
  pose(
    "chair-ride",
    "Chair Ride",
    "sitting",
    "He sits on a sturdy chair; she straddles facing him. Hands free for hair, back, and pacing."
  ),
  pose(
    "lap-straddle",
    "Lap Straddle",
    "sitting",
    "On the couch: he seated, she across his lap facing him. Casual room, serious friction."
  ),
  pose(
    "throne",
    "The Throne",
    "sitting",
    "He sits; she sits on him facing away (reverse cowgirl seated). His hands guide her hips."
  ),
  pose(
    "couch-lean",
    "Couch Lean",
    "sitting",
    "She kneels on the couch facing the backrest; he behind. Soft landing, strong angle."
  ),
  pose(
    "counter-sit",
    "Counter Sit",
    "sitting",
    "She sits on a kitchen counter or sturdy table; he stands between her legs. Spontaneous and high."
  ),
  pose(
    "reverse-chair",
    "Reverse Chair",
    "sitting",
    "He sits; she sits on him facing away, feet on the floor so she can bounce. Living-room energy."
  ),
  pose(
    "side-saddle",
    "Side Saddle",
    "sitting",
    "She sits across his lap sideways, one arm around his neck. Kissing, grinding, not a full straddle."
  ),
  pose(
    "rocking-lap",
    "Rocking Lap",
    "sitting",
    "He sits, she in his lap facing him, and you rock rather than bounce. Slow, close, good for a long stretch."
  ),
  pose(
    "office-chair",
    "Office Chair",
    "sitting",
    "He in a rolling chair; she in his lap or perched on the desk in front of him. Lock the wheels first."
  ),
  pose(
    "couch-behind",
    "Couch From Behind",
    "sitting",
    "Both on the couch, him sitting, her in his lap facing away, leaning back into his chest."
  ),

  // Standing
  pose(
    "wall-press",
    "Against the Wall",
    "standing",
    "She backed to the wall, one leg hooked around him; he presses in close. Classic urgent energy."
  ),
  pose(
    "lifted-hold",
    "Lifted Hold",
    "standing",
    "He lifts her; legs wrapped around his waist. Strength move — use a wall for support."
  ),
  pose(
    "bent-over-stand",
    "Bent Over Stand",
    "standing",
    "She stands and folds forward onto a table or windowsill; he stands behind. Quick and deep."
  ),
  pose(
    "shower-stance",
    "Shower Stance",
    "standing",
    "In the shower: one foot raised on a ledge, bodies slick and close. Wet, slippery teamwork."
  ),
  pose(
    "ballet",
    "Ballet",
    "standing",
    "She stands, one leg high on his hip or a rail; he stays close. Elegant, a little athletic."
  ),
  pose(
    "doorframe",
    "Doorframe",
    "standing",
    "She holds the doorframe; he behind or face-to-face in the doorway. Something to grip, nowhere to go."
  ),
  pose(
    "face-stand",
    "Standing Face to Face",
    "standing",
    "Both standing, her on tiptoe or a small step, bodies flush. Kiss the whole time."
  ),
  pose(
    "counter-brace",
    "Counter Brace",
    "standing",
    "She faces the kitchen counter, hands on it, feet apart; he behind. Everyday room, not-everyday night."
  ),

  // Oral — 24 poses
  pose(
    "kneeling-oral",
    "Kneeling Oral",
    "oral",
    "One partner kneels while the other stands. Classic worship pose — hands on thighs or in hair."
  ),
  pose(
    "face-sitting",
    "Face Sitting",
    "oral",
    "She kneels over his face, facing his head; he focuses entirely on her. Full control for her, full access for him."
  ),
  pose(
    "reverse-face-sit",
    "Reverse Face Sit",
    "oral",
    "She kneels over his face facing his feet. Different angle on her clit, his hands free for her hips and ass."
  ),
  pose(
    "sixty-nine",
    "Sixty-Nine",
    "oral",
    "Head-to-toe mutual oral, her on top. Simultaneous give and take — pause when one of you gets close."
  ),
  pose(
    "sixty-nine-him-top",
    "Sixty-Nine, Him on Top",
    "oral",
    "Same mutual oral, him stacked above. He can take more of his own weight on his knees so she can breathe."
  ),
  pose(
    "side-sixty-nine",
    "Side Sixty-Nine",
    "oral",
    "Both on your sides, head-to-toe. Easier to hold for a long time than the stacked version."
  ),
  pose(
    "edge-sit-oral",
    "Edge Sit Oral",
    "oral",
    "She sits on the edge of the bed; he kneels between her thighs. Perfect height, easy eye contact."
  ),
  pose(
    "lying-back-oral",
    "On Her Back",
    "oral",
    "She on her back, knees open; he lies or kneels between her thighs. Pillows under her hips if you want a better angle."
  ),
  pose(
    "from-behind-oral",
    "Oral From Behind",
    "oral",
    "She on hands and knees; he behind her with his mouth. Hands on her hips, plenty of room to use a finger too."
  ),
  pose(
    "head-off-bed",
    "Head Off the Bed",
    "oral",
    "She lies with her head hanging off the edge; he stands. A steeper blowjob angle — keep a hand under her neck and check in."
  ),
  pose(
    "standing-one-leg",
    "Standing, One Leg Up",
    "oral",
    "She stands, one foot on a chair or the bath edge; he kneels. Open, slightly athletic, good in a doorway."
  ),
  pose(
    "chair-throne-oral",
    "Chair Throne Oral",
    "oral",
    "He sits on a chair; she kneels between his knees. Relaxed for him, easy on her neck, simple to look up."
  ),
  pose(
    "chair-she-sits",
    "She in the Chair",
    "oral",
    "She sits back in a chair, legs open; he kneels. Scoot her hips to the edge of the seat."
  ),
  pose(
    "couch-recline-oral",
    "Couch Recline Oral",
    "oral",
    "She reclines on the couch, one leg over the back or his shoulder; he kneels on the floor. Living-room lazy."
  ),
  pose(
    "prone-oral",
    "Prone Oral",
    "oral",
    "She on her stomach, hips slightly up on a pillow; he oral from behind. Different access than face-up."
  ),
  pose(
    "spoon-oral",
    "Spoon Oral",
    "oral",
    "Both on your sides; he scoots down her body. Sleepy, close, no one has to kneel."
  ),
  pose(
    "legs-on-shoulders-oral",
    "Legs on His Shoulders",
    "oral",
    "She on her back, calves over his shoulders while he kneels or lies in. Wide open, easy to hold her thighs."
  ),
  pose(
    "all-fours-blowjob",
    "All Fours Blowjob",
    "oral",
    "He stands or kneels; she on all fours facing him. A different neck angle than sitting back on her heels."
  ),
  pose(
    "wall-kneel-oral",
    "Wall Kneel Oral",
    "oral",
    "Her back to the wall; he kneels. She has something to lean on; he has both hands free."
  ),
  pose(
    "counter-oral",
    "Counter Oral",
    "oral",
    "She sits on the kitchen counter; he stands or kneels depending on height. Spontaneous, slightly exhibitionist even at home."
  ),
  pose(
    "shower-oral",
    "Shower Oral",
    "oral",
    "In the stall: one kneeling, one standing, water aimed away from faces. A towel on the floor of the stall helps knees."
  ),
  pose(
    "under-the-desk",
    "Under the Desk",
    "oral",
    "He sits; she under the desk between his knees. The fantasy of being interrupted — lock the door anyway."
  ),
  pose(
    "seated-sixty-nine",
    "Seated Sixty-Nine",
    "oral",
    "He lies back; she sits on his face and leans forward to him. Mutual oral without the full stack."
  ),
  pose(
    "butterfly-oral",
    "Butterfly Oral",
    "oral",
    "Her hips at the corner of the bed, legs open wide; he kneeling on the floor. Open, visual, easy to stay a while."
  ),
  pose(
    "covers-oral",
    "Under the Covers",
    "oral",
    "Her (or him) under the duvet, the other lying back. Dark, muffled, a little secret even in your own bed."
  ),
  pose(
    "hands-free-oral",
    "Hands-Free Oral",
    "oral",
    "Mouth only — giver’s hands on the mattress, thighs, or behind their back. Slower, wetter, more deliberate."
  ),

  // Side & Creative
  pose(
    "scissors",
    "Scissors",
    "side-creative",
    "On your sides, legs interleaved for grinding contact. Great for clit-focused friction."
  ),
  pose(
    "sideways-spoon",
    "Sideways Cross",
    "side-creative",
    "She on her back, he on his side perpendicular — her legs over him. Unusual angle, deep reach."
  ),
  pose(
    "bridge",
    "The Bridge",
    "side-creative",
    "She arches hips up (feet planted); he kneels between. Athletic, dramatic, intense."
  ),
  pose(
    "table-edge",
    "Table Edge",
    "side-creative",
    "She perched on a table edge, legs open; he standing. Dining room energy, bedroom intent."
  ),
  pose(
    "butterfly",
    "Butterfly",
    "side-creative",
    "She on the bed edge, hips at the corner, legs open wide; he standing. Open, accessible, visual."
  ),
  pose(
    "pile-driver-lite",
    "Folded Press",
    "side-creative",
    "Her hips elevated, knees toward shoulders, he kneeling over. Advanced angle — go slow and check in."
  ),
  pose(
    "corkscrew",
    "Corkscrew",
    "side-creative",
    "She on her side; he kneels facing her, one of her legs over his hip. A twist on missionary without being flat on her back."
  ),
  pose(
    "spoons-top-leg",
    "Spoons, Top Leg High",
    "side-creative",
    "Spooning, but her top leg forward or hooked back over his. More access, still lazy."
  ),
  pose(
    "pretzel-dip",
    "Pretzel Dip",
    "side-creative",
    "She on her side; he kneeling, one of her legs between his. A milder pretzel — less fold, still a new line."
  ),
  pose(
    "crossed-ankles",
    "Crossed Ankles",
    "side-creative",
    "She on her back, ankles crossed at the small of his back. Changes the tightness without changing the rest of missionary."
  ),
];

export const POSITION_COUNT = SEX_POSITIONS.length;

export function positionsInCategory(id: PositionCategoryId): SexPosition[] {
  return SEX_POSITIONS.filter((row) => row.category === id);
}

export function positionsInCategories(
  enabled: PositionCategoryId[] | "all"
): SexPosition[] {
  if (enabled === "all" || enabled.length === 0) return SEX_POSITIONS;
  const set = new Set(enabled);
  return SEX_POSITIONS.filter((row) => set.has(row.category));
}

export function searchPositions(
  enabled: PositionCategoryId[] | "all",
  query: string
): SexPosition[] {
  const pool = positionsInCategories(enabled);
  const needle = query.trim().toLowerCase();
  if (!needle) return pool;
  return pool.filter((row) => {
    const cat = categoryMeta(row.category)?.label ?? "";
    return `${row.name} ${row.blurb} ${cat}`.toLowerCase().includes(needle);
  });
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
