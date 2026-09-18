import { applyOverlay } from "@/lib/catalog-overlay";

export type RoleplayCategoryId =
  | "professional"
  | "workplace"
  | "strangers"
  | "medical"
  | "fantasy"
  | "authority"
  | "domestic"
  | "scifi"
  | "public"
  | "bdsm";

export type Roleplay = {
  id: string;
  name: string;
  category: RoleplayCategoryId;
  blurb: string;
};

export type RoleplayCategory = {
  id: RoleplayCategoryId;
  label: string;
  detail: string;
  icon: string;
};

export const ROLEPLAY_CATEGORIES: RoleplayCategory[] = [
  {
    id: "professional",
    label: "Professional Services & Trades",
    detail: "Tradies, service callers, and in-home pros who cross the line.",
    icon: "construct-outline",
  },
  {
    id: "workplace",
    label: "Workplace & Corporate Authority",
    detail: "Bosses, desks, overtime, and locked office doors.",
    icon: "briefcase-outline",
  },
  {
    id: "strangers",
    label: "Strangers, Escaping & Stealth",
    detail: "Wrong doors, quiet corners, and getting caught mid-risk.",
    icon: "eye-outline",
  },
  {
    id: "medical",
    label: "Medical & Institutional Care",
    detail: "Exams, rounds, therapy tables, and private curtains.",
    icon: "medkit-outline",
  },
  {
    id: "fantasy",
    label: "Fantasy, Historical & Royalty",
    detail: "Knights, pirates, vampires, and royal chambers.",
    icon: "sparkles-outline",
  },
  {
    id: "authority",
    label: "Authority, Discipline & Taboo Dynamics",
    detail: "Cuffs, inspections, detention, and power imbalance.",
    icon: "shield-outline",
  },
  {
    id: "domestic",
    label: "Taboo Domestic & Household",
    detail: "Household dynamics, walk-ins, and forbidden rooms.",
    icon: "home-outline",
  },
  {
    id: "scifi",
    label: "Sci-Fi, Superhuman & Supernatural",
    detail: "Aliens, shifters, holodecks, and otherworldly touch.",
    icon: "planet-outline",
  },
  {
    id: "public",
    label: "Public Risk, Sports & Outdoor",
    detail: "Lockers, trails, hot tubs, and almost getting caught.",
    icon: "fitness-outline",
  },
  {
    id: "bdsm",
    label: "BDSM, Fetish & Heavy Kink",
    detail: "Collars, restraints, impact, and sensory play.",
    icon: "link-outline",
  },
];

