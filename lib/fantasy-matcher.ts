import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import { applyOverlay } from "@/lib/catalog-overlay";
import { localDateKey } from "@/lib/dates";
import type { FantasyTonightAsk } from "@/lib/types";

export type FantasyIcon = ComponentProps<typeof Ionicons>["name"];

export type FantasyCategoryId =
  | "oral"
  | "anal"
  | "toys"
  | "film"
  | "group"
  | "power"
  | "impact"
  | "places"
  | "watch"
  | "body";

export type FantasyIdea = {
  id: string;
  title: string;
  category: FantasyCategoryId;
};

export type FantasyCategory = {
  id: FantasyCategoryId;
  label: string;
  tint: string;
  icon: FantasyIcon;
};

export const FANTASY_CATEGORIES: FantasyCategory[] = [
  { id: "oral", label: "Oral", tint: "#FF6B9A", icon: "happy-outline" },
  { id: "anal", label: "Anal", tint: "#C084FC", icon: "flash-outline" },
  { id: "toys", label: "Toys", tint: "#F0A46A", icon: "cube-outline" },
  { id: "film", label: "Film", tint: "#5B8CFF", icon: "videocam-outline" },
  { id: "group", label: "Others", tint: "#FB7185", icon: "people-outline" },
  { id: "power", label: "Power", tint: "#FF5C7A", icon: "lock-closed-outline" },
  { id: "impact", label: "Impact", tint: "#E11D48", icon: "thunderstorm-outline" },
  { id: "places", label: "Places", tint: "#3ECFBF", icon: "location-outline" },
  { id: "watch", label: "Watch", tint: "#E4C37A", icon: "eye-outline" },
  { id: "body", label: "Body", tint: "#F472B6", icon: "heart-outline" },
];

