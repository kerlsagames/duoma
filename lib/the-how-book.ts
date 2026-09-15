import type { HowFor, HowStep, HowTechnique, HowType } from "@/lib/the-how";

function kind(name: string, mechanics: string, execution: string): HowType {
  return { name, mechanics, execution };
}

function step(
  minutes: string,
  title: string,
  body: string,
  durationSec: number
): HowStep {
  return { minutes, title, body, durationSec };
}

function tech(
  number: number,
  id: string,
  chapter: HowTechnique["chapter"],
  forWho: HowFor,
  name: string,
  promise: string,
  what: string,
  why: string,
  typesLabel: string,
  types: HowType[],
  routineLabel: string,
  routine: HowStep[],
  signsLabel: string,
  signs: string[],
  sayThis: string
): HowTechnique {
  return {
    id,
    number,
    chapter,
    for: forWho,
    name,
    promise,
    what,
    why,
    typesLabel,
    types,
    routineLabel,
    routine,
    signsLabel,
    signs,
    sayThis,
  };
}

export const HOW_TECHNIQUES: HowTechnique[] = [
  tech(
    1,
    "framing",
    "essentials",
    "both",
    "Framing",
    "The brain rates touch before the body does.",
    "Framing is the mental and emotional blueprint of pleasure. Touch is processed through the cerebral cortex, which evaluates context before assigning a sensation as pleasurable, neutral, or uncomfortable.",
    "Without a buffer, the amygdala can read unexpected touch as stress. Framing primes the prefrontal cortex for safety, shifts the body toward rest-and-digest, and opens pelvic blood flow. Anticipation loops around exploration — not a forced orgasm — drop cortisol that otherwise blunts sensation.",
    "The 3 types of Framing",
    [
      kind(
        "Temporal Framing",
        "A clear cut between daily responsibility and intimate focus.",
        "Take a non-negotiable 15-to-30-minute buffer — shower, change out of work clothes, devices off — before any touch."
      ),
      kind(
        "Contextual Framing",
        "Verbal, written, or atmospheric cues that set the session’s job.",
        "Name the goal in advance: “Tonight is relaxing touch, zero pressure for anything else.” A descriptive text hours earlier counts."
      ),
      kind(
        "Environmental Framing",
        "Tune the room so unconscious stress triggers go quiet.",
        "Warm, low light. Comfortable temperature — cold rooms clamp the pelvic floor. Kill intrusive noise."
      ),
    ],
    "10-minute Framing routine",
    [
      step(
        "0–3",
        "Environment reset",
        "Clear work clutter. Dim the lights. Add a neutral or soothing scent.",
        180
      ),
      step(
        "3–6",
        "Somatic transition",
        "Lie on your back. One hand on the chest, one on the lower belly. Ten breaths: 4-second inhale, 6-second exhale.",
        180
      ),
      step(
        "6–8",
        "Intentional alignment",
        "Say or think: there is nowhere to rush, nothing to accomplish, no specific outcome required.",
        120
      ),
      step(
        "8–10",
        "Non-genital grounding",
        "Slow, broad, pressure-free touch on arms, neck, or shoulders. Touch has begun. Nothing is being asked of it yet.",
        120
      ),
    ],
    "Signs it’s time to move on from Framing",
    [
      "Jaw, shoulders, and pelvic floor drop and unlock.",
      "Breathing leaves the chest and settles in the belly.",
      "The day recedes. Attention lands on actual sensation.",
    ],
    "Nowhere to be. Nothing to finish."
  ),
  tech(
    2,
    "surprise",
    "essentials",
    "her",
    "Surprise",
    "Same stroke forever and the nerves go to sleep.",
    "Surprise is the intentional disruption of physical predictability. Consistency builds momentum; static touch lets nerve endings adapt and stop firing with the same intensity.",
    "Pacinian and Meissner corpuscles habituate to repetitive pressure. A sudden shift in texture, speed, or place fires fresh action potentials, spikes dopamine, and yanks attention back to the exact point of contact.",
    "The 4 physical types of Surprise",
    [
      kind(
        "The Pressure Pivot",
        "Jump from light tracing to a firm stationary press — or the reverse.",
        "During a light circular glide, stop. Broad, firm downward pressure over the pubic bone for 5 seconds. Release."
      ),
      kind(
        "The Texture Switch",
        "Change the medium mid-motion.",
        "Skin, silk, a cool object, a warm lubricated palm — swap without warning."
      ),
      kind(
        "The Spatial Jump",
        "Break a local loop by moving to a distant nerve site.",
        "From the vulva, jump to inner knee, collarbone, or lower ribcage for a few seconds, then return."
      ),
      kind(
        "The Freeze",
        "Halt all motion mid-stroke while keeping contact.",
        "At peak speed, freeze 3 to 5 seconds. Let the tissue throb against a still hand."
      ),
    ],
    "10-minute Surprise integration",
    [
      step(
        "0–4",
        "Establish baseline",
        "Steady, predictable, low-speed vertical glides. Let the nervous system lock in.",
        240
      ),
      step(
        "4–6",
        "Spatial Jump",
        "Every 45 seconds, jump to inner thigh or lower abdomen for 3 seconds, then drop back into the exact rhythm.",
        120
      ),
      step(
        "6–8",
        "Pressure Pivot",
        "Press firmly on the pubic bone for 5 seconds on an exhale, then return to feather-light surface touch.",
        120
      ),
      step(
        "8–10",
        "The Freeze",
        "Bring speed up slightly. Freeze at highest momentum. Hold until a gasp or twitch.",
        120
      ),
    ],
    "Signs it’s time to move on from Surprise",
    [
      "Dull patches suddenly feel hyper-reactive.",
      "Micro-twitches in inner thighs or pelvis on a change.",
      "The mind is hunting where the next touch will land.",
    ],
    "Don’t warn me. Just change it."
  ),
  tech(
    3,
    "hinting",
    "essentials",
    "her",
    "Hinting",
    "Wake the neighbourhood. Don’t storm the house.",
    "Hinting stimulates peripheral nerves around a high-sensitivity target to build arousal without overloading or desensitizing the target itself.",
    "The clitoris extends internally into bulbs and crura. Adjacent touch vibrates those structures and fills them with blood before the glans is touched. Direct contact on a cold glans can cause guarding. Anticipation keeps dopamine high.",
    "The 4 physical types of Hinting",
    [
      kind(
        "Air & Proximity Touch",
        "Finger less than a millimetre above the skin — heat, not friction.",
        "Trace the outer labia or pubic bone. Air currents alert fine hairs and peripheral nerves."
      ),
      kind(
        "The Perimeter Circuit",
        "A loop that never crosses the centre.",
        "Clock face around the vulva: 12 (mons), 3 (inner thigh), 9. Never the glans."
      ),
      kind(
        "Intermittent Indulgence",
        "Brief incidental contact, then retreat.",
        "Along the inner thigh, one finger brushes the hood for half a second, then 30–60 seconds away."
      ),
      kind(
        "Fabric & Barrier Buffering",
        "Materials that filter and diffuse direct touch.",
        "Circles or vibration through underwear, sheets, or clothing so pressure spreads."
      ),
    ],
    "10-minute Hinting routine",
    [
      step(
        "0–3",
        "Far perimeter",
        "Lower back, hips, outer thighs. Slow firm strokes outside, light tracing on inner thighs.",
        180
      ),
      step(
        "3–6",
        "Near perimeter",
        "Mons and pelvic folds with broad, flat-fingered pressure. Hover over the labia. Do not land.",
        180
      ),
      step(
        "6–8",
        "The brush pass",
        "Brush past the clitoral area once a minute for a fraction of a second. Do not stop there.",
        120
      ),
      step(
        "8–10",
        "Transition to Staging",
        "Full, steady contact on the inner labia and the area above the hood.",
        120
      ),
    ],
    "Signs it’s time to move on from Hinting",
    [
      "Labia and hood feel warm, firm, and swollen.",
      "The pelvis tilts or arches toward the indirect touch.",
      "Natural lubrication increases significantly.",
    ],
    "Around it. Not on it yet."
  ),
  tech(
    4,
    "staging",
    "essentials",
    "her",
    "Staging",
    "Match the touch to the blood, not the clock.",
    "Staging is a phased progression of touch across zones over time. Instead of jumping to intense stimulation, it maps tiers that evolve with the body’s arousal stages.",
    "Tissue needs time to engorge. Staging tracks excitement into plateau so high-intensity touch only arrives when tissue is full and self-lubricated. What feels too much at minute one is often perfect at minute fifteen. The pelvic floor gets time to unclench.",
    "The 4 stages of touch",
    [
      kind(
        "Stage 1 — Peripheral & Somatic",
        "Broad, firm, sweeping strokes on non-genital zones.",
        "Flat palms across back, shoulders, thighs, belly. Large surface. Calm the system."
      ),
      kind(
        "Stage 2 — Structural & Bony Anchors",
        "Firm grounding on the bones around the pelvis.",
        "Steady downward pressure on hip bones, sacrum, and pubic bone."
      ),
      kind(
        "Stage 3 — Outer Soft Tissue",
        "Light glides, cupping, rolling across outer folds.",
        "Cup the whole vulva with a warm lubricated palm, or glide the labia majora and perineum."
      ),
      kind(
        "Stage 4 — Inner Soft Tissue & Hood",
        "Precise touch on labia minora, hood, and surrounding structures.",
        "Orbiting or Rhythm on or near the clitoral complex."
      ),
    ],
    "10-minute Staging routine",
    [
      step(
        "0–3",
        "Stage 1",
        "Broad, firm palm strokes on lower back, hips, outer thighs. Do not touch the pelvis.",
        180
      ),
      step(
        "3–5",
        "Stage 2",
        "Hands to mons and hip bones. Warm, stationary, downward pressure. Anchor the pelvis.",
        120
      ),
      step(
        "5–8",
        "Stage 3",
        "Lubricate fully. Broad glides down the outer labia and inner thighs. Stay off the glans.",
        180
      ),
      step(
        "8–10",
        "Stage 4",
        "Fingers inside the labia folds. Continuous targeted touch along the hood and inner labia.",
        120
      ),
    ],
    "Signs to move to the next stage",
    [
      "1 → 2: involuntary sighing, shoulders drop, skin warms.",
      "2 → 3: hips unclamp, pelvic floor softens under stationary pressure.",
      "3 → 4: inner labia flare and engorge; clear lubrication is present.",
    ],
    "Stay on this stage until I pull you closer."
  ),
  tech(
    5,
    "signaling",
    "essentials",
    "both",
    "Signaling",
    "Guide without breaking the trance.",
    "Signaling is real-time feedback during intimacy — clear channels for speed, pressure, and location that do not yank anyone into an awkward meeting.",
    "Uncertainty loads the brain. Clear signals let the giver relax. Deep arousal is a sensory trance; “Wait, not like that!” dumps both of you into analysis. Micro-adjustments keep touch inside the narrow sweet spot.",
    "The 3 channels of Signaling",
    [
      kind(
        "Hand-over-hand",
        "Receiver’s hand on the giver’s, directing force, vector, and speed.",
        "Press down to show weight. Speed or slow the wrist. Skip the speech."
      ),
      kind(
        "Somatic cues",
        "Body responses as pre-agreed language.",
        "Hip press up = more pressure. Slow tilt away = too intense. Breath-hold or arm squeeze = stay exactly there."
      ),
      kind(
        "Directional micro-verbals",
        "Single-word adjustments, not sentences.",
        "Yes. Lighter. Slower. Hold. Right there. Not “can you do that circular thing from earlier.”"
      ),
    ],
    "Signaling system for a session",
    [
      step(
        "Setup",
        "Calibrate",
        "Before genital touch, press an arm or thigh at Light, Medium, and Firm so those words mean the same thing.",
        120
      ),
      step(
        "0–5",
        "Tactile priority",
        "First five minutes of direct touch: hand-over-hand only. The receiver steers.",
        300
      ),
      step(
        "5–8",
        "Micro-verbal shift",
        "Top hand comes off. Single-word adjustments only when something must change.",
        180
      ),
      step(
        "8–10",
        "Somatic lock-in",
        "High arousal: drop words. Hip tilts, breath, squeezes do the rest.",
        120
      ),
    ],
    "Signs Signaling is working",
    [
      "Corrections land in under two seconds without stopping motion.",
      "A vocal correction sounds like intimacy, not a complaint.",
      "Touch stays inside the ideal threshold for the whole session.",
    ],
    "Lighter. Stay."
  ),
  tech(
    6,
    "rhythm",
    "essentials",
    "her",
    "Rhythm",
    "One loop, long enough for the spine to add it up.",
    "Rhythm is continuous, predictable loops of motion. Sensory processing needs repeated electrical signals to summate before they cross the threshold that can trigger orgasm.",
    "One touch is a small impulse. The same pathway at a regular frequency stacks those impulses. Brainwaves entrain to the beat. Predictability tells the pelvic floor it is safe to stay soft.",
    "The 4 core movement loops",
    [
      kind(
        "The Vertical Glide",
        "Straight up-and-down along the sides of the hood or labia.",
        "One or two fingers from mons to the base of the labia. Lift slightly or keep contact on the return."
      ),
      kind(
        "The Figure-8",
        "A continuous infinity sign over the pelvic structure.",
        "Up the left labia, across the mons, down the right, under the clitoris. Fingers never lift."
      ),
      kind(
        "The Pendulum",
        "Side-to-side across the top of the hood.",
        "0.5 to 1 inch width only. Directly above the glans."
      ),
      kind(
        "The Pulse",
        "Zero-displacement rhythm from muscle micro-tremors.",
        "Flat finger pads, no sliding. Pulse downward with the forearm."
      ),
    ],
    "10-minute Rhythm routine",
    [
      step(
        "0–2",
        "Select and lock",
        "Pick one loop. About one stroke per second. Fully lubricate.",
        120
      ),
      step(
        "2–5",
        "Pacing",
        "Same path. Speed up about 20%. Do not change pressure or contact area.",
        180
      ),
      step(
        "5–8",
        "Summation",
        "Lock the speed. Do not stray off the track or skip beats.",
        180
      ),
      step(
        "8–10",
        "Peak locking",
        "Keep the identical rhythm through high arousal. Fatigue? Drive from wrist or forearm, not a new finger shape.",
        120
      ),
    ],
    "Signs to maintain or adjust Rhythm",
    [
      "Maintain: breathing matches the stroke, pelvic muscles pulse in time, arousal climbs steadily.",
      "Adjust: wincing, hips pulling away, sudden dryness or friction.",
    ],
    "Same loop. Don’t get creative."
  ),
  tech(
    7,
    "accenting",
    "essentials",
    "her",
    "Accenting",
    "A beat inside the loop, not a new song.",
    "Accenting adds a deliberate local emphasis — a pressure pulse, speed variation, or micro-pause — at one point inside an established continuous rhythm.",
    "Pure rhythm habituates. Pure randomness never sums. Accenting keeps the background predictable and adds targeted novelty. Light-touch receptors stay on; the accent wakes deep-pressure receptors.",
    "The 3 accent types",
    [
      kind(
        "The Pressure Pulse",
        "Double the downward weight at one coordinate of the loop.",
        "On a 4-count circle, press at “1” (top), light for 2, 3, 4."
      ),
      kind(
        "The Micro-Pause",
        "A fraction-of-a-second freeze at the peak of a stroke.",
        "At the top of a vertical glide, pause 0.5 seconds in contact, then sweep down."
      ),
      kind(
        "The Texture Flick",
        "Fingertip or nail edge briefly changes the contact surface.",
        "Pad loop, then roll onto the fingertip at the bottom for a firmer point."
      ),
    ],
    "10-minute Accenting routine",
    [
      step(
        "0–3",
        "Baseline loop",
        "Smooth 4-count circular rhythm around the hood. Even. Fluid.",
        180
      ),
      step(
        "3–6",
        "Introduce the pulse",
        "Pressure pulse at count 1, 12 o’clock on the mons. Counts 2–4 stay light.",
        180
      ),
      step(
        "6–8",
        "Shift the accent",
        "Move the pulse from 12 o’clock to 6 o’clock, below the clitoris.",
        120
      ),
      step(
        "8–10",
        "Pulse and pause",
        "Micro-pause at the accent as arousal peaks.",
        120
      ),
    ],
    "Signs Accenting is effective",
    [
      "A micro-inhale or pelvic twitch lands on the accent.",
      "Arousal keeps climbing instead of going flat or monotone.",
    ],
    "That extra press at the top. Keep it."
  ),
  tech(
    8,
    "edging",
    "essentials",
    "her",
    "Edging",
    "Ride up to the line. Step back. Build a bigger wave.",
    "Edging — surf-cycling — brings arousal to the high plateau near orgasm, drops pressure or speed so arousal falls slightly, then rebuilds.",
    "Each cycle increases local vasocongestion and expands the clitoral footprint. Approaching the threshold repeatedly strengthens the reflex and extends the high-dopamine state. The eventual release is usually more intense.",
    "The 3 steps of an edge cycle",
    [
      kind(
        "The Approach",
        "Build to about 90% of the orgasmic threshold.",
        "Direct, consistent rhythm or orbiting. Watch muscle tightening, rapid breath, involuntary sound."
      ),
      kind(
        "The Back-Off",
        "Drop stimulus instantly so you do not cross.",
        "From fast direct touch to a still broad palm on the pubic bone, or broad inner-thigh strokes. Hold 20–40 seconds."
      ),
      kind(
        "The Re-engagement",
        "Resume at lower intensity once arousal settles to 60–70%.",
        "Restart with Hinting or Staging. Do not jump back to fast and direct."
      ),
    ],
    "3-cycle Edging session",
    [
      step(
        "Cycle 1",
        "Baseline edge",
        "Build with direct rhythm. At the tipping point, still palm on the mons. Wait 30 seconds for the edge to recede.",
        180
      ),
      step(
        "Cycle 2",
        "Expanded edge",
        "Rebuild with Orbiting. Arousal will rise faster. At 90%, light tracing on inner thighs for 30–45 seconds.",
        210
      ),
      step(
        "Cycle 3",
        "Final drive",
        "Rebuild with locked Consistency. At 90%, stay. Let the body cross.",
        210
      ),
    ],
    "Signs it’s time to back off",
    [
      "Pelvic floor locks into continuous contraction.",
      "Involuntary breath-holding right before climax.",
      "Voice goes high or rapid — threshold is here.",
    ],
    "Back off. Stay on me. Then come back."
  ),
  tech(
    9,
    "orbiting",
    "essentials",
    "her",
    "Orbiting",
    "Circle the planet. Don’t land on the sun.",
    "Orbiting traces circular or oval paths around the clitoral glans, stimulating the internal network without direct friction on the glans itself.",
    "The glans is only the visible tip. Orbiting compresses bulbs, crura, and hood while protecting the glans from friction numbness. Direction keeps shifting, so input stays dynamic, and you stay on lubricated surrounding tissue.",
    "The 4 variations of Orbiting",
    [
      kind(
        "The Wide Orbit",
        "A 1.5–2 inch ring around the whole upper vulva.",
        "Circle mons, outer labia, and the space above the perineum."
      ),
      kind(
        "The Tight Orbit",
        "A 0.5–1 inch ring around hood and base.",
        "One lubricated finger, tight loops around the base of the glans. Not over the tip."
      ),
      kind(
        "The Oval Orbit",
        "A teardrop down the labia minora and back over the hood.",
        "Down the left inner labia, across the entrance, up the right, around the top of the hood."
      ),
      kind(
        "The Crescent Orbit",
        "A half-moon across only the top or bottom half.",
        "9 o’clock to 3 o’clock across the top arch of the hood, and back."
      ),
    ],
    "10-minute Orbiting routine",
    [
      step(
        "0–3",
        "Wide Orbit",
        "Fully lubricated. Broad 2-inch orbits. One rotation every 2 seconds.",
        180
      ),
      step(
        "3–6",
        "Tight Orbit",
        "Spiral inward to a 1-inch ring around the hood. Light-to-medium pressure.",
        180
      ),
      step(
        "6–8",
        "Oval Orbit",
        "Lengthen down the labia minora. Involve the whole inner structure.",
        120
      ),
      step(
        "8–10",
        "Crescent locking",
        "Rapid precise crescents across the top arch of the hood.",
        120
      ),
    ],
    "Signs Orbiting is working",
    [
      "High arousal without sharp friction or oversensitivity.",
      "Hood and inner labia become noticeably engorged.",
    ],
    "Around the hood. Not on the tip."
  ),
  tech(
    10,
    "layering",
    "essentials",
    "her",
    "Layering",
    "Put something between you and the raw nerve.",
    "Layering applies touch, pressure, or vibration through tissue or fabric, spreading force into soft, diffused pressure.",
    "Direct touch focuses force on a tiny area. A layer spreads it, waking more low-threshold receptors without the friction that irritates. Ideal when tissue is hyper-sensitive or just after orgasm.",
    "The 3 forms of Layering",
    [
      kind(
        "Labial Folding",
        "Outer or inner labia as a cushion over the glans.",
        "Draw the labia majora inward over the clitoris. Circle or glide on the outside."
      ),
      kind(
        "Fabric Buffering",
        "Touch or vibration through clothing.",
        "Leave cotton, silk, or lace in place. Hand, fingers, or vibrator on top of the fabric."
      ),
      kind(
        "Palm Cushioning",
        "A still hand on the tissue; movement happens on the back of that hand.",
        "Non-dominant palm over the vulva. Dominant hand or toy taps, circles, or vibrates on top."
      ),
    ],
    "Layering protocol",
    [
      step(
        "0–5",
        "Fabric buffering",
        "Build baseline arousal through fabric. No direct skin yet.",
        300
      ),
      step(
        "5–8",
        "Active play",
        "Fabric aside. If direct touch gets too sharp, fold the labia majora over the glans and keep going.",
        180
      ),
      step(
        "8–10",
        "Post-orgasm multiples",
        "After a climax, do not touch the glans. Palm cushioning over the whole area.",
        120
      ),
    ],
    "Signs Layering is needed",
    [
      "Wincing or pulling away from direct skin.",
      "Dry friction — layering is an instant non-friction barrier.",
    ],
    "Through the lips. Not on the tip."
  ),
  tech(
    11,
    "consistency",
    "essentials",
    "her",
    "Consistency",
    "When it is working, become boring on purpose.",
    "Consistency holds every variable of touch — speed, downward pressure, surface area, and trajectory — constant once high arousal is achieved.",
    "At late plateau the spinal cord is summing hard. Changing speed or place breaks the build and forces a remap. A sudden new stimulus right before climax drops arousal. Uninterrupted prediction lets the body trigger the contractions of orgasm.",
    "The 4 variables to lock in",
    [
      kind(
        "Velocity",
        "The exact same rhythm. No speeding up because you are excited.",
        "If the impulse is to go faster, that is the cue to stay."
      ),
      kind(
        "Pressure",
        "The same downward force, continuously.",
        "Think a steady 2 ounces. Not a fidget."
      ),
      kind(
        "Trajectory",
        "The same micro-path. No drifting.",
        "If you lose the track, stop and let her put you back."
      ),
      kind(
        "Contact area",
        "The same part of the finger pad or palm.",
        "Do not roll onto a nail or switch to two fingers because one got tired."
      ),
    ],
    "Consistency in real time",
    [
      step(
        "Lock point",
        "Identify it",
        "Late plateau: rapid breathing, muscular tension, focused gaze, hips that have gone still.",
        120
      ),
      step(
        "Freeze",
        "Lock the variable set",
        "Wrist, fingers, arm. Do not speed up.",
        180
      ),
      step(
        "Drive",
        "Use the body",
        "If the hand tires, drive from core or shoulder so the contact point never changes.",
        180
      ),
      step(
        "Ride",
        "Through climax",
        "Identical stroke from the onset of climax until the contraction wave subsides.",
        120
      ),
    ],
    "Signs Consistency is being held",
    [
      "Arousal builds in a smooth arch, no sudden dips.",
      "Hips tilt up to lock against the still, consistent touch.",
    ],
    "Don’t you dare change that."
  ),
  tech(
    12,
    "multiples",
    "essentials",
    "her",
    "Multiples",
    "The second wave lives in the 90 seconds after the first.",
    "Multiples is continuing gentle, low-pressure stimulation in the post-orgasm window so the nervous system can climb again before the refractory drop sets in.",
    "Blood is still trapped in erectile tissue. Soft touch keeps it there. Hypersensitivity can convert back into arousal if intensity matches the new threshold. Sequential peaks stack oxytocin and endorphins.",
    "The 3 phases of Multiples",
    [
      kind(
        "Immediate Soften — 0–15 seconds",
        "Step down the second contractions finish. Do not leave.",
        "Lighten pressure about 80%. Broad still palm, or Layering."
      ),
      kind(
        "Sensitivity Glide — 15–60 seconds",
        "Ultra-light, continuous, highly lubricated perimeter movement.",
        "Extra lube. Wide Orbiting or Hinting on the far outer labia. Avoid the glans."
      ),
      kind(
        "Secondary Drive — 1–3 minutes",
        "Rebuild speed and directness as sharpness turns back into pleasure.",
        "Spiral inward toward the hood. Rhythm or Consistency into the second peak."
      ),
    ],
    "Multiples protocol",
    [
      step(
        "Peak",
        "First climax",
        "Drive the first peak with locked Consistency.",
        180
      ),
      step(
        "0–15s",
        "Instant down-shift",
        "Do not remove the hand. Broad still palm cushioning over the pubic bone.",
        30
      ),
      step(
        "15–60s",
        "Re-lubricate & sweep",
        "More lube without lifting the palm. Ultra-soft wide orbits around the far outer labia.",
        90
      ),
      step(
        "1–3m",
        "Re-engage",
        "When sensitivity normalizes, step speed and directness back up.",
        180
      ),
      step(
        "3–5m",
        "Second peak",
        "If the pelvis is pushing into touch, lock Consistency again.",
        120
      ),
    ],
    "Signs it’s safe to drive for a second peak",
    [
      "Sharp or ticklish shifts back to a warm throb.",
      "Tissue stays swollen — it does not return to baseline size.",
      "The pelvis pushes up into touch instead of pulling away.",
    ],
    "Don’t leave. Just go lighter."
  ),
  tech(
    13,
    "angling",
    "penetration",
    "her",
    "Angling",
    "Aim at a wall. Stop thrusting through empty space.",
    "Angling adjusts entry angle and pelvic tilt so force hits specific internal structures — especially the anterior vaginal wall — instead of passing through the centre of a tented canal.",
    "Internal clitoral bulbs and crura run along the front wall. Halban’s fascia and the periurethral sponge live there too. Straight centre-line thrusting often glides through open space with no continuous friction.",
    "The 3 core positions for Angling",
    [
      kind(
        "The Pelvic Lift",
        "Pelvis up so entry presses the front wall.",
        "Firm wedge or pillow under lower back and hips, 3 to 6 inches off the mattress."
      ),
      kind(
        "The Lateral Tilt",
        "Hips rotated so force hits a side wall.",
        "One hip higher, or angle the entry about 30 degrees left or right."
      ),
      kind(
        "The Posterior Press",
        "Down toward the back wall and perineal body.",
        "Aim the stroke toward the tailbone, not the belly button."
      ),
    ],
    "10-minute Angling protocol",
    [
      step(
        "0–3",
        "Setup & elevation",
        "Pillow under the hips. Full lubrication. Slow insert at a 45-degree angle toward the belly button until the front wall is felt.",
        180
      ),
      step(
        "3–6",
        "Anterior engagement",
        "Short 1–2 inch strokes that keep dragging contact on the front wall.",
        180
      ),
      step(
        "6–8",
        "Lateral exploration",
        "Without withdrawing, rotate left 60 seconds, then right 60 seconds. Notice which side sings.",
        120
      ),
      step(
        "8–10",
        "Lock the vector",
        "Return to the best angle. Lock the hips. Steady strokes through climax.",
        120
      ),
    ],
    "Signs Angling is working",
    [
      "Sensation shifts from generic pressure to a distinct, targeted focus.",
      "A smooth, firm drag — not gliding through empty space.",
    ],
    "Tilt up and stay. Don’t keep searching."
  ),
  tech(
    14,
    "rocking",
    "penetration",
    "her",
    "Rocking",
    "Stay in. Sway. Stop making a hallway of it.",
    "Rocking inserts fully and keeps complete contact while the hips sway or roll. No back-and-forth thrusting. Continuous deep pressure instead.",
    "The base stays on the external glans. Internal tissue stays compressed. You skip the withdrawal phase that empties the pressure, and you skip a lot of friction wear.",
    "The 3 variations of Rocking",
    [
      kind(
        "The Pelvic Roll",
        "Small circular hip motion, fully inserted.",
        "Lock the base against the pubic bone. 1-inch circular loops."
      ),
      kind(
        "The Lateral Sway",
        "Left-right hip sway, full depth.",
        "Press the inserted body against left and right sides of the entrance and canal."
      ),
      kind(
        "The Vertical Wave",
        "Pelvis tilts to alternate front and back walls.",
        "Tuck the tailbone for the front wall, slight arch for the back. Depth stays constant."
      ),
    ],
    "10-minute Rocking routine",
    [
      step(
        "0–2",
        "Full insertion & anchor",
        "Comfortable full insert. Slide forward until the base is pressed to mons and clitoris.",
        120
      ),
      step(
        "2–5",
        "Lateral sway",
        "Slow side-to-side. Feel internal wall pressure, not depth.",
        180
      ),
      step(
        "5–8",
        "Pelvic roll",
        "Shift into continuous circular rolls. External base stays anchored.",
        180
      ),
      step(
        "8–10",
        "High-pressure lock",
        "Continuous downward weight into the pubic bone plus micro-rolls.",
        120
      ),
    ],
    "Signs Rocking is effective",
    [
      "Deep pelvic warmth without sharp friction.",
      "Internal walls and external glans at once — no extra hand required.",
    ],
    "Grind on me. Don’t pull out."
  ),
  tech(
    15,
    "pairing",
    "penetration",
    "her",
    "Pairing",
    "Inside and the clit, on purpose, at the same time.",
    "Pairing is simultaneous internal penetration and continuous external clitoral stimulation.",
    "Internal sensation travels pelvic and vagus nerves; external clitoral touch travels the pudendal nerve. Firing both at once lowers the orgasmic threshold. Many women will not climax from penetration alone. Anatomically you sandwich the clitoral complex — glans outside, anterior wall inside.",
    "The 3 methods of Pairing",
    [
      kind(
        "Manual Pairing",
        "Orbiting or Rhythm on the clitoris during penetration.",
        "Steady internal strokes. Free hand, lubricated, on the hood."
      ),
      kind(
        "Vibrational Pairing",
        "A compact vibrator on the external clitoris during internal movement.",
        "Bullet or air-pulse on the glans, low-to-medium, while inside stays steady."
      ),
      kind(
        "Anatomic Body Pairing",
        "Pubic bone or groin on the clitoris every stroke.",
        "Grinding or prone positions where body contact never leaves the clit."
      ),
    ],
    "10-minute Pairing routine",
    [
      step(
        "0–3",
        "Internal baseline",
        "Slow steady internal movement or Rocking. Build warmth and lubrication.",
        180
      ),
      step(
        "3–5",
        "Introduce external",
        "More lube on the hood. Gentle slow Orbiting. Do not change the internal pace.",
        120
      ),
      step(
        "5–8",
        "Synchronize",
        "Match external tempo to internal. One-to-one pulse between both points.",
        180
      ),
      step(
        "8–10",
        "Lock and finish",
        "Near threshold, lock both into Consistency through climax.",
        120
      ),
    ],
    "Signs Pairing is working",
    [
      "Arousal climbs faster than either touch alone.",
      "It feels complete — internal fullness linked to external intensity.",
    ],
    "Don’t stop the hand when you go in."
  ),
  tech(
    16,
    "levering",
    "penetration",
    "her",
    "Levering",
    "Use what’s inside as a lever on the doorway.",
    "Levering uses the inserted body or toy as a lever, pushing outward or laterally against the walls and rim of the entrance.",
    "The outer third holds nearly all internal sensory nerve endings. Outward press stretch-reflexes the levator ani. The clitoral crura run along the sides of the opening — side-to-side levering presses those legs.",
    "The 3 motions of Levering",
    [
      kind(
        "Anterior Levering",
        "Press the stem up against the roof of the entrance.",
        "Partial insert. Steady upward leverage through the movement."
      ),
      kind(
        "Posterior Levering",
        "Press down toward the perineum.",
        "Dragging friction along the floor of the entrance."
      ),
      kind(
        "Lateral Levering",
        "Force left or right against the side walls.",
        "Firm crescent arc, left wall then right."
      ),
    ],
    "10-minute Levering routine",
    [
      step(
        "0–2",
        "Entry & anchor",
        "Insert 1 to 2 inches. Pause. Comfort and lubrication first.",
        120
      ),
      step(
        "2–5",
        "Anterior levering",
        "Firm upward pressure on the top rim. Slow 1-inch glides, continuous upward force.",
        180
      ),
      step(
        "5–8",
        "Lateral sweeps",
        "Five strokes on the left wall, five on the right.",
        180
      ),
      step(
        "8–10",
        "Levered outstroking",
        "Upward leverage plus withdrawal strokes. Drag on the way out.",
        120
      ),
    ],
    "Signs Levering is effective",
    [
      "Sensation is pronounced at the opening, not lost deep inside.",
      "Involuntary pelvic floor pulsing against the outward stretch.",
    ],
    "Press up against the entrance. Stay shallow."
  ),
  tech(
    17,
    "shallowing",
    "penetration",
    "her",
    "Shallowing",
    "The first two inches are the instrument.",
    "Shallowing limits movement to the outermost entrance — the first 1 to 2 inches — and refuses deep penetration.",
    "The outer third holds nearly all vaginal touch receptors. The inner two-thirds have far fewer. Shallowing puts 100% of movement where the nerves are, skips cervical bruising, and every stroke tugs labia minora and hood.",
    "The 3 Shallowing strokes",
    [
      kind(
        "The Entrance Glide",
        "Micro-strokes just past the threshold and back.",
        "Less than an inch in, almost fully out. Fast or slow pulse."
      ),
      kind(
        "Entrance Ringing",
        "Circles around the inner circumference, no depth.",
        "Finger pad just past the entrance, small circles on the inner ring."
      ),
      kind(
        "The Flutter Stroke",
        "Rapid light pulses at the threshold.",
        "Shallow depth, low-amplitude flutters on the lower rim."
      ),
    ],
    "10-minute Shallowing routine",
    [
      step(
        "0–3",
        "Boundary setup",
        "Abundant lube. Tip only — first knuckle or first inch. All motion at the threshold.",
        180
      ),
      step(
        "3–6",
        "Entrance glides",
        "0.5 to 1.5 inches deep. Friction across the outer ring is the whole job.",
        180
      ),
      step(
        "6–8",
        "Shallow levering",
        "Glides plus upward pressure along the roof. Never past 1.5 inches.",
        120
      ),
      step(
        "8–10",
        "Speed locking",
        "Rapid shallow flutters at the entrance ring.",
        120
      ),
    ],
    "Signs Shallowing is working",
    [
      "Light, sharp, pleasurable — no deep ache.",
      "Outer labia and entrance ring swell from concentrated blood flow.",
    ],
    "Stay shallow. I will take more if I want it."
  ),
  tech(
    18,
    "outstroking",
    "penetration",
    "her",
    "Outstroking",
    "The good part is the way out.",
    "Outstroking puts speed, pressure, and attention on the withdrawal, not the inward push.",
    "Entrance nerves detect directional stretch. Inward compresses; outward opens a different pathway. Heavy inward thrusts often trigger guarding. Outward drag pulls tissue across the nerve-dense ring.",
    "The 3 elements of Outstroking",
    [
      kind(
        "The Asymmetric Stroke",
        "Slow in with zero pressure, faster out with firm contact.",
        "3 seconds in. Half-second pause. 1 second out with dragging pressure."
      ),
      kind(
        "The Hooked Exit",
        "Hook up against the front wall on the way out.",
        "Insert smoothly. Withdraw with upward drag until the tip almost exits."
      ),
      kind(
        "Pause-at-the-Exit",
        "Stop at the outer ring before going back in.",
        "Withdraw with drag. Still for 2 seconds at the threshold. Slide in gently."
      ),
    ],
    "10-minute Outstroking routine",
    [
      step(
        "0–3",
        "Tempo calibration",
        "Strip pressure from the inward stroke. Inward is a light reset.",
        180
      ),
      step(
        "3–6",
        "Asymmetric execution",
        "3 seconds in, 1 second out with firm drag.",
        180
      ),
      step(
        "6–8",
        "Hooked exit",
        "Every outward stroke hooks up against the anterior wall and the front rim.",
        120
      ),
      step(
        "8–10",
        "Threshold locking",
        "Add a 1-second pause at the exit on every stroke.",
        120
      ),
    ],
    "Signs Outstroking is working",
    [
      "Anticipation lives on the outward movement.",
      "The outward pull draws lubrication across the entrance ring.",
    ],
    "Slow in. Drag out."
  ),
  tech(
    19,
    "adding",
    "penetration",
    "her",
    "Adding",
    "Width after the tissue has asked for it.",
    "Adding slowly introduces more static width — fingers or contact points — once tissues are fully relaxed and engorged, for a feeling of internal fullness.",
    "Arousal expands pelvic tissue and relaxes walls. Extra width presses left and right, or front and back, at once, and wakes deep stretch receptors that register saturation. Never as a first move.",
    "The 3 phases of Adding",
    [
      kind(
        "Single-point Anchor",
        "One finger or slim object until tightness dissolves.",
        "Well-lubricated. Steady, low-speed movement."
      ),
      kind(
        "Side-by-side Slide",
        "A second contact alongside the first, without withdrawing.",
        "Extra lube at the entrance. Slide the second in. Hold still 30 seconds."
      ),
      kind(
        "Radial Spread",
        "Gently separate inside for multi-directional pressure.",
        "A V-shape stretch once two points are comfortable. No thrusting required."
      ),
    ],
    "Adding protocol",
    [
      step(
        "0–4",
        "Single anchor",
        "One finger or slim toy. Light, steady. Wait for high arousal and full lubrication.",
        240
      ),
      step(
        "4–6",
        "Second contact",
        "Pause. Extra lube. Second finger alongside. Motionless 30 seconds.",
        120
      ),
      step(
        "6–8",
        "Static expansion",
        "Do not thrust. Rock or Angle with both points.",
        120
      ),
      step(
        "8–10",
        "Fullness drive",
        "Keep the expanded width. Steady upward pressure on the anterior wall.",
        120
      ),
    ],
    "Signs it is safe to Add",
    [
      "Initial penetration glides with abundant lubrication and zero resistance.",
      "The entrance ring feels soft, relaxed, and open.",
    ],
    "Stay. Let me take the extra."
  ),
  tech(
    20,
    "breath-sync",
    "amplify",
    "both",
    "Breath-Sensation Syncing",
    "Put the stroke on the breath so the pelvic floor can follow.",
    "Breath-Sensation Syncing lines inhalation, hold, and exhalation up with specific touches, movements, or pressure changes.",
    "Inhale leans sympathetic (readiness). Exhale leans parasympathetic (blood flow, less clamp). Diaphragm and pelvic floor move together — inhale drops and opens the floor, exhale gently tones it. Rhythmic breathing also turns the sensory volume up.",
    "The 3 core breathing frameworks",
    [
      kind(
        "The Expansion Breath",
        "Inhale as pressure or depth increases.",
        "4-second nose inhale as a stroke begins. Belly and pelvic floor expand around the touch."
      ),
      kind(
        "The Release Breath",
        "Exhale on the primary stroke or climax phase.",
        "6-second slow mouth exhale as outward movement or static pressure happens."
      ),
      kind(
        "The Wave Breath",
        "2–3 second hold at peak sensation.",
        "Inhale on buildup, hold at maximum contact, release smoothly."
      ),
    ],
    "10-minute Breath Sync protocol",
    [
      step(
        "0–3",
        "Diaphragmatic calibration",
        "No movement yet. Hand on chest, hand on belly. 4 in, 6 out, until the pelvic floor dissolves.",
        180
      ),
      step(
        "3–6",
        "1-to-1 matching",
        "Light external touch or slow penetration. Inward = 4-second inhale. Outward = 4-second exhale.",
        180
      ),
      step(
        "6–8",
        "Release emphasis",
        "Exhales 6–8 seconds. Static pressure or slow Rocking. Sigh or low tone on the out-breath.",
        120
      ),
      step(
        "8–10",
        "Peak wave",
        "Rapid deep inhale on buildup, 2-second hold at max pressure, slow release as sensation peaks.",
        120
      ),
    ],
    "Signs Breath Syncing is working",
    [
      "Pelvic floor unclenches on its own. Contact goes frictionless.",
      "Spreading pelvic warmth and skin tingling on the exhales.",
    ],
    "Breathe me in. Sigh me out."
  ),
  tech(
    21,
    "dynamic-tension",
    "amplify",
    "her",
    "Dynamic Tension & Relaxation",
    "Squeeze, then melt. The melt is the trick.",
    "Deliberately contract pelvic floor, thighs, glutes, or abdomen for brief intervals, then fully relax, so release itself becomes the hypersensitivity.",
    "After a voluntary contraction, muscle drops below its previous baseline and capillaries open. Alternating engagement and drop resets sensory nerves. The squeeze siphons blood; the release lets a fresh wave flood clitoral and vaginal tissue.",
    "The 3 muscle tension vectors",
    [
      kind(
        "The Kegel Pulse",
        "Squeeze levator ani around finger, toy, or body, then drop.",
        "Firm 3-second contract, then a 6-second “push out” / full drop while touch continues."
      ),
      kind(
        "Glute & Thigh Drive",
        "Glutes and inner thighs compress the vulva from outside.",
        "Flex 5 seconds during static internal pressure, then melt the lower body flat."
      ),
      kind(
        "The Abdominal Wave",
        "Brace the lower abs to tilt the pelvis into contact.",
        "Gentle sit-up brace to push internal structures onto the touch, then release on the exhale."
      ),
    ],
    "Dynamic Tension protocol",
    [
      step(
        "0–3",
        "Baseline touch",
        "Steady Orbiting or continuous shallow penetration.",
        180
      ),
      step(
        "3–6",
        "3-to-6 pulses",
        "Every 30 seconds: 3-second pelvic squeeze, 6-second full release. Touch stays constant.",
        180
      ),
      step(
        "6–8",
        "Macro-body squeezes",
        "Pelvic, glute, and thigh together. 5 seconds at peak pressure, then drop everything. Contact stays.",
        120
      ),
      step(
        "8–10",
        "Micro-pulses",
        "Near climax, 1-second pulse-and-release, mirroring oncoming orgasmic reflexes.",
        120
      ),
    ],
    "Signs Dynamic Tension is working",
    [
      "Sensation doubles the instant the tension drops.",
      "Labia and clitoral structures feel firmer and warmer after each release.",
    ],
    "Squeeze. Now let the whole thing go."
  ),
  tech(
    22,
    "edging-contrast",
    "amplify",
    "her",
    "Edging & Temperature/Texture",
    "Stop at the cliff. Change the weather. Climb again.",
    "Arousal management — stopping or slowing right before orgasm — combined with thermal shifts or tactile materials to expand capacity and sensitivity.",
    "Repeated plateaus keep dopamine high. Skin has separate cold and heat channels; alternating them is a multi-sensory cascade. Soft vs firm vs textured surfaces wake different mechanoreceptors. This is not the same technique as Edging in Essentials — contrast is the second instrument.",
    "The 3 contrast variations",
    [
      kind(
        "Thermal Contrast",
        "Warm tools or hands, then cool metal, glass, air, or lube.",
        "Warm lube or wand for 2 minutes, then a brief chilled touch on hood or inner thighs."
      ),
      kind(
        "Texture Cycling",
        "Soft broad materials into firm or ribbed ones.",
        "Silk or ultra-smooth silicone first. Micro-texture or ridges after engorgement."
      ),
      kind(
        "Speed/Pressure Contrast",
        "Drive to 85–90%, then zero movement or feather touch.",
        "Fast and intense to the edge, then one motionless cool or light contact for 30 seconds."
      ),
    ],
    "10-minute Edging & Contrast protocol",
    [
      step(
        "0–3",
        "First buildup",
        "Warm, smooth, steady. About 70% capacity.",
        180
      ),
      step(
        "3–5",
        "First edge & thermal drop",
        "At 85%, halt. Cool element or cool breath for 30 seconds, down to about 50%.",
        120
      ),
      step(
        "5–7",
        "Second buildup",
        "Textured surface or firmer pressure, up to 90%.",
        120
      ),
      step(
        "7–8",
        "Second edge & stillness",
        "Stop at the threshold. Warm static palm on the pubic mound, 45 seconds.",
        60
      ),
      step(
        "8–10",
        "Unrestricted release",
        "Intense, fast, warm, smooth. Let it go through.",
        120
      ),
    ],
    "Signs Edging & Contrast is working",
    [
      "Sensation feels whole-body, not stuck at the point of touch.",
      "Flush of heat across chest, neck, lower abdomen.",
    ],
    "Stop. Cool. Come back warmer."
  ),
  tech(
    23,
    "mapping",
    "amplify",
    "both",
    "Erogenous Mapping & Linking",
    "The clit is not the only map. Link another country to it.",
    "Systematic exploration of non-genital sensory zones, then touching a secondary zone at the same time as genital stimulation.",
    "In the somatosensory cortex, feet, inner thighs, lower back, and genitals sit next to each other — cross-stimulation overflows. Shared sacral nerves (S2–S4) innervate genitals, perineum, backs of legs, soles. Neck and inner-arm touch via C-tactile nerves drops cortisol so genital nerves listen better.",
    "The 3 core non-genital zones",
    [
      kind(
        "Sacral-Pelvic Zone",
        "Firm rhythmic pressure or warmth on lower spine and tailbone.",
        "Warm palm, thumb, or massager on the sacrum while genital touch happens."
      ),
      kind(
        "Inner Pathway Zone",
        "Delicate skin of upper inner thighs toward the labia.",
        "Fingertip or light nail glides along the inner-thigh lines. Don’t hop to the clitoris yet."
      ),
      kind(
        "Upper Axis Zone",
        "Earlobe, neck, collarbone — vagal and cervical pathways.",
        "Clitoral or internal touch plus warm breath, light bite, or stroke along the side of the neck."
      ),
    ],
    "10-minute Mapping & Linking routine",
    [
      step(
        "0–3",
        "Non-genital mapping",
        "Do not touch genitals. Neck, lower back, inner arms, inner thighs. Find what lights up.",
        180
      ),
      step(
        "3–6",
        "Secondary anchor",
        "Hold steady warm pressure on the most responsive non-genital zone.",
        180
      ),
      step(
        "6–8",
        "Genital linking",
        "Keep the secondary zone. Add slow Orbiting or gentle penetration with the other hand.",
        120
      ),
      step(
        "8–10",
        "Synchronized drive",
        "Match tempos 1-to-1. Both inputs through climax.",
        120
      ),
    ],
    "Signs Mapping & Linking is working",
    [
      "Goosebumps along arms, back, or legs from genital touch.",
      "Genital sensation echoes or radiates through the secondary zone.",
    ],
    "Keep your hand on my lower back. Don’t leave that."
  ),
  tech(
    24,
    "vocalization",
    "amplify",
    "both",
    "Vocalization & Biofeedback",
    "Open the throat so the pelvic floor can open too.",
    "Low-frequency sound — groaning, humming, sighing — plus active sensory monitoring. The voice is not performance. It is a muscle strategy.",
    "Vocal cords ride a vagus-nerve branch; low pitch raises parasympathetic tone. Jaw and throat clench reflexively tightens the pelvic floor; an open vowel unclenches it. Vocalizing also kills the unconscious breath-hold that dumps adrenaline into the room.",
    "The 3 vocalization modes",
    [
      kind(
        "The Low-Frequency Hum",
        "Sustained low “mmm” with closed lips, relaxed jaw.",
        "Belly inhale. Lowest comfortable pitch on the exhale. Feel it in the chest."
      ),
      kind(
        "The Open-Vowel Exhale",
        "Soft resonant “ah” or “oh” on the stroke.",
        "Drop the jaw. Teeth do not touch. Sigh on every exhalation."
      ),
      kind(
        "The Motor-Pulse",
        "Short sounds matched to the physical tempo.",
        "“Ah… ah… ah…” at the exact beat of the movement."
      ),
    ],
    "Vocalization protocol",
    [
      step(
        "0–2",
        "Jaw & throat unlock",
        "Before touch: jaw open, head rolls, three deep open-mouth sighs.",
        120
      ),
      step(
        "2–5",
        "Low hum",
        "Baseline touch. Every exhale, a 5-second low hum. Vibration in the chest.",
        180
      ),
      step(
        "5–8",
        "Open vowels",
        "Shift to “ahhh.” Jaw unclenched. Teeth apart.",
        180
      ),
      step(
        "8–10",
        "Uninhibited drive",
        "Let sound go automatic through climax. Volume is a pressure-release valve, not a show.",
        120
      ),
    ],
    "Signs Vocalization is working",
    [
      "No jaw clench, grinding, or neck tightness at high arousal.",
      "Movement stays continuous — no sharp, tense interruptions.",
    ],
    "Don’t swallow the sound. Let it out."
  ),
  tech(
    25,
    "post-peak",
    "amplify",
    "both",
    "Post-Peak Sustained Touch",
    "The two minutes after teach the body whether to come back.",
    "Ultra-gentle, mostly static contact immediately after orgasm, so the drop is not a cliff — and so a second wave has somewhere to live.",
    "Post-climax nerves are exquisite. Yanking the hand away jars; heavy rubbing hurts. Warm still contact keeps pelvic blood from dumping all at once and rides the oxytocin peak instead of wasting it.",
    "The 3 post-peak touch states",
    [
      kind(
        "The Static Palm Shield",
        "Flat warm palm over the whole vulva and mound. Zero sliding.",
        "The instant contractions finish, stop rubbing. Open hand, light steady weight."
      ),
      kind(
        "Feather Glides",
        "Off the glans, onto outer labia, inner thighs, lower belly.",
        "Barely-there fingertip pressure along the borders."
      ),
      kind(
        "Micro-Vibration Hold",
        "Lowest setting, motionless, on pubic bone or lower entrance — not the glans.",
        "Broad vibrator or smooth tool parked on bone structure above the clitoris."
      ),
    ],
    "Post-Peak integration protocol",
    [
      step(
        "0–30s",
        "Immediate transition",
        "Contractions finish: freeze. Do not pull away. Full flat palm over the vulva.",
        30
      ),
      step(
        "0.5–3m",
        "Static warm shield",
        "Hand still. Slow diaphragmatic breaths together. Let the pelvic floor settle.",
        150
      ),
      step(
        "3–6m",
        "Peripheral feathering",
        "Lift off the clitoris. Extremely light strokes on inner thighs, hip bones, lower abdomen.",
        180
      ),
      step(
        "6–10m",
        "Re-explore or rest",
        "If hypersensitivity fades and a second wave starts, light Orbiting or Shallowing. If not, stay in the hold.",
        240
      ),
    ],
    "Signs Post-Peak touch was executed correctly",
    [
      "Deep melting relaxation — no flinch, no sharp drop-off.",
      "Pelvis stays warm, engorged, and comfortable for 10–15 minutes.",
    ],
    "Don’t go yet. Just your hand."
  ),
  tech(
    26,
    "clitoral-orgasm",
    "release",
    "her",
    "Clitoral Glans & Complex Orgasms",
    "Most orgasms start here. Learn the three shapes of that peak.",
    "Localized or whole-body releases driven by direct or indirect stimulation of the external glans, body, and hood — high-density superficial mechanoreceptors.",
    "The glans packs enormous innervation into a tiny surface. Signals travel the pudendal nerve into S2–S4 and fire rapid levator ani pulses. Engorged bulbs lift the glans; the hood is the safe friction surface. Going raw on the tip is usually why it feels “too sensitive.”",
    "The 3 clitoral orgasm variations",
    [
      kind(
        "Glans-Focused Peak",
        "Fast rhythmic near-direct stimulation. Intense, localized, rhythmic contractions.",
        "Orbiting or Rhythm over the hood, ample lube, absolute Consistency at threshold."
      ),
      kind(
        "Broad-Complex Peak",
        "Labia minora, hood, and mound — a wider, warmer whole-vulva release.",
        "Flat fingers or a wide vibrator across mons and labia, compressing internal bulbs from outside."
      ),
      kind(
        "Blended Clitoral-Internal Peak",
        "Pudendal plus pelvic/vagus at once.",
        "Continuous external touch plus static internal pressure on the anterior wall. Both steady through release."
      ),
    ],
    "10-minute Clitoral orgasm protocol",
    [
      step(
        "0–3",
        "Lube & hood mapping",
        "Generous lube on the hood. Light broad circles around the outer perimeter. Not the centre.",
        180
      ),
      step(
        "3–6",
        "Targeted rhythm",
        "Onto the hood. 1–2 strokes per second, Orbiting or low-amplitude vibration. Pressure rises with engorgement.",
        180
      ),
      step(
        "6–8",
        "Build the edge",
        "Lock tempo and pressure. No sudden shifts.",
        120
      ),
      step(
        "8–10",
        "Consistency through contraction",
        "When involuntary pulses start, do not stop or speed up. Identical friction through the whole sequence.",
        120
      ),
    ],
    "Signs of an approaching clitoral orgasm",
    [
      "Rhythmic pulsing of vulva and anus, about every 0.8 seconds.",
      "Glans retracts slightly under the hood at peak engorgement.",
    ],
    "Same beat. Through it."
  ),
  tech(
    27,
    "deep-vaginal",
    "release",
    "her",
    "Deep Vaginal / G-Spot & Cervical",
    "A heavier wave. It needs arousal first, then patience.",
    "Deep, visceral releases from sustained pressure, friction, or compression on the anterior wall (G-spot area) and the deep posterior fornix near the cervix.",
    "Deep input travels pelvic plexus and vagus — sometimes even when spinal routes are damaged. The “G-spot” is the nerve-rich meeting of internal clitoral bulbs, urethral sponge, and front wall. Cervical pressure can release high oxytocin and rolling uterine contractions rather than quick vulvar pulses.",
    "The 3 deep internal orgasm vectors",
    [
      kind(
        "Anterior Wall / G-Spot Peak",
        "Sustained upward firm pressure 1–2 inches in. Heavy pelvic fullness into systemic contractions.",
        "Two fingers or a curved wand, palm-up. “Come hither” toward the belly button. Steady compression."
      ),
      kind(
        "Cervical / Posterior Fornix Peak",
        "Gentle static or slow press into the deep vault.",
        "Full slow depth only in a highly relaxed, already-aroused state. Broad pressure, no aggressive thrusting."
      ),
      kind(
        "The Full-Canal Siphon",
        "Shallow entrance pressure plus deep wall compression along the whole length.",
        "Long dragging outstrokes with continuous upward leverage on the front wall."
      ),
    ],
    "10-minute Deep vaginal protocol",
    [
      step(
        "0–3",
        "Arousal & tenting",
        "High baseline arousal first. Inner canal expands and the cervix lifts. Deep touch before that is often just ache.",
        180
      ),
      step(
        "3–6",
        "Anterior wall",
        "Curved tool or fingers 1.5–2 inches in. Find the spongy front-wall tissue. Firm slow upward presses or micro-rolls.",
        180
      ),
      step(
        "6–8",
        "The fullness / urge",
        "A “need to pee” feeling is common. Do not stop. Relax the pelvic floor. Deep exhales.",
        120
      ),
      step(
        "8–10",
        "Sustained compression",
        "Less sliding. Continuous firm static pressure or deep micro-rocking until rolling lower-abdomen waves arrive.",
        120
      ),
    ],
    "Signs of an approaching deep vaginal orgasm",
    [
      "Heavy spreading warmth deep in the pelvis, not a surface tickle.",
      "Longer internal core waves rather than entrance pulses.",
    ],
    "Press up and stay. I’ll tell you if I need you to ease."
  ),
  tech(
    28,
    "blended-waves",
    "release",
    "her",
    "Blended, Squirting & Waves",
    "Two nerves at once. Then don’t drop the contact.",
    "Advanced multi-system releases: blended orgasms, ejaculatory or squirting release, and successive waves without a full refractory drop.",
    "Blended work recruits pudendal and pelvic/vagus together — more cortex, longer whole-body states. Female ejaculation is a small milky Skene’s-gland release; squirting is a larger clear volume from the bladder during intense anterior-wall compression. Unlike a typical male refractory period, steady low-friction touch can carry remaining vasocongestion into the next wave.",
    "The 3 advanced release frameworks",
    [
      kind(
        "The Blended Fusion",
        "Peak on external glans and internal anterior wall at the same time.",
        "Lock external vibrator or finger rhythm. Firm upward G-spot pressure. Hold both until they merge."
      ),
      kind(
        "Ejaculatory / Squirting Trigger",
        "Intense sustained anterior-wall compression plus a fully released pelvic floor.",
        "Firm continuous G-spot strokes. When the urge to push arrives, do not squeeze. Bear down gently, exhale, let fluid happen."
      ),
      kind(
        "The Multi-Wave Cascade",
        "Re-initiate light steady stimulation as the first release subsides.",
        "Post-Peak touch for 15 seconds, then slow Shallowing or Orbiting on the remaining engorgement."
      ),
    ],
    "Blended & Wave protocol",
    [
      step(
        "0–4",
        "Dual-zone setup",
        "High baseline arousal. Absorbent towel. Extra lube inside and out.",
        240
      ),
      step(
        "4–7",
        "Dual-zone sync",
        "Steady G-spot pressure plus light consistent external clitoral touch. One shared rhythm.",
        180
      ),
      step(
        "7–9",
        "Push / release",
        "Lean into internal fullness. Belly breaths, jaw soft, pelvic holding gone. If fluid comes, do not stop movement.",
        120
      ),
      step(
        "9–12",
        "Ride the cascade",
        "Primary release finishes: drop speed 50%, lighten, stay in contact 20 seconds, then slowly rebuild.",
        180
      ),
    ],
    "Signs of an imminent blended or ejaculatory release",
    [
      "Heavy fullness behind the pubic bone and an impulse to push outward.",
      "Trembling in thighs, glutes, abdomen before a widespread autonomic release.",
    ],
    "If I push, don’t stop. Just stay with me."
  ),
];