export const ROLEPLAYS: Roleplay[] = [
  {
    id: "the-late-night-electrician",
    name: "The Late-Night Electrician",
    category: "professional",
    blurb: "The power dies. M works the dark hallway by flashlight. F leans in the bedroom doorway in an open robe and tells him the fuse box can wait, her mouth can't.",
  },
  {
    id: "the-maid-s-inspection",
    name: "The Maid's Inspection",
    category: "professional",
    blurb: "F stands at the foot of the bed in the black-and-white uniform, waiting. M, still in his robe, circles her, lifts the apron, and tells her the room fails until she is on the mattress.",
  },
  {
    id: "the-personal-trainer-s-stretch",
    name: "The Personal Trainer's Stretch",
    category: "professional",
    blurb: "M holds F in a split on the gym mat and will not let her close her thighs. Every correction is a hand higher on her hip until the set is him inside her.",
  },
  {
    id: "the-massage-therapist-s-upgrade",
    name: "The Massage Therapist's Upgrade",
    category: "professional",
    blurb: "F is face-down under one towel. M works oil down her spine, then under the towel, and tells her to turn over if she wants the real appointment.",
  },
  {
    id: "the-delivery-driver-s-tip",
    name: "The Delivery Driver's Tip",
    category: "professional",
    blurb: "F opens the door in a thin sundress, no cash in her hand. She takes the box, then his belt, and pulls him over the threshold before the porch light clicks off.",
  },
  {
    id: "the-pool-cleaner-s-dip",
    name: "The Pool Cleaner's Dip",
    category: "professional",
    blurb: "M is shirtless with the skimmer. F watches from the lounger, swimsuit already wet, and tells him to drop the pole and earn the rest of his afternoon on top of her.",
  },
  {
    id: "the-private-chef-s-taste-test",
    name: "The Private Chef's Taste Test",
    category: "professional",
    blurb: "M feeds F from a spoon over the kitchen island, then paints the next taste down her throat and between her breasts and makes her stay still while he finishes dinner on her.",
  },
  {
    id: "the-car-detailer-s-inspection",
    name: "The Car Detailer's Inspection",
    category: "professional",
    blurb: "Rain on the windshield. F is in the driver's seat. M leans across from the passenger side, hand on her thigh, and says the leather in back still needs his mouth.",
  },
  {
    id: "the-tutor-s-extra-credit",
    name: "The Tutor's Extra Credit",
    category: "professional",
    blurb: "F sits on a student desk in a tight skirt. M stays behind his, voice low, and tells her the only way she passes is under that desk until he says stop.",
  },
  {
    id: "the-locksmith-s-entry",
    name: "The Locksmith's Entry",
    category: "professional",
    blurb: "F is locked out in a robe. M picks the door, follows her into the dark hall, and she tells him to lock it from the inside and finish the job against the wall.",
  },
  {
    id: "the-plumber-under-the-sink",
    name: "The Plumber Under the Sink",
    category: "professional",
    blurb: "M is on his back under the kitchen sink. F stands over him in the robe, one foot on either side of his shoulders, and asks if he can see what is leaking now.",
  },
  {
    id: "the-accidental-view",
    name: "The Accidental View",
    category: "professional",
    blurb: "M opens the bedroom door to fix the light and finds F already touching herself. She does not cover up. She tells him to close the door and put the flashlight down.",
  },

  {
    id: "the-boss-s-after-hours-audit",
    name: "The Boss's After-Hours Audit",
    category: "workplace",
    blurb: "City lights behind the glass. F sits on his desk in a pencil skirt. M locks the door, stands between her knees, and audits how quiet she can stay on his cock.",
  },
  {
    id: "the-executive-interview",
    name: "The Executive Interview",
    category: "workplace",
    blurb: "M interviews F after hours. The last question is not verbal. He tells her to hike the skirt, stay on the desk, and show him why she wants the job.",
  },
  {
    id: "the-performance-review",
    name: "The Performance Review",
    category: "workplace",
    blurb: "M bends F over the walnut desk for \"attitude.\" Skirt up, palms flat, he spanks until she is wet, then takes her from behind while the skyline watches.",
  },
  {
    id: "the-overtime-interruption",
    name: "The Overtime Interruption",
    category: "workplace",
    blurb: "They are the last two in the office. M pins F to the desk she has been living at all week and fucks the deadline out of her.",
  },
  {
    id: "the-promotion-contract",
    name: "The Promotion Contract",
    category: "workplace",
    blurb: "The offer letter is under F's knees on the desk. M tells her she signs after she rides him through the last page.",
  },
  {
    id: "the-law-firm-partner",
    name: "The Law Firm Partner",
    category: "workplace",
    blurb: "M closes the blinds, sits, and unzips. F, still in court heels, is told to settle the case on her knees before anyone comes back from lunch.",
  },
  {
    id: "the-receptionist-s-bell",
    name: "The Receptionist's Bell",
    category: "workplace",
    blurb: "M rings the front desk, walks around it, and rolls F's chair in so the lobby only sees her shoulders while her mouth works him.",
  },
  {
    id: "the-ceo-s-private-jet",
    name: "The CEO's Private Jet",
    category: "workplace",
    blurb: "The cabin curtain pulls shut. M tells his assistant to leave the blazer on, climb into his lap, and keep her moans under the engine.",
  },
  {
    id: "the-business-trip-hotel",
    name: "The Business Trip Hotel",
    category: "workplace",
    blurb: "One room, one bed, champagne already open. F sits on the white sheets in the evening dress. M tells her they are not sleeping in it.",
  },
  {
    id: "the-photo-studio-shoot",
    name: "The Photo Studio Shoot",
    category: "workplace",
    blurb: "M steps into the fitting stall \"to fix the pose.\" The camera is off. His hands are not. He tells F to hold the look while he ruins the outfit.",
  },
  {
    id: "the-elevator-malfunction",
    name: "The Elevator Malfunction",
    category: "workplace",
    blurb: "Stuck between floors. M hits the stop, lifts F against the mirror, and they race the repair tech with her legs around him.",
  },
  {
    id: "the-stockroom-inventory",
    name: "The Stockroom Inventory",
    category: "workplace",
    blurb: "Between high shelves, M's hand is already under F's apron. He counts her off in thrusts so no one on the floor hears the real inventory.",
  },

  {
    id: "the-hotel-room-miscount",
    name: "The Hotel Room Miscount",
    category: "strangers",
    blurb: "Wrong door. F is on the bed in a low dress, champagne open. She looks at the stranger and says if he is already in, he should finish pouring, and then her.",
  },
  {
    id: "the-vip-backstage-pass",
    name: "The VIP Backstage Pass",
    category: "strangers",
    blurb: "Bass through the wall. M has F against the speakers and tells her the pass is only good if she stays on her knees in the dark.",
  },
  {
    id: "the-library-stacks",
    name: "The Library Stacks",
    category: "strangers",
    blurb: "A book passes between them in the stacks. M's mouth is at F's ear: not a sound. He fucks her standing, spine against first editions.",
  },
  {
    id: "the-cinema-back-row",
    name: "The Cinema Back Row",
    category: "strangers",
    blurb: "Empty back row. F slides into M's lap with the popcorn still in her hand and rides him to the score so the few seats down never turn around.",
  },
  {
    id: "the-uber-driver-s-extra-route",
    name: "The Uber Driver's Extra Route",
    category: "strangers",
    blurb: "He pulls over in the rain, looks at her in the driver's seat glow, and climbs across. Doors locked. Windows fogged. Trip still running.",
  },
  {
    id: "the-first-class-curtain",
    name: "The First Class Curtain",
    category: "strangers",
    blurb: "Red-eye, curtain drawn. M's hand is already under the blanket. F keeps her face calm for the aisle and lets him take her in the dark.",
  },
  {
    id: "the-train-compartment",
    name: "The Train Compartment",
    category: "strangers",
    blurb: "One bunk, blinds down, countryside sliding past. They stop pretending to share it and use the narrow mattress until the next station.",
  },
  {
    id: "the-ski-lift-hold",
    name: "The Ski Lift Hold",
    category: "strangers",
    blurb: "The lift stops over the pines. M's glove is inside F's coat, then her thermals, and they have to finish before the chairs move again.",
  },
  {
    id: "the-beach-cabana",
    name: "The Beach Cabana",
    category: "strangers",
    blurb: "Sheer curtains, sunset, people on the sand ten metres away. M pulls F onto the daybed and they risk the whole beach hearing her.",
  },
  {
    id: "the-fitting-room-slip",
    name: "The Fitting Room Slip",
    category: "strangers",
    blurb: "F holds the curtain. M is already inside. Staff chatting two stalls over while he gets her jeans to her knees and fucks her against the mirror.",
  },
  {
    id: "the-rainy-bus-stop",
    name: "The Rainy Bus Stop",
    category: "strangers",
    blurb: "Soaked, pressed together under the glass. M's hand is in F's coat, two fingers deep, and the next bus's headlights are the only clock they have.",
  },
  {
    id: "the-museum-alcove",
    name: "The Museum Alcove",
    category: "strangers",
    blurb: "Behind a marble column, M has F's dress up. Security shoes click the main hall while he makes her come next to the statues.",
  },
  {
    id: "the-rooftop-access",
    name: "The Rooftop Access",
    category: "strangers",
    blurb: "The service door slams. Wind, city, coats still on. M puts F on the ledge and takes her where anyone in the tower opposite could see.",
  },
  {
    id: "the-sauna-steam",
    name: "The Sauna Steam",
    category: "strangers",
    blurb: "Towels only. Thick steam. M moves down the bench, opens F's towel, and they use the heat so nobody walking past the glass can tell where he is.",
  },
  {
    id: "the-campground-tent",
    name: "The Campground Tent",
    category: "strangers",
    blurb: "Thin nylon, neighbours six metres away. They have to stay silent while M fucks F on the sleeping bags, every zip and breath a risk.",
  },
  {
    id: "the-underground-club-nook",
    name: "The Underground Club Nook",
    category: "strangers",
    blurb: "Pink light, a wall of speakers. M holds F there and she comes on his thigh to the kick drum so the floor never notices.",
  },
  {
    id: "the-house-party-coat-room",
    name: "The House Party Coat Room",
    category: "strangers",
    blurb: "Coats on the bed, lock clicked. M has F under someone else's wool coat while the party thumps through the door.",
  },
  {
    id: "the-masked-masquerade",
    name: "The Masked Masquerade",
    category: "strangers",
    blurb: "Masks stay on. F in black silk, M on the sofa. They use the dark lounge like they will never learn each other's names.",
  },

  {
    id: "the-bedside-exam",
    name: "The Bedside Exam",
    category: "medical",
    blurb: "Gown open at the back. M closes the curtain, sets the clipboard down, and tells F to slide to the edge so he can examine her with his mouth.",
  },
  {
    id: "the-night-nurse-s-rounds",
    name: "The Night Nurse's Rounds",
    category: "medical",
    blurb: "Late wing, lights low. M checks F's chart, then the gown, then how wet she is, and writes the prescription with his fingers.",
  },
  {
    id: "the-physical-therapy-session",
    name: "The Physical Therapy Session",
    category: "medical",
    blurb: "F is face-down on the table. M works her hips until the stretch is him between her thighs, towel on the floor.",
  },
  {
    id: "the-chiropractor-s-adjustment",
    name: "The Chiropractor's Adjustment",
    category: "medical",
    blurb: "He straddles her thighs to \"align\" her, then slides a hand under and tells her the next crack is going to be her coming.",
  },
  {
    id: "the-reflexology-session",
    name: "The Reflexology Session",
    category: "medical",
    blurb: "M starts at F's feet and does not stop. By the time he is at her cunt she is not allowed to close her legs.",
  },
  {
    id: "the-post-op-sponge-bath",
    name: "The Post-Op Sponge Bath",
    category: "medical",
    blurb: "Warm cloth, slow. M washes F's breasts, belly, then lower, and the bath becomes his mouth until she forgets she was supposed to rest.",
  },
  {
    id: "the-quarantine-check",
    name: "The Quarantine Check",
    category: "medical",
    blurb: "Door locked for observation. M says a full-body check is mandatory. F's gown hits the floor. He takes his time clearing her.",
  },
  {
    id: "the-dermatologist-s-skin-check",
    name: "The Dermatologist's Skin Check",
    category: "medical",
    blurb: "Every inch, under the lamp. M has F turn, kneel, spread. The last mole is an excuse to put his tongue where the light is brightest.",
  },
  {
    id: "the-ultrasound-friction",
    name: "The Ultrasound Friction",
    category: "medical",
    blurb: "Warm gel, wand sliding lower. M drops the tool, uses his hand, and tells F the machine already saw how ready she is.",
  },

  {
    id: "the-knight-the-queen",
    name: "The Knight & The Queen",
    category: "fantasy",
    blurb: "He kneels in armour. She is on the throne. F tells M the king is gone and a knight's mouth belongs between a queen's thighs.",
  },
  {
    id: "the-captive-the-pirate-captain",
    name: "The Captive & The Pirate Captain",
    category: "fantasy",
    blurb: "Cabin lamp, a map, her wrists free if she asks. M offers F the bunk instead of the brig. She takes the bunk. He takes the rest.",
  },
  {
    id: "the-lord-the-governess",
    name: "The Lord & The Governess",
    category: "fantasy",
    blurb: "He finds her in the stacks with a filthy book. M makes F read the page out loud while he does every line to her against the shelves.",
  },
  {
    id: "the-vampire-s-feeding",
    name: "The Vampire's Feeding",
    category: "fantasy",
    blurb: "Moon at the window. M does not bite first. He has F in the red dress against the glass and drinks the sound she makes when she comes.",
  },
  {
    id: "the-french-maid-the-count",
    name: "The French Maid & The Count",
    category: "fantasy",
    blurb: "F is caught in the uniform at the foot of his bed. M, robe open, tells her to finish the silver later, he needs her mouth now.",
  },
  {
    id: "the-mermaid-s-grotto",
    name: "The Mermaid's Grotto",
    category: "fantasy",
    blurb: "Moonlit cave. F on the rock, tail wet. She pulls M off the shore and shows him how a siren takes a man apart with her hands and mouth.",
  },
  {
    id: "the-elven-guard-the-lost-traveler",
    name: "The Elven Guard & The Lost Traveler",
    category: "fantasy",
    blurb: "He has her in the rose garden for trespass. M binds F's wrists in vine and questions her with his fingers until she confesses everything.",
  },
  {
    id: "the-roman-bath-attendant",
    name: "The Roman Bath Attendant",
    category: "fantasy",
    blurb: "Steam, towels, marble. M oils F slowly, then follows her into the water and fucks her where the steam hides the splashes.",
  },
  {
    id: "the-bandit-the-carriage",
    name: "The Bandit & The Carriage",
    category: "fantasy",
    blurb: "He stops the coach and climbs in. M tells F the jewels can stay, he is taking his tribute between her legs on the velvet seat.",
  },
  {
    id: "the-princess-the-assassin",
    name: "The Princess & The Assassin",
    category: "fantasy",
    blurb: "Blade on the floor. F on the throne tells M he can have her instead of the contract. He takes the deal on the stone.",
  },
  {
    id: "the-sorcerer-the-apprentice",
    name: "The Sorcerer & The Apprentice",
    category: "fantasy",
    blurb: "A hold spell pins F standing. M walks around her in the moonlight and teaches the lesson with his mouth until the spell breaks on a scream.",
  },
  {
    id: "the-space-captain-the-alien-envoy",
    name: "The Space Captain & The Alien Envoy",
    category: "fantasy",
    blurb: "White ship, blue light. F is the envoy. She studies M's body like a treaty and uses him until both species understand the terms.",
  },

  {
    id: "the-principal-s-after-school-detention",
    name: "The Principal's After-School Detention",
    category: "authority",
    blurb: "Empty classroom, adult students only. F sits on a desk. M tells her the door is locked and detention is over his knee, then over the desk.",
  },
  {
    id: "the-police-officer-s-traffic-stop",
    name: "The Police Officer's Traffic Stop",
    category: "authority",
    blurb: "Empty road, flashers on. M orders F out, cuffs her loosely, searches her against the car, and takes the ticket out of her another way.",
  },
  {
    id: "the-security-guard-s-shoplifting-search",
    name: "The Security Guard's Shoplifting Search",
    category: "authority",
    blurb: "Caught with unpaid lingerie. M follows F into the fitting room, locks the slat, and says she can wear it out if she comes on his hand first.",
  },
  {
    id: "the-prison-guard-s-cell-check",
    name: "The Prison Guard's Cell Check",
    category: "authority",
    blurb: "Night count. M steps into the dark room, has F face the wall in the black slip, and uses the count as an excuse to fuck her quiet.",
  },
  {
    id: "the-military-drill-sergeant-s-inspection",
    name: "The Military Drill Sergeant's Inspection",
    category: "authority",
    blurb: "After-hours locker room. M has F hold a plank on the bench and inspects her from behind until the inspection is him buried in her.",
  },
  {
    id: "the-strict-landlord-s-rent-deficit",
    name: "The Strict Landlord's Rent Deficit",
    category: "authority",
    blurb: "He is in the doorway with a drink. F is on the sofa in pyjamas, late again. M says the sofa covers this month if she stays on it.",
  },
  {
    id: "the-customs-officer-s-private-room",
    name: "The Customs Officer's Private Room",
    category: "authority",
    blurb: "Secondary screening. M makes F strip piece by piece against the car-side table energy of a closed room, then clears her with his mouth.",
  },
  {
    id: "the-flight-attendant-s-rule-break",
    name: "The Flight Attendant's Rule Break",
    category: "authority",
    blurb: "Seatbelt sign on. M pulls F behind the first-class curtain and reminds her who gives orders at this altitude.",
  },
  {
    id: "the-judge-s-chambers",
    name: "The Judge's Chambers",
    category: "authority",
    blurb: "After court. M has F on the desk in the same skirt she wore for the gallery and rules in his own favour, hard and quiet.",
  },
  {
    id: "the-royal-bodyguard-s-protocol",
    name: "The Royal Bodyguard's Protocol",
    category: "authority",
    blurb: "He kneels because that is the job. Then M stands, pins F to the throne wall, and shows her who actually keeps her safe, and used.",
  },
  {
    id: "the-bouncer-s-back-alley-choice",
    name: "The Bouncer's Back-Alley Choice",
    category: "authority",
    blurb: "Fake ID. He walks her off the floor to the speaker wall and offers a choice: the street, or her knees in the pink dark.",
  },
  {
    id: "the-parole-officer-s-home-visit",
    name: "The Parole Officer's Home Visit",
    category: "authority",
    blurb: "Unannounced. M finds F on the sofa, tells her to stay seated, and does the check with two fingers and no paperwork.",
  },

  {
    id: "the-roommate-s-walk-in",
    name: "The Roommate's Walk-In",
    category: "domestic",
    blurb: "He walks in with a drink. She is on the sofa in pyjamas, caught. M does not leave. He sits down, pulls her into his lap, and they use the living room.",
  },
  {
    id: "the-landlord-s-master-key",
    name: "The Landlord's Master Key",
    category: "domestic",
    blurb: "He lets himself in \"for the pipes.\" F is still on the sofa, barely dressed. M pockets the key and collects the visit on her back.",
  },
  {
    id: "the-houseguest-s-late-night",
    name: "The Houseguest's Late Night",
    category: "domestic",
    blurb: "Everyone else is asleep. F appears in the doorway. M is already holding a drink. They keep the lamp off and use the couch like it is not his partner's house.",
  },
  {
    id: "the-gardener-s-shed",
    name: "The Gardener's Shed",
    category: "domestic",
    blurb: "Roses, glasshouse, dirt on his shirt. F follows M in \"to see the beds\" and gets taken against the potting bench with soil on her dress.",
  },
  {
    id: "the-butler-s-service",
    name: "The Butler's Service",
    category: "domestic",
    blurb: "F on the stairs in the purple gown. M waits with the tray, then sets it down, peels the gloves, and services her on the steps.",
  },
  {
    id: "the-chauffeur-s-partition",
    name: "The Chauffeur's Partition",
    category: "domestic",
    blurb: "Rain, glass down. F tells M to pull over. He climbs through and she fucks her driver in the front seat like the back does not exist.",
  },
  {
    id: "the-maid-s-uniform",
    name: "The Maid's Uniform",
    category: "domestic",
    blurb: "He bought it. She is wearing it. M sits on the bed in the robe and makes F clean the floor on her hands and knees until he pulls her back by the apron.",
  },
  {
    id: "the-washing-machine-stuck",
    name: "The Washing Machine Stuck",
    category: "domestic",
    blurb: "F is bent into the drum, shirt caught. M walks up, holds her hips, and uses the spin cycle as cover.",
  },
  {
    id: "the-babysitter-s-bedtime",
    name: "The Babysitter's Bedtime",
    category: "domestic",
    blurb: "Kids asleep, adult sitter still there. M comes home, finds F on the sofa, and pays the night in the dark living room.",
  },
  {
    id: "the-estate-manager-s-tour",
    name: "The Estate Manager's Tour",
    category: "domestic",
    blurb: "Empty mansion. He shows her the gardens, then the master. F tests the bed. M closes the door and they skip the rest of the listing.",
  },
  {
    id: "the-best-friend-s-dad",
    name: "The Best Friend's Dad",
    category: "domestic",
    blurb: "Her friend is out. M pours F a drink in the doorway, sits too close on the sofa, and they do the thing they have been circling for months.",
  },

  {
    id: "the-alien-abduction-lab",
    name: "The Alien Abduction Lab",
    category: "scifi",
    blurb: "F is the commander. M is the specimen. She walks him through the white ship and studies human stamina the filthy way.",
  },
  {
    id: "the-superhero-the-villain",
    name: "The Superhero & The Saved",
    category: "scifi",
    blurb: "Rooftop, cape still on. He just pulled her out of the dark. F in the red dress tells M she does not want to go home yet. The suit stays on.",
  },
  {
    id: "the-android-calibration",
    name: "The Android Calibration",
    category: "scifi",
    blurb: "M runs F's sensors on the table, pressure, heat, how many times she can come before the software begs.",
  },
  {
    id: "the-werewolf-s-full-moon",
    name: "The Werewolf's Full Moon",
    category: "scifi",
    blurb: "Moon at the window, dress already off her shoulder. M stops being gentle. F wants the animal. He gives it to her on the floor.",
  },
  {
    id: "the-demon-s-possession",
    name: "The Demon's Possession",
    category: "scifi",
    blurb: "Midnight, red silk. M does not ask. He fills F until she is saying yes in a voice that is not only hers.",
  },
  {
    id: "the-witch-s-love-potion",
    name: "The Witch's Love Potion",
    category: "scifi",
    blurb: "She dosed him. He knows. M still backs F to the moonlit sofa and spends the spell inside her.",
  },
  {
    id: "the-genie-s-wish",
    name: "The Genie's Wish",
    category: "scifi",
    blurb: "First wish is not polite. F asks to be used until dawn. M, unbound from the lamp, grants it on every surface of the room.",
  },
  {
    id: "the-holodeck-simulation",
    name: "The Holodeck Simulation",
    category: "scifi",
    blurb: "She sets compliance to maximum. The room becomes whatever F wants. M is the program that does not stop when she says she can't.",
  },
  {
    id: "the-fitness-club-locker-room",
    name: "The Fitness Club Locker Room",
    category: "public",
    blurb: "After hours. M stands at the open locker. F is on the bench in a sports bra. He tells her the cameras are off and the bench is not for sitting.",
  },
  {
    id: "the-tennis-coach-s-serve",
    name: "The Tennis Coach's Serve",
    category: "public",
    blurb: "He corrects her stance from behind, hand under the skirt. M keeps F in the stretch until the lesson is him.",
  },
  {
    id: "the-lifeguard-tower",
    name: "The Lifeguard Tower",
    category: "public",
    blurb: "Dusk, empty beach. He brings her up the ladder. F's dress is already thin. M takes her on the platform over the water.",
  },
  {
    id: "the-yoga-instructor-s-adjustment",
    name: "The Yoga Instructor's Adjustment",
    category: "public",
    blurb: "Private studio. He puts F in a fold, hips high, and the adjustment is his cock. She has to hold the pose.",
  },
  {
    id: "the-ski-resort-hot-tub",
    name: "The Ski Resort Hot Tub",
    category: "public",
    blurb: "Towels on the wood, snow outside. Under the water M is already in F. Other guests are a door away.",
  },
  {
    id: "the-equestrian-barn",
    name: "The Equestrian Barn",
    category: "public",
    blurb: "Hay, quiet, her in the garden dress. M has F on the tack bench and does not care if a boot hits the aisle.",
  },
  {
    id: "the-swimming-pool-night-dip",
    name: "The Swimming Pool Night Dip",
    category: "public",
    blurb: "Hotel pool, lights off. He has her on the lounger first, then in the water, hand over her mouth for the windows above.",
  },
  {
    id: "the-dance-studio-mirror",
    name: "The Dance Studio Mirror",
    category: "public",
    blurb: "Barre, mirror, empty studio. M spreads F's standing split and makes her watch herself take it.",
  },
  {
    id: "the-outdoor-shower",
    name: "The Outdoor Shower",
    category: "public",
    blurb: "Resort rain shower, swimwear off. Soap, then M, loud enough that the path might hear.",
  },
  {
    id: "the-camping-hammock",
    name: "The Camping Hammock",
    category: "public",
    blurb: "Two of them in one hammock. The sway is the problem and the point. They finish anyway.",
  },
  {
    id: "the-country-club-changing-room",
    name: "The Country Club Changing Room",
    category: "public",
    blurb: "Velvet lockers, dinner in twenty. M has F on the bench in her sports kit and they risk the next member walking in.",
  },

  {
    id: "the-pet-girl-the-handler",
    name: "The Pet Girl & The Handler",
    category: "bdsm",
    blurb: "Collar on the table. F waits in the black slip. M picks it up, clips the lead, and she does not use furniture for the rest of the night.",
  },
  {
    id: "the-bondage-furniture-test",
    name: "The Bondage Furniture Test",
    category: "bdsm",
    blurb: "He straps F to the frame in the velvet room and will not let her down until she has come the number he named.",
  },
  {
    id: "the-sensory-deprivation-chamber",
    name: "The Sensory Deprivation Chamber",
    category: "bdsm",
    blurb: "Blindfold, quiet, wrists tied. F cannot tell if the next touch is mouth, ice, or cock. M makes her guess wrong on purpose.",
  },
  {
    id: "the-spanking-bench-audit",
    name: "The Spanking Bench Audit",
    category: "bdsm",
    blurb: "Over the leather. He counts. F has to thank him after every stroke, then take him while she is still stinging.",
  },
  {
    id: "the-rope-harness-suspension",
    name: "The Rope Harness Suspension",
    category: "bdsm",
    blurb: "Red room, careful knots. M lifts F's hips off the floor and fucks the harness, not the furniture.",
  },
  {
    id: "the-chastity-keyholder",
    name: "The Chastity Keyholder",
    category: "bdsm",
    blurb: "The key is on the table next to the gold chain. M makes F watch it, edge her, and wait. He decides when the lock opens.",
  },
  {
    id: "the-master-the-house-slave",
    name: "The Master & The House Slave",
    category: "bdsm",
    blurb: "No clothes, no chair. F serves drinks on her knees. When M snaps, she is the furniture and the hole.",
  },
  {
    id: "the-dominant-female-male-slave",
    name: "The Dominant Female & Male Slave",
    category: "bdsm",
    blurb: "She is standing. He is on the sofa. F tells M the collar is for him tonight, mouth on her, no hands, until she is finished.",
  },
  {
    id: "the-public-leash-walk",
    name: "The Public Leash Walk",
    category: "bdsm",
    blurb: "Coat on, collar under it. M walks F through the dark garden and uses the lead every time a light goes on in a window.",
  },
  {
    id: "the-cane-submissive-apology",
    name: "The Cane & Submissive Apology",
    category: "bdsm",
    blurb: "She broke a rule. M has F over the sofa arm for ten. She kisses the cane, then him, and asks for the eleventh.",
  },
  {
    id: "the-heavy-boot-worship",
    name: "The Heavy Boot Worship",
    category: "bdsm",
    blurb: "M's boots on. F on the rug. Tongue on leather first. He only lets her have his cock when the shine is perfect.",
  },
  {
    id: "the-latex-suit-enclosure",
    name: "The Latex Suit Enclosure",
    category: "bdsm",
    blurb: "Zipped in, shiny, almost no air. M uses F through the latex until she is shaking and still not allowed out.",
  },
];

