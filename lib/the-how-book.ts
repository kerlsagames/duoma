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
  where: string,
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
    where,
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
    "Both of you, still in the room. No one is touching genitals yet. This is the buffer before sex, not the sex.",
    "Three ways to frame",
    [
      kind("A buffer", "Fifteen to thirty minutes off the day — shower, change, phones away — before any touch."),
      kind("Name the night", "Say what this is: “Just slow touch. Nothing to finish.” A text hours earlier counts."),
      kind("The room", "Warm light, comfortable temperature, quiet. Cold rooms make the body clamp."),
    ],
    "10-minute start",
    [
      step("0–3", "Clear the space", "Lights down. Laptop off the bed. Phones face-down in another room. The bed is for bodies, not the day.", 180),
      step("3–6", "Breathe down", "She lies on her back. One of your hands on her chest, one on her belly. Ten slow breaths together — belly rises, chest stays quiet.", 180),
      step("6–8", "Say the job", "Out loud, one sentence: nowhere to rush, nothing to finish, no one owes an orgasm.", 120),
      step("8–10", "Start far away", "Slow palms on her arms, neck, or shoulders. Stay off breasts, vulva, and penis. You are not starting sex yet.", 120),
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
    "Your two fingers on her vulva — the whole outside of her genitals, not inside the vagina. Lots of lube. You keep a simple stroke, then interrupt it on purpose.",
    "Four surprises",
    [
      kind("Pressure pivot", "Light tracing along the inner lips, then a firm still press on the mons (the padded mound above the clitoris) for five seconds — or the reverse."),
      kind("Texture switch", "Fingers, then silk, then a warm wet palm over the whole vulva. Change without telling her first."),
      kind("Jump the map", "Lift off her vulva. Touch the inner knee, collarbone, or ribs for a few seconds. Come back to the same stroke."),
      kind("The freeze", "Speed the stroke up. Then stop dead, fingers still on her. Hold 3–5 seconds. Let her throb against a still hand."),
    ],
    "10-minute try",
    [
      step("0–4", "Same stroke", "Two lubed fingers. Slow up-and-down along the inner lips, beside the clitoris — not on the exposed tip, not inside her. Same path, same pressure, until she settles.", 240),
      step("4–6", "Jump", "Every 45 seconds, lift off the vulva and rest on her inner thigh or lower belly for 3 seconds. Then the exact same up-and-down.", 120),
      step("6–8", "Press", "On her exhale, plant a firm still palm on the mons (the mound above the clitoris) for 5 seconds. Then back to feather-light fingers on the inner lips.", 120),
      step("8–10", "Freeze", "Same stroke, a little faster. At the fastest beat, freeze. Fingers stay on her. Hold until she gasps or her hips twitch.", 120),
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
    "Your hands on her thighs, belly, and the outside of her vulva. You do not land on the clitoris until the last two minutes. Not inside her.",
    "Four ways to hint",
    [
      kind("Hover", "One finger almost touching. Heat and air, not friction. Trace the outer lips and the mons. Do not land."),
      kind("The clock", "Touch 12 o’clock (the mons above the clitoris), then 3 and 9 (inner thighs). Never the centre of the vulva."),
      kind("Brush and leave", "One light half-second pass over the clitoral hood (the fold of skin covering the clitoris). Then 30–60 seconds back on her thighs."),
      kind("Through fabric", "Leave her underwear on. Circles with your palm or a toy over the cloth so the pressure spreads."),
    ],
    "10-minute try",
    [
      step("0–3", "Far away", "Palms on her lower back, hips, and outer thighs. Light fingertips on the inner thighs. Stay off the vulva.", 180),
      step("3–6", "Closer", "A warm still palm on the mons (the mound above the clitoris). Hover a finger over the outer lips so she feels heat, not contact. Do not land on the clitoris.", 180),
      step("6–8", "Brush", "Once a minute, one light pass over the clitoral hood. Lift off. Go back to thighs. Do not stay on it.", 120),
      step("8–10", "Land", "Now rest two fingers on the inner lips and just above the hood — the fold covering the clitoris. Steady contact. Still not on the raw tip, still not inside.", 120),
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
    "Your hands on her body, then her vulva. Fingers stay outside. You do not go inside the vagina on this card.",
    "Four stages",
    [
      kind("Far out", "Whole palms on her back, outer thighs, and belly. Not the pelvis, not the vulva."),
      kind("Bones", "Steady weight on her hip bones, the small of her back, and the mons (the mound above the clitoris). Still hands."),
      kind("Outer lips", "A warm wet palm cupping the whole vulva, or slow glides up and down the outer lips. Stay off the clitoral tip."),
      kind("Closer", "Fingers in the groove of the inner lips, then slow circles on the clitoral hood. Still not stabbing the exposed tip."),
    ],
    "10-minute try",
    [
      step("0–3", "Far", "Palms on her lower back, hips, and outer thighs. Skip the pelvis and skip the vulva.", 180),
      step("3–5", "Bones", "Warm still pressure on the mons and both hip bones. Hands do not rub. They rest.", 120),
      step("5–8", "Outer", "Lube on your palm. Glide up and down the outer lips and inner thighs. Stay off the clitoral tip.", 180),
      step("8–10", "Closer", "Two fingers in the inner lips. Then a slow circle on the clitoral hood — the fold of skin over the clitoris. Not on the raw tip. Not inside her.", 120),
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
    "Any genital touch you already know. She steers. You follow. This card is the language, not a new stroke.",
    "Three channels",
    [
      kind("Hand on hand", "Her hand on top of yours, on her vulva. She sets speed and pressure. You do not guess."),
      kind("Body codes", "Hips pushing into your hand = more. Hips pulling away = too much. A squeeze of your wrist or a held breath = stay exactly there."),
      kind("One word", "Yes. Lighter. Slower. Hold. Right there. Not a paragraph."),
    ],
    "Build the system",
    [
      step("Setup", "Calibrate", "On her inner arm or thigh — not the genitals yet — show Light, Medium, Firm so those words mean the same thing later.", 120),
      step("0–5", "Hands only", "First five minutes of direct vulva touch: her hand on yours. She moves your fingers. You copy.", 300),
      step("5–8", "One word", "Her hand comes off. You keep the last motion. She only speaks if something must change: lighter, stay, slower.", 180),
      step("8–10", "Body only", "If she is close, stop talking. Watch her hips and breath. Push-in means keep going. Pull-away means ease off, do not leave.", 120),
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
    "One or two lubed fingers on the sides of her clitoral hood — the fold of skin covering the clitoris. Not inside her. You pick one loop and repeat it.",
    "Four loops",
    [
      kind("Up and down", "One or two fingers along the sides of the hood, from the mons down to the base of the inner lips. Like stroking a small ridge, not poking a button."),
      kind("Figure-8", "Up one inner lip, across the mons, down the other lip, under the opening — fingers never lift off the skin."),
      kind("Pendulum", "Tiny side-to-side just above the clitoral tip, on the hood. Half an inch to an inch. That is the whole width of the stroke."),
      kind("Pulse", "Fingers still on the hood. Pulse down from your forearm. No rubbing. The skin does not slide."),
    ],
    "10-minute try",
    [
      step("0–2", "Pick one", "Lots of lube. Choose up-and-down along both sides of the clitoral hood. About one stroke a second. Stay off the raw tip.", 120),
      step("2–5", "A bit faster", "Same path, same two fingers, same pressure. Maybe 20% quicker. Do not wander onto the tip or inside her.", 180),
      step("5–8", "Hold it", "Do not change sides, speed, or shape. This boring minute is the one that builds.", 180),
      step("8–10", "Keep it", "If your hand tires, drive from the wrist or forearm so the contact on her hood never changes shape.", 120),
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
    "Two fingers circling the clitoral hood, same as Rhythm. You add one extra press at one point in the circle. Still not inside her.",
    "Three accents",
    [
      kind("The extra press", "On a 4-count circle around the hood, press a little harder at 1 (the top, toward the mons). Light for 2, 3, 4."),
      kind("The hang", "At the top of an up-stroke along the hood, pause half a second with fingers still on her, then sweep down."),
      kind("The edge", "Most of the loop uses the pad of the finger. At the bottom of the loop, below the clitoris, roll onto the fingertip for a sharper point."),
    ],
    "10-minute try",
    [
      step("0–3", "Plain circle", "Lube. Two fingertips make a smooth 4-count circle around the clitoral hood. Even pressure. No extra press yet. Not on the raw tip.", 180),
      step("3–6", "Press on 1", "Same circle. Extra weight only at the top, toward the mons. Counts 2–4 stay light.", 180),
      step("6–8", "Move it", "Same pulse, now at the bottom of the circle — just below the clitoris, toward the opening. Still not inside.", 120),
      step("8–10", "Press and hang", "Keep the extra press, and add a half-second pause on that accent as she climbs. Path does not change.", 120),
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
    "Your fingers on her clitoris (on the hood, not the raw tip). You take her close, then park a still palm on the mons instead of leaving her body.",
    "One cycle",
    [
      kind("Climb", "Steady up-and-down or circles on the clitoral hood until she’s about 90% — tight belly, fast breath, a sound she didn’t mean to make."),
      kind("Back off", "Do not take your hand off her. Flatten your palm on the mons (the mound above the clitoris), or stroke her inner thighs, 20–40 seconds."),
      kind("Rebuild", "Come back to the hood slower than you left. Do not jump to fast and direct on the tip."),
    ],
    "Three cycles",
    [
      step("1", "First edge", "Simple up-and-down on the clitoral hood. When her hips chase you and her breath snags, flatten a still palm on the mons. Wait 30 seconds. Hand stays.", 180),
      step("2", "Second", "Rebuild with slow circles around the hood. She will climb faster. At 90%, lift to inner-thigh strokes for 30–45 seconds.", 210),
      step("3", "Through", "Back to the same hood stroke. This time do not back off. Ride that exact motion through the orgasm.", 210),
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
    "Your fingertips circling around her clitoris, on the hood and lips. You never land on the tiny exposed tip. Not inside her.",
    "Four orbits",
    [
      kind("Wide", "A big circle on the vulva — mons, outer lips, the skin below the opening. About two inches across. The clitoris sits in the middle and you go around it."),
      kind("Tight", "A small circle around the clitoral hood. Around the base of the tip, not over the tip itself."),
      kind("Oval", "Down one inner lip, across the vaginal opening (do not go in), up the other inner lip, over the top of the hood."),
      kind("Crescent", "Just the top half of the hood, 9 o’clock to 3 o’clock and back. Never the 6 o’clock underside yet."),
    ],
    "10-minute try",
    [
      step("0–3", "Wide", "Lots of lube. Two fingers. Big slow circles around the whole vulva, about one circle every two seconds. Go around the clitoris. Do not land on it.", 180),
      step("3–6", "Tight", "Spiral in until you are circling the clitoral hood — the fold over the clitoris. Light to medium. Still around the tip, not on it.", 180),
      step("6–8", "Oval", "Lengthen the circle down each inner lip and across the opening without going inside.", 120),
      step("8–10", "Crescent", "Smaller, quicker arcs just across the top of the hood, 9 to 3 o’clock. If she winces, widen again.", 120),
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
    "Your hand on her clitoris, with her outer lips or her underwear between you and the raw tip. You are cushioning the nerve, not going inside.",
    "Three layers",
    [
      kind("Fold the lips", "Gently pinch her outer lips together so they cover the clitoris. Stroke the outside of that cushion. You never touch the tip skin-on-skin."),
      kind("Through fabric", "Leave underwear on. Palm or a small toy on top of the cloth, over the clitoris."),
      kind("Hand on hand", "Your still palm cups the whole vulva. Movement happens on the back of that hand, so the clitoris feels pressure through your palm."),
    ],
    "Layering try",
    [
      step("0–5", "Fabric", "Underwear stays on. Palm circles over the cloth, right over the clitoris. Build here. No bare skin yet.", 300),
      step("5–8", "Skin, then fold", "If you go skin-on-skin and she flinches, fold the outer lips over the clitoris and keep stroking that fold. Do not chase the tip.", 180),
      step("8–10", "After", "If she comes, do not touch the tip. Whole-hand cushion on the vulva, light weight, no rubbing.", 120),
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
    "Whatever stroke is already working on her clitoral hood. You freeze speed, pressure, path, and which bit of your finger. You do not invent a new move.",
    "Lock these four",
    [
      kind("Speed", "The same beat on the hood. The urge to go faster is the cue to stay."),
      kind("Pressure", "The same weight of finger. Not a fidget, not a grind that keeps getting heavier."),
      kind("Path", "The same tiny track — usually a centimetre on one side of the hood. If you lose it, stop and let her put your finger back."),
      kind("Surface", "The same bit of finger. Don’t roll onto a nail because you’re tired."),
    ],
    "Hold it",
    [
      step("Spot it", "Late climb", "You are already on the clitoral hood. Fast breath, still hips, that focused look. That is the lock point. Do not change now.", 120),
      step("Freeze", "Don’t improve it", "Wrist, fingers, arm stay as they are. No speeding up. No circling a new place.", 180),
      step("Drive", "From the body", "Hand tired? Move from your core or shoulder so the fingertip on her hood never changes.", 180),
      step("Ride", "Through", "Same millimetre of skin, same stroke, from the first pelvic clench until the orgasm is over.", 120),
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
    "Your hand stays on her vulva after she comes. You drop the pressure a lot. You do not pull away, and you do not keep rubbing the tip.",
    "Three phases after",
    [
      kind("Soften, don’t leave", "The second the pulsing finishes, drop the pressure a lot. Stay on her. Still palm over the whole vulva."),
      kind("Around, not on", "Extra lube. Feather circles on the outer lips only. Avoid the clitoral tip while it stings."),
      kind("Climb again", "When sharp becomes a warm throb, spiral back in toward the hood. Same light touch."),
    ],
    "Second-wave try",
    [
      step("Peak", "First one", "Ride the first orgasm with a locked stroke on the clitoral hood. Do not change it mid-clench.", 180),
      step("0–15s", "Downshift", "Hand stays. Broad still palm on the mons and whole vulva. No rubbing the tip.", 30),
      step("15–60s", "Sweep", "More lube. Soft wide circles on the far outer lips only. Skip the clitoris.", 90),
      step("1–3m", "In again", "If she can take it, spiral closer to the hood and a bit faster. If she flinches, stay wide.", 180),
      step("3–5m", "Second", "Hips pushing into your hand? Lock that stroke again and ride a second orgasm.", 120),
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
    "Penis, a toy, or two fingers inside her vagina. You tilt so you rub the front wall — toward her belly button — instead of thrusting into empty space.",
    "Three angles",
    [
      kind("Hips up", "A pillow under her lower back. Entry aims toward her belly button, dragging the front vaginal wall on every short stroke."),
      kind("A little sideways", "Lift one of her hips, or aim 30 degrees left or right of centre. Some bodies only sing off-centre."),
      kind("Toward the tailbone", "Angle down, toward her tailbone, not at the belly. Stay there if that is the wall she wants."),
    ],
    "10-minute try",
    [
      step("0–3", "Set up", "Pillow under her hips. Lots of lube. Slow in until the head, toy, or fingertips press the front wall — the vaginal wall toward her belly, a couple of inches in. Not a slam to the cervix.", 180),
      step("3–6", "Short strokes", "One to two inches of movement. Stay in contact with that front wall. Do not piston through the middle of the canal.", 180),
      step("6–8", "Sides", "Without pulling out, 60 seconds aimed a little left, 60 seconds a little right. Notice which one makes her sound or grab you.", 120),
      step("8–10", "Lock it", "Stay on the best angle. Hips almost still. Short grind, not a long thrust. Hold it if she is climbing.", 120),
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
    "Penis or a toy all the way inside. Your pubic bone stays pressed to her mons and clitoris. You grind in tiny circles. You do not pull out.",
    "Three rocks",
    [
      kind("Circles", "All the way in. Base of the penis or toy pressed to her mons and clitoris. Tiny hip circles — about an inch. No in-and-out."),
      kind("Side to side", "Full depth. Sway so the sides of the vaginal opening get the pressure. The clitoris stays pinned under you."),
      kind("Tilt", "Tuck your tailbone to press her front wall, then a slight arch for the back wall. Don’t pull out."),
    ],
    "10-minute try",
    [
      step("0–2", "In and parked", "Comfortable full in. Slide your body forward until your pubic bone is on her mons and clitoris. Stay there.", 120),
      step("2–5", "Sway", "Slow side to side. Feel the vaginal walls, not more depth. The clitoris stays under your pubic bone.", 180),
      step("5–8", "Circles", "Small hip rolls, about an inch. The outside contact on her clitoris never leaves.", 180),
      step("8–10", "Weight", "Keep that downward press on the mons plus micro-rolls. If you start thrusting, you are doing a different card.", 120),
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
    "Something inside her vagina (penis, toy, or two fingers) plus your other hand on her clitoris. Both at once. The hand is not optional.",
    "Three pairings",
    [
      kind("A hand", "Whatever is inside stays simple — slow, even strokes. Your other, lubricated hand circles the clitoral hood."),
      kind("A small toy", "A bullet or air-pulse toy on the clitoris, low to medium, while inside keeps a steady pace. Do not crank the toy up as a substitute for staying on the spot."),
      kind("The body", "A position where your pubic bone stays on her clitoris every stroke — a grind, or her on top rocking, not bouncing."),
    ],
    "10-minute try",
    [
      step("0–3", "Inside first", "Slow penis, toy, or fingers inside only. Let her get wet and warm. No clitoral hand yet.", 180),
      step("3–5", "Add outside", "Lube on the clitoral hood. Gentle circles with two fingers. Do not speed up or change the inside stroke.", 120),
      step("5–8", "Match", "Same tempo inside the vagina and on the clitoris. If you have to drop one, drop the inside, not the hand.", 180),
      step("8–10", "Lock both", "Near the edge, freeze both: same inside depth, same finger circle. Do not drop the hand when she starts to come.", 120),
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
    "Only the first inch or two of penis, toy, or fingers inside her vagina. You press out against the opening, like a lever, instead of aiming for depth.",
    "Three levers",
    [
      kind("Up", "Only an inch or two in. Press up against the top of the vaginal opening the whole time — toward her belly, not toward her cervix."),
      kind("Down", "Press toward the perineum — the stretch of skin between the vaginal opening and the anus."),
      kind("Sides", "Push left, then right, in a firm crescent. The clitoris has hidden legs along those walls."),
    ],
    "10-minute try",
    [
      step("0–2", "Just in", "One to two inches of penis, toy, or two fingers. Pause. Extra lube. Comfort first. Do not go deeper to ‘get to it.’", 120),
      step("2–5", "Up", "Firm up-pressure against the top of the opening. Slow one-inch slides, never dropping that lift. You are prying the doorway, not thrusting.", 180),
      step("5–8", "Sides", "Five short strokes pressing the left wall, five pressing the right. Stay shallow.", 180),
      step("8–10", "Drag out", "On the way out, keep the upward press so the head or fingers drag the front of the opening.", 120),
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
    "The head of the penis, a toy, or a fingertip at the vaginal opening. Almost no depth. The first inch is the whole job.",
    "Three shallow strokes",
    [
      kind("In and almost out", "Less than an inch in, almost fully out. That’s the whole stroke. You are working the opening, not the canal."),
      kind("Circle the ring", "Fingertip just inside the vagina. Small circles around the inner rim. No depth."),
      kind("Flutter", "Tiny fast pulses right at the opening — the head or fingertip tapping the ring, not plunging."),
    ],
    "10-minute try",
    [
      step("0–3", "Tip only", "Lots of lube. First knuckle of a finger, or the first inch of penis or toy. All motion at the vaginal opening. Do not go looking for more room.", 180),
      step("3–6", "Glides", "Half an inch in to an inch and a half. The ring of muscle at the entrance is the whole job.", 180),
      step("6–8", "Plus up", "Same shallow glide, pressed up along the roof of the opening. Never past an inch and a half.", 120),
      step("8–10", "Flutter", "If she wants speed, quick little pulses at the rim. If she wants you deeper, she will pull you in. You do not decide that.", 120),
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
    "Penis, toy, or fingers going in and out. The stroke that counts is the pull out — a drag along the front wall — not the thrust in.",
    "Three outstrokes",
    [
      kind("Slow in, drag out", "Three seconds in with almost no pressure. One second out with a firm drag along the front wall and the opening."),
      kind("Hook on the way out", "In easy. Out with an upward pull along the front wall (toward her belly) until you almost leave."),
      kind("Pause at the door", "Stop two seconds with just the head or fingertips at the opening before going back in."),
    ],
    "10-minute try",
    [
      step("0–3", "Strip the in-stroke", "Inward is a light reset — almost nothing. All the meaning is on the way out, dragging the front wall and the opening.", 180),
      step("3–6", "Uneven timing", "Three seconds in, one second out with that drag. She should be waiting for the exit, not the thrust.", 180),
      step("6–8", "Hook", "Every exit pulls up along the front wall and the front of the opening, toward her belly, until you almost leave.", 120),
      step("8–10", "Pause", "One-second stop at the exit each time, head or fingers still kissing the opening.", 120),
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
    "Fingers inside her vagina. One well-lubed finger first. A second finger only after she is wet and open. This is width, not faster thrusting.",
    "Three widths",
    [
      kind("One first", "One well-lubed finger, pad toward her belly, until everything is soft and wet. No second finger yet."),
      kind("Slide a second", "Extra lube. Second finger beside the first. Hold still 30 seconds. Don’t thrust."),
      kind("Open a little", "Once that’s easy, a gentle V with those two fingers to press more than one wall at once."),
    ],
    "Adding try",
    [
      step("0–4", "One", "One finger, slow, pad toward her belly. Wait until she is clearly wet and the opening is not fighting you.", 240),
      step("4–6", "Two", "Pause. Extra lube. Second finger in beside the first. Hold still 30 seconds. Do not pump.", 120),
      step("6–8", "Fill, don’t pump", "Tiny rocks or a slight angle toward the belly. No in-and-out required. Let her feel the stretch.", 120),
      step("8–10", "Stay wide", "Keep both fingers. Steady press toward the belly if she likes it. If she tenses, go back to one.", 120),
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
    "Your fingers on her clitoris (slow circles on the hood), or slow sex if you are already inside. You both breathe on a count. The stroke follows the breath.",
    "Three breaths",
    [
      kind("In with the press", "Four-second nose inhale as your fingers press or the in-stroke starts. Her belly goes soft, not sucked in."),
      kind("Out with the release", "Six-second mouth exhale as you ease the fingers or pull back. A sigh is allowed."),
      kind("Hold at the top", "At the strongest moment of the stroke, hold the breath two seconds, then let it go."),
    ],
    "10-minute try",
    [
      step("0–3", "Just breath", "No genital touch yet. One hand on her chest, one on her belly. Four seconds in through the nose, six out through the mouth.", 180),
      step("3–6", "Match", "Now two fingers, slow circles on the clitoral hood. Inhale as you press, exhale as you ease. If you are already inside, in on the in-stroke, out on the out-stroke — stay slow.", 180),
      step("6–8", "Longer sighs", "Exhales 6–8 seconds. Keep the same circles or a slow rock. Do not speed up because it feels good.", 120),
      step("8–10", "Hold", "Deep inhale on the climb, two-second hold at the strongest press, slow out. Fingers stay on the hood.", 120),
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
    "You: two fingers, slow circles around her clitoral hood — the fold of skin covering the clitoris. Not inside her, not on the raw tip. She: squeezes the muscles she’d use to stop a pee, then lets them go. You do not squeeze her.",
    "Three squeezes",
    [
      kind("Pelvic pulse", "She squeezes those pee-stopping muscles inside — not her abs, not her thighs — for 3 seconds, then lets them go slack for 6. Your two fingers keep circling the hood the whole time."),
      kind("Thighs and bum", "She squeezes inner thighs and bum for 5 seconds while your hand is still and firm on the mons (the padded mound above the vulva). Then she melts flat."),
      kind("Low belly", "She braces her lower belly a little, like the start of a sit-up, which presses her vulva into your fingers. She exhales and drops it."),
    ],
    "Tension try",
    [
      step(
        "0–3",
        "Circles. She does not squeeze yet.",
        "Lots of lube. Two fingertips on the clitoral hood — the fold of skin over the clitoris. Slow circles around that bump. Around it, not on the tiny exposed tip, not inside the vagina. If you are already having sex, stay only about an inch in and rock — do not thrust. She keeps her pelvic floor soft. No squeezing yet.",
        180
      ),
      step(
        "3–6",
        "She squeezes, then drops",
        "Every 30 seconds she squeezes the muscles she’d use to stop a pee — inside her pelvis, not her stomach — for a slow count of 3. Then she lets them go completely for a count of 6. You do not change your circles. You are not squeezing her. She is doing it.",
        180
      ),
      step(
        "6–8",
        "Legs and bum too",
        "Same circles on the hood. Now she adds inner thighs and bum to a 5-second squeeze, then everything goes slack. Your fingers never lift off her clitoris.",
        120
      ),
      step(
        "8–10",
        "Tiny pulses if she’s close",
        "If her breath is going and her hips are chasing your hand, she does one-second squeeze-and-drop in time with your circles. You still do not speed up or move to the raw tip.",
        120
      ),
    ],
    "Working when",
    "Squeeze. Now let the whole thing go.",
    voice(
      "Squeeze, then melt. The melt is the trick.",
      "This is not you squeezing her. She tenses the pelvic floor — the muscles she’d use to stop a pee — then drops them, while your fingers keep circling the clitoral hood. Same touch the whole time.",
      "The second she lets the squeeze go, that same circle often feels twice as much. That rush is the point. If you change the stroke on the drop, you miss it.",
      ["A surge right as she releases.", "The vulva feels warmer and fuller after a drop."]
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
    "Your fingers or a toy on her clitoral hood. You take her close, stop, change temperature or texture, then climb again. Not inside her unless you already were — then stay still inside and do the contrast on the clitoris.",
    "Three contrasts",
    [
      kind("Warm then cool", "Warm hand or warm lube on the hood, then a brief cool touch — cool fingers, a cool spoon, cool breath — on the hood or inner thighs."),
      kind("Smooth then textured", "Silk or a very smooth finger first. Something with a bit of ridge (a textured toy, or the side of a knuckle) once she’s swollen."),
      kind("Fast then nothing", "Up to 85–90% on the hood, then one still, light (or cool) contact for 30 seconds. Hand stays on her."),
    ],
    "10-minute try",
    [
      step("0–3", "Warm and smooth", "Warm lube. Two fingers, slow circles on the clitoral hood. Stay around 70% — climbing, not rushing the orgasm.", 180),
      step("3–5", "Stop and cool", "At about 85%, halt the circles. Cool breath or a cool clean object on the hood or inner thighs for 30 seconds. Do not leave her body.", 120),
      step("5–7", "Different texture", "Come back with a slightly firmer or more textured stroke on the hood, up toward 90%. Same place.", 120),
      step("7–8", "Still palm", "Stop. Warm open hand on the mons, 45 seconds. No rubbing.", 60),
      step("8–10", "Through", "Warm, wet, fast enough circles on the hood. Let the orgasm happen. Do not switch texture mid-clench.", 120),
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
    "One hand on a non-genital spot — lower back, inner thigh, or side of the neck. The other hand on her clitoris. You link the two.",
    "Three other maps",
    [
      kind("Lower back", "Firm warm circles on the sacrum — the triangular bone just above the tailbone — while the other hand circles the clitoral hood."),
      kind("Inner thighs", "Light traces up the inner thigh lines, toward the vulva, without hopping to the clitoris yet. Then both at once."),
      kind("Neck", "Clitoral circles plus breath, a light bite, or a stroke along the side of the neck — not the throat."),
    ],
    "10-minute try",
    [
      step("0–3", "No genitals", "Hands on her neck, lower back, inner arms, inner thighs. Find the non-genital spot that makes her breath change. Stay off the vulva.", 180),
      step("3–6", "Hold the winner", "Steady warm pressure on that best spot — often the sacrum, just above the tailbone. Other hand still off the clitoris.", 180),
      step("6–8", "Add the clit", "Keep that first hand exactly where it is. Other hand: slow circles on the clitoral hood. Not inside her.", 120),
      step("8–10", "Same beat", "Both hands, same tempo. If she wants to come, ride it. Do not leave the lower-back hand to ‘help’ the clitoris.", 120),
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
    "Any touch that already feels good — usually your fingers on her clitoral hood. She makes sound on purpose. A clenched jaw clenches the pelvis.",
    "Three sounds",
    [
      kind("Low hum", "Mouth closed, jaw soft. Lowest comfortable ‘mmm’ on the exhale. Feel it in the chest."),
      kind("Open ah", "Jaw dropped, teeth apart. A real sigh, not a performance."),
      kind("On the beat", "Short sounds matching the stroke. Not a show — a metronome."),
    ],
    "Voice try",
    [
      step("0–2", "Unlock the jaw", "Before you touch the vulva: mouth open, three deep sighs. Check her jaw is not clamped.", 120),
      step("2–5", "Hum", "Two fingers, slow circles on the clitoral hood. She hums a low ‘mmm’ for five seconds on every exhale.", 180),
      step("5–8", "Open", "Same circles. Switch to an open ‘ah.’ Teeth do not touch. If the sound stops, the pelvic floor is usually clamping — ease the stroke.", 180),
      step("8–10", "Let it", "Sound can get louder through a peak. That is a valve, not a performance. Keep the same stroke on the hood.", 120),
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
    "Your open palm on her vulva the second she finishes. No more rubbing the clitoris. You stay. You do not pull away.",
    "Three afters",
    [
      kind("Still palm", "The instant the pulsing finishes, stop rubbing. Open hand, light weight, covering the whole vulva."),
      kind("Feathers", "Off the clitoral tip. Barely-there strokes on outer lips, inner thighs, lower belly."),
      kind("Parked buzz", "If you use a toy, lowest setting, still, on the pubic bone — not on the tip."),
    ],
    "After try",
    [
      step("0–30s", "Freeze", "The second the contractions finish: stop rubbing. Full palm on the vulva. Do not pull away. Do not keep circling the clitoris.", 30),
      step("0.5–3m", "Hold", "Hand still. Slow belly breaths together. If she twitches, that is leftover pulse — stay still.", 150),
      step("3–6m", "Around", "Lift off the clitoris. Light strokes on inner thighs and hip bones only.", 180),
      step("6–10m", "Again or rest", "If a second wave shows up — hips pushing in, warm throb instead of sting — tiny circles on the hood. If not, stay in the hold. Do not go inside unless she asks.", 240),
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
    "Two lubed fingers on the clitoral hood — the fold of skin covering the clitoris. Same beat through the orgasm. The raw exposed tip is usually too much.",
    "Three shapes",
    [
      kind("On the hood", "Steady circles or a simple up-and-down over the hood — wet, not dry, not on the raw tip. Same beat through the clenches."),
      kind("The whole vulva", "A flat hand or wide toy across the mons and both lips. Broader, warmer, less pinpoint than a fingertip on the clitoris."),
      kind("Both", "Outside stays going on the hood while two fingers or a toy inside press the front wall (toward her belly). Neither stops at the end."),
    ],
    "10-minute try",
    [
      step("0–3", "Around first", "Lube on the clitoral hood. Broad circles around the clitoris, not on the exposed tip. Let the tissue swell.", 180),
      step("3–6", "On the hood", "One or two strokes a second on the hood. Add pressure only as she swells. If she winces, go back to around it.", 180),
      step("6–8", "Lock", "Same tempo, same millimetre of skin. No ‘helpful’ circles somewhere new.", 120),
      step("8–10", "Through", "When the pulsing starts — about once a second, including the anus — keep identical friction until it’s over. Then stop rubbing. Palm stays.", 120),
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
    "One or two fingers, or a curved toy, inside her vagina. You press the front wall toward her belly, a couple of inches in. She must already be very turned on. This is not a first move.",
    "Three insides",
    [
      kind("Front wall", "One to two inches in, pad of the fingers toward her belly button. A ‘come here’ hook. Slow, firm, not frantic."),
      kind("Deep and still", "Only once she’s already very turned on. Broad pressure at the far end, toward the cervix. No slamming."),
      kind("The long drag", "A long outstroke that stays hooked up along the whole front wall until you almost leave."),
    ],
    "10-minute try",
    [
      step("0–3", "Warm first", "Do not start inside cold. Fingers or a mouth on the clitoris, or a long make-out, until she is clearly wet. Deep pressure on a cold vagina just aches.", 180),
      step("3–6", "Find the spongy bit", "One or two fingers, or a curved toy, 1.5–2 inches in, pads toward her belly. Slow upward presses, like saying ‘come here.’ Not toward the tailbone.", 180),
      step("6–8", "The pee feeling", "Common here — the urethral sponge sits next to that wall. Don’t panic, don’t stop unless she says. Long exhales. She softens the pelvic floor instead of clamping.", 120),
      step("8–10", "Stay", "Less sliding. Firm still pressure or tiny rocks on that same spongy spot until the wave is low and heavy. If she wants the clitoris too, add the other hand on the hood — do not abandon this press.", 120),
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
    "One hand (or penis, or a toy) pressing the front wall inside, toward her belly. The other hand on the clitoral hood. Both keep going. Towel down. Fluid is optional, not a grade.",
    "Three advanced releases",
    [
      kind("Blended", "Outside rhythm on the clitoral hood and a firm inside press on the front wall. Both locked. Let them merge. Neither hand drops at the end."),
      kind("If fluid happens", "Steady front-wall work with the ‘come here’ hook. When she wants to push, she does not squeeze shut — she exhales and lets it. Towel down. No shame, no requirement."),
      kind("The next wave", "First orgasm ends: 15 seconds still and light on the vulva, then slow circles on the hood. Don’t drop contact."),
    ],
    "Blended try",
    [
      step("0–4", "Set up", "She’s already highly aroused from clitoral touch. Towel under her. Extra lube on the hood and on the fingers or toy going inside.", 240),
      step("4–7", "Both", "Two fingers inside, pads toward her belly, slow ‘come here’ press. Other hand: light steady circles on the clitoral hood. One shared beat. Do not pump the inside while the outside is climbing.", 180),
      step("7–9", "Let go", "Jaw soft, belly breath, no pelvic holding. If fluid comes, keep both hands moving unless she says stop. If she hates the pee feeling, ease the inside press and stay on the hood.", 120),
      step("9–12", "Stay", "After the first peak: half speed, lighter, 20 seconds still palm, then rebuild on the hood if she wants. Inside stays gentle or still — do not yank out.", 180),
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
