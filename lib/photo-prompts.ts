import { applyOverlay } from "@/lib/catalog-overlay";

export type PhotoPromptCategory = "dramatic" | "domestic" | "outdoor" | "wholesome" | "stunts";

export type PhotoPrompt = {
  id: string;
  category: PhotoPromptCategory;
  title: string;
  label: string;
};

export const PHOTO_CATEGORIES: {
  id: PhotoPromptCategory;
  label: string;
  detail: string;
}[] = [
  { id: "dramatic", label: "Over-the-top", detail: "Dramatic, movie, soap opera" },
  { id: "domestic", label: "Everyday", detail: "House, laundry, couch" },
  { id: "outdoor", label: "Outdoors", detail: "Town, park, street" },
  { id: "wholesome", label: "Cute", detail: "Wholesome and creative" },
  { id: "stunts", label: "Couple stunts", detail: "Challenges you shoot together" },
];

function p(
  category: PhotoPromptCategory,
  id: string,
  title: string,
  label: string
): PhotoPrompt {
  return { id, category, title, label };
}

/** Weekly photo ideas, including couple stunts you shoot together. */
export const PHOTO_PROMPTS: PhotoPrompt[] = [
  p("dramatic", "overly-happy-dishes", "The Overly Happy Dishes", "Take a photo doing the dishes together looking unnaturally, absurdly overjoyed."),
  p("dramatic", "movie-poster", "The Movie Poster", "Recreate a dramatic action movie poster using household items as props."),
  p("dramatic", "soap-opera-shock", "The Soap Opera Shock", "A photo capturing one of you gasping in extreme, fake betrayal while the other looks sinister."),
  p("dramatic", "high-fashion-grocery", "The High-Fashion Grocery", "Strike a high-fashion, serious Vogue model pose in the middle of a mundane supermarket aisle."),
  p("dramatic", "paparazzi-shield", "The Paparazzi Shield", "One partner acts like an overwhelmed celebrity hiding their face, while the other plays the intrusive paparazzi."),
  p("dramatic", "album-cover", "The Album Cover", "Take a brooding, moody photo together that looks like a 90s alternative rock album cover."),
  p("dramatic", "renaissance-painting", "The Renaissance Painting", "Pose together in dim lighting imitating a classic, dramatic Renaissance oil painting."),
  p("dramatic", "telenovela-kiss", "The Telenovela Kiss", "Take a photo doing an overly dramatic, swept-off-your-feet romantic dip."),
  p("dramatic", "superhero-landing", "The Superhero Landing", "Both perform a synchronized, dramatic superhero landing in the backyard or living room."),
  p("dramatic", "victorian-portrait", "The Victorian Portrait", "Sit side-by-side with completely unsmiling, stoic, frozen Victorian-era faces."),
  p("dramatic", "workout-montage", "The Workout Montage", "Pose looking completely exhausted, drenched in sweat, holding ridiculously tiny weights."),
  p("dramatic", "evil-genius", "The Evil Genius", "One partner holding a pet or mug like a villain, while the other looks tied up or trapped."),
  p("dramatic", "cooking-disaster", "The Cooking Disaster", "Capture a photo looking in absolute, dramatic horror at a totally normal meal."),
  p("dramatic", "infomercial-before", "The Infomercial Before", "Pose looking completely defeated by a simple household task (e.g., trying to fold a fitted sheet)."),
  p("dramatic", "secret-agent", "The Secret Agent", "Take a stealthy photo spying on each other from behind an indoor plant or door frame wearing dark sunglasses."),
  p("dramatic", "red-carpet-bins", "The Red Carpet Arrival", "Dress up in your absolute fanciest clothes just to stand next to the household wheelie bins."),
  p("dramatic", "sci-fi-abduction", "The Sci-Fi Abduction", "Use a flashlight from below to create a dramatic alien abduction glow on your faces in the dark."),
  p("dramatic", "slow-mo-explosion", "The Slow-Mo Explosion", "Walk away from the oven or microwave without looking back like it’s an exploding building."),
  p("dramatic", "fantasy-quest", "The Fantasy Quest", "Pose with kitchen utensils (baking trays as shields, spatulas as swords) ready for battle."),
  p("dramatic", "weather-broadcast", "The Weather Broadcast", "One partner points at a blank wall like a news meteorologist while the other acts out the storm."),
  p("dramatic", "undercover-boss", "The Undercover Boss", "Dress up in terrible disguises (hats, fake mustaches, glasses) while sitting at a café."),
  p("dramatic", "soap-opera-rejection", "The Soap Opera Rejection", "Throw a glass of water (or pretend to) in a dramatic betrayal moment."),
  p("dramatic", "award-speech", "The Award Speech", "One partner holds a golden kitchen item crying tears of joy while the other applauds wildly."),
  p("dramatic", "staring-contest", "The Staring Contest", "Extreme close-up of both your eyes inches apart in an intense showdown."),
  p("dramatic", "time-traveler", "The Time Traveler", "Pose in vintage clothing next to a modern appliance looking completely baffled by it."),

  p("domestic", "laundry-mountain", "The Laundry Mountain", "Pose triumphantly at the peak of a massive pile of unfolded laundry."),
  p("domestic", "morning-coffee-zombie", "The Morning Coffee Zombie", "Capture your truest, unbrushed, half-asleep morning faces before the first coffee hits."),
  p("domestic", "fridge-glow", "The Fridge Glow", "A late-night photo taken from inside the fridge looking out at your hungry faces in the dark."),
  p("domestic", "remote-tug-of-war", "The Remote Tug-of-War", "A desperate struggle photo fighting over the TV remote control on the couch."),
  p("domestic", "blankets-thief", "The Blankets Thief", "A photo in bed showing one partner completely bundled in all the blankets while the other shivers."),
  p("domestic", "bedtime-tuck-in", "The Bedtime Tuck-In", "One partner tucked into bed like a toddler, complete with a stuffed animal or warm milk."),
  p("domestic", "flat-pack-fury", "The Flat-Pack Fury", "Pose looking completely defeated while surrounded by wooden pegs and IKEA instructions."),
  p("domestic", "thermostat-guard", "The Thermostat Guard", "Standing guard in front of the house thermostat with arms crossed and a protective glare."),
  p("domestic", "bin-run-dash", "The Bin Run Dash", "A blurry motion-shot of running the bins out to the curb at the very last second."),
  p("domestic", "car-karaoke", "The Car Karaoke", "A photo caught mid-shout while singing your hearts out during a drive."),
  p("domestic", "grocery-haul-flex", "The Grocery Haul Flex", "Posing like bodybuilders while carrying every single grocery bag in one single trip."),
  p("domestic", "recipe-vs-reality", "The Recipe vs. Reality", "A split photo of what the online recipe promised versus your actual cooked creation."),
  p("domestic", "pet-gatekeeper", "The Pet Gatekeeper", "Trying to take a couple photo while your pet aggressively blocks the camera view."),
  p("domestic", "sneaky-snack", "The Sneaky Snack", "Catching your partner red-handed with their head inside the snack cupboard at night."),
  p("domestic", "parallel-play", "The Parallel Play", "Sitting side-by-side on the couch completely absorbed in your own separate hobbies."),
  p("domestic", "diy-disaster", "The DIY Disaster", "Posing covered in paint, dust, or mud after trying a home improvement project."),
  p("domestic", "meal-prep-line", "The Meal Prep Assembly Line", "Working in synchronized harmony (or chaos) packing work lunches."),
  p("domestic", "pillow-fort", "The Pillow Fort", "Peeking out from inside a fully constructed living room blanket fort."),
  p("domestic", "chores-race", "The Chores Race", "A split-screen or action shot showing who can clean their side of the room faster."),
  p("domestic", "shoe-hoard", "The Shoe Hoard", "Standing next to the massive pile of shoes by the front door looking guilty."),
  p("domestic", "couch-potato", "The Couch Potato", "Completely buried under a pile of cushions, blankets, and snack wrappers."),
  p("domestic", "plant-parents", "The Plant Parents", "Proudly posing with every single indoor plant in the house packed into one shot."),
  p("domestic", "takeaway-feast", "The Takeaway Feast", "Sitting on the living room floor surrounded by open takeaway containers like royalty."),
  p("domestic", "shopping-cart-driver", "The Shopping Cart Driver", "One partner sitting inside the trolley while the other pushes down the aisle."),
  p("domestic", "mismatched-socks", "The Mismatched Socks", "Showing off the most absurd, mismatched sock combinations you can find in your drawers."),

  p("outdoor", "shadow-art", "The Shadow Art", "Standing in the sun to create a funny, distorted shadow monster using both your bodies."),
  p("outdoor", "tourist-own-town", "The Tourist in Your Own Town", "Posing like cheesy tourists next to a local landmark or municipal sign."),
  p("outdoor", "playground-nostalgia", "The Playground Nostalgia", "Both trying to fit onto the kids' swings or seesaw at a local park."),
  p("outdoor", "window-shopping-dream", "The Window Shopping Dream", "Pressing your faces flat against the glass of a store window looking at something expensive."),
  p("outdoor", "mirror-swap", "The Mirror Swap", "Taking a photo in a public decorative mirror where your reflections line up weirdly."),
  p("outdoor", "tree-hugger", "The Tree Hugger", "Hugging a massive tree trunk together with absolute, genuine emotion."),
  p("outdoor", "park-bench-nappers", "The Park Bench Nappers", "Pretending to be fast asleep on a public park bench in broad daylight."),
  p("outdoor", "coffee-art-critique", "The Coffee Art Critique", "Looking intensely analytical at the latte art on your coffee cups like it’s priceless art."),
  p("outdoor", "sidewalk-strut", "The Sidewalk Strut", "A low-angle action shot of both of you strutting across a pedestrian crossing."),
  p("outdoor", "statue-impersonation", "The Statue Impersonation", "Matching the exact pose of a local outdoor statue or sculpture."),
  p("outdoor", "sunset-silhouette", "The Sunset Silhouette", "A classic back-lit silhouette photo doing a silly pose against a colorful sky."),
  p("outdoor", "car-bonnet-picnic", "The Car Bonnet Picnic", "Eating a quick snack or ice cream while sitting on the bonnet of your car."),
  p("outdoor", "reflection-selfie", "The Reflection Selfie", "A creative shot taken in a puddle, a car side-mirror, or a metallic building surface."),
  p("outdoor", "high-five-fail", "The High-Five Fail", "An action-shot capturing the exact awkward moment a high-five completely misses."),
  p("outdoor", "elevator-stare", "The Elevator Stare", "Taking a mirror photo in a crowded or empty lift looking as serious as secret agents."),
  p("outdoor", "hardware-store-test", "The Hardware Store Test", "Testing out lawn chairs or outdoor furniture inside a home improvement store."),
  p("outdoor", "book-cover-match", "The Book Cover Match", "Holding a book cover up in front of your partner’s face so the cover aligns with their body."),
  p("outdoor", "alleyway-cool", "The Alleyway Cool", "Posing against a brick wall or graffiti art trying to look like a cool street gang."),
  p("outdoor", "fast-food-date", "The Fast-Food Date", "Eating a cheap soft-serve cone with your pinky fingers held high in the air."),
  p("outdoor", "bushwalk-discovery", "The Bushwalk Discovery", "Pointing in exaggerated awe at a completely tiny mushroom or leaf on a trail."),
  p("outdoor", "dog-sight", "The Dog Sight", "Catching a photo of both your faces at the exact moment you spot a cute dog nearby."),
  p("outdoor", "bus-stop-wait", "The Bus Stop Wait", "Looking like characters waiting for a bus in a quiet indie film."),
  p("outdoor", "bridge-high-five", "The Bridge High-Five", "Meeting in the middle of a footbridge for an epic mid-air high-five photo."),
  p("outdoor", "street-light-glow", "The Street Light Glow", "A nighttime shot standing directly under a single bright street lamp."),
  p("outdoor", "giant-item", "The Giant Item", "Holding a tiny object close to the camera lens so it looks giant next to your partner."),

  p("wholesome", "face-swap-classic", "The Face Swap Classic", "A photo using a face-swap filter, or holding up drawn paper masks over your faces."),
  p("wholesome", "heart-hands", "The Heart Hands", "Framing a sunrise, sunset, or favorite spot inside a hand-heart shape."),
  p("wholesome", "hug-from-behind", "The Hug from Behind", "A candid, cozy shot caught in a surprise warm embrace while cooking or working."),
  p("wholesome", "matching-outfits", "The Matching Outfits", "Accidental (or intentional) twin dressing in the exact same colors on the same day."),
  p("wholesome", "forehead-touch", "The Forehead Touch", "A soft, close-up shot with your foreheads resting together and eyes closed."),
  p("wholesome", "piggyback-smile", "The Piggyback Smile", "A genuine, laughing piggyback photo taken in the backyard or living room."),
  p("wholesome", "height-difference", "The Height Difference", "Playing up your height difference by standing on tiptoes or stepping on a book."),
  p("wholesome", "decades-throwback", "The Decades Throwback", "Recreating a photo of your parents or grandparents from the 70s, 80s, or 90s."),
  p("wholesome", "foot-selfie", "The Foot Selfie", "A top-down shot of both your feet side-by-side in your favorite shoes or cozy slippers."),
  p("wholesome", "pinky-promise", "The Pinky Promise", "A close-up shot of your pinky fingers locked together."),
  p("wholesome", "unexpected-kiss", "The Unexpected Kiss", "One partner capturing a photo right as they surprise the other with a kiss on the cheek."),
  p("wholesome", "childhood-remake", "The Childhood Remake", "Recreating a photo from one of your childhood photos as adults."),
  p("wholesome", "wink-and-smile", "The Wink & Smile", "Both attempting to wink at the camera at the exact same time."),
  p("wholesome", "candlelight-glow", "The Candlelight Glow", "A photo taken purely by the warm light of a single candle on the table."),
  p("wholesome", "laughing-candid", "The Laughing Candid", "Setting a camera timer, telling a terrible joke, and capturing the genuine laugh."),
  p("wholesome", "blanket-wrap", "The Blanket Wrap", "Wrapped up together inside one single giant fleece blanket like a burrito."),
  p("wholesome", "silly-face-standoff", "The Silly Face Stand-Off", "Who can make the absolute ugliest, most absurd double-chin face?"),
  p("wholesome", "kissing-reflection", "The Kissing Reflection", "A photo of a kiss captured in the reflection of a window or TV screen."),
  p("wholesome", "hand-hold-walk", "The Hand Hold Walk", "A low shot taken from behind holding hands while walking down the road."),
  p("wholesome", "cozy-socks", "The Cozy Socks", "Propping your feet up near a fireplace or coffee table showing off clean, warm socks."),
  p("wholesome", "frame-within-frame", "The Frame Within a Frame", "Taking a photo of your partner through an object (like a mug handle or ring)."),
  p("wholesome", "crown-placement", "The Crown Placement", "Placing a homemade paper crown or flower crown on each other's heads."),
  p("wholesome", "dessert-share", "The Dessert Share", "Two spoons digging into one single shared dessert at the exact same time."),
  p("wholesome", "polaroid-vibe", "The Polaroid Vibe", "A flash photo taken in the dark that looks like an old-school vintage instant print."),
  p("wholesome", "year-1-vs-now", "The Year 1 vs. Now", "Recreating the very first photo you ever took together as a couple."),

  p("stunts", "each-others-clothes", "Each Other's Clothes", "Both of you fully dressed in the other's clothes, shoes included if they fit even badly."),
  p("stunts", "fake-living-room-wedding", "Fake Living-Room Wedding", "A full fake wedding in the living room: something borrowed as a veil, a bouquet of kitchen utensils, vows optional."),
  p("stunts", "piggyback-grocery", "Piggyback Grocery", "One of you carrying the other plus a grocery bag. Indoor or driveway. Try not to drop the milk."),
  p("stunts", "mirror-twins", "Mirror Twins", "Stand facing each other and copy poses like a mirror. One photo of the sync, one of the fail."),
  p("stunts", "tiny-table-dinner", "Tiny Table Dinner", "Eat a full plated meal on the smallest surface you can find (stool, suitcase, child's table)."),
  p("stunts", "balcony-opera", "Balcony Opera", "One of you dramatically 'sings' from a balcony, stairs, or the back step. The other is the stunned audience."),
  p("stunts", "swap-shoes-walk", "Swap Shoes Walk", "Wear each other's shoes around the block or the hallway. Photo at the furthest point."),
  p("stunts", "newspaper-kiss", "Newspaper Kiss", "Hold a newspaper or tablet up like a 1940s V-J Day kiss. Stay in character."),
  p("stunts", "human-chair", "Human Chair", "One partner sits on the other as if they are a fancy armchair. Include a drink if you dare."),
  p("stunts", "synchronized-yawn", "Synchronized Yawn", "Fake the biggest yawn of your lives at the exact same time, mid-couch."),
  p("stunts", "tarp-picnic-rain", "Tarp Picnic", "Picnic on a tarp in the backyard or bathroom. Fancy plates. Weather optional."),
  p("stunts", "red-carpet-hallway", "Hallway Red Carpet", "Towel or sheet as a carpet. Paparazzi flash from the other end of the hall."),
  p("stunts", "cook-blindfold", "Blindfold Chef", "One of you cooks one simple step blindfolded. The other documents the crime."),
  p("stunts", "lift-over-threshold", "Threshold Lift", "Carry them over a doorway like you just got married. Repeat until the photo isn't blurry."),
  p("stunts", "matching-mud-masks", "Matching Mud Masks", "Full face masks, robes or towels, serious spa faces in the least spa room in the house."),
  p("stunts", "fort-royal-portrait", "Fort Royal Portrait", "Sit in a blanket fort like monarchs. Use a colander or mixing bowl as a crown."),
  p("stunts", "dance-dip-kitchen", "Kitchen Dip", "Dip them in the kitchen like a ballroom. Oven light for mood."),
  p("stunts", "back-to-back-detectives", "Back-to-Back Detectives", "Sunglasses, serious faces, back-to-back in an alley, carpark, or hallway."),
  p("stunts", "one-coat-two-people", "One Coat, Two People", "Both of you inside one coat or blanket, walking. Only four feet should show."),
  p("stunts", "breakfast-in-bed-mess", "Breakfast in Bed Mess", "Tray, crumbs, both of you still in bed looking proud of the disaster."),
  p("stunts", "statue-challenge", "Statue Challenge", "Hold a ridiculous pose in public or the garden for a full 10-second timer. No laughing. (You will laugh.)"),
  p("stunts", "hair-swap-styles", "Hair Swap", "Do each other's hair as badly as possible. Side-by-side portrait."),
  p("stunts", "yoga-fail", "Yoga Fail", "Attempt a partner yoga pose. Photograph the collapse, not the success."),
  p("stunts", "car-karaoke-still", "Parked Karaoke Still", "Parked car, both singing, windows up. Night photo with interior lights."),
  p("stunts", "apology-bouquet-weeds", "Weeds Bouquet", "Present a bouquet of weeds or supermarket herbs on one knee."),
  p("stunts", "shadow-puppet-fight", "Shadow Puppet Fight", "A lamp, a wall, two silhouettes pretending to sword-fight."),
  p("stunts", "suitcase-escape", "Suitcase Escape", "One of you in an empty suitcase or laundry basket, the other 'catching you packing to leave'."),
  p("stunts", "formal-takeaway", "Formal Takeaway", "Your fanciest clothes, eating chips or pizza on the floor."),
  p("stunts", "three-legged-hallway", "Three-Legged Hallway", "Tie two inside legs together, walk the hall. Action shot of the tangle."),
  p("stunts", "makeup-swap", "Makeup Swap", "If you have makeup, do each other's. If you don't, use sunscreen or flour artfully."),
  p("stunts", "rain-dance-driveway", "Driveway Rain Dance", "If it's dry, use the hose. Dance like a music video. Neighbours are the extras."),
  p("stunts", "slow-mo-run-towards", "Slow-Mo Run Towards", "Run toward each other in a park or the backyard in dramatic slow-mo. Hair optional."),
  p("stunts", "bed-sheet-ghosts", "Bed Sheet Ghosts", "Two ghosts in the living room, eye holes cut or held. Hold hands."),
  p("stunts", "trophy-night", "Trophy Night", "Award each other a homemade trophy (foil, mug, banana). Acceptance speech faces."),
  p("stunts", "under-table-spies", "Under-Table Spies", "Both under the dining table with torches, like kids hiding from a party."),
  p("stunts", "lean-tower", "Lean Tower", "How far can you both lean out holding hands before someone steps. Safety first, drama second."),
  p("stunts", "matching-sunglasses-night", "Night Sunglasses", "Sunglasses after dark, streetlight, trying to look famous."),
  p("stunts", "carry-all-the-bags", "Carry All the Bags", "One partner carries every bag from a shop. Heroic pose on the footpath."),
  p("stunts", "recreate-album-cover", "Recreate an Album Cover", "Pick a famous album and rebuild it with household props. Hold the original on your phone in the corner."),
  p("stunts", "first-dance-redo", "First Dance Redo", "If you had a first dance, redo it in socks. If you didn't, invent one in the kitchen."),
  p("stunts", "sleeping-beauty-couch", "Sleeping Beauty Couch", "One 'asleep' in a ridiculous pose, the other about to wake them with a kiss. Or a snack."),
  p("stunts", "wanted-poster", "Wanted Poster", "Mugshot-style photos of each other, then a couple shot holding the 'posters'."),
  p("stunts", "balance-book-heads", "Books on Heads", "Walk toward each other with a book on each head. Photo of the drop."),
  p("stunts", "fake-fight-pillow", "Pillow Fight Freeze", "Mid-pillow-fight freeze frame. Feathers optional, sofa cushions required."),
  p("stunts", "window-press", "Window Press", "Faces and hands pressed to the same window from opposite sides if you can, or both from inside looking tragic."),
  p("stunts", "supermarket-ballroom", "Supermarket Ballroom", "One slow-dance dip in an empty aisle. Be brief. Be kind to staff."),
  p("stunts", "hat-swap-portraits", "Hat Swap Portraits", "Serious studio portraits wearing each other's hats, beanies, or a saucepan."),
  p("stunts", "jump-sync", "Jump Sync", "Both jump at the same time in the backyard or a quiet street. Catch air or catch the fail."),
  p("stunts", "love-letter-prop", "Giant Love Letter", "Write a huge cardboard letter and pose delivering it on one knee at the front door."),
  p("stunts", "movie-end-credits-walk", "End Credits Walk", "Walk away from the camera down a path or hallway, holding hands, like the credits are rolling."),
];

export function photoPrompts(includeHidden = false): PhotoPrompt[] {
  return applyOverlay(
    "photo",
    PHOTO_PROMPTS,
    (row, edit) => ({
      ...row,
      title: edit.title?.trim() || row.title,
      label: edit.body?.trim() || row.label,
      category: (PHOTO_CATEGORIES.some((item) => item.id === edit.group)
        ? edit.group
        : row.category) as PhotoPromptCategory,
    }),
    (row) => ({
      id: row.id,
      category: (PHOTO_CATEGORIES.some((item) => item.id === row.group)
        ? row.group
        : "wholesome") as PhotoPromptCategory,
      title: row.title.trim() || "Untitled",
      label: row.body.trim() || row.title,
    }),
    includeHidden
  );
}

export function photoPromptsIn(category: PhotoPromptCategory): PhotoPrompt[] {
  return photoPrompts().filter((row) => row.category === category);
}