export function roleplays(includeHidden = false): Roleplay[] {
  return applyOverlay(
    "roleplays",
    ROLEPLAYS,
    (row, edit) => ({
      ...row,
      name: edit.title?.trim() || row.name,
      blurb: edit.body?.trim() || row.blurb,
      category: (ROLEPLAY_CATEGORIES.some((item) => item.id === edit.group)
        ? edit.group
        : row.category) as RoleplayCategoryId,
    }),
    (row) => ({
      id: row.id,
      name: row.title.trim() || "Untitled",
      category: (ROLEPLAY_CATEGORIES.some((item) => item.id === row.group)
        ? row.group
        : "fantasy") as RoleplayCategoryId,
      blurb: row.body.trim() || row.title,
    }),
    includeHidden
  );
}

export function roleplaysInCategories(ids: RoleplayCategoryId[]): Roleplay[] {
  const set = new Set(ids);
  return roleplays().filter((row) => set.has(row.category));
}

export function roleplayById(id: string): Roleplay | null {
  return roleplays().find((row) => row.id === id) ?? null;
}

export function categoryMeta(id: RoleplayCategoryId): RoleplayCategory | null {
  return ROLEPLAY_CATEGORIES.find((row) => row.id === id) ?? null;
}

export function pickRandomRoleplay(
  categories: RoleplayCategoryId[],
  excludeId?: string | null
): Roleplay | null {
  const pool = roleplaysInCategories(categories).filter(
    (row) => row.id !== excludeId
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

type CastPerson = {
  displayName: string;
  gender?: "male" | "female" | null;
};

/** Map scenario F/M labels to the couple's display names by gender. */
export function roleplayCastNames(
  you: CastPerson | null | undefined,
  partner: CastPerson | null | undefined
): { f: string; m: string } {
  const people = [you, partner].filter(Boolean) as CastPerson[];
  const female = people.find((p) => p.gender === "female");
  const male = people.find((p) => p.gender === "male");
  const youName = you?.displayName?.trim() || "";
  const partnerName = partner?.displayName?.trim() || "";

  let f =
    female?.displayName?.trim() ||
    people.find((p) => p.gender !== "male")?.displayName?.trim() ||
    partnerName ||
    youName ||
    "her";

  let m =
    male?.displayName?.trim() ||
    people.find((p) => p.displayName?.trim() !== f)?.displayName?.trim() ||
    youName ||
    partnerName ||
    "him";

  // Waiting / unpaired: don't print one name in both F and M slots.
  if (f.toLowerCase() === m.toLowerCase()) {
    if (female && !male) m = partnerName && partnerName !== f ? partnerName : "him";
    else if (male && !female) f = partnerName && partnerName !== m ? partnerName : "her";
    else m = partnerName && partnerName !== f ? partnerName : "them";
  }

  return { f, m };
}

/** Replace standalone F / M (and possessives) with cast names. */
export function personalizeRoleplayText(
  text: string,
  cast: { f: string; m: string }
): string {
  const next = text
    .replace(/\bF's\b/g, `${cast.f}'s`)
    .replace(/\bM's\b/g, `${cast.m}'s`)
    .replace(/\bF\b/g, cast.f)
    .replace(/\bM\b/g, cast.m);
  if (/^[FM]\b/.test(text) && next[0] && next[0] === next[0].toLowerCase()) {
    return next.charAt(0).toUpperCase() + next.slice(1);
  }
  return next;
}