const SHORTS: [string, string, FantasyCategoryId][] = [
  ["oral-f", "M goes down on F", "oral"],
  ["oral-m", "F gives M a blowjob", "oral"],
  ["oral-69", "Sixty-nine, both mouths at once", "oral"],
  ["oral-facesit", "F sits on M's face", "oral"],
  ["oral-deep-m", "F deep-throats M", "oral"],
  ["oral-slow-m", "F gives M a slow, teasing blowjob", "oral"],
  ["oral-fast-f", "M gives F fast, hungry oral", "oral"],
  ["oral-morning-m", "F wakes M with a blowjob", "oral"],
  ["oral-wake-f", "M wakes F by going down on her", "oral"],
  ["oral-wall", "M goes down on F against the wall", "oral"],
  ["oral-bed-edge", "M goes down on F sitting on the edge of the bed", "oral"],
  ["oral-stand", "F kneels and goes down on M while he stands", "oral"],
  ["oral-mirror", "M goes down on F in front of the mirror", "oral"],
  ["oral-handsfree-m", "F blows M with no hands", "oral"],
  ["oral-tease", "F teases M with her mouth, doesn't let him finish yet", "oral"],
  ["oral-shower", "M goes down on F after a shower", "oral"],
  ["oral-car", "F gives M head in the car", "oral"],
  ["oral-tv", "F goes down on M while he tries to watch TV", "oral"],
  ["oral-ice", "Ice then a warm mouth, F and M take turns", "oral"],
  ["oral-beg", "M keeps going down on F until she begs", "oral"],
  ["oral-swallow", "F swallows when M cums", "oral"],
  ["oral-finish-her-tongue", "M cums on F's tongue", "oral"],
  ["oral-finish-his-tongue", "F cums on M's tongue", "oral"],
  ["oral-vibe-f", "M goes down on F with a vibe on her clit", "oral"],
  ["oral-tied-f", "M goes down on F while she's tied", "oral"],
  ["oral-tied-m", "F blows M while he's tied", "oral"],
  ["oral-sloppy-m", "F gives M a sloppy, messy blowjob", "oral"],
  ["oral-gentle-f", "M gives F soft, slow oral", "oral"],
  ["oral-all-night", "The whole night is just oral", "oral"],
  ["oral-eye-contact", "F goes down on M and doesn't break eye contact", "oral"],
  ["anal-f", "M has anal sex with F", "anal"],
  ["anal-m", "F has anal sex with M", "anal"],
  ["anal-finger-f", "M puts a first finger in F's ass", "anal"],
  ["anal-finger-m", "F puts a first finger in M's ass", "anal"],
  ["anal-plug-f-sex", "F wears a plug during sex", "anal"],
  ["anal-plug-m-sex", "M wears a plug during sex", "anal"],
  ["anal-behind-f", "M has anal with F from behind", "anal"],
  ["anal-f-on-top", "F is on top for anal", "anal"],
  ["anal-slow-f", "M has slow anal with F", "anal"],
  ["anal-slow-m", "F has slow anal with M", "anal"],
  ["anal-lube", "Anal with way too much lube", "anal"],
  ["anal-after-oral", "Oral first, then anal", "anal"],
  ["anal-shower", "Anal in the shower", "anal"],
  ["anal-tied-f", "M has anal with F while she's tied", "anal"],
  ["anal-tied-m", "F has anal with M while he's tied", "anal"],
  ["anal-strap-m", "F fucks M with a strap-on", "anal"],
  ["anal-strap-f", "M uses a strap-on on F", "anal"],
  ["anal-training", "A slow, patient anal training night", "anal"],
  ["anal-only", "An anal-only night, nothing else", "anal"],
  ["anal-toy-first", "M opens F with a toy, then anal", "anal"],
  ["anal-rim-f", "M rims F", "anal"],
  ["anal-rim-m", "F rims M", "anal"],
  ["anal-mirror", "Anal in front of a mirror", "anal"],
  ["anal-then-vag", "Anal first, then vaginal", "anal"],
  ["anal-vag-then", "Vaginal first, then anal", "anal"],
  ["anal-floor", "Anal on the floor", "anal"],
  ["anal-counter", "Anal against the kitchen counter", "anal"],
  ["anal-prostate", "F plays with M's prostate", "anal"],
  ["anal-talk", "Anal with filthy talk the whole time", "anal"],
  ["anal-reward", "M gives F anal as the reward she earned", "anal"],
  ["toy-f-during", "M uses a toy on F during sex", "toys"],
  ["toy-vibe-fuck", "M holds a vibe on F while he fucks her", "toys"],
  ["toy-wand-f", "M uses a wand on F until she shakes", "toys"],
  ["toy-dildo-f", "M fucks F with a dildo", "toys"],
  ["toy-rabbit", "M uses a rabbit toy on F", "toys"],
  ["toy-sleeve-m", "F strokes M with a sleeve toy", "toys"],
  ["toy-cock-ring", "M wears a cock ring", "toys"],
  ["toy-remote-public", "F wears a remote vibe out in public", "toys"],
  ["toy-remote-dinner", "M uses a remote vibe on F at dinner", "toys"],
  ["toy-porn", "M uses a toy on F while porn plays", "toys"],
  ["toy-two-f", "M uses two toys on F at once", "toys"],
  ["toy-mouth", "M puts a toy in F's mouth", "toys"],
  ["toy-tied-f", "M uses a toy on F while she's tied", "toys"],
  ["toy-tied-m", "F uses a toy on M while he's tied", "toys"],
  ["toy-together", "A couple vibe, F and M both feel it", "toys"],
  ["toy-prostate-m", "F uses a prostate toy on M", "toys"],
  ["toy-beads-f", "M uses anal beads on F", "toys"],
  ["toy-beads-m", "F uses anal beads on M", "toys"],
  ["toy-race", "Race toys, who cums first", "toys"],
  ["toy-strap-him", "F fucks M with a strap-on until he cums", "toys"],
  ["toy-he-only", "M only uses a toy on F, no cock", "toys"],
  ["toy-she-show", "F uses a toy on herself while M watches", "toys"],
  ["toy-he-show", "M uses a toy on himself while F watches", "toys"],
  ["toy-table", "F sneaks a toy under the table", "toys"],
  ["toy-bullet", "M holds a bullet vibe on F's clit", "toys"],
  ["toy-glass", "M uses a glass toy on F", "toys"],
  ["toy-app", "M controls F's toy from his phone", "toys"],
  ["toy-warmup", "M warms F up with a toy before sex", "toys"],
  ["toy-no-hands", "M makes F cum with a toy, not his hands", "toys"],
  ["toy-finish", "M finishes F with a toy", "toys"],
  ["film-head-f", "Film M going down on F", "film"],
  ["film-head-m", "Film F giving M a blowjob", "film"],
  ["film-sex", "Film F and M having sex", "film"],
  ["film-her-top", "Film F on top", "film"],
  ["film-behind", "Film M fucking F from behind", "film"],
  ["film-close", "Film a close-up of where F and M join", "film"],
  ["film-mirror", "Film F and M in the mirror", "film"],
  ["film-shower", "Film a shower together", "film"],
  ["film-photo-her", "M takes photos of F's body", "film"],
  ["film-photo-him", "F takes photos of M's body", "film"],
  ["film-voice", "Record a voice note of the night", "film"],
  ["film-replay", "Watch last time's video together, then do it again", "film"],
  ["film-toys", "Film a toy session", "film"],
  ["film-60", "Film only 60 seconds, then stop", "film"],
  ["film-her-face", "Film F's face when she cums", "film"],
  ["film-his-face", "Film M's face when he cums", "film"],
  ["film-tripod", "Set the phone on a tripod and forget it", "film"],
  ["film-one-photo", "Take one photo after F and M both finish", "film"],
  ["film-polaroid", "Take a Polaroid, then hide it", "film"],
  ["film-strip", "Film F stripping for M", "film"],
  ["film-hands", "Film only M's hands on F", "film"],
  ["film-legs", "Film F's legs and feet", "film"],
  ["film-ride", "Film F riding M", "film"],
  ["film-him-down", "Film M's face between F's legs", "film"],
  ["film-quickie", "Film a quickie", "film"],
  ["film-watch-us", "Watch a tape of F and M", "film"],
  ["film-delete", "Watch it once, then delete it", "film"],
  ["film-keep", "Keep one favourite clip", "film"],
  ["film-lights", "Film with the lights on", "film"],
  ["film-lingerie", "Film F in lingerie", "film"],
  ["group-three", "Have a threesome", "group"],
  ["group-ffm", "A threesome with another woman", "group"],
  ["group-mmf", "A threesome with another man", "group"],
  ["group-swap", "Swap with another couple", "group"],
  ["group-soft-swap", "Soft swap, kiss and touch the other couple only", "group"],
  ["group-watch-couple", "Watch another couple have sex", "group"],
  ["group-watched", "Let another couple watch F and M", "group"],
  ["group-same-room", "Swap in the same room", "group"],
  ["group-sep-rooms", "Swap, separate rooms", "group"],
  ["group-mfm", "Two men on F, M plus another", "group"],
  ["group-fmf", "Two women on M, F plus another", "group"],
  ["group-hotwife", "F plays with someone else while M watches", "group"],
  ["group-cuckold", "M watches F get fucked", "group"],
  ["group-she-woman", "F plays with another woman", "group"],
  ["group-he-man", "M plays with another man", "group"],
  ["group-third-watch", "Invite a third just to watch", "group"],
  ["group-third-oral", "Invite a third to join for oral only", "group"],
  ["group-club", "Play in a club playroom", "group"],
  ["group-hotel", "A hotel night with another couple", "group"],
  ["group-text-third", "Text a third together", "group"],
  ["group-pick-photos", "Pick a third from photos, together", "group"],
  ["group-unicorn", "Find a unicorn for one night", "group"],
  ["group-full-swap", "Full swap, sex with the other couple", "group"],
  ["group-kiss-else", "F kisses someone else while M watches", "group"],
  ["group-hands-else", "F puts her hands on someone else while M watches", "group"],
  ["group-she-directs", "F directs M with a third person", "group"],
  ["group-he-directs", "M directs F with a third person", "group"],
  ["group-aftercare-3", "Aftercare with three people", "group"],
  ["group-blind-who", "Blindfold F so she doesn't know whose hands", "group"],
  ["group-fake-third", "Roleplay a third in the room, just F and M", "group"],
  ["pow-tied", "M ties F up", "power"],
  ["pow-tied-f", "M ties F up and leaves her waiting", "power"],
  ["pow-tied-m", "F ties M up", "power"],
  ["pow-wrists-bed", "M ties F's wrists to the bed", "power"],
  ["pow-spread", "M ties F spread open", "power"],
  ["pow-collar-f", "M puts a collar on F", "power"],
  ["pow-collar-m", "F puts a collar on M", "power"],
  ["pow-leash-house", "F walks M on a leash around the house", "power"],
  ["pow-gag", "M gags F", "power"],
  ["pow-blindfold", "M blindfolds F", "power"],
  ["pow-she-charge", "F is in charge all night", "power"],
  ["pow-he-charge", "M is in charge all night", "power"],
  ["pow-ask-come", "F has to ask M for permission to cum", "power"],
  ["pow-orgasm-ctrl", "M decides if and when F gets to cum", "power"],
  ["pow-edge", "M edges F until she shakes", "power"],
  ["pow-beg", "M makes F beg for it", "power"],
  ["pow-orders", "M only gives orders, F doesn't get to ask", "power"],
  ["pow-kneel", "M makes F kneel", "power"],
  ["pow-all-fours", "M puts F on all fours and makes her wait", "power"],
  ["pow-hair", "M pulls F's hair during sex", "power"],
  ["pow-throat", "M's hand on F's throat, check in, stay safe", "power"],
  ["pow-spank", "M spanks F", "power"],
  ["pow-otk", "M pulls F over his knee and spanks her", "power"],
  ["pow-names", "M calls F the filthy names she asked for", "power"],
  ["pow-praise", "M talks F through it with praise only, good girl, no insults", "power"],
  ["pow-service", "F services M first and gets nothing until he says", "power"],
  ["pow-tied-tease", "M ties F up and teases her", "power"],
  ["pow-tied-used", "M ties F up and uses her", "power"],
  ["pow-free-use", "F is free to use for one hour", "power"],
  ["pow-safeword", "Pick a safeword and practise using it first", "power"],
  ["imp-whipped", "M whips F", "impact"],
  ["imp-crop-f", "M uses a riding crop on F", "impact"],
  ["imp-crop-m", "F uses a riding crop on M", "impact"],
  ["imp-paddle", "M paddles F", "impact"],
  ["imp-belt", "M gives F a light belt spanking", "impact"],
  ["imp-hairbrush", "M spanks F with a hairbrush", "impact"],
  ["imp-slap-ass", "M slaps F's ass", "impact"],
  ["imp-slap-face", "M gives F a consensual slap across the face", "impact"],
  ["imp-flogged", "M flogs F", "impact"],
  ["imp-cane", "M leaves cane lines on F", "impact"],
  ["imp-then-sex", "M hits F, then fucks her", "impact"],
  ["imp-then-oral", "M hits F, then goes down on her", "impact"],
  ["imp-count", "M makes F count every hit out loud", "impact"],
  ["imp-marks", "M leaves marks F will still feel tomorrow", "impact"],
  ["imp-ice", "M puts ice on the sting after he hits F", "impact"],
  ["imp-warmup", "M gives F a warm-up spanking before anything else", "impact"],
  ["imp-harder-moan", "M hits F harder every time she moans", "impact"],
  ["imp-harder-quiet", "M hits F harder if she stays quiet", "impact"],
  ["imp-thighs", "M spanks the insides of F's thighs", "impact"],
  ["imp-riding", "M spanks F while she rides him", "impact"],
  ["imp-tied", "M hits F while she's tied", "impact"],
  ["imp-she-whips", "F whips M", "impact"],
  ["imp-he-whips", "M whips F while she's bent over", "impact"],
  ["imp-heels-crop", "F wears heels and holds a riding crop", "impact"],
  ["imp-spoon", "M spanks F with a wooden spoon", "impact"],
  ["imp-hands", "M spanks F with bare hands only", "impact"],
  ["imp-punish", "M spanks F as a punishment she asked for", "impact"],
  ["imp-gift", "M spanks F as a gift she asked for", "impact"],
  ["imp-oil", "M rubs oil into F's marks after", "impact"],
  ["imp-mirror", "M shows F the marks in the mirror", "impact"],
  ["plc-counter", "Have sex on the kitchen counter", "places"],
  ["plc-shower", "Have sex in the shower", "places"],
  ["plc-wall", "M fucks F against the wall", "places"],
  ["plc-floor", "Have sex on the floor", "places"],
  ["plc-couch", "Have sex on the couch", "places"],
  ["plc-car", "Have sex in the car", "places"],
  ["plc-driveway", "Have sex in the driveway", "places"],
  ["plc-hotel", "Have sex in a hotel room", "places"],
  ["plc-balcony", "Have sex on the balcony", "places"],
  ["plc-woods", "Have sex in the woods", "places"],
  ["plc-beach", "Have sex on the beach at night", "places"],
  ["plc-changing", "Have sex in a changing room", "places"],
  ["plc-cinema", "Fool around in the cinema back row", "places"],
  ["plc-office", "Have sex in the office after hours", "places"],
  ["plc-elevator", "Risk it in an elevator", "places"],
  ["plc-stairs", "Have sex on the stairs", "places"],
  ["plc-alley", "Have a quickie in an alley", "places"],
  ["plc-pool", "Have sex in the pool", "places"],
  ["plc-hottub", "Have sex in the hot tub", "places"],
  ["plc-tent", "Have sex in a tent", "places"],
  ["plc-guest", "Have sex in the guest room", "places"],
  ["plc-window", "Have sex in front of a window", "places"],
  ["plc-washer", "Have sex on the washing machine", "places"],
  ["plc-desk", "Have sex on a desk", "places"],
  ["plc-bar-bath", "Have sex in a bar bathroom", "places"],
  ["plc-lookout", "Have sex parked at a lookout", "places"],
  ["plc-cabin", "Have sex in a cabin", "places"],
  ["plc-plane", "Mile-high fantasy, try it on a plane", "places"],
  ["plc-train", "Have sex in a train toilet", "places"],
  ["plc-roof", "Have sex on a roof or fire escape", "places"],
  ["wat-toy-her", "Watch F use a toy on herself", "watch"],
  ["wat-toy-him", "Watch M use a toy on himself", "watch"],
  ["wat-her-hands", "Watch F touch herself", "watch"],
  ["wat-him-hands", "Watch M touch himself", "watch"],
  ["wat-her-else", "M watches F with someone else", "watch"],
  ["wat-him-else", "F watches M with someone else", "watch"],
  ["wat-mirror", "Do it in front of the mirror the whole time", "watch"],
  ["wat-window", "Leave the window open a crack", "watch"],
  ["wat-lights", "Keep the lights on and look at each other the whole time", "watch"],
  ["wat-she-show", "F puts on a show, M only watches", "watch"],
  ["wat-he-show", "M puts on a show, F only watches", "watch"],
  ["wat-strip", "F does a striptease for M", "watch"],
  ["wat-lap", "F gives M a lap dance", "watch"],
  ["wat-porn-us", "Put porn on and have sex to it", "watch"],
  ["wat-porn-her", "Have sex to porn F picked", "watch"],
  ["wat-porn-him", "Have sex to porn M picked", "watch"],
  ["wat-finish", "Watch each other cum", "watch"],
  ["wat-no-touch", "No touching, M only gets to watch F", "watch"],
  ["wat-doorway", "M watches F from the doorway", "watch"],
  ["wat-catch", "M walks in on F already started", "watch"],
  ["wat-exhibit", "Do it where someone could see", "watch"],
  ["wat-almost", "Get almost caught on purpose", "watch"],
  ["wat-replay-now", "Record it, then watch it immediately", "watch"],
  ["wat-mutual", "F and M masturbate facing each other", "watch"],
  ["wat-she-talks", "F talks M through touching himself", "watch"],
  ["wat-he-talks", "M talks F through touching herself", "watch"],
  ["wat-hotel-mirror", "Watch F and M in a hotel mirror", "watch"],
  ["wat-dress", "Watch F get dressed after", "watch"],
  ["wat-hard", "Watch M get hard", "watch"],
  ["wat-eyes-come", "M doesn't look away when F cums", "watch"],
  ["bod-chest-her", "M cums on F's chest", "body"],
  ["bod-face-her", "M cums on F's face", "body"],
  ["bod-chest-him", "F cums on M's chest", "body"],
  ["bod-inside-f", "M cums inside F", "body"],
  ["bod-inside-m", "F cums inside M (anal)", "body"],
  ["bod-creampie", "Creampie, leave it in", "body"],
  ["bod-keep-going", "Creampie, then keep going", "body"],
  ["bod-breasts", "M fucks between F's breasts", "body"],
  ["bod-feet", "M uses F's feet", "body"],
  ["bod-hair-sex", "M pulls F's hair while he fucks her", "body"],
  ["bod-neck", "M kisses F's neck for a long time before anything else", "body"],
  ["bod-bites", "M leaves bite marks on F", "body"],
  ["bod-hickeys", "M leaves hickeys on F", "body"],
  ["bod-scratch-him", "F scratches M's back", "body"],
  ["bod-scratch-her", "M scratches F's back", "body"],
  ["bod-oil", "Oil all over F and M", "body"],
  ["bod-massage", "Massage that turns into sex", "body"],
  ["bod-outer", "Rub on each other, no penetration", "body"],
  ["bod-grind", "Grind clothed until neither can stand it", "body"],
  ["bod-dry", "Dry hump, then strip", "body"],
  ["bod-morning", "Have sex first thing in the morning", "body"],
  ["bod-quickie", "A quickie, in and out", "body"],
  ["bod-marathon", "A long marathon session", "body"],
  ["bod-slow-mean", "Go slow and mean", "body"],
  ["bod-fast-messy", "Go fast and messy", "body"],
  ["bod-stand", "Have sex standing up", "body"],
  ["bod-her-top", "F on top", "body"],
  ["bod-behind", "M fucks F from behind", "body"],
  ["bod-missionary", "Missionary, deep", "body"],
  ["bod-fridge", "M fucks F against the fridge", "body"],
  ["bod-nibble-ear", "M nibbles F's ear", "body"],
  ["bod-ear-nibbled", "F nibbles M's ear", "body"],
  ["bod-nibble-lip", "M nibbles F's lower lip", "body"],
  ["bod-lip-nibbled", "F nibbles M's lower lip", "body"],
  ["bod-kiss-behind-ear", "M kisses behind F's ear", "body"],
  ["bod-behind-ear-kissed", "F kisses behind M's ear", "body"],
  ["bod-suck-neck", "M sucks on F's neck", "body"],
  ["bod-neck-sucked", "F sucks on M's neck", "body"],
  ["bod-bite-lip", "M bites F's lip during a kiss", "body"],
  ["bod-lip-bit", "F bites M's lip during a kiss", "body"],
  ["bod-tongue-spine", "M runs his tongue down F's spine", "body"],
  ["bod-spine-tongued", "F runs her tongue down M's spine", "body"],
  ["bod-kiss-thigh", "M kisses the inside of F's thighs", "body"],
  ["bod-thigh-kissed", "F kisses the inside of M's thighs", "body"],
  ["bod-suck-fingers", "F sucks M's fingers", "body"],
  ["bod-fingers-sucked", "M sucks F's fingers", "body"],
  ["bod-kiss-stomach", "M kisses down F's stomach", "body"],
  ["bod-stomach-kissed", "F kisses down M's stomach", "body"],
  ["bod-nibble-shoulder", "M nibbles F's shoulder", "body"],
  ["bod-shoulder-nibbled", "F nibbles M's shoulder", "body"],
  ["bod-bite-ass", "M bites F's ass", "body"],
  ["bod-ass-bit", "F bites M's ass", "body"],
  ["bod-lick-nipples", "M licks F's nipples", "body"],
  ["bod-nipples-licked", "F licks M's nipples", "body"],
  ["bod-pinch-nipples", "M pinches F's nipples", "body"],
  ["bod-nipples-pinched", "F pinches M's nipples", "body"],
  ["bod-hold-face-kiss", "M holds F's face while he kisses her", "body"],
  ["bod-face-held-kiss", "F holds M's face while she kisses him", "body"],
  ["bod-whisper-filth", "M whispers filthy things in F's ear", "body"],
  ["bod-filth-whispered", "F whispers filthy things in M's ear", "body"],
  ["bod-undress-them", "M undresses F slowly", "body"],
  ["bod-undressed-slow", "F undresses M slowly", "body"],
  ["bod-touch-clothes", "M touches F through her clothes", "body"],
  ["bod-touched-clothes", "F touches M through his clothes", "body"],
  ["bod-hickeys-got", "F leaves hickeys on M", "body"],
  ["bod-bites-got", "F leaves bite marks on M", "body"],
  ["bod-neck-long-got", "F kisses M's neck for a long time before anything else", "body"],
  ["bod-hair-fuck-got", "F pulls M's hair while she fucks him", "body"],
  ["bod-feet-on-them", "F uses her feet on M", "body"],
  ["bod-feet-used", "F uses M's feet", "body"],
  ["bod-scratch-got", "F scratches M's back until it marks", "body"],
  ["bod-behind-got", "F takes M from behind", "body"],
  ["bod-pin-wrists", "M pins F's wrists above her head", "body"],
  ["bod-wrists-pinned", "F pins M's wrists above his head", "body"],
  ["bod-legs-shoulders", "M puts F's legs over his shoulders", "body"],
  ["bod-legs-shoulders-got", "F puts M's legs over her shoulders", "body"],
  ["bod-spit-mouth", "M spits in F's mouth", "body"],
  ["bod-spit-got", "F spits in M's mouth", "body"],
  ["bod-cum-stomach", "M cums on F's stomach", "body"],
  ["bod-stomach-came", "F cums on M's stomach", "body"],
  ["bod-cum-back", "M cums on F's back", "body"],
  ["bod-back-came", "F cums on M's back", "body"],
  ["bod-slap-breasts", "M slaps F's breasts", "body"],
  ["bod-breasts-slapped", "F slaps M's chest", "body"],
  ["bod-eat-creampie", "M eats a creampie out of F", "body"],
  ["bod-creampie-eaten", "F makes M eat a creampie out of her", "body"],
  ["bod-kiss-feet", "M kisses F's feet", "body"],
  ["bod-feet-kissed", "F kisses M's feet", "body"],
  ["bod-suck-toes", "M sucks F's toes", "body"],
  ["bod-toes-sucked", "F sucks M's toes", "body"],
  ["oral-under-table", "F goes down on M under the table", "oral"],
  ["oral-under-table-got", "M goes down on F under the table", "oral"],
  ["oral-while-work", "F goes down on M while he tries to work", "oral"],
  ["oral-while-work-got", "M goes down on F while she tries to work", "oral"],
  ["oral-balls", "F sucks M's balls", "oral"],
  ["oral-balls-got", "F sucks M's balls while he holds her hair", "oral"],
  ["oral-from-behind", "M goes down on F from behind", "oral"],
  ["oral-from-behind-got", "F goes down on M from behind", "oral"],
  ["oral-hold-head", "M holds F's head while she goes down on him", "oral"],
  ["oral-head-held", "F holds M's head while he goes down on her", "oral"],
  ["oral-sit-face", "F sits on M's face and stays there", "oral"],
  ["oral-face-sat", "M sits on F's face", "oral"],
  ["oral-wake-you", "F wakes M with oral", "oral"],
  ["oral-tease-got", "M teases F with his mouth, doesn't let her finish yet", "oral"],
  ["oral-until-beg-got", "F keeps going down on M until he begs", "oral"],
  ["oral-swallow-them", "M swallows when F cums", "oral"],
  ["oral-cum-mouth", "M cums in F's mouth", "oral"],
  ["oral-mouth-came", "F cums in M's mouth", "oral"],
  ["oral-stand-got", "M kneels and goes down on F while she stands", "oral"],
  ["oral-wall-got", "F goes down on M against the wall", "oral"],
  ["oral-shower-got", "F goes down on M after a shower", "oral"],
  ["oral-car-got", "M goes down on F in the car", "oral"],
  ["oral-eye-got", "M goes down on F and doesn't break eye contact", "oral"],
  ["oral-tied-you", "F goes down on M while he's tied", "oral"],
  ["anal-finger-you", "F's first finger in M, slow, checking in", "anal"],
  ["anal-rim-got", "F rims M until he shakes", "anal"],
  ["anal-plug-leave", "M puts a plug in F and leaves it in", "anal"],
  ["anal-plug-left", "F puts a plug in M and leaves it in", "anal"],
  ["anal-prostate-got", "F plays with M's prostate until he cums", "anal"],
  ["anal-reward-got", "F gives M anal as the reward he earned", "anal"],
  ["anal-toy-first-got", "F opens M with a toy, then anal", "anal"],
  ["anal-strap-you-m", "F fucks M with a strap-on, he's on all fours", "anal"],
  ["anal-strap-you-f", "M uses a strap-on on F, she's on all fours", "anal"],
  ["anal-two-fingers", "M uses two fingers in F's ass", "anal"],
  ["anal-two-fingers-got", "F uses two fingers in M's ass", "anal"],
  ["anal-hold-cheeks", "M holds F's ass open", "anal"],
  ["anal-cheeks-held", "F holds M's ass open", "anal"],
  ["toy-you-during", "F uses a toy on M during sex", "toys"],
  ["toy-warmup-got", "F warms M up with a toy before sex", "toys"],
  ["toy-finish-got", "F finishes M with a toy", "toys"],
  ["toy-app-got", "F controls M's toy from her phone", "toys"],
  ["toy-no-hands-got", "F makes M cum with a toy, not her hands", "toys"],
  ["toy-ring-on", "F puts a cock ring on M", "toys"],
  ["toy-ring-got", "F locks a cock ring onto M", "toys"],
  ["toy-mouth-you", "F puts a toy in M's mouth", "toys"],
  ["toy-clamps-on", "M puts nipple clamps on F", "toys"],
  ["toy-clamps-got", "F puts nipple clamps on M", "toys"],
  ["toy-spreader-on", "M uses a spreader bar on F", "toys"],
  ["toy-spreader-got", "F uses a spreader bar on M", "toys"],
  ["toy-cage-m", "F locks M in a cock cage", "toys"],
  ["toy-cage-key", "F holds the key to M's cage", "toys"],
  ["toy-wand-you", "F uses a wand on M until he shakes", "toys"],
  ["toy-beads-you", "F pulls anal beads out of M as he cums", "toys"],
  ["pow-tied-got", "F ties M up and walks away for a bit", "power"],
  ["pow-tied-f-got", "F ties M up and leaves him waiting", "power"],
  ["pow-tied-m-got", "M ties F's ankles and wrists", "power"],
  ["pow-wrists-got", "F ties M's wrists to the bed", "power"],
  ["pow-spread-got", "F ties M spread open", "power"],
  ["pow-collar-you-f", "F collars M and keeps the lead in her hand", "power"],
  ["pow-collar-you-m", "M puts a collar on F and keeps the lead", "power"],
  ["pow-leash-got", "M walks F on a leash around the house", "power"],
  ["pow-gag-got", "F gags M", "power"],
  ["pow-blind-got", "F blindfolds M", "power"],
  ["pow-ask-you", "M has to ask F for permission to cum", "power"],
  ["pow-ctrl-you", "F decides if and when M gets to cum", "power"],
  ["pow-edge-got", "F edges M until he shakes", "power"],
  ["pow-beg-you", "F makes M beg for it", "power"],
  ["pow-orders-got", "F only gives orders, M doesn't get to ask", "power"],
  ["pow-kneel-you", "F makes M kneel", "power"],
  ["pow-fours-got", "F puts M on all fours and makes him wait", "power"],
  ["pow-hair-got", "F pulls M's hair during sex", "power"],
  ["pow-throat-got", "F's hand on M's throat, check in, stay safe", "power"],
  ["pow-spank-got", "F spanks M", "power"],
  ["pow-otk-got", "F pulls M over her knee and spanks him", "power"],
  ["pow-names-got", "F calls M the filthy names he asked for", "power"],
  ["pow-praise-got", "F talks M through it with praise only, good boy, no insults", "power"],
  ["pow-service-you", "M services F first and gets nothing until she says", "power"],
  ["pow-tease-got", "F ties M up and teases him", "power"],
  ["pow-used-got", "F ties M up and uses him", "power"],
  ["pow-free-you", "M is free to use for one hour", "power"],
  ["pow-crawl", "M makes F crawl to him", "power"],
  ["pow-crawl-you", "F makes M crawl to her", "power"],
  ["imp-whip-got", "F whips M until he asks to stop", "impact"],
  ["imp-crop-you", "F uses a riding crop on M's ass", "impact"],
  ["imp-paddle-got", "F paddles M", "impact"],
  ["imp-belt-got", "F gives M a light belt spanking", "impact"],
  ["imp-brush-got", "F spanks M with a hairbrush", "impact"],
  ["imp-ass-slapped", "F slaps M's ass", "impact"],
  ["imp-face-slapped", "F gives M a consensual slap across the face", "impact"],
  ["imp-flog-got", "F flogs M", "impact"],
  ["imp-cane-got", "F leaves cane lines on M", "impact"],
  ["imp-then-sex-got", "F hits M, then fucks him", "impact"],
  ["imp-then-oral-got", "F hits M, then goes down on him", "impact"],
  ["imp-count-you", "F makes M count every hit out loud", "impact"],
  ["imp-marks-you", "F leaves marks M will still feel tomorrow", "impact"],
  ["imp-ice-got", "F puts ice on the sting after she hits M", "impact"],
  ["imp-warmup-got", "F gives M a warm-up spanking before anything else", "impact"],
  ["imp-thighs-got", "F spanks the insides of M's thighs", "impact"],
  ["imp-ride-spank-got", "F spanks M while he is on all fours", "impact"],
  ["imp-tied-hit-got", "F hits M while he's tied", "impact"],
  ["imp-spoon-got", "F spanks M with a wooden spoon", "impact"],
  ["imp-hands-got", "F spanks M with bare hands only", "impact"],
  ["imp-punish-got", "F spanks M as a punishment he asked for", "impact"],
  ["imp-gift-got", "F spanks M as a gift he asked for", "impact"],
  ["imp-oil-got", "F rubs oil into M's marks after", "impact"],
  ["imp-mirror-got", "F shows M the marks in the mirror", "impact"],
  ["wat-strip-you", "M does a striptease for F", "watch"],
  ["wat-lap-you", "M gives F a lap dance", "watch"],
  ["wat-door-you", "F watches M from the doorway", "watch"],
  ["wat-catch-you", "F walks in on M already started", "watch"],
  ["wat-club-watch", "Watch other people at a sex club", "watch"],
  ["wat-club-watched", "F and M get watched at a sex club", "watch"],
  ["film-photo-you", "F takes nudes of M", "film"],
  ["film-nudes-got", "M takes nudes of F", "film"],
  ["film-send", "F sends M a dirty photo from work", "film"],
  ["film-send-got", "M sends F a dirty photo from work", "film"],
  ["plc-bath", "Have sex in the bath", "places"],
  ["plc-closet", "Have sex in a closet", "places"],
  ["plc-work-bath", "Have sex in a work bathroom", "places"],
  ["plc-party-sneak", "Sneak off at a party", "places"],
  ["plc-wedding-sneak", "Sneak off at a wedding", "places"],
  ["plc-park-bench", "Fool around on a park bench at night", "places"],
  ["plc-sauna", "Fool around in a sauna", "places"],
  ["plc-library", "Fool around in a library", "places"],
  ["plc-sex-club", "Visit a sex club together", "places"],
  ["plc-club-dark", "Go into a sex-club dark room", "places"],
  ["plc-glory", "M uses a glory hole", "places"],
  ["plc-glory-got", "F is on the receiving side of a glory hole", "places"],
  ["plc-adult-cinema", "Fool around in an adult cinema", "places"],
  ["plc-motel", "Have a cheap motel afternoon", "places"],
  ["group-club-look", "Visit a sex club and only watch", "group"],
  ["group-club-soft", "Soft play at a sex club, touch, no sex", "group"],
  ["group-sex-party", "Go to a sex party", "group"],
  ["group-orgy", "Join an orgy", "group"],
  ["group-kiss-got", "M kisses someone else while F watches", "group"],
  ["group-hands-got", "M puts his hands on someone else while F watches", "group"],
  ["group-watched-close", "Another couple watches F and M up close", "group"],
  ["group-watch-close", "Watch another couple up close", "group"],
  ["group-oral-else", "F goes down on someone else while M watches", "group"],
  ["group-oral-else-got", "M goes down on someone else while F watches", "group"],
];

