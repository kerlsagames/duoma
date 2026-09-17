import { applyOverlay } from "@/lib/catalog-overlay";

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
    "Her ankles by his head, hips lifted. Deep and visual, go slow and keep checking in."
  ),
  pose(
    "amazon",
    "Amazon",
    "face-to-face",
    "He on his back with legs together; she squats or kneels over him facing him. She owns the depth."
  ),
  pose(
    "pillow-missionary",
    "Pillow Missionary",
    "face-to-face",
    "Same as missionary, with a firm pillow under her hips. Tilts her pelvis so the grind is easier to aim."
  ),
  pose(
    "wrap-missionary",
    "Wrapped Missionary",
    "face-to-face",
    "Her legs high around his back, ankles crossed. Pulls him in and keeps chests together."
  ),
  pose(
    "split-missionary",
    "Split Missionary",
    "face-to-face",
    "One of her legs up along his side or over a shoulder, the other down. Asymmetric, still face-to-face."
  ),
  pose(
    "irish-garden",
    "Irish Garden",
    "face-to-face",
    "She on her back; he kneels and draws her hips into his lap. Deep without him putting his weight on her."
  ),
  pose(
    "waterfall",
    "Waterfall",
    "face-to-face",
    "Her head and shoulders off the edge of the bed; he kneels between her legs. Blood-to-the-head intensity, keep it short."
  ),
  pose(
    "laid-back-cowgirl",
    "Laid-Back Cowgirl",
    "face-to-face",
    "She stays on top but lies down on his chest. Cowgirl depth, missionary closeness."
  ),
  pose(
    "kneeling-together",
    "Kneeling Together",
    "face-to-face",
    "Both kneeling on the bed, her settling into his lap facing him. Upright, kissable, easy to hold."
  ),
  pose(
    "edge-face",
    "Edge, Face to Face",
    "face-to-face",
    "She sits or lies at the bed edge; he stands between her legs, leaning in. Eye contact at a standing height."
  ),
  pose(
    "half-lotus-bed",
    "Half Lotus",
    "face-to-face",
    "One of her legs folded, the other extended past his hip. A milder lotus if full wrap is too much."
  ),
  pose(
    "seated-bed-edge",
    "Seated Bed Edge",
    "face-to-face",
    "He sits on the edge of the mattress; she straddles facing him, feet on the floor. Easy to stand up after."
  ),
  pose(
    "crab",
    "The Crab",
    "face-to-face",
    "She on her back, propped on elbows or hands; he kneeling. She can watch and still push back."
  ),
  pose(
    "deck-chair",
    "Deck Chair",
    "face-to-face",
    "Her legs up along his chest, almost folded; he kneeling over. Open, deep, keep a check on her lower back."
  ),
  pose(
    "slow-grind",
    "Slow Grind",
    "face-to-face",
    "Missionary or cowgirl with almost no thrust, just a circular grind. Built for clit contact and a long kiss."
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
  pose(
    "wide-doggy",
    "Wide Doggy",
    "from-behind",
    "Hands and knees, knees extra wide. Lower, more open, easier for him to reach around."
  ),
  pose(
    "closed-doggy",
    "Closed Doggy",
    "from-behind",
    "Knees together, chest down. Tighter than classic doggy, a different kind of deep."
  ),
  pose(
    "pillow-hug",
    "Pillow Hug",
    "from-behind",
    "She hugs a pillow or the duvet, hips up; he behind. Soft for her chest, still a strong angle."
  ),
  pose(
    "one-knee-doggy",
    "One Knee Up",
    "from-behind",
    "Doggy, but one of her knees is drawn up. Twists the angle without leaving all fours."
  ),
  pose(
    "sofa-arm",
    "Sofa Arm",
    "from-behind",
    "She bent over the arm of the sofa; he standing behind. Living-room height, nowhere to slip."
  ),
  pose(
    "chair-back",
    "Over the Chair",
    "from-behind",
    "She folded over the back of a sturdy chair, feet on the floor; he behind. Hold the chair, not her weight."
  ),
  pose(
    "window-lean",
    "Window Lean",
    "from-behind",
    "Hands on the windowsill, him behind. Close the curtains unless that is the point."
  ),
  pose(
    "stairs-rear",
    "Stairs",
    "from-behind",
    "She a step or two above, hands on a higher stair; he behind. Use the staircase as a brace, go slow."
  ),
  pose(
    "lazy-rear",
    "Lazy Rear",
    "from-behind",
    "Both more reclined than doggy, her on forearms, him sitting back on his heels. Unhurried."
  ),
  pose(
    "kitchen-rear",
    "Kitchen Rear",
    "from-behind",
    "She braced on the sink or fridge; he behind. The room you walk through a hundred times a day."
  ),
  pose(
    "wheelbarrow-lite",
    "Wheelbarrow Lite",
    "from-behind",
    "Her chest on the bed, he standing and lifting her thighs a little. Not a full lift, just enough tilt."
  ),
  pose(
    "side-rear-kneel",
    "Kneeling Side Rear",
    "from-behind",
    "She on her side, he kneeling behind rather than lying down. Spooning energy with more drive."
  ),
  pose(
    "mirror-rear",
    "Mirror Rear",
    "from-behind",
    "Doggy or standing behind, facing a mirror. You both get the view."
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
  pose(
    "armchair",
    "Armchair",
    "sitting",
    "He in a deep armchair; she straddles facing him, knees in the seat. Enclosed, hard to fall out of."
  ),
  pose(
    "ottoman",
    "Ottoman",
    "sitting",
    "She sits on a low ottoman or pouffe; he kneels or sits on the floor in front. Height swap."
  ),
  pose(
    "floor-lap",
    "Floor Lap",
    "sitting",
    "He sits on the floor, back to the sofa; she in his lap. Picnic energy, bedroom intent."
  ),
  pose(
    "windowsill-sit",
    "Windowsill Sit",
    "sitting",
    "She on a wide sill, legs around him; he standing. Check the window is shut and the sill is sound."
  ),
  pose(
    "dining-chair",
    "Dining Chair",
    "sitting",
    "Straight-backed chair, no arms. She faces him or away, the back is something to hold."
  ),
  pose(
    "stool",
    "Bar Stool",
    "sitting",
    "He on a high stool; she stands or perches. Kitchen-island height, watch the wobble."
  ),
  pose(
    "bathtub-sit",
    "Bath Sit",
    "sitting",
    "He in the tub; she in his lap, water low so you do not flood the floor. Slow, slippery, warm."
  ),
  pose(
    "washer",
    "On the Washer",
    "sitting",
    "She sits on a running machine; he stands between her legs. The spin is the extra hand."
  ),
  pose(
    "stairs-sit",
    "Stair Sit",
    "sitting",
    "He sits on a stair; she in his lap facing him. Compact, a little illicit even at home."
  ),
  pose(
    "beanbag",
    "Beanbag",
    "sitting",
    "He sunk in a beanbag; she kneeling over him. Soft, unstable, funny until it is not."
  ),
  pose(
    "car-lap",
    "Car Lap",
    "sitting",
    "Parked. He in the passenger seat reclined; she in his lap. Seat all the way back, doors locked."
  ),
  pose(
    "desk-perch",
    "Desk Perch",
    "sitting",
    "She perched on the desk, him in the office chair rolled in. Clear the mug first."
  ),
  pose(
    "sofa-kneel-face",
    "Sofa Kneel, Facing",
    "sitting",
    "He sits; she kneels on the cushions facing him rather than sitting down fully. More bounce, more height."
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
    "He lifts her; legs wrapped around his waist. Strength move, use a wall for support."
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
  pose(
    "pinned-corner",
    "Pinned in the Corner",
    "standing",
    "Two walls, her back in the corner; he close. Nowhere to go, easy to kiss."
  ),
  pose(
    "one-leg-wrap",
    "One Leg Wrap",
    "standing",
    "She standing, one leg hooked high around him, the other on the floor. A wall at her back helps."
  ),
  pose(
    "wall-behind",
    "Wall, From Behind",
    "standing",
    "Both standing, her hands on the wall, him behind, bodies almost upright. Quiet and close."
  ),
  pose(
    "against-the-door",
    "Against the Door",
    "standing",
    "Her back to the door, one leg up; he pressing in. The lock is part of the pose."
  ),
  pose(
    "hallway",
    "Hallway",
    "standing",
    "Narrow hall, her back or hands on one wall. You barely fit, which is the point."
  ),
  pose(
    "fridge-press",
    "Fridge Press",
    "standing",
    "Cold door at her back, him in close. Kitchen standing, faces together."
  ),
  pose(
    "sink-stand",
    "At the Sink",
    "standing",
    "She facing the basin, him behind, both standing. Turn the tap off first."
  ),
  pose(
    "stair-landing",
    "Stair Landing",
    "standing",
    "On the landing: her back to the wall or the banister for a hand. Between floors."
  ),
  pose(
    "shower-behind",
    "Shower, From Behind",
    "standing",
    "In the stall, both standing, him behind, her hands on the tiles. Water off the faces."
  ),
  pose(
    "closet",
    "Closet",
    "standing",
    "Door almost shut, coats against her back. Standing, cramped, quick."
  ),
  pose(
    "balcony-rail",
    "Balcony Rail",
    "standing",
    "Hands on the rail, him behind, or face to face if the rail is low. Privacy first."
  ),
  pose(
    "table-press-stand",
    "Table Press",
    "standing",
    "She sitting back against a table edge, not fully sitting, feet on the floor; he standing between. Half sit, half stand."
  ),
  pose(
    "lift-with-wall",
    "Lift Against the Wall",
    "standing",
    "Full wrap, her back to the wall so he is not holding all of her. Strength pose with backup."
  ),
  pose(
    "tiptoe",
    "On Tiptoe",
    "standing",
    "Both standing, no wall, her on tiptoe to match height. Hands on each other, slow so you do not topple."
  ),

  // Oral, 24 poses
  pose(
    "kneeling-oral",
    "Kneeling Oral",
    "oral",
    "One partner kneels while the other stands. Classic worship pose, hands on thighs or in hair."
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
    "Head-to-toe mutual oral, her on top. Simultaneous give and take, pause when one of you gets close."
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
    "She lies with her head hanging off the edge; he stands. A steeper blowjob angle, keep a hand under her neck and check in."
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
    "He sits; she under the desk between his knees. The fantasy of being interrupted, lock the door anyway."
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
    "Mouth only, giver’s hands on the mattress, thighs, or behind their back. Slower, wetter, more deliberate."
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
    "She on her back, he on his side perpendicular, her legs over him. Unusual angle, deep reach."
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
    "Her hips elevated, knees toward shoulders, he kneeling over. Advanced angle, go slow and check in."
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
    "She on her side; he kneeling, one of her legs between his. A milder pretzel, less fold, still a new line."
  ),
  pose(
    "crossed-ankles",
    "Crossed Ankles",
    "side-creative",
    "She on her back, ankles crossed at the small of his back. Changes the tightness without changing the rest of missionary."
  ),
  pose(
    "t-bone",
    "T-Bone",
    "side-creative",
    "She on her back; he on his side at a right angle, her legs over him. A hard T, deep and a bit odd until it clicks."
  ),
  pose(
    "figure-four",
    "Figure Four",
    "side-creative",
    "One of her legs bent, ankle on the other thigh, making a 4. Opens one hip without a full split."
  ),
  pose(
    "rolled-side",
    "Rolled to Her Side",
    "side-creative",
    "Start missionary, then roll together onto her side without pulling out. Same connection, new gravity."
  ),
  pose(
    "edge-side",
    "Side on the Edge",
    "side-creative",
    "She on her side at the bed edge; he standing or kneeling on the floor. Height plus a side angle."
  ),
  pose(
    "chair-side",
    "Chair, Sideways",
    "side-creative",
    "He sits; she sits across him sideways and leans back on one hand. Not a full straddle, a lounge pose that turns."
  ),
  pose(
    "hammock",
    "Hammock",
    "side-creative",
    "Her legs over his shoulders, him kneeling, her back on the bed. Like a sling, go easy on her neck."
  ),
  pose(
    "tangle",
    "The Tangle",
    "side-creative",
    "Both on your sides, legs mixed, not quite scissors. Grind more than thrust. Fine if you laugh."
  ),
  pose(
    "lifted-hips-side",
    "Lifted Hips, Side",
    "side-creative",
    "She on her side, bottom hip stacked on a pillow so the angle opens. Lazy, but aimed."
  ),
  pose(
    "knees-together-back",
    "Knees Together, On Her Back",
    "side-creative",
    "She on her back, knees together and drawn toward her chest; he kneeling. Tight, visual, a bit folded."
  ),
  pose(
    "one-leg-floor",
    "One Leg on the Floor",
    "side-creative",
    "She on the bed, one foot dropped to the floor; he between. Half in, half out of the mattress."
  ),
  pose(
    "sofa-side-lie",
    "Sofa Side-Lie",
    "side-creative",
    "Both on the sofa on your sides, her back to the cushions. Cramped on purpose."
  ),
  pose(
    "over-the-ottoman",
    "Over the Ottoman",
    "side-creative",
    "Her hips on a low ottoman, chest on the floor or a cushion; he kneeling. A portable edge-of-bed."
  ),
  pose(
    "magic-mountain",
    "Magic Mountain",
    "side-creative",
    "Pillows stacked under her hips so she is on a slope, him kneeling. The furniture is the pose."
  ),
  pose(
    "forehead-press",
    "Forehead Press",
    "face-to-face",
    "Missionary with foreheads touching the whole time. Short strokes. If you lose the contact, you slow down."
  ),
  pose(
    "wrapped-ankles",
    "Wrapped Ankles",
    "face-to-face",
    "She hooks her ankles at his lower back and keeps them there. He doesn't get to pull out far."
  ),
  pose(
    "side-eye-contact",
    "Side, Eye Contact",
    "face-to-face",
    "Both on your sides facing each other, her top leg over his hip. Close, a bit awkward, very in each other's faces."
  ),
  pose(
    "kneeling-hug",
    "Kneeling Hug",
    "face-to-face",
    "Both kneeling, her in his lap facing him, arms around his neck. More hug than bounce."
  ),
  pose(
    "edge-sit",
    "Edge Sit",
    "face-to-face",
    "He sits on the edge of the bed, she straddles facing him, feet on the floor. Easy to kiss and stand up from."
  ),
  pose(
    "folded-kiss",
    "Folded Kiss",
    "face-to-face",
    "Her knees toward her chest, him kneeling over her. Folded enough to kiss. Don't crush her lungs."
  ),
  pose(
    "wall-face",
    "Wall, Face to Face",
    "face-to-face",
    "Her back on the wall, one thigh up, him holding that leg. Standing missionary. Use the wall."
  ),
  pose(
    "chair-lean-in",
    "Chair Lean-In",
    "face-to-face",
    "He sits, she stands between his knees then sits facing him. Slow, because the chair will complain."
  ),
  pose(
    "pillow-cradle",
    "Pillow Cradle",
    "face-to-face",
    "Pillow under her head and one under her hips. Him close, chest to chest. The pillows do the angle."
  ),
  pose(
    "bent-table",
    "Bent Over the Table",
    "from-behind",
    "She folds over a table or bench, him behind. Keep a hand on her hip so she doesn't slide."
  ),
  pose(
    "kitchen-sink-hold",
    "Kitchen Sink Hold",
    "from-behind",
    "She holds the sink or counter, him behind, knees soft. If the tap drips, ignore it."
  ),
  pose(
    "bed-end-fold",
    "Bed-End Fold",
    "from-behind",
    "She bends at the end of the bed, chest on the mattress, him standing. Classic for a reason."
  ),
  pose(
    "prone-flat",
    "Prone Flat",
    "from-behind",
    "She on her stomach, legs together, him over her. Shallow, heavy, close. Go easy on her lower back."
  ),
  pose(
    "knees-wide-rear",
    "Knees Wide, From Behind",
    "from-behind",
    "She on all fours, knees wider than her hands. He stays kneeling. Lower, deeper, slower."
  ),
  pose(
    "standing-hook",
    "Standing Hook",
    "from-behind",
    "Both standing, she hooks one foot back around his calf. His arm across her chest. Don't overbalance."
  ),
  pose(
    "sofa-kneel-rear",
    "Sofa Kneel Rear",
    "from-behind",
    "She kneeling on the sofa facing the back, him behind on the floor or cushion. Hold the sofa."
  ),
  pose(
    "side-rear-reach",
    "Side Rear Reach",
    "from-behind",
    "Both on your sides, him behind, her top knee pulled up. His hand can reach around easily."
  ),
  pose(
    "lap-drop",
    "Lap Drop",
    "sitting",
    "He sits. She drops into his lap facing away and stays low. He holds her waist, not her shoulders."
  ),
  pose(
    "couch-straddle-in",
    "Couch Straddle In",
    "sitting",
    "He in the couch corner, she straddles facing him, one knee in the cushions. Kissing distance."
  ),
  pose(
    "desk-chair-spin",
    "Desk Chair",
    "sitting",
    "Wheeled chair, brakes on if it has them. She faces him. Don't actually spin unless you want a bruise."
  ),
  pose(
    "floor-sit-wrap",
    "Floor Sit Wrap",
    "sitting",
    "He sits on the floor against the bed. She wraps her legs around him. Slow because your hips will burn."
  ),
  pose(
    "ottoman-perch",
    "Ottoman Perch",
    "sitting",
    "He sits on a low ottoman. She sits on him facing away, feet on the floor. Easy to stand up from."
  ),
  pose(
    "bath-edge",
    "Bath Edge",
    "sitting",
    "He sits on the edge of the tub, feet in the water. She straddles. Towels on the floor. Wet is the point."
  ),
  pose(
    "stool-lean",
    "Stool Lean",
    "sitting",
    "Bar stool or kitchen stool. She sits, he stands between her knees, or she sits on him if the stool is solid."
  ),
  pose(
    "washer-sit",
    "Washer Sit",
    "sitting",
    "If the machine is on, she sits on it facing him, legs around. If it isn't, turn it on for the joke."
  ),
  pose(
    "doorframe-lift",
    "Doorframe Lift",
    "standing",
    "Her back on the doorframe, one thigh up. He holds that thigh. Use the frame, not just your arms."
  ),
  pose(
    "counter-perch-stand",
    "Counter Perch",
    "standing",
    "She sits on the counter, him standing. Pull her to the edge. Watch her head on the cupboards."
  ),
  pose(
    "wall-slide",
    "Wall Slide",
    "standing",
    "Both standing, her back sliding a little down the wall, one knee bent out. Stay on your feet."
  ),
  pose(
    "shower-corner",
    "Shower Corner",
    "standing",
    "Her in the shower corner, one foot on the ledge if there is one. Him close. Non-slip mat first."
  ),
  pose(
    "hallway-press",
    "Hallway Press",
    "standing",
    "Narrow hallway, her hands on one wall, him behind. You don't need much room. That's the heat."
  ),
  pose(
    "fridge-lean",
    "Fridge Lean",
    "standing",
    "She faces the fridge, him behind, one of her feet on his. Cold door, warm everything else."
  ),
  pose(
    "kneel-worship",
    "Kneel Worship",
    "oral",
    "He kneels, she stands or sits on the bed edge. His hands on her thighs. She can hold the headboard."
  ),
  pose(
    "chair-oral",
    "Chair Oral",
    "oral",
    "She in a chair, he on the floor between her knees. Her legs over his shoulders if it feels good."
  ),
  pose(
    "sixty-side",
    "Sixty-Nine on Your Sides",
    "oral",
    "Both on your sides, heads opposite. Less crush, more aiming. Fine if you laugh."
  ),
  pose(
    "face-sit-lean",
    "Face Sit, Lean Forward",
    "oral",
    "She sits on his face and leans forward onto her hands. He holds her hips. She can rock."
  ),
  pose(
    "bed-edge-mouth",
    "Bed-Edge Mouth",
    "oral",
    "She on her back, hips at the edge. He kneeling on the floor. Best angle for his neck."
  ),
  pose(
    "standing-oral-hold",
    "Standing Oral Hold",
    "oral",
    "She standing, one leg over his shoulder, him kneeling. Hold her other hip. Wall nearby."
  ),
  pose(
    "lap-oral",
    "Lap Oral",
    "oral",
    "He sits. She kneels between his knees. His hands stay on the chair unless she puts them in her hair."
  ),
  pose(
    "cross-ankles",
    "Crossed Ankles",
    "side-creative",
    "She on her back, ankles crossed, him kneeling. Tight. Small movements."
  ),
  pose(
    "figure-four",
    "Figure Four",
    "side-creative",
    "She on her back, one ankle on the opposite knee. He kneels into the opening. Go slow until it fits."
  ),
  pose(
    "spoon-top-leg",
    "Spoon, Top Leg High",
    "side-creative",
    "Classic spoon with her top knee pulled toward her chest. His hand free for the front."
  ),
  pose(
    "yoga-split-assist",
    "Assisted Split",
    "side-creative",
    "She on her back, one leg toward her shoulder if her body allows. He holds that leg. Stop if anything pinches."
  ),
];

export function sexPositions(includeHidden = false): SexPosition[] {
  return applyOverlay(
    "positions",
    SEX_POSITIONS,
    (row, edit) => ({
      ...row,
      name: edit.title?.trim() || row.name,
      blurb: edit.body?.trim() || row.blurb,
      category: (POSITION_CATEGORIES.some((item) => item.id === edit.group)
        ? edit.group
        : row.category) as PositionCategoryId,
    }),
    (row) => ({
      id: row.id,
      name: row.title.trim() || "Untitled",
      category: (POSITION_CATEGORIES.some((item) => item.id === row.group)
        ? row.group
        : "face-to-face") as PositionCategoryId,
      blurb: row.body.trim() || row.title,
    }),
    includeHidden
  );
}

export const POSITION_COUNT = SEX_POSITIONS.length;

export function positionsInCategory(id: PositionCategoryId): SexPosition[] {
  return sexPositions().filter((row) => row.category === id);
}

export function positionsInCategories(
  enabled: PositionCategoryId[] | "all"
): SexPosition[] {
  const live = sexPositions();
  if (enabled === "all" || enabled.length === 0) return live;
  const set = new Set(enabled);
  return live.filter((row) => set.has(row.category));
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
  return sexPositions().find((row) => row.id === id) ?? null;
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
