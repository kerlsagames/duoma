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
  // Professional Services & Trades
  {
    id: "the-accidental-view",
    name: "The Accidental View",
    category: "professional",
    blurb: "A tradie enters the bedroom to fix an overhead light or fan, catching F on the bed playing with herself. He stammers an apology, but she tells him to close the door, keep watching, and eventually steps off the bed to show him exactly what he was missing.",
  },
  {
    id: "the-maid-s-inspection",
    name: "The Maid's Inspection",
    category: "professional",
    blurb: "M plays a strict house inspector or high-end maid checking F's room. Finding \"unsatisfactory conditions,\" he demands she assume a kneeling position on the bed to receive her immediate punishment.",
  },
  {
    id: "the-late-night-electrician",
    name: "The Late-Night Electrician",
    category: "professional",
    blurb: "The power goes out, and the electrician arrives in the dark. Working by flashlight, F \"accidentally\" brushes up against him in the tight hallway, leading to a dark, hands-on encounter against the wall.",
  },
  {
    id: "the-personal-trainer-s-stretch",
    name: "The Personal Trainer's Stretch",
    category: "professional",
    blurb: "After an intense workout in the home gym, the trainer pushes F into a deep, vulnerable groin stretch. He refuses to let her up until she completes every grueling set of explicit movement he commands.",
  },
  {
    id: "the-cable-guy-s-signal-check",
    name: "The Cable Guy's Signal Check",
    category: "professional",
    blurb: "The technician needs to check the wall outlet directly behind the bed. F reclines in sheer lingerie, making it impossible for him to focus until he drops his tool belt and gets on the bed with her.",
  },
  {
    id: "the-decorator-s-measurements",
    name: "The Decorator's Measurements",
    category: "professional",
    blurb: "An interior designer is measuring F's waist and hips for custom tailoring. The measuring tape slips, his hands linger on her inner thighs, and the professional boundary completely dissolves.",
  },
  {
    id: "the-massage-therapist-s-upgrade",
    name: "The Massage Therapist's Upgrade",
    category: "professional",
    blurb: "F books an in-home full-body massage. Halfway through, the therapist shifts from smooth strokes to targeting her inner thighs, demanding she turn over and take off the rest of her towel.",
  },
  {
    id: "the-plumber-under-the-sink",
    name: "The Plumber Under the Sink",
    category: "professional",
    blurb: "M is bent double under the kitchen sink fixing a pipe. F stands over him wearing only an oversized shirt, intentionally dropping items so she has to bend down right in front of his face.",
  },
  {
    id: "the-delivery-driver-s-tip",
    name: "The Delivery Driver\u2019s Tip",
    category: "professional",
    blurb: "F answers the front door in a silk robe that slips open. Instead of paying a cash tip, she pulls the driver inside by his belt and locks the deadbolt behind him.",
  },
  {
    id: "the-pool-cleaner-s-dip",
    name: "The Pool Cleaner\u2019s Dip",
    category: "professional",
    blurb: "M is cleaning the pool while F sunbathes nude on a lounger. She commands him to drop his pole, strip out of his wet work clothes, and join her on the outdoor daybed.",
  },
  {
    id: "the-private-chef-s-taste-test",
    name: "The Private Chef\u2019s Taste Test",
    category: "professional",
    blurb: "A chef is prepping dinner while F watches from the kitchen island. He uses warm syrup or cream to conduct a \"sensory taste test\" directly off her chest and belly before serving dinner.",
  },
  {
    id: "the-locksmith-s-entry",
    name: "The Locksmith\u2019s Entry",
    category: "professional",
    blurb: "F is locked out in a short dress. The locksmith picks the door, but once inside, she tells him his job isn't done until he locks them both inside the bedroom.",
  },
  {
    id: "the-car-detailer-s-inspection",
    name: "The Car Detailer's Inspection",
    category: "professional",
    blurb: "M is vacuuming and detailing the interior of F's car in the driveway. F climbs into the backseat, sliding her underwear off and telling him the back leather needs a full hands-on inspection.",
  },
  {
    id: "the-tutor-s-extra-credit",
    name: "The Tutor\u2019s Extra Credit",
    category: "professional",
    blurb: "A private tutor is helping F with a complex subject. When she fails a practice test, he commands her to slide under the desk to earn her passing grade.",
  },
  {
    id: "the-architect-s-blueprint",
    name: "The Architect\u2019s Blueprint",
    category: "professional",
    blurb: "An architect spreads blueprints across a wide dining table. F climbs onto the blueprints, pushing the papers aside and demanding he measure her curves instead.",
  },
  {
    id: "the-carpet-cleaner-s-spot-test",
    name: "The Carpet Cleaner\u2019s Spot Test",
    category: "professional",
    blurb: "M brings heavy machinery into the room. F sits on the couch, pulling her legs wide and asking him if he can remove a \"very specific wet spot\" on the cushions.",
  },
  {
    id: "the-handyman-s-lube",
    name: "The Handyman\u2019s Lube",
    category: "professional",
    blurb: "M asks for oil or lubricant to fix a squeaky door hinge. F hands him a bottle of personal massage lube instead and points straight to the bed.",
  },
  {
    id: "the-pest-control-spray",
    name: "The Pest Control Spray",
    category: "professional",
    blurb: "M is spraying baseboards on his knees. F steps over him, letting him look straight up her skirt while giving him explicit directions on where else to spray.",
  },
  {
    id: "the-window-washer-s-view",
    name: "The Window Washer\u2019s View",
    category: "professional",
    blurb: "F intentionally leaves the bedroom blinds wide open while a window washer works on the scaffold outside, stripping down while making unbroken eye contact through the glass.",
  },
  {
    id: "the-valet-s-garage-pause",
    name: "The Valet\u2019s Garage Pause",
    category: "professional",
    blurb: "M pulls the car into a dark parking garage. Before handing back the keys, F climbs over the center console to reward him in the driver's seat.",
  },
  // Workplace & Corporate Authority
  {
    id: "the-boss-s-after-hours-audit",
    name: "The Boss's After-Hours Audit",
    category: "workplace",
    blurb: "F stays late at the office to finish a report. Her boss enters, locks the office door, sits in his leather chair, and commands her to show him how dedicated she really is under his desk.",
  },
  {
    id: "the-executive-interview",
    name: "The Executive Interview",
    category: "workplace",
    blurb: "F is interviewing for an elite position. M sits behind a massive oak desk, explaining that the final stage of the interview requires complete obedience to his physical commands.",
  },
  {
    id: "the-performance-review",
    name: "The Performance Review",
    category: "workplace",
    blurb: "M calls F into his office to discuss her \"poor behavior.\" As punishment, he turns her over his desk for a sharp spanking before driving into her from behind.",
  },
  {
    id: "the-overtime-interruption",
    name: "The Overtime Interruption",
    category: "workplace",
    blurb: "Two coworkers are stuck working late on a project. Tensions boil over, and M pins F against the filing cabinet, sliding her skirt up to clear away the work stress.",
  },
  {
    id: "the-dictation-session",
    name: "The Dictation Session",
    category: "workplace",
    blurb: "An executive sits back in his swivel chair, dictating an explicit letter while F takes notes while sitting on his lap, forced to stay professional while he touches her.",
  },
  {
    id: "the-boardroom-projection",
    name: "The Boardroom Projection",
    category: "workplace",
    blurb: "During a private slide presentation in a dark boardroom, M pulls F onto the conference table right in front of the illuminated projector screen.",
  },
  {
    id: "the-janitor-s-keyring",
    name: "The Janitor\u2019s Keyring",
    category: "workplace",
    blurb: "F gets locked in the office building after hours. The janitor finds her, but instead of unlocking the front exit, he unlocks the breakroom sofa.",
  },
  {
    id: "the-secretarial-search",
    name: "The Secretarial Search",
    category: "workplace",
    blurb: "M accuses F of stealing company property. He conducts a thorough, hands-on frisking search while she stands pressed against the office door.",
  },
  {
    id: "the-promotion-contract",
    name: "The Promotion Contract",
    category: "workplace",
    blurb: "M lays out a promotion agreement on the desk, telling F she can sign it only after she rides him to completion right on top of the paperwork.",
  },
  {
    id: "the-security-guard-s-monitor",
    name: "The Security Guard\u2019s Monitor",
    category: "workplace",
    blurb: "A night-shift security guard catches F on camera trespassing in a restricted lounge. He walks in and offers to delete the footage if she puts on a private show.",
  },
  {
    id: "the-ceo-s-private-jet",
    name: "The CEO\u2019s Private Jet",
    category: "workplace",
    blurb: "Mid-flight on a corporate jet, the CEO closes the cabin curtain and commands his assistant to join him on the leather reclining seats.",
  },
  {
    id: "the-stockroom-inventory",
    name: "The Stockroom Inventory",
    category: "workplace",
    blurb: "Two retail employees are counting stock in a cramped back room. M traps F between high shelves, sliding his hands under her uniform apron.",
  },
  {
    id: "the-hr-complaint",
    name: "The HR Complaint",
    category: "workplace",
    blurb: "F is brought into HR for inappropriate office attire. The HR manager demonstrates exactly why her outfit is \"too distracting\" by taking it off piece by piece.",
  },
  {
    id: "the-business-trip-hotel",
    name: "The Business Trip Hotel",
    category: "workplace",
    blurb: "Two colleagues share a hotel room to save corporate budget. After drinks at the hotel bar, the professional boundaries vanish the moment the door clicks shut.",
  },
  {
    id: "the-law-firm-partner",
    name: "The Law Firm Partner",
    category: "workplace",
    blurb: "A senior partner orders his associate to lock the office blinds. He sits back, pulls his zipper down, and demands she settle the case right now.",
  },
  {
    id: "the-receptionist-s-bell",
    name: "The Receptionist\u2019s Bell",
    category: "workplace",
    blurb: "F works the front desk. M rings the bell, steps around the counter, and pushes her chair back under the desk so no incoming clients can see what she\u2019s doing.",
  },
  {
    id: "the-laboratory-protocol",
    name: "The Laboratory Protocol",
    category: "workplace",
    blurb: "A lead researcher demands his assistant follow strict \"physical safety protocols,\" binding her wrists with soft lab ties before conducting his experiment.",
  },
  {
    id: "the-elevator-malfunction",
    name: "The Elevator Malfunction",
    category: "workplace",
    blurb: "Two corporate rivals get stuck between floors in an express elevator. As the heat rises, competition turns into aggressive, standing penetration against the mirror.",
  },
  {
    id: "the-photo-studio-shoot",
    name: "The Photo Studio Shoot",
    category: "workplace",
    blurb: "A fashion photographer tells the model her poses are \"too rigid.\" He steps out from behind the lens to physically adjust her body into explicit positions.",
  },
  {
    id: "the-soundproof-studio",
    name: "The Soundproof Studio",
    category: "workplace",
    blurb: "A music producer isolates a singer in the soundproof booth, turning off her mic and joining her inside to give her a \"hands-on vocal warmup.\"",
  },
  // Strangers, Escaping & Stealth
  {
    id: "the-hotel-room-miscount",
    name: "The Hotel Room Miscount",
    category: "strangers",
    blurb: "F opens her hotel room door wearing only a towel, thinking it\u2019s room service. It\u2019s a stranger who misread the room number, but she invites him inside anyway.",
  },
  {
    id: "the-vip-backstage-pass",
    name: "The VIP Backstage Pass",
    category: "strangers",
    blurb: "F sneaks backstage at a venue. M catches her behind the amps, offering to let her stay only if she kneels behind the main stage curtain right now.",
  },
  {
    id: "the-neighbor-s-package-delivery",
    name: "The Neighbor\u2019s Package Delivery",
    category: "strangers",
    blurb: "M receives a misdelivered package for F. He brings it over, and when she opens the door in a sheer robe, he steps inside and claims his delivery fee.",
  },
  {
    id: "the-tailgate-hitchhiker",
    name: "The Tailgate Hitchhiker",
    category: "strangers",
    blurb: "Caught in a rainstorm, F gets into M's truck cab. To thank him for the ride, she slides onto the bench seat beside him while he drives down a quiet dirt road.",
  },
  {
    id: "the-library-stacks",
    name: "The Library Stacks",
    category: "strangers",
    blurb: "Deep in the quietest aisle of a university library, M catches F touching herself behind a shelf. He steps up behind her, whispering that she must stay 100% silent while he takes over.",
  },
  {
    id: "the-cinema-back-row",
    name: "The Cinema Back Row",
    category: "strangers",
    blurb: "Sitting in the empty back row of a dark movie theater, F slides into M's lap, keeping her groans hidden over the loud movie audio.",
  },
  {
    id: "the-uber-driver-s-extra-route",
    name: "The Uber Driver's Extra Route",
    category: "strangers",
    blurb: "M pulls the car into an empty, unlit parking lot at the end of the ride, locking the doors from the driver's panel and sliding into the back seat.",
  },
  {
    id: "the-first-class-curtain",
    name: "The First Class Curtain",
    category: "strangers",
    blurb: "On a red-eye flight, F slips past the first-class galley curtain into M's private suite for a dark, quiet flight encounter.",
  },
  {
    id: "the-train-compartment",
    name: "The Train Compartment",
    category: "strangers",
    blurb: "Locked inside a private overnight sleeper train car, two strangers negotiate how to share the single narrow bunk bed.",
  },
  {
    id: "the-ski-lift-hold",
    name: "The Ski Lift Hold",
    category: "strangers",
    blurb: "The ski lift stalls high above the snow-covered mountain. Bundle up in heavy gear, M and F find a way to stay warm in the freezing air.",
  },
  {
    id: "the-beach-cabana",
    name: "The Beach Cabana",
    category: "strangers",
    blurb: "Shielded only by thin blowing curtains in a private beach cabana, M and F take a massive risk with sunbathers walking by outside.",
  },
  {
    id: "the-fitting-room-slip",
    name: "The Fitting Room Slip",
    category: "strangers",
    blurb: "F is trying on clothes in a boutique. M slips past the curtain into her stall while the sales staff chat right outside the door.",
  },
  {
    id: "the-house-party-coat-room",
    name: "The House Party Coat Room",
    category: "strangers",
    blurb: "Piled under winter coats on a master bed during a wild party, M and F lock the bedroom door to escape the crowd.",
  },
  {
    id: "the-masked-masquerade",
    name: "The Masked Masquerade",
    category: "strangers",
    blurb: "At a costume gala, two anonymous guests meet on a dark balcony, engaging in an intense session without ever taking off their masks.",
  },
  {
    id: "the-underground-club-nook",
    name: "The Underground Club Nook",
    category: "strangers",
    blurb: "Tucked into a dark, thumping corner of a subterranean nightclub, M holds F up against the speaker wall.",
  },
  {
    id: "the-rainy-bus-stop",
    name: "The Rainy Bus Stop",
    category: "strangers",
    blurb: "Huddling under a tiny bus shelter during a torrential downpour, M pulls F behind the glass display frame out of view of passing cars.",
  },
  {
    id: "the-museum-alcove",
    name: "The Museum Alcove",
    category: "strangers",
    blurb: "Tucked away in a quiet classical sculpture gallery, M pins F against a marble pedestal while security patrols the main hall.",
  },
  {
    id: "the-rooftop-access",
    name: "The Rooftop Access",
    category: "strangers",
    blurb: "M and F break through the rooftop door of a high-rise, taking each other against the ledge overlooking the lit city skyline.",
  },
  {
    id: "the-sauna-steam",
    name: "The Sauna Steam",
    category: "strangers",
    blurb: "Thick fog fills a private spa sauna. M slides off his towel and moves through the heavy steam toward F on the wooden bench.",
  },
  {
    id: "the-campground-tent",
    name: "The Campground Tent",
    category: "strangers",
    blurb: "Inside a thin nylon tent at a crowded campsite, M and F have to keep their physical play completely silent so neighboring campers don't hear.",
  },
  // Medical & Institutional Care
  {
    id: "the-night-nurse-s-rounds",
    name: "The Night Nurse\u2019s Rounds",
    category: "medical",
    blurb: "A male nurse enters the private hospital room for late-night checks. Finding the patient restless and aroused, he prescribed a hands-on physical release.",
  },
  {
    id: "the-bedside-exam",
    name: "The Bedside Exam",
    category: "medical",
    blurb: "A doctor enters the exam room, closing the door and pulling the privacy curtain. He instructs F to slide to the edge of the table for a comprehensive pelvic check.",
  },
  {
    id: "the-physical-therapy-session",
    name: "The Physical Therapy Session",
    category: "medical",
    blurb: "A therapist is working on F's tight hip flexors. As he moves her legs into vulnerable angles, he decides to expand the therapy session onto the padded mat.",
  },
  {
    id: "the-optometrist-s-dark-room",
    name: "The Optometrist\u2019s Dark Room",
    category: "medical",
    blurb: "The eye doctor turns off all the lights to conduct a dark-room dilation exam, using the complete blackness to move in close.",
  },
  {
    id: "the-dental-chair-restraints",
    name: "The Dental Chair Restraints",
    category: "medical",
    blurb: "F is reclined in a dental chair. M uses the chair tilt and chest bib to keep her completely restrained while he conducts his inspection.",
  },
  {
    id: "the-quarantine-check",
    name: "The Quarantine Check",
    category: "medical",
    blurb: "Locked in an isolation room, the doctor instructs the patient that a full-body physical check is mandatory before release.",
  },
  {
    id: "the-sanctuary-retreat",
    name: "The Sanctuary Retreat",
    category: "medical",
    blurb: "A stressed patient checks into an exclusive wellness retreat. The head practitioner uses sensory deprivation and heavy touch to strip away her stress.",
  },
  {
    id: "the-ultrasound-friction",
    name: "The Ultrasound Friction",
    category: "medical",
    blurb: "A technician applies warm acoustic gel to F's lower abdomen, slowly moving the wand further and further down until he drops the equipment entirely.",
  },
  {
    id: "the-chiropractor-s-adjustment",
    name: "The Chiropractor\u2019s Adjustment",
    category: "medical",
    blurb: "M places F face-down on the adjustment table, straddling her thighs to align her hips before sliding his hands under her waist.",
  },
  {
    id: "the-sleep-lab-monitor",
    name: "The Sleep Lab Monitor",
    category: "medical",
    blurb: "A sleep researcher notices his subject tossing and turning on the night monitors. He enters the dark lab room to manually soothe her back to sleep.",
  },
  {
    id: "the-dermatologist-s-skin-check",
    name: "The Dermatologist\u2019s Skin Check",
    category: "medical",
    blurb: "The specialist requires a full-body skin audit, inspecting every inch of F's body under high-intensity examination lights.",
  },
  {
    id: "the-mental-health-intake",
    name: "The Mental Health Intake",
    category: "medical",
    blurb: "A strict specialist sits across from F, noting her high anxiety levels and ordering an immediate physical release exercise on his office couch.",
  },
  {
    id: "the-reflexology-session",
    name: "The Reflexology Session",
    category: "medical",
    blurb: "A foot reflexologist moves up F's calves and inner thighs, demonstrating how specific pressure points directly trigger her arousal.",
  },
  {
    id: "the-post-op-sponge-bath",
    name: "The Post-Op Sponge Bath",
    category: "medical",
    blurb: "A caretaker brings a basin of warm water to F's bedside, slowly washing her body from her chest down to her thighs.",
  },
  {
    id: "the-private-asylum-specialist",
    name: "The Private Asylum Specialist",
    category: "medical",
    blurb: "Set in a vintage era, a specialist uses physical \"hysteria treatments\" on a stubborn female patient bound to a velvet chaise.",
  },
  {
    id: "the-phlebotomist-s-comfort",
    name: "The Phlebotomist\u2019s Comfort",
    category: "medical",
    blurb: "F is terrified of needles. The technician distracts her by sliding his hand straight up her dress while taking her vitals.",
  },
  {
    id: "the-vip-recovery-suite",
    name: "The VIP Recovery Suite",
    category: "medical",
    blurb: "A wealthy patient demands 24/7 one-on-one care from her private male nurse, ordering him into her bed to keep her warm.",
  },
  {
    id: "the-emergency-room-curtain",
    name: "The Emergency Room Curtain",
    category: "medical",
    blurb: "Behind a thin, pulled yellow curtain in a noisy ER, a doctor conducts a quick, high-stakes private check.",
  },
  {
    id: "the-oxygen-bar-relaxation",
    name: "The Oxygen Bar Relaxation",
    category: "medical",
    blurb: "In a dim lounge, an attendant fits F with an oxygen mask, using the heightened sensory state to touch her uninterrupted.",
  },
  {
    id: "the-home-health-visit",
    name: "The Home Health Visit",
    category: "medical",
    blurb: "A visiting specialist checks on F's recovery, deciding that a full-body manual massage is the best medicine for the evening.",
  },
  // Fantasy, Historical & Royalty
  {
    id: "the-knight-the-queen",
    name: "The Knight & The Queen",
    category: "fantasy",
    blurb: "While the King is away at war, a royal guard breaks protocol, entering the Queen\u2019s chambers to give her his absolute physical devotion.",
  },
  {
    id: "the-captive-the-pirate-captain",
    name: "The Captive & The Pirate Captain",
    category: "fantasy",
    blurb: "A pirate captain pulls a high-society female captive into his private wooden cabin, offering her freedom in exchange for complete submission.",
  },
  {
    id: "the-lord-the-governess",
    name: "The Lord & The Governess",
    category: "fantasy",
    blurb: "In a Victorian manor, the Lord of the house catches the governess reading explicit literature in the library, demanding a practical demonstration.",
  },
  {
    id: "the-vampire-s-feeding",
    name: "The Vampire\u2019s Feeding",
    category: "fantasy",
    blurb: "A vampire corners a mortal in a moonlit conservatory, replacing his bite with slow, intoxicating physical seduction.",
  },
  {
    id: "the-gladiator-s-reward",
    name: "The Gladiator\u2019s Reward",
    category: "fantasy",
    blurb: "After winning in the arena, a gladiator is brought to a noblewoman's private quarters to serve as her personal plaything for the night.",
  },
  {
    id: "the-tavern-keeper-s-wench",
    name: "The Tavern Keeper\u2019s Wench",
    category: "fantasy",
    blurb: "After closing the tavern doors, the innkeeper pins his head barmaid against the heavy wooden bar to tally up the night's profits.",
  },
  {
    id: "the-princess-the-assassin",
    name: "The Princess & The Assassin",
    category: "fantasy",
    blurb: "An assassin breaks into the royal bedchamber to eliminate a target, but the Princess negotiates for her life using her body.",
  },
  {
    id: "the-viking-raid-claim",
    name: "The Viking Raid Claim",
    category: "fantasy",
    blurb: "A Viking warrior claims a high-born noblewoman as his prize, taking her back to his fur-lined tent to break her pride.",
  },
  {
    id: "the-geisha-the-samurai",
    name: "The Geisha & The Samurai",
    category: "fantasy",
    blurb: "A warrior visits a private tea house, where an elite entertainer uses traditional feather touches and silk ties to unravel his discipline.",
  },
  {
    id: "the-sultan-s-harem-favorite",
    name: "The Sultan\u2019s Harem Favorite",
    category: "fantasy",
    blurb: "The ruler enters his private quarters, selecting his top concubine to demonstrate new erotic arts learned from distant lands.",
  },
  {
    id: "the-french-maid-the-count",
    name: "The French Maid & The Count",
    category: "fantasy",
    blurb: "In an 18th-century French chateau, a young maid is caught polishing silver in her corset, prompting the Count to teach her a lesson.",
  },
  {
    id: "the-sorcerer-the-apprentice",
    name: "The Sorcerer & The Apprentice",
    category: "fantasy",
    blurb: "A powerful mage uses a binding spell to lock his apprentice in place while he tests her physical reactions to magic touch.",
  },
  {
    id: "the-bandit-the-carriage",
    name: "The Bandit & The Carriage",
    category: "fantasy",
    blurb: "Outlaws stop a gold carriage. The leader steps inside the velvet-lined carriage, taking his tribute from the noble lady inside.",
  },
  {
    id: "the-roman-bath-attendant",
    name: "The Roman Bath Attendant",
    category: "fantasy",
    blurb: "In an ancient marble bathhouse, a servant oils down a noblewoman\u2019s body before sliding into the warm water behind her.",
  },
  {
    id: "the-high-priestess-the-sacrifice",
    name: "The High Priestess & The Sacrifice",
    category: "fantasy",
    blurb: "A priestess prepares a willing male initiate for a temple ritual, using her body to sanctify his devotion.",
  },
  {
    id: "the-court-jester-s-trick",
    name: "The Court Jester\u2019s Trick",
    category: "fantasy",
    blurb: "The castle jester uses his wit and agility to slip past the royal guards, sneaking into the lady\u2019s bed to play explicit games.",
  },
  {
    id: "the-space-captain-the-alien-envoy",
    name: "The Space Captain & The Alien Envoy",
    category: "fantasy",
    blurb: "On a distant starship, two diplomatic leaders use physical touch to bridge the communication gap between their species.",
  },
  {
    id: "the-cyberpunk-hacker-the-corporate-spec",
    name: "The Cyberpunk Hacker & The Corporate Spec",
    category: "fantasy",
    blurb: "In a neon-lit futuristic apartment, a street hacker uses neural links and physical ties to extract data from an executive.",
  },
  {
    id: "the-tudor-executioner-s-reprieve",
    name: "The Tudor Executioner\u2019s Reprieve",
    category: "fantasy",
    blurb: "A prisoner facing the gallows offers the lead guard her complete body for the night in exchange for an open cell door at dawn.",
  },
  {
    id: "the-elven-guard-the-lost-traveler",
    name: "The Elven Guard & The Lost Traveler",
    category: "fantasy",
    blurb: "Deep in an enchanted forest, an immortal guard binds a human trespasser to a tree, questioning her with intense, slow touches.",
  },
  // Authority, Discipline & Taboo Dynamics
  {
    id: "the-principal-s-after-school-detention",
    name: "The Principal\u2019s After-School Detention",
    category: "authority",
    blurb: "F (playing a rebellious college senior/graduate student) is called into the dean\u2019s office. M locks the door and delivers a stern paddle spanking over her plaid skirt.",
  },
  {
    id: "the-police-officer-s-traffic-stop",
    name: "The Police Officer\u2019s Traffic Stop",
    category: "authority",
    blurb: "M pulls F over on a dark stretch of highway. Finding an expired license, he orders her out of the car, handcuffs her wrists behind her back, and searches her against the trunk.",
  },
  {
    id: "the-security-guard-s-shoplifting-search",
    name: "The Security Guard\u2019s Shoplifting Search",
    category: "authority",
    blurb: "F is caught red-handed stealing lingerie. The store guard takes her into the back holding room, offering an \"informal settlement\" off the record.",
  },
  {
    id: "the-prison-guard-s-cell-check",
    name: "The Prison Guard\u2019s Cell Check",
    category: "authority",
    blurb: "A strict corrections officer does a late-night cell count, stepping inside F's cell and ordering her to face the cold stone wall.",
  },
  {
    id: "the-military-drill-sergeant-s-inspection",
    name: "The Military Drill Sergeant\u2019s Inspection",
    category: "authority",
    blurb: "A strict commander inspects the barracks. Finding F\u2019s bunk messy, he orders her into a rigid push-up position and punishes her from behind while she holds it.",
  },
  {
    id: "the-strict-landlord-s-rent-deficit",
    name: "The Strict Landlord\u2019s Rent Deficit",
    category: "authority",
    blurb: "F is two weeks late on rent. The landlord shows up with an eviction notice, giving her one alternative way to cover this month's balance on the living room sofa.",
  },
  {
    id: "the-customs-officer-s-private-room",
    name: "The Customs Officer\u2019s Private Room",
    category: "authority",
    blurb: "At an international border, a customs agent pulls F into a private room for an emergency body search, making her strip piece by piece.",
  },
  {
    id: "the-warden-s-office-order",
    name: "The Warden\u2019s Office Order",
    category: "authority",
    blurb: "The head of an institution summons a subordinate, commanding her to kneel beside his desk chair for the duration of his phone call.",
  },
  {
    id: "the-parole-officer-s-home-visit",
    name: "The Parole Officer\u2019s Home Visit",
    category: "authority",
    blurb: "A parole officer makes an unannounced late-night check, ordering his subject to stand facing the front door while he conducts a thorough physical check.",
  },
  {
    id: "the-probation-officer-s-drug-test",
    name: "The Probation Officer\u2019s Drug Test",
    category: "authority",
    blurb: "F fails her routine check. M offers to overlook the results if she follows every explicit instruction he gives her on his office couch.",
  },
  {
    id: "the-bouncer-s-back-alley-choice",
    name: "The Bouncer\u2019s Back-Alley Choice",
    category: "authority",
    blurb: "Caught using a fake ID, F is dragged into the club's dark back alley by the head bouncer, who demands a private bribe to let her go.",
  },
  {
    id: "the-border-guard-s-outpost",
    name: "The Border Guard\u2019s Outpost",
    category: "authority",
    blurb: "Stuck at a remote mountain checkpoint, a guard orders a traveler out of her vehicle for an extended inspection inside his warm cabin.",
  },
  {
    id: "the-flight-attendant-s-rule-break",
    name: "The Flight Attendant\u2019s Rule Break",
    category: "authority",
    blurb: "A passenger refuses to follow safety rules. The lead steward pulls her into the galley behind the curtain to teach her complete compliance.",
  },
  {
    id: "the-judge-s-chambers",
    name: "The Judge\u2019s Chambers",
    category: "authority",
    blurb: "After a long court trial, the judge calls opposing counsel into his private chambers, settling the legal dispute over his desk.",
  },
  {
    id: "the-strict-father-in-law-s-lecture",
    name: "The Strict Father-in-Law\u2019s Lecture",
    category: "authority",
    blurb: "(Roleplay dynamic) M plays an older family authority figure scolding F for her wild behavior, taking her over his knee to discipline her.",
  },
  {
    id: "the-royal-bodyguard-s-protocol",
    name: "The Royal Bodyguard\u2019s Protocol",
    category: "authority",
    blurb: "A personal bodyguard catches his high-profile client sneaking out. He pins her to the wall, reminding her who is actually in physical control.",
  },
  {
    id: "the-headmaster-s-study",
    name: "The Headmaster\u2019s Study",
    category: "authority",
    blurb: "Set in an old-world academy, the headmaster uses an old leather strap on a student\u2019s hands and rear before forcing her to thank him.",
  },
  {
    id: "the-guard-s-escort",
    name: "The Guard\u2019s Escort",
    category: "authority",
    blurb: "A prisoner is being moved in heavy wrist and ankle chains. The transport guard takes a detour into an empty holding room along the corridor.",
  },
  {
    id: "the-tax-inspector-s-audit",
    name: "The Tax Inspector\u2019s Audit",
    category: "authority",
    blurb: "An auditor uncovers massive financial irregularities, giving F an hour on his desk to convince him not to file the report.",
  },
  {
    id: "the-interrogator-s-light",
    name: "The Interrogator\u2019s Light",
    category: "authority",
    blurb: "Locked in a dark room under a single bright lamp, an interrogator uses physical sensory overload to make his subject confess everything.",
  },
  // Taboo Domestic & Household
  {
    id: "the-stepbrother-s-secret",
    name: "The Stepbrother\u2019s Secret",
    category: "domestic",
    blurb: "(Roleplay dynamic) F gets her hand stuck under the sofa while searching for a remote. Her stepbrother walks in, sees her bent over, and takes advantage of her position.",
  },
  {
    id: "the-babysitter-s-bedtime",
    name: "The Babysitter\u2019s Bedtime",
    category: "domestic",
    blurb: "A young adult babysitter stays late. The attractive home father returns home alone, offering to drive her back after a private thank-you session in the foyer.",
  },
  {
    id: "the-pool-boy-s-summer-job",
    name: "The Pool Boy\u2019s Summer Job",
    category: "domestic",
    blurb: "A wealthy housewife hires a young pool boy for the summer, intentionally sunbathing topless until he drops his skimmer and steps onto her towel.",
  },
  {
    id: "the-roommate-s-walk-in",
    name: "The Roommate\u2019s Walk-In",
    category: "domestic",
    blurb: "A roommate accidentally walks into the bathroom while F is taking a bubble bath. Instead of leaving, he locks the door and steps into the tub with his clothes on.",
  },
  {
    id: "the-au-pair-s-lessons",
    name: "The Au Pair\u2019s Lessons",
    category: "domestic",
    blurb: "A wealthy homeowner catches the foreign au pair practicing her English in the bedroom, stepping in to give her an explicit, hands-on vocabulary lesson.",
  },
  {
    id: "the-best-friend-s-dad",
    name: "The Best Friend\u2019s Dad",
    category: "domestic",
    blurb: "F visits her friend's house, but her friend isn't home. Her friend\u2019s father invites her in for a drink, leading to an intense, forbidden encounter on the living room couch.",
  },
  {
    id: "the-sister-s-boyfriend",
    name: "The Sister\u2019s Boyfriend",
    category: "domestic",
    blurb: "(Roleplay dynamic) Left alone in the house while her sister runs errands, F teases her sister\u2019s boyfriend until he pins her against the kitchen island.",
  },
  {
    id: "the-landlord-s-master-key",
    name: "The Landlord\u2019s Master Key",
    category: "domestic",
    blurb: "A landlord uses his spare key to enter an apartment for a \"pipe check,\" walking into the bedroom while F is sleeping naked under a single sheet.",
  },
  {
    id: "the-houseguest-s-late-night",
    name: "The Houseguest\u2019s Late Night",
    category: "domestic",
    blurb: "A guest staying in the spare bedroom hears a knock at midnight. F slips inside, whispering that her partner is fast asleep down the hall.",
  },
  {
    id: "the-gardener-s-shed",
    name: "The Gardener\u2019s Shed",
    category: "domestic",
    blurb: "F follows the estate gardener into the potting shed to get away from a boring family dinner, getting taken against the workbench among the soil bags.",
  },
  {
    id: "the-nanny-s-night-off",
    name: "The Nanny\u2019s Night Off",
    category: "domestic",
    blurb: "The parents are away for the weekend. The hired caretaker invites her partner over to use the master suite's king-sized bed and jacuzzi.",
  },
  {
    id: "the-step-mother-s-discipline",
    name: "The Step-Mother\u2019s Discipline",
    category: "domestic",
    blurb: "(Roleplay dynamic) A younger stepmother catches her grown stepson looking through her lingerie drawer, commanding him to kneel and show her what he was looking for.",
  },
  {
    id: "the-butler-s-service",
    name: "The Butler\u2019s Service",
    category: "domestic",
    blurb: "A high-society lady calls her veteran butler into her dressing room, ordering him to strip off his white gloves and dress her from the skin up.",
  },
  {
    id: "the-chauffeur-s-partition",
    name: "The Chauffeur\u2019s Partition",
    category: "domestic",
    blurb: "A wealthy heiress rolls down the glass partition to her limousine driver, commanding him to pull over into a dark alley and join her in the back seat.",
  },
  {
    id: "the-milkman-s-morning",
    name: "The Milkman\u2019s Morning",
    category: "domestic",
    blurb: "A retro roleplay where the morning delivery driver comes straight into the kitchen, taking his payment from the housewife on the kitchen table.",
  },
  {
    id: "the-cousin-s-reunion",
    name: "The Cousin\u2019s Reunion",
    category: "domestic",
    blurb: "(Roleplay dynamic) Two distant relatives meet up at a family cabin after years apart, realizing the childhood crush has evolved into an intense physical attraction.",
  },
  {
    id: "the-maid-s-uniform",
    name: "The Maid\u2019s Uniform",
    category: "domestic",
    blurb: "A husband buys his wife a classic maid outfit, ordering her to clean the entire master bedroom on her hands and knees while he watches from the bed.",
  },
  {
    id: "the-tenant-s-sublet",
    name: "The Tenant\u2019s Sublet",
    category: "domestic",
    blurb: "A subletter arrives to pick up the keys, finding the original tenant packing up in her underwear, leading to an immediate move-in celebration.",
  },
  {
    id: "the-estate-manager-s-tour",
    name: "The Estate Manager\u2019s Tour",
    category: "domestic",
    blurb: "A prospective buyer tours a massive empty mansion with the real estate manager, testing out the master bedroom suite before making an offer.",
  },
  {
    id: "the-washing-machine-stuck",
    name: "The Washing Machine Stuck",
    category: "domestic",
    blurb: "F gets her shirt caught in the front-loading washer. Her partner walks up behind her, taking full advantage of her trapped posture.",
  },
  // Sci-Fi, Superhuman & Supernatural
  {
    id: "the-alien-abduction-lab",
    name: "The Alien Abduction Lab",
    category: "scifi",
    blurb: "F wakes up strapped to an glowing metallic exam table. An alien commander uses advanced sensory probes to study human reproductive anatomy.",
  },
  {
    id: "the-superhero-the-villain",
    name: "The Superhero & The Villain",
    category: "scifi",
    blurb: "A captured superheroine is bound in dampening chains by a supervillain, who takes his victory reward while she tries to fight her restraint.",
  },
  {
    id: "the-android-calibration",
    name: "The Android Calibration",
    category: "scifi",
    blurb: "An engineer runs a physical diagnostic on a lifelike female android, testing her sensory receptors and fluid responses on the lab workbench.",
  },
  {
    id: "the-werewolf-s-full-moon",
    name: "The Werewolf\u2019s Full Moon",
    category: "scifi",
    blurb: "On the night of a full moon, a primal, beast-like partner loses all civilized restraint, taking his mate with raw, uninhibited aggression.",
  },
  {
    id: "the-time-traveler-s-pause",
    name: "The Time Traveler\u2019s Pause",
    category: "scifi",
    blurb: "A time traveler uses a device to freeze time mid-party, walking around the frozen room to pleasure his target while everyone else is frozen in place.",
  },
  {
    id: "the-demon-s-possession",
    name: "The Demon\u2019s Possession",
    category: "scifi",
    blurb: "An incubus visits a mortal at midnight, taking control of her body and filling her with intense, unholy physical pleasure.",
  },
  {
    id: "the-telepathic-command",
    name: "The Telepathic Command",
    category: "scifi",
    blurb: "A mutant with mind-control powers forces his target to strip and present herself to him while she watches her own body obey against her will.",
  },
  {
    id: "the-ghost-in-the-manor",
    name: "The Ghost in the Manor",
    category: "scifi",
    blurb: "A Victorian spirit haunts a bedroom, using invisible, icy touches and floating weight to pleasure a mortal occupant in her bed.",
  },
  {
    id: "the-cybernetic-upgrade",
    name: "The Cybernetic Upgrade",
    category: "scifi",
    blurb: "In a dark futuristic alley, a street doc installs illegal body cyberware on a female patient, using sensory testing to calibrate the hardware.",
  },
  {
    id: "the-shape-shifter-s-game",
    name: "The Shape-Shifter\u2019s Game",
    category: "scifi",
    blurb: "A shifter takes on the physical appearance of a partner's ultimate celebrity crush, walking into the bedroom to fulfill a total fantasy.",
  },
  {
    id: "the-clone-experiment",
    name: "The Clone Experiment",
    category: "scifi",
    blurb: "A scientist creates a perfect physical clone of his assistant, putting the clone through intense physical testing in a glass chamber.",
  },
  {
    id: "the-siren-s-call",
    name: "The Siren\u2019s Call",
    category: "scifi",
    blurb: "A mythical siren uses her hypnotic voice to pull a sailor off his ship, luring him onto a flat ocean rock to drain his energy.",
  },
  {
    id: "the-invisible-man",
    name: "The Invisible Man",
    category: "scifi",
    blurb: "F feels invisible hands pulling down her underwear and spreading her legs on the bed, unable to see her partner as he takes her.",
  },
  {
    id: "the-mermaid-s-grotto",
    name: "The Mermaid\u2019s Grotto",
    category: "scifi",
    blurb: "A diver is pulled down into a warm underwater cavern by a sea creature, engaging in weightless, fluid play under the water.",
  },
  {
    id: "the-witch-s-love-potion",
    name: "The Witch\u2019s Love Potion",
    category: "scifi",
    blurb: "A witch slip a powerful aphrodisiac potion to a traveler, locking him in her cabin while the spell drives him completely wild.",
  },
  {
    id: "the-portal-transporter",
    name: "The Portal Transporter",
    category: "scifi",
    blurb: "A malfunction in a teleportation pod fuses two passengers together in a tight space, forcing deep physical contact during the phase shift.",
  },
  {
    id: "the-zombie-apocalypse-bunker",
    name: "The Zombie Apocalypse Bunker",
    category: "scifi",
    blurb: "Locked inside an underground bunker while monsters roam outside, two survivors use intense physical touch to forget the end of the world.",
  },
  {
    id: "the-angel-s-temptation",
    name: "The Angel\u2019s Temptation",
    category: "scifi",
    blurb: "A fallen angel uses his divine touch to corrupt a mortal, showing her pleasures far beyond normal human experience.",
  },
  {
    id: "the-holodeck-simulation",
    name: "The Holodeck Simulation",
    category: "scifi",
    blurb: "A user creates a custom holographic partner in a virtual reality chamber, setting the compliance parameters to 100%.",
  },
  {
    id: "the-genie-s-wish",
    name: "The Genie\u2019s Wish",
    category: "scifi",
    blurb: "A genie emerges from a lamp, informing his master that her first wish must be an explicit, magical night of physical pleasure.",
  },
  // Public Risk, Sports & Outdoor
  {
    id: "the-fitness-club-locker-room",
    name: "The Fitness Club Locker Room",
    category: "public",
    blurb: "After hours at a private gym, a personal trainer locks the women\u2019s locker room, taking his client on the wooden bench between the lockers.",
  },
  {
    id: "the-tennis-coach-s-serve",
    name: "The Tennis Coach\u2019s Serve",
    category: "public",
    blurb: "A tennis coach adjusts his student's hip position and stance from behind, moving his hands down her tennis skirt to correct her form.",
  },
  {
    id: "the-lifeguard-tower",
    name: "The Lifeguard Tower",
    category: "public",
    blurb: "On a deserted beach at dusk, a lifeguard invites a late swimmer up into his elevated wooden tower for a high-view session.",
  },
  {
    id: "the-golf-course-cart-path",
    name: "The Golf Course Cart Path",
    category: "public",
    blurb: "Hidden in a wooded area off the 14th fairway, two golfers park their cart to take a fast, risky break behind the trees.",
  },
  {
    id: "the-hiking-trail-overlook",
    name: "The Hiking Trail Overlook",
    category: "public",
    blurb: "After a long hike to a secluded mountain peak, M pins F against a flat granite boulder overlooking the valley below.",
  },
  {
    id: "the-yoga-instructor-s-adjustment",
    name: "The Yoga Instructor\u2019s Adjustment",
    category: "public",
    blurb: "In a private yoga session, the instructor pushes his student into an advanced downward position, straddling her from behind to hold the pose.",
  },
  {
    id: "the-ski-resort-hot-tub",
    name: "The Ski Resort Hot Tub",
    category: "public",
    blurb: "Under falling snow in an outdoor hotel hot tub, two guests slip off their swimwear underwater while other guests sit on the far side.",
  },
  {
    id: "the-scuba-boat-cabin",
    name: "The Scuba Boat Cabin",
    category: "public",
    blurb: "Below deck on a diving charter boat, two divers shed their tight neoprene wetsuits for a slick, salt-water-drenched encounter.",
  },
  {
    id: "the-rock-climbing-belay",
    name: "The Rock Climbing Belay",
    category: "public",
    blurb: "A climbing instructor holds his student\u2019s harness tight from below, commanding her to hold a wide wall pose while he reaches up under her chalk bag.",
  },
  {
    id: "the-equestrian-barn",
    name: "The Equestrian Barn",
    category: "public",
    blurb: "Inside a quiet horse barn, an instructor pins a rider against a stack of hay bales, sliding her riding boots off.",
  },
  {
    id: "the-swimming-pool-night-dip",
    name: "The Swimming Pool Night Dip",
    category: "public",
    blurb: "Sneaking into a hotel pool after midnight, two swimmers engage in silent aquatic play against the deep-end wall.",
  },
  {
    id: "the-stadium-box-suite",
    name: "The Stadium Box Suite",
    category: "public",
    blurb: "During a loud sporting event, a couple slips into the dark back restroom of a private VIP stadium box.",
  },
  {
    id: "the-surf-shop-backroom",
    name: "The Surf Shop Backroom",
    category: "public",
    blurb: "Surrounded by surfboards and wax, a shop owner helps a customer try on tight neoprene suits in the private storage room.",
  },
  {
    id: "the-dance-studio-mirror",
    name: "The Dance Studio Mirror",
    category: "public",
    blurb: "A ballet instructor uses the studio bar to stretch his dancer's legs wide, keeping her pinned against the mirror wall.",
  },
  {
    id: "the-camping-hammock",
    name: "The Camping Hammock",
    category: "public",
    blurb: "Wrapped together in a double nylon hammock strung between two trees, M and F find a rhythm despite the swaying fabric.",
  },
  {
    id: "the-ice-skating-rink",
    name: "The Ice Skating Rink",
    category: "public",
    blurb: "After the Zamboni finishes and the lights dim, two skaters take to the ice, using the chill air as an excuse to stay flush together.",
  },
  {
    id: "the-marathon-massage-tent",
    name: "The Marathon Massage Tent",
    category: "public",
    blurb: "In the recovery tent after a race, an athletic masseuse works on a runner's tight glutes and thighs behind a canvas screen.",
  },
  {
    id: "the-archery-range-stance",
    name: "The Archery Range Stance",
    category: "public",
    blurb: "An instructor stands flush behind an archer, holding her arms and hips in alignment while pressing his body against her back.",
  },
  {
    id: "the-country-club-changing-room",
    name: "The Country Club Changing Room",
    category: "public",
    blurb: "Hidden behind velvet curtains in an exclusive club dressing room, M and F take a quick risk before dinner.",
  },
  {
    id: "the-outdoor-shower",
    name: "The Outdoor Shower",
    category: "public",
    blurb: "Under a wooden outdoor rainfall shower at a tropical resort, two guests wash off the sand with a slick, soapy encounter.",
  },
  // BDSM, Fetish & Heavy Kink
  {
    id: "the-pet-girl-the-handler",
    name: "The Pet Girl & The Handler",
    category: "bdsm",
    blurb: "F wears a leather collar and leash, completely restricted to moving on all fours while her handler directs her every move with a crop.",
  },
  {
    id: "the-bondage-furniture-test",
    name: "The Bondage Furniture Test",
    category: "bdsm",
    blurb: "M straps F securely into a specialized wooden bondage frame, using feathers, ice, and vibrators to test her endurance.",
  },
  {
    id: "the-sensory-deprivation-chamber",
    name: "The Sensory Deprivation Chamber",
    category: "bdsm",
    blurb: "F is blindfolded, fitted with noise-canceling headphones, and bound flat to a bed, completely unaware of where M will touch her next.",
  },
  {
    id: "the-latex-suit-enclosure",
    name: "The Latex Suit Enclosure",
    category: "bdsm",
    blurb: "F is zipped into a full-body shine latex suit, locked in total sensory enclosure while M uses heavy external pressure and toys.",
  },
  {
    id: "the-spanking-bench-audit",
    name: "The Spanking Bench Audit",
    category: "bdsm",
    blurb: "M secures F face-down over a leather spanking horse, using a progression of leather paddles, crops, and open hands.",
  },
  {
    id: "the-rope-harness-suspension",
    name: "The Rope Harness Suspension",
    category: "bdsm",
    blurb: "M ties F into a complex Japanese Shibari rope harness, lifting her hips off the mattress to hang suspended in mid-air.",
  },
  {
    id: "the-chastity-keyholder",
    name: "The Chastity Keyholder",
    category: "bdsm",
    blurb: "M locks F into a metal or silicone chastity device, keeping the key around his neck while forcing her to edge using external toys.",
  },
  {
    id: "the-medical-restraints-speculum",
    name: "The Medical Restraints & Speculum",
    category: "bdsm",
    blurb: "Set in a clinical kink lab, F is strapped to a tilt-table while M uses temperature probes and clinical dilators.",
  },
  {
    id: "the-master-the-house-slave",
    name: "The Master & The House Slave",
    category: "bdsm",
    blurb: "F is stripped of all clothing and rights for 24 hours, serving as a footrest, coaster, and physical outlet whenever M snaps his fingers.",
  },
  {
    id: "the-wax-ice-contrast",
    name: "The Wax & Ice Contrast",
    category: "bdsm",
    blurb: "M drip hot soy wax over F\u2019s chest and belly, immediately following the heat with smooth blocks of melting ice.",
  },
  {
    id: "the-tickle-torture-frame",
    name: "The Tickle Torture Frame",
    category: "bdsm",
    blurb: "F\u2019s wrists and ankles are spread-eagle to a wooden frame while M uses feathers, electric wands, and fingers to drive her wild.",
  },
  {
    id: "the-french-hood-gilded-cage",
    name: "The French Hood & Gilded Cage",
    category: "bdsm",
    blurb: "F wears a leather posture collar and hood, locked inside a small brass cage until M decides to open the door.",
  },
  {
    id: "the-cane-submissive-apology",
    name: "The Cane & Submissive Apology",
    category: "bdsm",
    blurb: "F breaks a cardinal rule of the house. M orders her to bend over the leather couch arm to receive ten heavy cane strikes.",
  },
  {
    id: "the-milking-machine-lab",
    name: "The Milking Machine Lab",
    category: "bdsm",
    blurb: "F is strapped into a specialized ergonomic chair with suction cups and toys attached, controlled entirely by a remote control panel.",
  },
  {
    id: "the-electric-wand-stimulation",
    name: "The Electric Wand Stimulation",
    category: "bdsm",
    blurb: "M uses a Violet Wand and glass electrodes to send crackling sparks across F\u2019s sensitive skin while she is bound to the bed.",
  },
  {
    id: "the-leather-hood-forced-silence",
    name: "The Leather Hood & Forced Silence",
    category: "bdsm",
    blurb: "F is fitted with a leather mouth gag and hood, forced to complete explicit physical tasks without making a single noise.",
  },
  {
    id: "the-ball-gag-nipple-clamps",
    name: "The Ball Gag & Nipple Clamps",
    category: "bdsm",
    blurb: "M attaches weighted chain clamps to F\u2019s chest while her mouth is gagged, controlling her movement through small tugs on the chain.",
  },
  {
    id: "the-dominant-female-male-slave",
    name: "The Dominant Female & Male Slave",
    category: "bdsm",
    blurb: "F sits high on a leather throne while M (on a leash) is commanded to worship her feet, boots, and body on command.",
  },
  {
    id: "the-heavy-boot-worship",
    name: "The Heavy Boot Worship",
    category: "bdsm",
    blurb: "M wears heavy leather riding boots, ordering F to clean the leather with her tongue before allowing her to touch his shaft.",
  },
  {
    id: "the-public-leash-walk",
    name: "The Public Leash Walk",
    category: "bdsm",
    blurb: "M leads F (wearing a collar under a heavy coat) through a quiet dark park, pulling the leash tight whenever a distant shadow passes by.",
  },
];

export function roleplaysInCategories(ids: RoleplayCategoryId[]): Roleplay[] {
  const set = new Set(ids);
  return ROLEPLAYS.filter((row) => set.has(row.category));
}

export function roleplayById(id: string): Roleplay | null {
  return ROLEPLAYS.find((row) => row.id === id) ?? null;
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