const FANTASY_SEED: FantasyIdea[] = SHORTS.map(([id, title, category]) => ({
  id: `fx-${id}`,
  title,
  category,
}));

function asFantasyCategory(value: string | undefined, fallback: FantasyCategoryId): FantasyCategoryId {
  return FANTASY_CATEGORIES.some((row) => row.id === value)
    ? (value as FantasyCategoryId)
    : fallback;
}

export function fantasyIdeas(includeHidden = false): FantasyIdea[] {
  return applyOverlay(
    "fantasy",
    FANTASY_SEED,
    (row, edit) => ({
      ...row,
      title: edit.title?.trim() || row.title,
      category: asFantasyCategory(edit.group, row.category),
    }),
    (row) => ({
      id: row.id,
      title: row.title.trim() || "Untitled",
      category: asFantasyCategory(row.group, "body"),
    }),
    includeHidden
  );
}

/** @deprecated use fantasyIdeas(), kept for older imports */
export const FANTASY_IDEAS = FANTASY_SEED;

export function fantasyById(id: string): FantasyIdea | null {
  return fantasyIdeas().find((item) => item.id === id) ?? null;
}

export function fantasyCategoryMeta(id: FantasyCategoryId): FantasyCategory {
  return (
    FANTASY_CATEGORIES.find((item) => item.id === id) ?? FANTASY_CATEGORIES[0]
  );
}

