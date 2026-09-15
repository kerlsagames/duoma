import type { HowFor, HowStep, HowTechnique, HowType, HowVoice } from "@/lib/the-how";

function kind(name: string, line: string): HowType {
  return { name, line };
}

function step(
  minutes: string,
  title: string,
  body: string,
  durationSec: number
): HowStep {
  return { minutes, title, body, durationSec };
}

function voice(
  promise: string,
  what: string,
  why: string,
  signs: string[]
): HowVoice {
  return { promise, what, why, signs };
}

function tech(
  number: number,
  id: string,
  chapter: HowTechnique["chapter"],
  forWho: HowFor,
  name: string,
  terms: string[],
  typesLabel: string,
  types: HowType[],
  routineLabel: string,
  routine: HowStep[],
  signsLabel: string,
  sayThis: string,
  plain: HowVoice,
  science: HowVoice
): HowTechnique {
  return {
    id,
    number,
    chapter,
    for: forWho,
    name,
    terms,
    typesLabel,
    types,
    routineLabel,
    routine,
    signsLabel,
    sayThis,
    plain,
    science,
  };
}

export const HOW_TECHNIQUES: HowTechnique[] = [
  tech(
    1,
    "framing",
    "essentials",
    "both",
    "Framing",
    ["pelvic-floor"],
    "Three ways to frame",
    [
      kind("A buffer", "Fifteen to thirty minutes off the day — shower, change, phones away — before any touch."),
      kind("Name the night", "Say what this is: “Just slow touch. Nothing to finish.” A text hours earlier counts."),
      kind("The room", "Warm light, comfortable temperature, quiet. Cold rooms make the body clamp."),
    ],
    "10-minute start",
    [
      step("0–3", "Clear the space", "Dim lights. Move the laptop. A calm scent if you have one.", 180),
      step("3–6", "Breathe down", "On your back. Hand on chest, hand on belly. Ten slow breaths.", 180),
      step("6–8", "Say the job", "Nowhere to rush. Nothing to accomplish.", 120),
      step("8–10", "Start far away", "Slow touch on arms, neck, or shoulders. No one is being asked for anything yet.", 120),
    ],
    "Ready when",
    "Nowhere to be. Nothing to finish.",
    voice(
      "Get out of the day before anyone is touched.",
      "Framing is the start. Mood, the room, and whether the to-do list is still shouting all decide if touch feels good or like “get off me.”",
      "Jump in cold and the body stays braced. A short buffer lets the pelvis actually take the touch.",
      ["Jaw and shoulders drop.", "Breath sits in the belly, not the chest."]
    ),
    voice(
      "The brain rates touch before the body does.",
      "Touch is judged for safety first. Context — time, words, the room — is what lets the brain file a sensation as pleasure instead of intrusion.",
      "A buffer shifts the nervous system toward rest, so blood can reach the pelvis instead of staying locked in fight-or-flight.",
      ["Pelvic floor unclenches.", "Intrusive day-thoughts fade and sensation takes over."]
    )
  ),
  tech(
    2,
    "surprise",
    "essentials",
    "her",
    "Surprise",
    ["mons", "vulva"],
    "Four surprises",
    [
      kind("Pressure pivot", "Light tracing, then a firm still press on the mons for five seconds — or the reverse."),
      kind("Texture switch", "Skin, silk, something cool, a warm wet palm. Change without warning."),
      kind("Jump the map", "Leave the vulva for the inner knee, collarbone, or ribs, then come back."),
      kind("The freeze", "At full speed, stop. Keep contact 3–5 seconds. Let her throb against a still hand."),
    ],
    "10-minute try",
    [
      step("0–4", "Same stroke", "Slow, boring up-and-down. Let her nervous system settle.", 240),
      step("4–6", "Jump", "Every 45 seconds, hop to inner thigh or lower belly for 3 seconds, then the same stroke.", 120),
      step("6–8", "Press", "Firm press on the mons for 5 seconds on an exhale, then feather-light again.", 120),
      step("8–10", "Freeze", "Speed up a little. Stop at the fastest moment. Hold until a gasp or twitch.", 120),
    ],
    "Working when",
    "Don’t warn me. Just change it.",
    voice(
      "Same stroke forever and the nerves go to sleep.",
      "Surprise is a planned interruption. A body that knows exactly what’s coming next starts to ignore it.",
      "A sudden change of pressure, texture, or place wakes the spot back up.",
      ["A dull patch suddenly feels sharp.", "She’s waiting for where you’ll go next."]
    ),
    voice(
      "Break the pattern so the nerves fire again.",
      "Nerve endings adapt to a repeated stroke and stop sending a strong signal. A sudden change forces a fresh one.",
      "Unexpected pleasant input also spikes dopamine — attention snaps back to the exact point of contact.",
      ["Micro-twitches on a change.", "Places that had gone numb feel reactive again."]
    )
  ),
  tech(
    3,
    "hinting",
    "essentials",
    "her",
    "Hinting",
    ["vulva", "mons", "hood", "glans", "labia", "clit-body"],
    "Four ways to hint",
    [
      kind("Hover", "Finger almost touching. Heat and air, not friction. Trace the outer lips and mons."),
      kind("The clock", "Touch 12 (mons), 3 and 9 (inner thighs). Never the centre."),
      kind("Brush and leave", "One light pass over the hood for half a second. Then 30–60 seconds away."),
      kind("Through fabric", "Circles or a toy over underwear so the pressure spreads."),
    ],
    "10-minute try",
    [
      step("0–3", "Far away", "Lower back, hips, outer thighs. Light on the inner thighs.", 180),
      step("3–6", "Closer", "Broad pressure on the mons. Hover over the lips. Don’t land.", 180),
      step("6–8", "Brush", "Pass the clitoral area once a minute. Do not stop there.", 120),
      step("8–10", "Land", "Steady contact on the inner lips and just above the hood.", 120),
    ],
    "Ready when",
    "Around it. Not on it yet.",
    voice(
      "Wake the neighbourhood. Don’t storm the house.",
      "Hinting is circling the most sensitive spot instead of going straight for it. The clitoris is mostly under the skin — touching around it still reaches it.",
      "Going straight to the tip when she’s not ready often feels like too much. Nearby touch fills the tissue with blood first.",
      ["Lips and hood feel warm and a bit swollen.", "Hips come toward your hand."]
    ),
    voice(
      "Prime the internal clitoris before you touch the tip.",
      "The visible tip is only part of the organ. Touch on the mons and lips vibrates the bulbs underneath and lets them fill with blood.",
      "Direct contact on a cold glans can make muscles guard. Anticipation also keeps desire high.",
      ["Clear lubrication.", "She arches toward indirect touch."]
    )
  ),
  tech(
    4,
    "staging",
    "essentials",
    "her",
    "Staging",
    ["mons", "labia", "hood", "glans", "vulva"],
    "Four stages",
    [
      kind("Far out", "Whole hands on back, thighs, belly. Not the pelvis yet."),
      kind("Bones", "Steady weight on hip bones, lower spine, and the mons."),
      kind("Outer lips", "A warm wet palm cupping everything, or slow glides on the outer lips."),
      kind("Closer", "Inner lips and hood. Circles or a simple rhythm — still not stabbing the tip."),
    ],
    "10-minute try",
    [
      step("0–3", "Far", "Palms on lower back, hips, outer thighs. Skip the pelvis.", 180),
      step("3–5", "Bones", "Warm still pressure on the mons and hip bones.", 120),
      step("5–8", "Outer", "Lube. Glide the outer lips and inner thighs. Stay off the tip.", 180),
      step("8–10", "Closer", "Fingers in the inner lips. Steady touch along the hood.", 120),
    ],
    "Move on when",
    "Stay on this stage until I pull you closer.",
    voice(
      "Match the touch to how ready her body is.",
      "Staging is not skipping ahead. Tissue needs time to swell. What feels like too much at minute one is often perfect at minute fifteen.",
      "If you go to the most sensitive spot first, it often hurts or goes numb. Each stage buys the next one.",
      ["Shoulders drop, skin warms.", "Inner lips look a bit more open and wet."]
    ),
    voice(
      "Time touch to blood flow, not the clock.",
      "Arousal fills tissue with blood in phases. High-intensity touch only feels good once that has happened.",
      "Phased contact also lets the pelvic floor unclench instead of fighting you.",
      ["Hips unclamp under still pressure.", "Lubrication is clearly there before you go precise."]
    )
  ),
  tech(
    5,
    "signaling",
    "essentials",
    "both",
    "Signaling",
    [],
    "Three channels",
    [
      kind("Hand on hand", "Her hand on yours, steering speed and pressure. Skip the speech."),
      kind("Body codes", "Hips up = more. Hips away = too much. A squeeze or held breath = stay."),
      kind("One word", "Yes. Lighter. Slower. Hold. Right there. Not a paragraph."),
    ],
    "Build the system",
    [
      step("Setup", "Calibrate", "On an arm or thigh, show Light, Medium, Firm so the words match.", 120),
      step("0–5", "Hands only", "First five minutes of direct touch: she steers your hand.", 300),
      step("5–8", "One word", "Her hand comes off. Single words only if something must change.", 180),
      step("8–10", "Body only", "Near the edge, drop talking. Hips and breath do it.", 120),
    ],
    "Working when",
    "Lighter. Stay.",
    voice(
      "Guide without turning it into a meeting.",
      "Signaling is how you course-correct without killing the mood. Guessing is what makes people tense.",
      "A full sentence (“can you do that circular thing”) yanks both brains into analysis. One word, or a hand, keeps you in it.",
      ["A fix lands in a second and the motion never stops.", "A ‘lighter’ still sounds like sex."]
    ),
    voice(
      "Keep the trance. Cut the cognitive load.",
      "Uncertainty makes the giver overthink. Deep arousal is a narrow sensory state — a jarring correction dumps you out of it.",
      "Tiny, pre-agreed signals keep touch inside the sweet spot without a debrief.",
      ["Corrections don’t cause a pause or a flinch.", "Touch stays in the usable range the whole time."]
    )
  ),
  tech(
    6,
    "rhythm",
    "essentials",
    "her",
    "Rhythm",
    ["mons", "hood", "labia", "glans"],
    "Four loops",
    [
      kind("Up and down", "One or two fingers along the sides of the hood, mons to the base of the lips."),
      kind("Figure-8", "Up one side, across the mons, down the other, under — fingers never lift."),
      kind("Pendulum", "Tiny side-to-side just above the tip. Half an inch to an inch. That’s the whole width."),
      kind("Pulse", "Fingers still on the skin. Pulse down from the forearm. No rubbing."),
    ],
    "10-minute try",
    [
      step("0–2", "Pick one", "One loop. About one stroke a second. Lots of lube.", 120),
      step("2–5", "A bit faster", "Same path. Maybe 20% quicker. Same pressure, same contact.", 180),
      step("5–8", "Hold it", "Do not wander or skip. This is the boring part that works.", 180),
      step("8–10", "Keep it", "If your hand tires, drive from the wrist. Don’t change the shape.", 120),
    ],
    "Stay or adjust",
    "Same loop. Don’t get creative.",
    voice(
      "One loop, long enough that it can add up.",
      "Rhythm is the same motion, over and over. Orgasm is often just that — not a new trick every ten seconds.",
      "The body needs a beat it can trust. Predictable also feels safe, so muscles stay soft.",
      ["Breath matches the stroke.", "Wincing, hips away, or sudden dryness means slow down or stop changing."]
    ),
    voice(
      "Repeat the same path so signals can stack.",
      "One touch is a small blip. The same path at a steady tempo lets those blips add up in the spine until they cross a threshold.",
      "Brainwaves also lock to a beat, which is why ‘creative’ mid-climb so often kills it.",
      ["Pelvic muscles pulse in time.", "Arousal climbs without sudden dips."]
    )
  ),
  tech(
    7,
    "accenting",
    "essentials",
    "her",
    "Accenting",
    ["mons", "hood"],
    "Three accents",
    [
      kind("The extra press", "On a 4-count circle, press at 1 (the top). Light for 2, 3, 4."),
      kind("The hang", "At the top of an up-stroke, pause half a second in contact, then sweep down."),
      kind("The edge", "Mostly the pad of the finger. At the bottom of the loop, roll onto the fingertip for a sharper point."),
    ],
    "10-minute try",
    [
      step("0–3", "Plain circle", "Smooth 4-count around the hood. Even. No extra anything.", 180),
      step("3–6", "Press on 1", "Extra weight at the top / mons. The rest stays light.", 180),
      step("6–8", "Move it", "Same pulse, now at the bottom, below the clitoris.", 120),
      step("8–10", "Press and hang", "Add the half-second pause on the accent as she climbs.", 120),
    ],
    "Working when",
    "That extra press at the top. Keep it.",
    voice(
      "A beat inside the loop — not a new song.",
      "Accenting is one extra on a stroke you already have: a press, a tiny pause, a sharper fingertip. The rest stays the same.",
      "All rhythm gets dull. All randomness never builds. This is both.",
      ["A small inhale or hip twitch lands on the accent.", "It keeps getting better instead of going flat."]
    ),
    voice(
      "Novelty inside a pattern, so nothing habituates.",
      "The background loop keeps light-touch nerves busy. The accent wakes deeper pressure nerves at one point.",
      "That mix of ‘I know what’s coming’ and ‘wait, that’ is what keeps the climb alive.",
      ["The body tracks the accent.", "Momentum holds without you inventing a new move."]
    )
  ),
  tech(
    8,
    "edging",
    "essentials",
    "her",
    "Edging",
    ["mons", "hood"],
    "One cycle",
    [
      kind("Climb", "Steady direct rhythm until she’s about 90% — tight muscles, fast breath, involuntary sound."),
      kind("Back off", "Don’t leave. Still palm on the mons, or slow inner-thigh strokes, 20–40 seconds."),
      kind("Rebuild", "Come back slower than you left. Don’t jump to fast and direct."),
    ],
    "Three cycles",
    [
      step("1", "First edge", "Build with a simple rhythm. At the tipping point, still palm on the mons. Wait 30 seconds.", 180),
      step("2", "Second", "Rebuild with circles around the hood. She’ll climb faster. At 90%, inner thighs 30–45 seconds.", 210),
      step("3", "Through", "Rebuild and stay. Same stroke over the line.", 210),
    ],
    "Back off when",
    "Back off. Stay on me. Then come back.",
    voice(
      "Ride up to the line. Step back. Build a bigger wave.",
      "Edging is getting close, easing off, then climbing again. Do it with consent — otherwise it’s just you grabbing the remote.",
      "Each climb usually makes the next one bigger. The last one is allowed to go over.",
      ["Pelvic muscles lock on.", "She holds her breath or her voice jumps — that’s the line."]
    ),
    voice(
      "Approach the threshold, drop, rebuild.",
      "Each cycle leaves more blood in the tissue, so the organ is physically bigger and more responsive.",
      "Staying on the plateau also keeps dopamine high, which is why the eventual release often hits harder.",
      ["Continuous pelvic clench.", "Voice goes high or rapid."]
    )
  ),
  tech(
    9,
    "orbiting",
    "essentials",
    "her",
    "Orbiting",
    ["hood", "glans", "mons", "labia", "clit-body", "vulva"],
    "Four orbits",
    [
      kind("Wide", "A big circle — mons, outer lips, the space below. About two inches across."),
      kind("Tight", "A small circle around the hood. Around the base of the tip, not over it."),
      kind("Oval", "Down one inner lip, across the opening, up the other, over the top of the hood."),
      kind("Crescent", "Just the top half of the hood, 9 o’clock to 3 o’clock and back."),
    ],
    "10-minute try",
    [
      step("0–3", "Wide", "Lots of lube. Big slow circles, about one every two seconds.", 180),
      step("3–6", "Tight", "Spiral in around the hood. Light to medium.", 180),
      step("6–8", "Oval", "Lengthen down the inner lips.", 120),
      step("8–10", "Crescent", "Smaller, quicker arcs across the top of the hood.", 120),
    ],
    "Working when",
    "Around the hood. Not on the tip.",
    voice(
      "Circle the planet. Don’t land on the sun.",
      "Orbiting is circling the clitoris instead of rubbing the tip. You still reach the parts under the skin.",
      "Direct rubbing on the tip is what goes raw or numb. The hood is the kinder surface.",
      ["She’s climbing without wincing.", "The whole area looks fuller."]
    ),
    voice(
      "Compress the internal clitoris without frying the glans.",
      "Circles on the hood and lips press the bulbs and legs underneath while the visible tip stays protected.",
      "The path also keeps changing direction, so the same nerves don’t go to sleep.",
      ["High arousal without sharp friction.", "Hood and inner lips are clearly swollen."]
    )
  ),
  tech(
    10,
    "layering",
    "essentials",
    "her",
    "Layering",
    ["labia", "glans", "vulva", "hood"],
    "Three layers",
    [
      kind("Fold the lips", "Bring the outer lips together over the clitoris. Touch the outside of that cushion."),
      kind("Through fabric", "Leave underwear on. Hand or toy on top."),
      kind("Hand on hand", "A still palm over everything. Movement happens on the back of that hand."),
    ],
    "Layering try",
    [
      step("0–5", "Fabric", "Build through cloth. No bare skin yet.", 300),
      step("5–8", "Skin, then fold", "If direct gets too sharp, fold the outer lips over the tip and keep going.", 180),
      step("8–10", "After", "If she comes, don’t touch the tip. Whole-hand cushion.", 120),
    ],
    "Use this when",
    "Through the lips. Not on the tip.",
    voice(
      "Put something between you and the raw nerve.",
      "Layering is touch through lips, fabric, or another hand so the force spreads out.",
      "Direct on the tip can feel like too much — especially after an orgasm, or if she’s naturally extra-sensitive.",
      ["She winces or pulls away from skin-on-skin.", "It feels dry or scratchy — a layer fixes that instantly."]
    ),
    voice(
      "Diffuse force so more nerves fire and fewer get irritated.",
      "A tiny contact point concentrates pressure. A layer spreads it, which is often more pleasure and less sting.",
      "It’s also how you stay in contact after a climax without triggering a withdrawal reflex.",
      ["Hypersensitivity to direct skin.", "Friction without enough wetness."]
    )
  ),
  tech(
    11,
    "consistency",
    "essentials",
    "her",
    "Consistency",
    ["hood"],
    "Lock these four",
    [
      kind("Speed", "The same beat. The urge to go faster is the cue to stay."),
      kind("Pressure", "The same weight. Not a fidget."),
      kind("Path", "The same tiny track. If you lose it, stop and let her put you back."),
      kind("Surface", "The same bit of finger. Don’t roll onto a nail because you’re tired."),
    ],
    "Hold it",
    [
      step("Spot it", "Late climb", "Fast breath, still hips, that focused look. That’s the lock point.", 120),
      step("Freeze", "Don’t improve it", "Wrist, fingers, arm. No speeding up.", 180),
      step("Drive", "From the body", "Hand tired? Move from core or shoulder so the contact never changes.", 180),
      step("Ride", "Through", "Same stroke from the first clench until it’s over.", 120),
    ],
    "Held when",
    "Don’t you dare change that.",
    voice(
      "When it is working, become boring on purpose.",
      "Consistency is freezing every variable once she’s close. Speed, pressure, path, which bit of your finger.",
      "Most good things get stolen by a partner who means well and ‘helps’ by going faster.",
      ["The climb is a smooth arch.", "Her hips push up to pin themselves against you."]
    ),
    voice(
      "Don’t break the summation right before climax.",
      "Late in the climb the spinal cord is adding signals. A new speed or place forces it to start over, and arousal drops.",
      "Uninterrupted prediction is often what lets the contractions actually start.",
      ["No sudden dips.", "She locks herself onto the same contact."]
    )
  ),
  tech(
    12,
    "multiples",
    "essentials",
    "her",
    "Multiples",
    ["glans", "labia", "hood", "mons", "vulva"],
    "Three phases after",
    [
      kind("Soften, don’t leave", "The second the clenches finish, drop the pressure a lot. Stay on her. Still palm."),
      kind("Around, not on", "Extra lube. Feather circles on the outer lips. Avoid the tip while it stings."),
      kind("Climb again", "When sharp becomes a warm throb, spiral back in."),
    ],
    "Second-wave try",
    [
      step("Peak", "First one", "Ride the first orgasm with a locked stroke.", 180),
      step("0–15s", "Downshift", "Hand stays. Broad still palm on the mons.", 30),
      step("15–60s", "Sweep", "More lube. Soft wide circles on the far outer lips.", 90),
      step("1–3m", "In again", "If she can take it, closer and a bit faster.", 180),
      step("3–5m", "Second", "Hips pushing in? Lock the stroke again.", 120),
    ],
    "Safe to climb when",
    "Don’t leave. Just go lighter.",
    voice(
      "The second wave lives in the 90 seconds after the first.",
      "Multiples is staying with very light touch after she comes, instead of pulling away or going as hard as before.",
      "The tissue is still full of blood. Soft contact can keep that, so a second peak is possible. Hard contact usually isn’t.",
      ["Too-sharp turns back into a warm throb.", "Hips push into you instead of away."]
    ),
    voice(
      "Stay in the post-climax window before blood drains.",
      "Immediately after, erectile tissue is at its fullest. Soft touch keeps it there. Intensity has to match a new, lower threshold.",
      "A second peak also stacks the feel-good chemistry — deeper drop afterward.",
      ["Tissue stays swollen, not back to baseline.", "Hypersensitivity recedes."]
    )
  ),
  tech(
    13,
    "angling",
    "penetration",
    "her",
    "Angling",
    ["front-wall", "entrance", "clit-body"],
    "Three angles",
    [
      kind("Hips up", "Pillow under her lower back. Entry aims toward her belly, dragging the front wall."),
      kind("A little sideways", "One hip higher, or aim 30 degrees left or right."),
      kind("Toward the tailbone", "Angle down, not at the belly. Some bodies want that more than the front wall."),
    ],
    "10-minute try",
    [
      step("0–3", "Set up", "Pillow under hips. Lots of lube. Slow in until you feel the front wall.", 180),
      step("3–6", "Short strokes", "One to two inches. Stay in contact with that wall. Don’t piston the middle.", 180),
      step("6–8", "Sides", "Without pulling out, 60 seconds left, 60 seconds right. Notice which sings.", 120),
      step("8–10", "Lock it", "The best angle. Hips still. Steady through if she wants that.", 120),
    ],
    "Working when",
    "Tilt up and stay. Don’t keep searching.",
    voice(
      "Aim at a wall. Stop thrusting through empty space.",
      "Angling is tilting so what’s inside actually rubs a wall — usually the front one, toward the belly.",
      "When she’s turned on, the canal opens up. Straight in-and-out can miss everything that feels like much.",
      ["Generic pressure becomes a specific ‘there.’", "A smooth drag, not a glide through nothing."]
    ),
    voice(
      "Direct force into the internal clitoris and front wall.",
      "The clitoris’s hidden legs run along the front vaginal wall. A pillow tilt aims into that, plus the spongy tissue often called the G-spot.",
      "A tented canal has dead space in the middle. Angle keeps wall friction continuous.",
      ["Targeted internal focus.", "Firm tissue contact instead of empty thrusting."]
    )
  ),
  tech(
    14,
    "rocking",
    "penetration",
    "her",
    "Rocking",
    ["mons", "glans", "hood"],
    "Three rocks",
    [
      kind("Circles", "All the way in. Base pressed to the mons. Tiny hip circles — about an inch."),
      kind("Side to side", "Full depth. Sway so the sides of the opening get the pressure."),
      kind("Tilt", "Tuck the tailbone to press the front wall, slight arch for the back. Don’t pull out."),
    ],
    "10-minute try",
    [
      step("0–2", "In and parked", "Comfortable full in. Slide forward until you’re on the mons and clitoris.", 120),
      step("2–5", "Sway", "Slow side to side. Feel the walls, not more depth.", 180),
      step("5–8", "Circles", "Small rolls. The outside contact never leaves.", 180),
      step("8–10", "Weight", "Keep the downward press on the mons plus micro-rolls.", 120),
    ],
    "Working when",
    "Grind on me. Don’t pull out.",
    voice(
      "Stay in. Sway. Stop making a hallway of it.",
      "Rocking is all the way in, then hips moving, no in-and-out. The base of the body or toy stays on the clitoris.",
      "Pulling out on every stroke takes the pressure off everything that was working. A grind keeps both inside and outside.",
      ["Deep warm fullness, not a scrape.", "She doesn’t need a spare hand on the clitoris."]
    ),
    voice(
      "Constant contact instead of a withdrawal stroke.",
      "Staying fully in keeps compressing internal tissue and the pubic bone on the external clitoris at once.",
      "You also skip a lot of friction wear. Deep pressure nerves like a still-ish load more than a piston.",
      ["Pelvic warmth without sharp friction.", "Inside and the tip together without extra hands."]
    )
  ),
  tech(
    15,
    "pairing",
    "penetration",
    "her",
    "Pairing",
    ["hood", "glans", "front-wall"],
    "Three pairings",
    [
      kind("A hand", "Whatever is inside stays simple. A lubricated hand circles the hood."),
      kind("A small toy", "Bullet or air-pulse on the clitoris, low to medium, while inside keeps a steady pace."),
      kind("The body", "A position where the pubic bone stays on the clitoris every stroke — a grind, or her on top."),
    ],
    "10-minute try",
    [
      step("0–3", "Inside first", "Slow inside only. Let her get wet and warm.", 180),
      step("3–5", "Add outside", "Lube on the hood. Gentle circles. Don’t change the inside pace.", 120),
      step("5–8", "Match", "Same tempo inside and out.", 180),
      step("8–10", "Lock both", "Near the edge, freeze both. Don’t drop the hand.", 120),
    ],
    "Working when",
    "Don’t stop the hand when you go in.",
    voice(
      "Inside and the clitoris, on purpose, at the same time.",
      "Pairing is not ‘foreplay then penetration.’ Plenty of women need both, and the hand is not optional flavouring.",
      "Get the outside rhythm first if you have to choose. Losing the clitoris when you go in is the usual miss.",
      ["It builds faster than either alone.", "It feels complete, not like two unrelated jobs."]
    ),
    voice(
      "Fire two nerve routes at once.",
      "External clitoral touch and internal pressure travel different nerves. Together they lower the threshold for orgasm.",
      "You also sandwich the clitoris — tip from outside, hidden body from the front wall.",
      ["Faster climb than either channel alone.", "Full-spectrum sensation, inside linked to outside."]
    )
  ),
  tech(
    16,
    "levering",
    "penetration",
    "her",
    "Levering",
    ["entrance", "clit-body", "perineum", "front-wall"],
    "Three levers",
    [
      kind("Up", "Only an inch or two in. Press up against the top of the opening the whole time."),
      kind("Down", "Press toward the perineum — the skin between vagina and anus."),
      kind("Sides", "Push left, then right, in a firm crescent. The clitoris has legs along those walls."),
    ],
    "10-minute try",
    [
      step("0–2", "Just in", "One to two inches. Pause. Lube and comfort first.", 120),
      step("2–5", "Up", "Firm up-pressure. Slow one-inch slides, never dropping that lift.", 180),
      step("5–8", "Sides", "Five strokes left, five right.", 180),
      step("8–10", "Drag out", "Keep the upward press on the way out.", 120),
    ],
    "Working when",
    "Press up against the entrance. Stay shallow.",
    voice(
      "Use what’s inside as a lever on the doorway.",
      "Levering is pressing out against the opening, not aiming for depth. The first inch is where most of the feeling is.",
      "Deep isn’t automatically better. For a lot of bodies, the doorway is the instrument.",
      ["Sensation is right at the opening, not lost inside.", "Muscles pulse against the stretch."]
    ),
    voice(
      "Load the nerve-dense outer third and the clitoral legs.",
      "Almost all vaginal touch receptors sit in the outer third. Side pressure also hits the crura running beside the opening.",
      "An outward press stretch-reflexes the pelvic floor, which can make it more responsive.",
      ["Focus at the introitus, not the vault.", "Involuntary pulsing against the stretch."]
    )
  ),
  tech(
    17,
    "shallowing",
    "penetration",
    "her",
    "Shallowing",
    ["entrance", "labia", "hood", "vulva"],
    "Three shallow strokes",
    [
      kind("In and almost out", "Less than an inch in, almost fully out. That’s the whole stroke."),
      kind("Circle the ring", "Fingertip just inside. Small circles around the inner rim. No depth."),
      kind("Flutter", "Tiny fast pulses right at the opening."),
    ],
    "10-minute try",
    [
      step("0–3", "Tip only", "Lots of lube. First knuckle or first inch. All motion at the doorway.", 180),
      step("3–6", "Glides", "Half an inch to an inch and a half. The ring is the whole job.", 180),
      step("6–8", "Plus up", "Same shallow glide, pressed up along the roof. Never past an inch and a half.", 120),
      step("8–10", "Flutter", "Quick little pulses at the rim if she wants speed.", 120),
    ],
    "Working when",
    "Stay shallow. I will take more if I want it.",
    voice(
      "The first two inches are the instrument.",
      "Shallowing is staying at the entrance on purpose. Deep is optional, and often less interesting than people think.",
      "Every shallow stroke also tugs the inner lips and hood, so the clitoris gets a little pull without a second hand.",
      ["Sharp and nice — no deep ache.", "The opening looks fuller."]
    ),
    voice(
      "Put 100% of movement where the nerves actually are.",
      "The inner two-thirds of the vagina have far fewer touch receptors. Shallowing also avoids slamming the cervix.",
      "Entrance movement traction the hood, so you get indirect clitoral input for free.",
      ["No cervical ache.", "Outer lips and the ring swell from local blood flow."]
    )
  ),
  tech(
    18,
    "outstroking",
    "penetration",
    "her",
    "Outstroking",
    ["entrance", "front-wall"],
    "Three outstrokes",
    [
      kind("Slow in, drag out", "Three seconds in with almost no pressure. One second out with a firm drag."),
      kind("Hook on the way out", "In easy. Out with an upward pull along the front wall until you almost leave."),
      kind("Pause at the door", "Stop two seconds at the opening before going back in."),
    ],
    "10-minute try",
    [
      step("0–3", "Strip the in-stroke", "Inward is a light reset. All the meaning is on the way out.", 180),
      step("3–6", "Uneven timing", "Three seconds in, one second out with drag.", 180),
      step("6–8", "Hook", "Every exit pulls up along the front wall and the front of the opening.", 120),
      step("8–10", "Pause", "One-second stop at the exit each time.", 120),
    ],
    "Working when",
    "Slow in. Drag out.",
    voice(
      "The good part is the way out.",
      "Outstroking puts the attention on withdrawal. Inward can be almost nothing. Outward is the stroke.",
      "Pushing in hard often makes muscles brace. A drag out stretches the opening instead, which a lot of people feel more.",
      ["She’s waiting for the exit, not the thrust.", "The pull draws wetness across the opening."]
    ),
    voice(
      "Stretch the entrance nerves instead of compressing them.",
      "Inward compresses tissue; outward opens it — different receptors. Heavy inward thrusts also trigger guarding.",
      "A hooked exit keeps front-wall contact on the way out, which is where a lot of internal feeling lives.",
      ["Anticipation lives on withdrawal.", "Lubrication drag across the rim."]
    )
  ),
  tech(
    19,
    "adding",
    "penetration",
    "her",
    "Adding",
    ["entrance", "front-wall", "pelvic-floor"],
    "Three widths",
    [
      kind("One first", "One well-lubed finger or a slim toy until everything is soft and wet."),
      kind("Slide a second", "Extra lube. Second finger beside the first. Hold still 30 seconds. Don’t thrust."),
      kind("Open a little", "Once that’s easy, a gentle V to press more than one wall at once."),
    ],
    "Adding try",
    [
      step("0–4", "One", "Light, steady, one point. Wait until she’s clearly ready.", 240),
      step("4–6", "Two", "Pause. Extra lube. Second point in. Still for 30 seconds.", 120),
      step("6–8", "Fill, don’t pump", "Rock or angle. No in-and-out required.", 120),
      step("8–10", "Stay wide", "Keep the extra width. Steady press toward the belly if she likes it.", 120),
    ],
    "Safe when",
    "Stay. Let me take the extra.",
    voice(
      "Width after the body has asked for it.",
      "Adding is more fullness — another finger, more girth — only once she’s already open and wet. Never as a first move.",
      "Fullness is a different feeling from thrusting. A lot of people want the stretch, not more speed.",
      ["The first thing glides in with no fight.", "The opening feels soft, not a clenched ring."]
    ),
    voice(
      "Meet tissue after it has expanded.",
      "Arousal relaxes the walls and fills them with blood, so more width can be comfortable later that wouldn’t be at the start.",
      "Extra girth loads stretch receptors on more than one wall at once — fullness, not just in-and-out friction.",
      ["Zero resistance and plenty of lubrication.", "The entrance ring is open under touch."]
    )
  ),
  tech(
    20,
    "breath-sync",
    "amplify",
    "both",
    "Breath-Sensation Syncing",
    ["pelvic-floor"],
    "Three breaths",
    [
      kind("In with the press", "Four-second nose inhale as a stroke or pressure starts. Let the belly go."),
      kind("Out with the release", "Six-second mouth exhale as you ease or pull back. A sigh is allowed."),
      kind("Hold at the top", "At the strongest moment, hold two seconds, then let it go."),
    ],
    "10-minute try",
    [
      step("0–3", "Just breath", "No sex yet. Hand on chest, hand on belly. Four in, six out.", 180),
      step("3–6", "Match", "Light touch or slow inside. In on the in-stroke, out on the out-stroke.", 180),
      step("6–8", "Longer sighs", "Exhales 6–8 seconds. Still pressure or a slow rock.", 120),
      step("8–10", "Hold", "Deep inhale on the climb, two-second hold at max, slow out.", 120),
    ],
    "Working when",
    "Breathe me in. Sigh me out.",
    voice(
      "Put the stroke on the breath so the body can follow.",
      "You line up inhales and exhales with the movement. It sounds soft. It actually changes how tight the pelvis is.",
      "People often hold their breath when it feels good, which makes muscles clamp. A long exhale is the unlock.",
      ["The pelvic floor lets go on its own.", "Warmth spreading on the out-breath."]
    ),
    voice(
      "Use breath to switch the autonomic gear.",
      "Inhale leans the body toward arousal-readiness. Exhale leans it toward blood flow and less clamp. The diaphragm and pelvic floor move together.",
      "Steady breathing also turns tactile volume up — the brain gates sensation less aggressively.",
      ["Frictionless, unclenched contact.", "Pelvic warmth and skin tingling on exhales."]
    )
  ),
  tech(
    21,
    "dynamic-tension",
    "amplify",
    "her",
    "Dynamic Tension & Relaxation",
    ["pelvic-floor", "vulva"],
    "Three squeezes",
    [
      kind("Pelvic pulse", "Squeeze inside for 3 seconds, then fully drop for 6. Touch never stops."),
      kind("Thighs and glutes", "Squeeze legs and bum 5 seconds during a still press, then melt flat."),
      kind("Low belly", "A gentle brace, like the start of a sit-up, to push herself onto the touch — then release on the exhale."),
    ],
    "Tension try",
    [
      step("0–3", "Baseline", "Steady circles or shallow inside. No squeezing yet.", 180),
      step("3–6", "3 and 6", "Every 30 seconds: 3-second squeeze, 6-second drop. Touch stays.", 180),
      step("6–8", "Whole lower body", "Pelvis, glutes, thighs together 5 seconds, then everything goes.", 120),
      step("8–10", "Little pulses", "Near the edge, one-second squeeze-and-drop, matching what’s coming.", 120),
    ],
    "Working when",
    "Squeeze. Now let the whole thing go.",
    voice(
      "Squeeze, then melt. The melt is the trick.",
      "She tenses on purpose — pelvic floor, thighs, bum — then drops it all while you keep touching.",
      "The second the squeeze lets go, the same touch often feels twice as much. That’s the point.",
      ["A surge right as she releases.", "Everything feels warmer and fuller after a drop."]
    ),
    voice(
      "Post-squeeze, the muscle goes slacker than baseline.",
      "A brief voluntary clench is followed by extra relaxation and a fresh blood rush into the tissue.",
      "The on/off also stops nerves going numb from a single steady state.",
      ["Intensity jumps on release.", "Labia and clitoris feel firmer afterward."]
    )
  ),
  tech(
    22,
    "edging-contrast",
    "amplify",
    "her",
    "Edging & Temperature/Texture",
    ["hood", "mons", "vulva"],
    "Three contrasts",
    [
      kind("Warm then cool", "Warm hand or lube, then a brief cool touch on the hood or inner thighs."),
      kind("Smooth then textured", "Silk or very smooth first. Something with a bit of ridge once she’s swollen."),
      kind("Fast then nothing", "Up to 85–90%, then one still, light (or cool) contact for 30 seconds."),
    ],
    "10-minute try",
    [
      step("0–3", "Warm and smooth", "Steady. About 70%.", 180),
      step("3–5", "Stop and cool", "At 85%, halt. Cool breath or cool object 30 seconds.", 120),
      step("5–7", "Different texture", "A bit firmer or more textured, up toward 90%.", 120),
      step("7–8", "Still palm", "Stop. Warm hand on the mons, 45 seconds.", 60),
      step("8–10", "Through", "Warm, wet, fast enough. Let it finish.", 120),
    ],
    "Working when",
    "Stop. Cool. Come back warmer.",
    voice(
      "Stop at the cliff. Change the weather. Climb again.",
      "This is edging plus contrast — warm/cool, smooth/textured, fast/still. Not the same as the simpler Edging card.",
      "The stop keeps her close. The new temperature or texture makes the next climb feel like a different body.",
      ["It feels bigger than the one spot you’re touching.", "A flush on chest or neck."]
    ),
    voice(
      "Plateau plus new sensory channels.",
      "Repeated near-orgasm holds dopamine up. Heat and cold use different skin channels; textures wake different touch receptors.",
      "Dropping to stillness at the edge, then returning, is a second instrument on top of ordinary edging.",
      ["Whole-body sensation.", "Visible sex flush."]
    )
  ),
  tech(
    23,
    "mapping",
    "amplify",
    "both",
    "Erogenous Mapping & Linking",
    ["sacrum", "vulva", "hood"],
    "Three other maps",
    [
      kind("Lower back", "Firm warm circles on the sacrum — the bone just above the tailbone — while genital touch happens."),
      kind("Inner thighs", "Light traces up the inner thigh lines, toward the vulva, without hopping to the clitoris yet."),
      kind("Neck", "Clitoral or inside touch plus breath, a light bite, or a stroke along the side of the neck."),
    ],
    "10-minute try",
    [
      step("0–3", "No genitals", "Neck, lower back, inner arms, inner thighs. Find what lights up.", 180),
      step("3–6", "Hold the winner", "Steady warm pressure on the best non-genital spot.", 180),
      step("6–8", "Add the clit", "Keep that hand. Other hand starts slow circles or gentle inside.", 120),
      step("8–10", "Same beat", "Both hands, same tempo, through if she wants.", 120),
    ],
    "Working when",
    "Keep your hand on my lower back. Don’t leave that.",
    voice(
      "The clitoris is not the only map. Link another country to it.",
      "Mapping is finding a second place that wakes her up — lower back, inner thigh, neck — then touching it at the same time as the genitals.",
      "The brain files those body parts next to each other. Touch both and the genital feeling often spreads.",
      ["Goosebumps from genital touch.", "The clit feeling seems to echo in the other spot."]
    ),
    voice(
      "Overflow across neighbouring sensory maps.",
      "Genitals, inner thighs, and lower back sit beside each other on the brain’s body map, and they share sacral nerves.",
      "Soft skin touch (neck, inner arms) also drops stress chemistry so genital nerves listen better.",
      ["Piloerection along arms or back.", "Less localised genital sensation — it radiates."]
    )
  ),
  tech(
    24,
    "vocalization",
    "amplify",
    "both",
    "Vocalization & Biofeedback",
    ["pelvic-floor"],
    "Three sounds",
    [
      kind("Low hum", "Mouth closed, jaw soft. Lowest comfortable ‘mmm’ on the exhale. Feel it in the chest."),
      kind("Open ah", "Jaw dropped, teeth apart. A real sigh, not a performance."),
      kind("On the beat", "Short sounds matching the stroke. Not a show — a metronome."),
    ],
    "Voice try",
    [
      step("0–2", "Unlock the jaw", "Before touch: mouth open, three deep sighs.", 120),
      step("2–5", "Hum", "Baseline touch. Five-second low hum every exhale.", 180),
      step("5–8", "Open", "Switch to ‘ah.’ Teeth don’t touch.", 180),
      step("8–10", "Let it", "Sound can get louder through a peak. That’s a valve, not a review.", 120),
    ],
    "Working when",
    "Don’t swallow the sound. Let it out.",
    voice(
      "Open the throat so the pelvic floor can open too.",
      "Sound is not for the audience. A clenched jaw reflexively clenches the pelvis. A low voice unclenches both.",
      "People also hold their breath when they’re close. Making a sound forces the air out.",
      ["No grinding teeth or tight neck.", "The movement stays smooth."]
    ),
    voice(
      "Vagus-linked voice, pelvic-floor co-regulation.",
      "Low-pitched vibration stimulates a calming nerve that also serves the throat. Embryologically, throat and pelvic sphincters are linked — jaw clamp, pelvic clamp.",
      "Vocalising also prevents arousal apnea, which otherwise dumps adrenaline into the climb.",
      ["Jaw and neck stay soft at high arousal.", "No tense interruptions in the rhythm."]
    )
  ),
  tech(
    25,
    "post-peak",
    "amplify",
    "both",
    "Post-Peak Sustained Touch",
    ["vulva", "glans", "mons", "hood"],
    "Three afters",
    [
      kind("Still palm", "The instant the clenches finish, stop rubbing. Open hand, light weight, over everything."),
      kind("Feathers", "Off the tip. Barely-there strokes on outer lips, inner thighs, lower belly."),
      kind("Parked buzz", "If you use a toy, lowest setting, still, on the pubic bone — not on the tip."),
    ],
    "After try",
    [
      step("0–30s", "Freeze", "Contractions done: don’t pull away. Full palm.", 30),
      step("0.5–3m", "Hold", "Hand still. Slow belly breaths together.", 150),
      step("3–6m", "Around", "Lift off the clitoris. Light strokes on thighs and hip bones.", 180),
      step("6–10m", "Again or rest", "If a second wave shows up, tiny circles or shallow. If not, stay in the hold.", 240),
    ],
    "Done well when",
    "Don’t go yet. Just your hand.",
    voice(
      "The two minutes after teach the body whether to come back.",
      "Post-peak touch is staying, softly, after she comes. Yanking the hand away can feel like a slap. Rubbing harder usually hurts.",
      "Still warmth lets the drop be a slide, not a cliff — and sometimes a second wave has somewhere to live.",
      ["A melt, not a flinch.", "The pelvis stays warm and comfortable."]
    ),
    voice(
      "Ease hypersensitivity and keep pelvic blood from dumping.",
      "Right after climax the nerves are exquisite. Abrupt zero is jarring; heavy friction overshoots. Warm static contact rides the oxytocin peak instead of wasting it.",
      "It also slows detumescence — the draining of blood — so the afterglow lasts.",
      ["No sharp drop-off.", "Pelvis stays engorged and easy for 10–15 minutes."]
    )
  ),
  tech(
    26,
    "clitoral-orgasm",
    "release",
    "her",
    "Clitoral Glans & Complex Orgasms",
    ["glans", "hood", "mons", "labia", "clit-body", "front-wall"],
    "Three shapes",
    [
      kind("On the hood", "Steady circles or a simple rhythm over the hood — not dry, not on the raw tip. Same beat through the clenches."),
      kind("The whole vulva", "A flat hand or wide toy across the mons and lips. Broader, warmer, less pinpoint."),
      kind("Both", "Outside stays going while something inside presses the front wall. Neither stops at the end."),
    ],
    "10-minute try",
    [
      step("0–3", "Around first", "Lube on the hood. Broad circles around, not on, the centre.", 180),
      step("3–6", "On the hood", "One or two strokes a second. Pressure only as she swells.", 180),
      step("6–8", "Lock", "Same tempo, same place. No ‘helpful’ changes.", 120),
      step("8–10", "Through", "When pulsing starts, identical friction until it’s over.", 120),
    ],
    "Close when",
    "Same beat. Through it.",
    voice(
      "Most orgasms start here. Learn the three shapes of that peak.",
      "A clitoral orgasm is the common one: the visible clitoris and the skin around it. The hood is usually the right surface. The raw tip is often too much.",
      "Going straight to the tip is why a lot of women say they’re ‘too sensitive.’ The tissue was never warmed, or the contact was too small and dry.",
      ["Rhythmic pulsing, including the anus, about once a second.", "The tip may tuck back under the hood right before."]
    ),
    voice(
      "High-density surface nerves, pudendal pathway.",
      "The glans is extremely nerve-rich. Signals run the pudendal nerve into the sacral cord and fire quick pelvic-floor pulses.",
      "Engorged bulbs lift the glans; the hood is the safe friction surface. Direct glans rubbing is what reads as ‘too sensitive.’",
      ["~0.8s rhythmic vulvar/anal pulses.", "Slight glans retraction at peak engorgement."]
    )
  ),
  tech(
    27,
    "deep-vaginal",
    "release",
    "her",
    "Deep Vaginal / G-Spot & Cervical",
    ["front-wall", "entrance", "clit-body", "pelvic-floor"],
    "Three insides",
    [
      kind("Front wall", "One to two inches in, toward the belly. A ‘come here’ hook. Slow, firm, not frantic."),
      kind("Deep and still", "Only once she’s already very turned on. Broad pressure at the far end. No slamming."),
      kind("The long drag", "A long outstroke that stays hooked up along the whole front wall."),
    ],
    "10-minute try",
    [
      step("0–3", "Warm first", "Do not start here cold. She needs to be clearly aroused or deep just aches.", 180),
      step("3–6", "Find the spongy bit", "Fingers or a curved toy 1.5–2 inches in, toward the belly. Slow upward presses.", 180),
      step("6–8", "The pee feeling", "Common. Don’t panic, don’t stop unless she says. Long exhales. Soften the pelvic floor.", 120),
      step("8–10", "Stay", "Less sliding. Firm still pressure or tiny rocks until the wave is low and heavy.", 120),
    ],
    "Close when",
    "Press up and stay. I’ll tell you if I need you to ease.",
    voice(
      "A heavier wave. It needs arousal first, then patience.",
      "This is pressure inside — usually the front wall a couple of inches in, sometimes deeper toward the cervix. It is not a hunt for a magic button.",
      "The ‘I need to pee’ feeling is often the nearby sponge, not a full bladder. If she hates it, stop. If she’s willing, relaxing into it is the technique.",
      ["A heavy warmth low in the belly, not a surface tickle.", "Longer, rolling waves rather than quick flutters at the opening."]
    ),
    voice(
      "Front-wall bulbs plus, sometimes, vagus-level deep pressure.",
      "The G-spot area is where internal clitoris, urethral sponge, and front wall meet — not a separate organ. Cervical pressure can trigger slower uterine contractions.",
      "Deep input uses different nerves than the external clitoris. It only feels good after tenting — the canal expanding with arousal.",
      ["Spreading deep pelvic warmth.", "Longer core waves, not just entrance pulses."]
    )
  ),
  tech(
    28,
    "blended-waves",
    "release",
    "her",
    "Blended, Squirting & Waves",
    ["glans", "hood", "front-wall", "pelvic-floor"],
    "Three advanced releases",
    [
      kind("Blended", "Outside rhythm on the clitoris and a firm inside press on the front wall. Both locked. Let them merge."),
      kind("If fluid happens", "Steady front-wall work. When she wants to push, she does not squeeze shut — she exhales and lets it. Towel down. No shame, no requirement."),
      kind("The next wave", "First orgasm ends: 15 seconds still and light, then slow circles or shallow. Don’t drop contact."),
    ],
    "Blended try",
    [
      step("0–4", "Set up", "She’s already highly aroused. Towel. Extra lube inside and out.", 240),
      step("4–7", "Both", "Steady inside on the front wall, light steady outside. One shared beat.", 180),
      step("7–9", "Let go", "Jaw soft, belly breath, pelvic holding gone. If fluid comes, keep moving unless she says stop.", 120),
      step("9–12", "Stay", "After the first peak: half speed, lighter, 20 seconds still, then rebuild if she wants.", 180),
    ],
    "Close when",
    "If I push, don’t stop. Just stay with me.",
    voice(
      "Two things at once. Then don’t drop the contact.",
      "Blended is inside and the clitoris peaking together. Squirting or ejaculation might happen with strong front-wall pressure — it also might not, and that’s not a grade. Waves are simply not leaving after the first one.",
      "None of this is a test. Towel, lube, and permission to stop are the technique as much as the hands.",
      ["A heavy fullness behind the pubic bone, sometimes an urge to push.", "Trembling in thighs or belly before a big release."]
    ),
    voice(
      "Two nerve routes, optional fluid, a non-refractory window.",
      "Blended work recruits external and internal pathways at once. Some fluid is a small gland release; a larger clear gush is often bladder fluid from pelvic spasm — both are normal, neither is required.",
      "Unlike a typical male refractory period, steady low-friction contact can carry remaining blood-fill into another wave.",
      ["Anterior fullness plus a push impulse.", "Whole-body shivering before autonomic release."]
    )
  ),
];
