import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type FantasyIcon = ComponentProps<typeof Ionicons>["name"];

export type FantasyCategoryId =
  | "tonight"
  | "weekend"
  | "roleplay"
  | "places"
  | "sensory"
  | "power"
  | "soft";

export type FantasyIdea = {
  id: string;
  title: string;
  blurb: string;
  category: FantasyCategoryId;
};

export type FantasyCategory = {
  id: FantasyCategoryId;
  label: string;
  tint: string;
  icon: FantasyIcon;
};

export const FANTASY_CATEGORIES: FantasyCategory[] = [
  { id: "tonight", label: "Tonight", tint: "#FF6B9A", icon: "moon-outline" },
  { id: "weekend", label: "Weekend", tint: "#F0A46A", icon: "sunny-outline" },
  { id: "roleplay", label: "Roleplay", tint: "#C084FC", icon: "color-wand-outline" },
  { id: "places", label: "Places", tint: "#5B8CFF", icon: "location-outline" },
  { id: "sensory", label: "Sensory", tint: "#3ECFBF", icon: "flower-outline" },
  { id: "power", label: "Power", tint: "#FF5C7A", icon: "flash-outline" },
  { id: "soft", label: "Soft heat", tint: "#E4C37A", icon: "heart-outline" },
];

export const FANTASY_IDEAS: FantasyIdea[] = [
  {
    id: "fx-strangers-bar",
    title: "Strangers at the bar",
    blurb:
      "Act like you just met. Flirt from scratch, pick each other up, and take it from there.",
    category: "roleplay",
  },
  {
    id: "fx-hotel-key",
    title: "Hotel key drop",
    blurb:
      "Book a room (or fake one at home). One of you leaves a key and a time. No small talk first.",
    category: "places",
  },
  {
    id: "fx-blindfold-tour",
    title: "Blindfold tour",
    blurb:
      "Blindfold them and lead a slow full-body tour with only your hands and mouth.",
    category: "sensory",
  },
  {
    id: "fx-shower-rule",
    title: "Shower with one rule",
    blurb:
      "Shower together. One person is not allowed to touch themselves — the other does all the work.",
    category: "tonight",
  },
  {
    id: "fx-text-filth",
    title: "Filthy lunch texts",
    blurb:
      "Send three daytime texts that get filthier. The last one names exactly when you’ll make it real.",
    category: "tonight",
  },
  {
    id: "fx-kitchen-counter",
    title: "Kitchen counter detour",
    blurb:
      "Start dinner, abandon it halfway, and finish against the counter before the food burns.",
    category: "places",
  },
  {
    id: "fx-boss-desk",
    title: "Boss / assistant desk",
    blurb:
      "One of you is in charge. Clear instructions only. Stay in character until someone laughs.",
    category: "roleplay",
  },
  {
    id: "fx-massage-trap",
    title: "Massage that isn’t just a massage",
    blurb:
      "Oil, slow hands, no sex until they ask twice. If they speak early, restart.",
    category: "soft",
  },
  {
    id: "fx-tied-wrists",
    title: "Soft restraint night",
    blurb:
      "Tie or hold wrists with something soft. You set the pace. They set the stop word.",
    category: "power",
  },
  {
    id: "fx-mirror",
    title: "Mirror watch",
    blurb:
      "Do it where you can both see yourselves. No looking away for one whole song.",
    category: "sensory",
  },
  {
    id: "fx-car-driveway",
    title: "Parked car ten minutes",
    blurb:
      "Driveway or quiet street. Ten minutes. Then walk inside like nothing happened.",
    category: "places",
  },
  {
    id: "fx-outfit-order",
    title: "Wear what I pick",
    blurb:
      "One partner picks the other’s outfit (or lingerie) for the evening. No vetoes except safety.",
    category: "weekend",
  },
  {
    id: "fx-voice-note",
    title: "Voice note preview",
    blurb:
      "Record a 20-second voice note of what you want to do. They listen alone before you meet.",
    category: "tonight",
  },
  {
    id: "fx-edge-timer",
    title: "Edging timer",
    blurb:
      "Twenty minutes of teasing with a timer. Nobody finishes until it hits zero — then you decide.",
    category: "power",
  },
  {
    id: "fx-public-secret",
    title: "Public secret",
    blurb:
      "One explicit instruction they follow in public without anyone noticing. Payoff later.",
    category: "places",
  },
  {
    id: "fx-morning-wake",
    title: "Wake-up claim",
    blurb:
      "Wake them up with slow touch and no talking until they pull you in.",
    category: "soft",
  },
  {
    id: "fx-role-switch",
    title: "Full role switch",
    blurb:
      "Whoever usually leads follows tonight. No asking ‘is this okay’ unless the stop word is used.",
    category: "power",
  },
  {
    id: "fx-photo-tease",
    title: "Locked photo tease",
    blurb:
      "Send one photo they are not allowed to open until a set time tonight.",
    category: "tonight",
  },
  {
    id: "fx-ice-warm",
    title: "Ice then warm",
    blurb:
      "Temperature play: cool then warm hands or mouth. Stay until their breathing changes.",
    category: "sensory",
  },
  {
    id: "fx-movie-pause",
    title: "Movie pause rule",
    blurb:
      "Start a film. Every time someone gets distracted, pause and escalate for two minutes.",
    category: "weekend",
  },
  {
    id: "fx-new-room",
    title: "Wrong room on purpose",
    blurb:
      "Start in a room you never use. Finish wherever you end up.",
    category: "places",
  },
  {
    id: "fx-doctor",
    title: "Very thorough checkup",
    blurb:
      "Play doctor / patient with a clipboard of ‘symptoms’ you invent together.",
    category: "roleplay",
  },
  {
    id: "fx-slow-strip",
    title: "One piece at a time",
    blurb:
      "Clothes come off one piece per song. No rushing the playlist.",
    category: "soft",
  },
  {
    id: "fx-command-hour",
    title: "Command hour",
    blurb:
      "For sixty minutes they only do what you say. Kind, clear, and specific.",
    category: "power",
  },
  {
    id: "fx-bath-together",
    title: "Shared bath first",
    blurb:
      "Fill the tub, phones out, candles optional. Touch is allowed. Finish wherever you want after.",
    category: "weekend",
  },
  {
    id: "fx-toy-instruction",
    title: "Toy on the bed",
    blurb:
      "Leave one toy or accessory on the bed as the only instruction. No talking for five minutes.",
    category: "tonight",
  },
  {
    id: "fx-praise",
    title: "Praise-only night",
    blurb:
      "Only compliments and dirty praise allowed. No jokes that break the mood.",
    category: "soft",
  },
  {
    id: "fx-outdoor-risk",
    title: "Quiet outdoor risk",
    blurb:
      "Somewhere private outdoors or a balcony — keep it short, keep it quiet, keep it thrilling.",
    category: "places",
  },
  {
    id: "fx-name-game",
    title: "Call me that",
    blurb:
      "Pick a name or title. They use it for the next hour, even when you laugh.",
    category: "roleplay",
  },
  {
    id: "fx-aftercare-first",
    title: "Aftercare menu first",
    blurb:
      "Before anything spicy, agree the aftercare: water, cuddles, snack, or alone time.",
    category: "soft",
  },
  {
    id: "fx-sixty-nine-timer",
    title: "Mutual mouth timer",
    blurb:
      "Mouth only, ten minutes, no hands. Timer on the nightstand.",
    category: "tonight",
  },
  {
    id: "fx-weekend-hotel",
    title: "Fake anniversary hotel",
    blurb:
      "Treat a night like a hotel anniversary even if you stay home — robes, order-in, no chores.",
    category: "weekend",
  },
  {
    id: "fx-lights-off-map",
    title: "Lights-off body map",
    blurb:
      "Lights out. They lie still while you find every place that makes them twitch — no rushing the map.",
    category: "tonight",
  },
  {
    id: "fx-doorway-pin",
    title: "Pinned in the doorway",
    blurb:
      "Catch them coming through a door. Kiss, pin, and decide together whether you make it to the bed.",
    category: "tonight",
  },
  {
    id: "fx-remote-under-table",
    title: "Remote under the table",
    blurb:
      "One of you wears a toy through dinner at home. The remote stays across the table. Be kind. Be mean.",
    category: "tonight",
  },
  {
    id: "fx-no-hands-shower",
    title: "Hands-off shower",
    blurb:
      "Shower together. Hands stay on the wall or on them — never on yourself.",
    category: "tonight",
  },
  {
    id: "fx-sock-rule",
    title: "Clothes stay on until…",
    blurb:
      "Nothing comes off until one of you says the sentence you agreed at the start. Make them work for it.",
    category: "tonight",
  },
  {
    id: "fx-whisper-tour",
    title: "Ear-only instructions",
    blurb:
      "Whisper exactly what you want, one sentence at a time. They follow. You don’t repeat yourself.",
    category: "tonight",
  },
  {
    id: "fx-fridge-break",
    title: "Midnight fridge break",
    blurb:
      "Get up for water. Don’t make it back to bed the same way you left.",
    category: "tonight",
  },
  {
    id: "fx-phone-away-hour",
    title: "Phones in another room",
    blurb:
      "One hour. Phones out. You only get each other’s attention — including the filthy kind.",
    category: "tonight",
  },
  {
    id: "fx-count-to-ten",
    title: "Count to ten out loud",
    blurb:
      "They have to count slowly while you tease. If they lose the number, you start over.",
    category: "tonight",
  },
  {
    id: "fx-sofa-deal",
    title: "Sofa, then floor",
    blurb:
      "Start on the couch like you’ll be good. Finish wherever gravity takes you.",
    category: "tonight",
  },
  {
    id: "fx-lipstick-trail",
    title: "Leave a trail",
    blurb:
      "Mark a path down their body with mouth or lipstick. They are not allowed to wipe it off until morning.",
    category: "tonight",
  },
  {
    id: "fx-yes-list-three",
    title: "Three yeses",
    blurb:
      "Each of you names three things you want tonight. You have to hit all six before sleep.",
    category: "tonight",
  },
  {
    id: "fx-slow-grind-song",
    title: "One song, clothes on",
    blurb:
      "Pick one track. Grind like you’re in public. Clothes stay on until the last beat.",
    category: "tonight",
  },
  {
    id: "fx-window-light",
    title: "Against the window light",
    blurb:
      "Use the window or balcony door as your backdrop. Curtains are a negotiation.",
    category: "tonight",
  },
  {
    id: "fx-breakfast-in-bed-filth",
    title: "Breakfast, then dessert",
    blurb:
      "Serve breakfast in bed. Dessert is not food. No getting up until both are handled.",
    category: "weekend",
  },
  {
    id: "fx-lazy-morning-rule",
    title: "No leaving the mattress",
    blurb:
      "Saturday morning: nobody gets out of bed until you’ve both come or the coffee goes cold. Your call.",
    category: "weekend",
  },
  {
    id: "fx-picnic-blanket",
    title: "Indoor picnic that derails",
    blurb:
      "Blanket on the floor, snacks, a film. The rule: you have to start something before the credits.",
    category: "weekend",
  },
  {
    id: "fx-gold-hour-walk",
    title: "Walk first, rush home",
    blurb:
      "Take an evening walk. The first one to say what they want turns you both around immediately.",
    category: "weekend",
  },
  {
    id: "fx-dress-up-night",
    title: "Dress like a first date",
    blurb:
      "Full outfits, cologne, the nice glasses. Come home and ruin them carefully.",
    category: "weekend",
  },
  {
    id: "fx-two-hour-tease",
    title: "Two-hour tease window",
    blurb:
      "All afternoon you may tease. Nobody finishes until a time you set. Set a loud alarm.",
    category: "weekend",
  },
  {
    id: "fx-cook-naked-apron",
    title: "Apron-only cooking",
    blurb:
      "One of you cooks in an apron and nothing else. The other is allowed to interrupt twice.",
    category: "weekend",
  },
  {
    id: "fx-rain-check-in",
    title: "Rainy-day marathon",
    blurb:
      "If it’s grey out, you stay in. Three rounds, long breaks, no errands until dark.",
    category: "weekend",
  },
  {
    id: "fx-sunday-reset",
    title: "Sunday reset sex",
    blurb:
      "Slow, unhurried, lights low. The point is to remember you like each other, then get specific.",
    category: "weekend",
  },
  {
    id: "fx-day-trip-tease",
    title: "Day trip with a secret",
    blurb:
      "Go out for the day. One of you is wearing something they weren’t allowed to mention until the drive home.",
    category: "weekend",
  },
  {
    id: "fx-long-bath-handoff",
    title: "Bath handoff",
    blurb:
      "One soaks. The other gets in halfway. Trade who leads when the water starts to cool.",
    category: "weekend",
  },
  {
    id: "fx-record-store-flirt",
    title: "Public flirt, private payoff",
    blurb:
      "Spend an hour in shops being obviously into each other. The second you get home, no small talk.",
    category: "weekend",
  },
  {
    id: "fx-slow-sunday-oral",
    title: "Unhurried morning mouth",
    blurb:
      "One person gets a long, lazy oral morning. The other can only touch hair and sheets.",
    category: "weekend",
  },
  {
    id: "fx-mechanic-visit",
    title: "The mechanic who stays late",
    blurb:
      "Hood up, hands dirty, ‘it’ll cost extra.’ Stay in character until the invoice is ‘paid.’",
    category: "roleplay",
  },
  {
    id: "fx-hotel-porter",
    title: "Room service you didn’t order",
    blurb:
      "Knock, tray optional. They have to let you in and follow the special you describe.",
    category: "roleplay",
  },
  {
    id: "fx-photographer",
    title: "Private photoshoot",
    blurb:
      "One directs poses. Camera optional. The last pose is not for pictures.",
    category: "roleplay",
  },
  {
    id: "fx-librarian",
    title: "Quiet in the stacks",
    blurb:
      "One of you is the stern librarian. The other has overdue fines that can be worked off silently.",
    category: "roleplay",
  },
  {
    id: "fx-bodyguard",
    title: "Bodyguard in the hallway",
    blurb:
      "You don’t leave their side. When the ‘event’ ends, the protection gets very personal.",
    category: "roleplay",
  },
  {
    id: "fx-artist-model",
    title: "Stay still for the artist",
    blurb:
      "They pose. You ‘sketch’ with your mouth and hands. If they move, you start the pose over.",
    category: "roleplay",
  },
  {
    id: "fx-pilot-hotel",
    title: "Layover night",
    blurb:
      "You’re only in town until morning. Uniform optional. No exchanging real names until after.",
    category: "roleplay",
  },
  {
    id: "fx-exes-one-night",
    title: "Exes who shouldn’t",
    blurb:
      "Pretend you broke up months ago and ‘ran into’ each other. The bad idea is the point.",
    category: "roleplay",
  },
  {
    id: "fx-massage-client",
    title: "Happy-ending grey area",
    blurb:
      "Book a ‘professional’ massage at home. The table talk stays clinical until it absolutely doesn’t.",
    category: "roleplay",
  },
  {
    id: "fx-detective",
    title: "Interrogation with a smile",
    blurb:
      "One asks questions. The other is cuffed to a chair (softly). Truths get rewarded. Lies get teased.",
    category: "roleplay",
  },
  {
    id: "fx-vampire-hour",
    title: "Don’t you dare look away",
    blurb:
      "One of you is hungry and polite about it. Necks, wrists, slow bites that don’t break character.",
    category: "roleplay",
  },
  {
    id: "fx-royal-favor",
    title: "A favor for the crown",
    blurb:
      "One kneels. One grants permission. Titles stay on until someone giggles — then you double down.",
    category: "roleplay",
  },
  {
    id: "fx-step-into-office",
    title: "Closed-door review",
    blurb:
      "Performance review at the dining table. Ratings are physical. Appeals are allowed on your knees.",
    category: "roleplay",
  },
  {
    id: "fx-stranger-rideshare",
    title: "Wrong car on purpose",
    blurb:
      "Meet in the parked car like a rideshare mix-up. You don’t go inside until the ‘fare’ is settled.",
    category: "roleplay",
  },
  {
    id: "fx-laundry-room",
    title: "Shared laundry room",
    blurb:
      "Fold nothing. Use the machine cycle as your timer. If someone ‘walks in,’ freeze, then continue.",
    category: "places",
  },
  {
    id: "fx-closet-crush",
    title: "Walk-in closet squeeze",
    blurb:
      "Shut the door. Limited space, whispered instructions, try not to knock the hangers down.",
    category: "places",
  },
  {
    id: "fx-stairs-landing",
    title: "Halfway up the stairs",
    blurb:
      "Don’t make it to the bedroom. Landing, wall, or that one creaky step — pick your risk.",
    category: "places",
  },
  {
    id: "fx-desk-chair",
    title: "Work-from-home desk",
    blurb:
      "Laptop shut. Chair stays. They can keep typing if they want — you won’t make it easy.",
    category: "places",
  },
  {
    id: "fx-bathroom-sink",
    title: "Bathroom sink fog",
    blurb:
      "Mirror on. Hands on the porcelain. You both watch. Nobody pretends this was about brushing teeth.",
    category: "places",
  },
  {
    id: "fx-balcony-two-minutes",
    title: "Balcony two minutes",
    blurb:
      "Step outside. Two minutes. Quiet. Then back in like you were checking the weather.",
    category: "places",
  },
  {
    id: "fx-hallway-wall",
    title: "Hallway, coats still on",
    blurb:
      "You just got home. Coats stay on. The hallway is far enough.",
    category: "places",
  },
  {
    id: "fx-kitchen-table",
    title: "Clear the kitchen table",
    blurb:
      "One sweep of the mail. They sit or lie back. Dinner can wait.",
    category: "places",
  },
  {
    id: "fx-shower-glass",
    title: "Through the shower glass",
    blurb:
      "One of you stays outside the glass first — watching, directing — then joins when asked twice.",
    category: "places",
  },
  {
    id: "fx-guest-room",
    title: "The room you never use",
    blurb:
      "Guest bed, office floor, or that awkward armchair. New room, same hunger.",
    category: "places",
  },
  {
    id: "fx-parked-garage",
    title: "Garage with the door down",
    blurb:
      "Engine off. Door closed. Ten minutes before you ‘remember’ you have a house.",
    category: "places",
  },
  {
    id: "fx-library-carrel",
    title: "Quiet corner in public",
    blurb:
      "A bookstore nook, a museum bench, a dark cinema. Hands only. Faces calm. Payoff later.",
    category: "places",
  },
  {
    id: "fx-hot-tub-home",
    title: "Tub or hot tub rule",
    blurb:
      "Water up. Suits optional. One rule: nobody stands up until you’ve both had a turn being spoiled.",
    category: "places",
  },
  {
    id: "fx-feather-ice",
    title: "Feather, then ice",
    blurb:
      "Alternate the lightest touch with something cold. They say which they want next — you may ignore them.",
    category: "sensory",
  },
  {
    id: "fx-silk-blind",
    title: "Silk over the eyes",
    blurb:
      "Blindfold with something soft. You narrate what you’re about to do, then wait a beat before doing it.",
    category: "sensory",
  },
  {
    id: "fx-oil-shoulders",
    title: "Oil from the neck down",
    blurb:
      "Warm oil, slow hands, no skipping the boring spots. Sex is allowed only after the full pass.",
    category: "sensory",
  },
  {
    id: "fx-headphones-guide",
    title: "Headphones on them",
    blurb:
      "They wear headphones. You play a voice note you recorded earlier that tells them what happens next.",
    category: "sensory",
  },
  {
    id: "fx-taste-tour",
    title: "Taste, then kiss",
    blurb:
      "Honey, mint, chocolate, citrus — one at a time on skin, then kissed off. No mixing until the end.",
    category: "sensory",
  },
  {
    id: "fx-hair-pull-lesson",
    title: "Show me how hard",
    blurb:
      "They put your hand in their hair and show the exact pressure they want. You copy it all night.",
    category: "sensory",
  },
  {
    id: "fx-breath-play-soft",
    title: "Hand over the mouth",
    blurb:
      "Soft, consensual, easy to tap out. Cover their mouth while you go slow. Watch their eyes.",
    category: "sensory",
  },
  {
    id: "fx-nails-map",
    title: "Nails, not hands",
    blurb:
      "For ten minutes you may only use nails and breath. No palms. No mouth. Then you give everything back.",
    category: "sensory",
  },
  {
    id: "fx-temperature-spoons",
    title: "Hot spoon, cold spoon",
    blurb:
      "Warm a spoon, chill another. Trace them. They guess which is next with their eyes closed.",
    category: "sensory",
  },
  {
    id: "fx-fabric-only",
    title: "Fabric between you",
    blurb:
      "Keep one layer of clothes or a sheet between you for a whole song. Friction only. Then rip it away.",
    category: "sensory",
  },
  {
    id: "fx-ear-bites",
    title: "Ears and throat only",
    blurb:
      "Five minutes you are only allowed at their ears, jaw, and throat. They are not allowed to touch you back.",
    category: "sensory",
  },
  {
    id: "fx-lotion-gloves",
    title: "Slow lotion gloves",
    blurb:
      "Lotion or oil + optional gloves. Make the ordinary parts (arms, calves, back) feel filthy.",
    category: "sensory",
  },
  {
    id: "fx-mirror-hands",
    title: "Hands where they can see",
    blurb:
      "Stand them at the mirror. Your hands stay visible. They watch every decision you make.",
    category: "sensory",
  },
  {
    id: "fx-traffic-light",
    title: "Green / yellow / red night",
    blurb:
      "Pick a color system and actually use it. Push toward yellow on purpose, then ease or go.",
    category: "power",
  },
  {
    id: "fx-ask-permission",
    title: "Ask for every next thing",
    blurb:
      "They have to ask permission to kiss, touch, move, finish. You can say wait. You can say now.",
    category: "power",
  },
  {
    id: "fx-kneel-first",
    title: "Kneel before we start",
    blurb:
      "One kneels and waits for instructions. Clothes can stay on. The kneeling is the start of the night.",
    category: "power",
  },
  {
    id: "fx-orgasm-control",
    title: "You don’t get to decide",
    blurb:
      "One person controls if/when the other finishes. Kind check-ins. Mean timing.",
    category: "power",
  },
  {
    id: "fx-written-rules",
    title: "Three written rules",
    blurb:
      "Write three rules on paper and tape it where you’ll see it. Break one on purpose and take the consequence.",
    category: "power",
  },
  {
    id: "fx-collar-night",
    title: "Something at the throat",
    blurb:
      "A necklace, scarf, or collar they keep on. When you touch it, they pause and listen.",
    category: "power",
  },
  {
    id: "fx-over-the-knee",
    title: "Over the knee, then kinder",
    blurb:
      "Playful spanking with a number you both pick. Aftercare is mandatory and longer than the scene.",
    category: "power",
  },
  {
    id: "fx-no-talking-scene",
    title: "No words for twenty",
    blurb:
      "Twenty minutes, no talking. Gestures and eyes only. If someone speaks, add five minutes.",
    category: "power",
  },
  {
    id: "fx-service-stretch",
    title: "Service stretch",
    blurb:
      "They spend fifteen minutes doing exactly what you like with no goal of their own. Then you switch or reward.",
    category: "power",
  },
  {
    id: "fx-hold-still",
    title: "Hold still or we stop",
    blurb:
      "They have to stay as still as they can. Every twitch pauses you. Make stillness feel impossible.",
    category: "power",
  },
  {
    id: "fx-task-list",
    title: "A list on the nightstand",
    blurb:
      "Leave a short list: kneel, undress, wait, fetch water. They complete it before you touch them.",
    category: "power",
  },
  {
    id: "fx-eye-contact-order",
    title: "Don’t break eye contact",
    blurb:
      "The leading partner can look anywhere. The other cannot look away. If they do, you restart the beat.",
    category: "power",
  },
  {
    id: "fx-reward-chart",
    title: "Earn the next thing",
    blurb:
      "Split the night into rewards. Compliments, obedience, or daring — each one unlocks the next act.",
    category: "power",
  },
  {
    id: "fx-forehead-kisses-filth",
    title: "Gentle face, filthy hands",
    blurb:
      "Kiss them like you’re being sweet. Your hands are not sweet. Keep that split the whole time.",
    category: "soft",
  },
  {
    id: "fx-spoon-and-steal",
    title: "Spoon, then steal them",
    blurb:
      "Start as the little spoon. Slowly take over until they’re the one being held down — still tender.",
    category: "soft",
  },
  {
    id: "fx-forehead-checkin",
    title: "Name what feels good",
    blurb:
      "Every few minutes you each say one thing that feels good. No criticism. Adjust like you’re a team.",
    category: "soft",
  },
  {
    id: "fx-slow-undress-talk",
    title: "Undress and tell the truth",
    blurb:
      "Each piece of clothing comes with a true sentence about what you want from them this week.",
    category: "soft",
  },
  {
    id: "fx-cuddle-to-grind",
    title: "Cuddle until it isn’t",
    blurb:
      "No agenda for ten minutes of holding. The first person to start grinding owns the next twenty.",
    category: "soft",
  },
  {
    id: "fx-hair-wash",
    title: "Wash their hair first",
    blurb:
      "Shower or sink. Wash their hair like it’s the main event. Then let the rest of the water get used.",
    category: "soft",
  },
  {
    id: "fx-letters-then-bed",
    title: "Read it, then take me to bed",
    blurb:
      "Write three sentences about why you want them. Read them out loud. Then stop being literary.",
    category: "soft",
  },
  {
    id: "fx-forehead-to-forehead",
    title: "Stay that close",
    blurb:
      "Foreheads together as long as you can stand it. When you finally kiss, don’t pull away for a full song.",
    category: "soft",
  },
  {
    id: "fx-sleep-naked-rule",
    title: "Sleep naked on purpose",
    blurb:
      "Both of you, no clothes, even if you ‘just sleep.’ If someone starts something at 2am, that’s allowed.",
    category: "soft",
  },
  {
    id: "fx-hand-on-heart",
    title: "Hand on their chest",
    blurb:
      "Keep a hand over their heart while you go slow. Match your pace to their breathing, then steal it.",
    category: "soft",
  },
  {
    id: "fx-favorite-spot-only",
    title: "Only their favorite spot",
    blurb:
      "Ask what always works. Do only that, patiently, until they’re shaking. Then ask if they want more.",
    category: "soft",
  },
  {
    id: "fx-good-morning-note",
    title: "Wake-up note on the pillow",
    blurb:
      "Leave one filthy-sweet sentence. They have to do what it says before coffee, or you do it to them.",
    category: "soft",
  },
];

export function fantasyById(id: string): FantasyIdea | null {
  return FANTASY_IDEAS.find((item) => item.id === id) ?? null;
}

export function fantasyCategoryMeta(id: FantasyCategoryId): FantasyCategory {
  return (
    FANTASY_CATEGORIES.find((item) => item.id === id) ?? FANTASY_CATEGORIES[0]
  );
}

/** Cards the current person has not swiped yet — including ones added after they cleared an older deck. */
export function leftoverFantasies(seenIds: Iterable<string>): FantasyIdea[] {
  const seen = new Set(seenIds);
  return FANTASY_IDEAS.filter((idea) => !seen.has(idea.id));
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
  return FANTASY_IDEAS.filter((_, index) => index % 2 === 0).map(
    (item) => item.id
  );
}