function seededRand(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], rand: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

/**
 * One shuffled deck for this couple + user, then leftover cards keep that order.
 * Rebuilding from leftovers with the same seed used to put the same category
 * first after every swipe (ten Toys in a row).
 */
function fantasySeenKey(userId: string): string {
  return `duoma:fantasy-seen:${userId}`;
}

export function loadLocalFantasySeen(userId: string | null | undefined): string[] {
  if (!userId || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(fantasySeenKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function addLocalFantasySeen(userId: string, fantasyId: string): string[] {
  const next = [...new Set([...loadLocalFantasySeen(userId), fantasyId])].slice(-400);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(fantasySeenKey(userId), JSON.stringify(next));
    }
  } catch {
    // Private mode can block this. The live swipe still stays in memory.
  }
  return next;
}

export function removeLocalFantasySeen(userId: string, fantasyId: string): string[] {
  const next = loadLocalFantasySeen(userId).filter((id) => id !== fantasyId);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(fantasySeenKey(userId), JSON.stringify(next));
    }
  } catch {
    // Ignore.
  }
  return next;
}

export function leftoverFantasies(
  seenIds: Iterable<string>,
  seed = "deck"
): FantasyIdea[] {
  const seen = new Set(seenIds);
  return shuffledFantasyDeck(`${seed}:v2`).filter((idea) => !seen.has(idea.id));
}

function shuffledFantasyDeck(seed: string): FantasyIdea[] {
  const rand = seededRand(seed);
  const bag = shuffleInPlace([...fantasyIdeas()], rand);
  const mixed: FantasyIdea[] = [];
  while (bag.length) {
    const last = mixed[mixed.length - 1]?.category;
    const options = bag
      .map((idea, index) => index)
      .filter((index) => bag[index]!.category !== last);
    const pool = options.length > 0 ? options : bag.map((_, index) => index);
    const pick = pool[Math.floor(rand() * pool.length)]!;
    const [next] = bag.splice(pick, 1);
    mixed.push(next!);
  }
  return mixed;
}

/** Swap F / M labels for the couple's names. Leave he / she / him / his / her alone. */
export function personalizeFantasyTitle(
  title: string,
  cast: { f: string; m: string }
): string {
  const next = title
    .replace(/\bF's\b/g, `${cast.f}'s`)
    .replace(/\bM's\b/g, `${cast.m}'s`)
    .replace(/\bF\b/g, cast.f)
    .replace(/\bM\b/g, cast.m);
  if (/^[FM]\b/.test(title) && next[0] && next[0] === next[0].toLowerCase()) {
    return next.charAt(0).toUpperCase() + next.slice(1);
  }
  return next;
}

export function groupFantasiesByCategory(ideas: FantasyIdea[]): {
  category: FantasyCategory;
  items: FantasyIdea[];
}[] {
  return FANTASY_CATEGORIES.map((category) => ({
    category,
    items: ideas.filter((idea) => idea.category === category.id),
  })).filter((row) => row.items.length > 0);
}

/** Deterministic subset of idea ids a demo partner "already liked". */
export function demoLikedFantasyIds(): string[] {
  return fantasyIdeas()
    .filter((_, index) => index % 3 === 0)
    .map((item) => item.id);
}

export function isTonightAskLive(
  ask: FantasyTonightAsk,
  nightKey = localDateKey()
): boolean {
  return ask.nightKey === nightKey;
}

export function tonightAskForFantasy(
  asks: FantasyTonightAsk[],
  fantasyId: string,
  nightKey = localDateKey()
): FantasyTonightAsk | null {
  const live = asks.filter(
    (row) => row.fantasyId === fantasyId && isTonightAskLive(row, nightKey)
  );
  return (
    live.find((row) => row.status === "offered") ??
    live.find((row) => row.status === "accepted") ??
    live[0] ??
    null
  );
}

export function incomingTonightAsks(
  asks: FantasyTonightAsk[],
  userId: string,
  nightKey = localDateKey()
): FantasyTonightAsk[] {
  return asks.filter(
    (row) =>
      row.toUserId === userId &&
      row.status === "offered" &&
      isTonightAskLive(row, nightKey)
  );
}
