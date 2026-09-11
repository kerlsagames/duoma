import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type CouponCategoryId =
  | "food"
  | "relax"
  | "chores"
  | "outings"
  | "flirty"
  | "wildcard"
  | "escapes"
  | "nostalgia"
  | "relief"
  | "surprises"
  | "connection";

export type CouponIdea = {
  id: string;
  title: string;
  category: CouponCategoryId;
};

export type CouponCategory = {
  id: CouponCategoryId;
  label: string;
  detail: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

export const COUPON_CATEGORIES: CouponCategory[] = [
  {
    id: "food",
    label: "Food",
    detail: "Meals, snacks, coffee runs",
    icon: "restaurant-outline",
  },
  {
    id: "relax",
    label: "Pamper",
    detail: "Massages, baths, quiet time",
    icon: "water-outline",
  },
  {
    id: "chores",
    label: "Favors",
    detail: "Chores and lifesaver passes",
    icon: "construct-outline",
  },
  {
    id: "outings",
    label: "Outings",
    detail: "Dates, shows, adventures",
    icon: "ticket-outline",
  },
  {
    id: "flirty",
    label: "Romance",
    detail: "Flirty and romantic gestures",
    icon: "heart-outline",
  },
  {
    id: "wildcard",
    label: "Wildcard",
    detail: "Funny passes and blank checks",
    icon: "flash-outline",
  },
  {
    id: "escapes",
    label: "Escapes",
    detail: "Solo resets, quiet time",
    icon: "leaf-outline",
  },
  {
    id: "nostalgia",
    label: "Nostalgia",
    detail: "Games, snacks, throwbacks",
    icon: "game-controller-outline",
  },
  {
    id: "relief",
    label: "Relief",
    detail: "Venting, hugs, soft landings",
    icon: "hand-left-outline",
  },
  {
    id: "surprises",
    label: "Surprises",
    detail: "Small weekday pick-me-ups",
    icon: "gift-outline",
  },
  {
    id: "connection",
    label: "Connection",
    detail: "Talks, memories, together time",
    icon: "people-outline",
  },
];

function pack(category: CouponCategoryId, titles: string[]): CouponIdea[] {
  return titles.map((title, index) => ({
    id: `${category}-${index + 1}`,
    title,
    category,
  }));
}

export const COUPON_IDEAS: CouponIdea[] = [
  ...pack("food", [
    "Breakfast in bed with your choice of drinks & menu",
    "I cook your favorite home meal from scratch tonight",
    "Late-night fast-food run—my treat",
    "You get the last bite/slice of whatever we are sharing",
    "Coffee in bed brought to you every morning this weekend",
    "Master of the TV snacks: I make a deluxe snack platter for our movie",
    "Takeout night: You pick the restaurant, no questions asked",
    "Dessert date on me: Ice cream, bakery, or late-night sweets",
    "I take over kitchen clean-up duty after dinner",
    "Chef's Special: A custom dinner date night at home",
    "Freshly baked batch of your favorite cookies or treats",
    "Fancy cocktail or mocktail made and served to you",
    "Mystery dinner date: I organize and pay for the full meal",
    "Weekend pancake or waffle bar built just for you",
    "You get immunity from picking what's for dinner tonight",
    "Gourmet picnic planned and packed for an outdoor spot",
    "Pizza night: You pick every single topping without debate",
    "Endless refills: I play bartender/waiter for you all evening",
    "Midnight snack delivered to you in bed",
    "Lunch date drop-off: I bring your favorite lunch to your work/home",
  ]),
  ...pack("relax", [
    "20-minute full back massage with oil or lotion",
    "Deep scalp massage & hair scratch session",
    "Ultimate foot rub after a long day",
    "Hand & arm massage while watching TV",
    "Uninterrupted 1-hour bubble bath set up with candles & music",
    "Shoulder and neck tension release rub",
    "At-home spa night: Face mask, robe, relaxation setup",
    "Sleep in pass: No alarm, no morning responsibilities",
    "Zero-complaint nap time: Complete peace and quiet for 2 hours",
    "Fresh bedsheets day: Clean sheets, fluffy pillows, cozy bed ready for you",
    "Temperature control king/queen: You set the house thermostat today",
    "Total quiet hour: Guaranteed silence to read, rest, or unwind",
    "Guilt-free lazy Sunday: Do absolutely nothing all day",
    "Gentle back scratch until you drift off to sleep",
    "Warm towel waiting for you right after your shower",
    "Aromatherapy room setup: Diffuser, soft lights, cozy vibe",
    "Royal treatment: I bring you whatever you need for 1 full hour",
    "Afternoon hammock or couch cuddle session with no phone distractions",
    "Full head-to-toe relaxation massage",
    "Bedtime story read aloud to help you unwind",
    "Fresh smoothie or cold drink served post-workout/bath",
    "Candlelight bath with your favorite music playing",
    "Face mask & skin routine night together",
    "Unlimited back scratches during a 2-hour movie",
    "Early bedtime wrap: House locked up, chores done, bed ready early",
  ]),
  ...pack("chores", [
    "Get Out of Chore Free Pass: Swap any task to me",
    "Full house vacuum & floor sweep pass",
    "Laundry takeover: Wash, fold, and put away one entire load",
    "Dishwasher duty for 3 consecutive days",
    "Car wash & interior clean-out inside and out",
    "Trash & recycling duty for a full week",
    "Errands runner: I do 3 errands on your to-do list",
    "Pet duty pass: Walking, feeding, or cleaning up all day",
    "Deep clean one room of your choice",
    "Organise that one messy drawer/closet you've been avoiding",
    "Grocery shopping done completely solo by me",
    "Morning school/kid duty pass: You get to stay in bed",
    "Yard or outdoor maintenance takeover",
    "Auto maintenance pass: Checking tires, fuel fill-up, or servicing",
    "Make the bed every morning for a week",
    "Meal prep duty for the upcoming week",
    "Tech support pass: I fix or set up a device/app hassle-free",
    "Ironing / outfit preparation pass for your week",
    "Declutter helper: 1 hour dedicated to helping you organize",
    "Evening house reset pass: Everything tidied before bed",
    '"You rest, I test": I take care of all evening household tasks',
    "Quick-fix home repair pass",
    "Post-party or post-dinner cleanup done completely by me",
    "Window or mirror cleaning session",
    "Full car vacuum and air freshener refresh",
  ]),
  ...pack("outings", [
    "You pick the movie / show binge: Zero commentary or complaints from me",
    "Movie theater date: Premium seats, popcorn, and drinks on me",
    "Road trip controller: You control the music/podcasts the entire drive",
    "Local adventure day: We visit somewhere nearby we've never been",
    "Board game / Card game night of your choice",
    "Video game co-op pass: I play your favorite multiplayer game with you",
    "Sunset drive or walk with hot drinks",
    "Live event date: Sports, comedy show, concert, or theater outing",
    "Bookstore date: I buy you any book of your choice",
    "Arcade / Bowling / Mini-golf challenge night",
    "Museum, gallery, or local exhibition visit",
    "Outdoor star-gazing night with blankets and hot drinks",
    "Shopping spree buddy: I tag along willingly and hold your bags",
    "Picnic in the park with your favorite foods",
    "Tourist in our own town day",
    "Comedy night: Watching live stand-up or a classic comedy show",
    "Scenic hike or nature walk at your pace",
    "Late-night drive with the windows down and music up",
    "Weekend market / Farmers market stroll & coffee",
    "Festival or community event afternoon out",
    "TV remote authority for 24 hours straight",
    "Dessert bar or ice cream crawl",
    "Trivia night out at a local spot",
    "Beach or lakeside afternoon setup",
    "Photo walk: Taking fun photos together around town",
  ]),
  ...pack("flirty", [
    "Quick passionate kiss out of nowhere",
    "Midday flirty text streak guaranteed to make you smile",
    "Slow dance in the kitchen to our favorite romantic songs",
    "Candlelit bedroom setup with music and mood lighting",
    "Write and deliver a romantic handwritten love letter",
    "5 genuine, heartfelt compliments spoken throughout the day",
    "Spontaneous romantic getaway planning session",
    "Full-body massage with zero expectations attached",
    "Whispered secrets/compliments in a crowded room",
    "Dress up fancy for a stylish night in or out",
    "Recreate our very first date or early memory",
    "10-minute uninterrupted warm cuddle hold",
    "Steamy bath or shower together",
    "Playful challenge / dare of your choosing from the Spicy deck",
    "Stargazing cuddle under a warm pile of blankets",
    "Romantic morning check-in before the world gets busy",
    '"Tell me 3 things you love about me" cuddle session',
    "Romantic walk holding hands, no phone checking allowed",
    "Nightcap drink in the dark with cozy talk",
    "Blindfold taste-test or sensory game setup",
    "Bedroom request: Your wish is my command",
    "Romantic playlist curated specifically for you",
    "Late night secret conversation with all lights off",
    "A romantic polaroid / photo taken together today",
    "Unprompted physical affection pass all day long",
  ]),
  ...pack("wildcard", [
    "Win any argument instantly (No questions asked)",
    '"You were right" confession pass: I admit you were right out loud',
    '"I pick what we wear" pass: You style my outfit for an outing',
    "Get out of a social event pass: Instant veto card to stay home",
    "Silly voice or accent requirement for 30 minutes",
    '"Yes Day" hour: I have to say yes to every reasonable request for 1 hour',
    "30-second dance party anywhere, anytime you trigger it",
    "Aux cord privilege: Complete music takeover for 24 hours",
    "Sarcasm-free zone: I must be 100% earnest and genuine all evening",
    "Veto one outfit choice I am wearing today",
    "Funny impression request on demand",
    "Custom dad-joke or pun performance whenever requested",
    "Swap places in bed / on the couch for the night",
    "Secret handshake created and mastered together today",
    '"Pause everything" pass: Stop what I\'m doing and give you my full attention',
    "Personal hype-person pass: I hype you up before a big task or event",
    "Veto one TV show or movie selection instantly",
    "Override the playlist at any party or gathering",
    "Instant cuddle tackle on demand",
    "Bad dad joke or funny story told on command when you feel down",
    '"You choose the restaurant" pass for the entire weekend',
    "Swap chores with me for 24 hours",
    "Pick my nickname for the next 24 hours",
    '"No phone usage" pledge during our next meal together',
    "Unconditional 5-minute rant listen with 100% agreement from me",
    "Serenade request: Sing a song passionately to you",
    "Master of the bed cover: You get 75% of the blankets tonight",
    '"Do my hair / style my hair" fun session',
    "Unlimited veto power on today's weekend plans",
    "Blank check coupon: Redeemable for any one reasonable favor of your choice",
  ]),
  ...pack("escapes", [
    "Guilt-Free Solo Hour: 1 hour of zero interruptions where your partner handles everything while you do whatever you want",
    "Quiet Reading / Scrolling Pass: Immunity from household chatter or requests for 45 minutes while you unwind",
    "Hobby Sprint: Your partner covers routine responsibilities so you can spend two uninterrupted hours on a project or hobby",
    "Long Hot Shower Lockout: Complete quiet and zero bathroom interruptions for as long as a hot shower takes",
    "Solo Drive / Coffee Break: Take the car, get your favorite beverage, and sit somewhere quiet for an hour on your own",
    "Sleep-In Exemption: Pass this to stay in bed extra late on a weekend morning without explaining why",
    "Digital Fast Pass: Declare a 2-hour window where you don't have to reply to texts, check emails, or look at your phone",
    "Hammock / Porch Reset: Your partner brings you a cold drink while you sit outside and do nothing for 30 minutes",
    "Zero-Decibel Evening: 30 minutes of absolute silence around the house while you decompress after a long day",
    "Early Night Out-Of-Duty: Redeem to go to bed as early as you want, leaving all closing-up tasks to your partner",
  ]),
  ...pack("nostalgia", [
    "Arcade / Games Night: Head to an arcade, bowling alley, or set up retro games at home for a play session",
    "Childhood Snack Nostalgia: Your partner tracks down and buys three nostalgic snacks from your past",
    "Retro Movie Marathon: You pick two movies from your childhood or teenage years to watch back-to-back",
    "Playstation / Gaming Buddy: Your partner agrees to play co-op or multiplayer games with you for an hour",
    "Lego / Puzzle Build: Spend a quiet evening putting together a set or puzzle while listening to music",
    "Ice Cream Parlour Run: Grab a waffle cone or sundae from a local parlor, no matter the time of night",
    "Show-and-Tell Night: Show your partner your favorite old music videos, classic clips, or photo albums",
    "Mini-Golf / Trivia Challenge: Redeem for a quick mini-golf round or local pub trivia night together",
    "Comfort Food Dinner: Request a meal that tastes like home or a favorite childhood dish",
    "Board Game Rematch: Instantly trigger a rematch on any tabletop or card game you lost recently",
  ]),
  ...pack("relief", [
    "Venting Vault: 15 minutes to complain about work or life with guaranteed validation and zero advice",
    "Emergency Hug Hold: Hold a continuous 2-minute embrace whenever you need an instant reset",
    "Decision-Free Evening: Your partner makes every single minor decision (what to eat, watch, or do) for the rest of the night",
    "Head Massage on Demand: A 10-minute quiet scalp massage when a headache or stress hits",
    "Priority Comfort Item: Your partner fetches a warm blanket, heat pack, or fresh socks without you asking twice",
    "Problem-Solving Brainstorm: Sit down for 20 minutes while your partner helps you map out a solution to something stressing you out",
    "Peace & Quiet Guarantee: Immediate noise reduction in the house for 1 hour when you're overwhelmed",
    "No-Questions Answered: Get out of explaining why you're in a mood—your partner simply offers a hug or space",
    "Heavy Lifting Pass: Your partner handles moving, carrying, or lifting heavy items for the day",
    "Tea / Cocoa Remedy: A fresh hot drink delivered whenever you express that you've had a tough moment",
  ]),
  ...pack("surprises", [
    "Hidden Note Hunt: Your partner hides three sweet or funny notes in your bag, car, or pockets for you to find",
    "Surprise Treat in Bag: Your partner sneaks your favorite chocolate or snack into your work bag",
    "Playlist Dedicated to You: Your partner curates a 10-song custom playlist tailored specifically to your taste",
    "Custom Morning Coffee: Wake up to your favorite coffee prepared exactly how you like it before you ask",
    "Car Gas Tank Fill-Up: Your partner takes your car to the station and returns it with a full tank",
    "Desk Pickup Service: Your partner tidies your desk area or workspace while you take a break",
    "Fresh Sheets Upgrade: Bed made with freshly washed sheets ready for you at the end of the day",
    "Favorite Local Snack Drop: Your partner drops off a fresh bakery treat or lunch item at your workspace",
    "Mid-Day Check-in Text: A thoughtful message during a busy workday simply to tell you you're doing great",
    "Flower / Plant Pick-Me-Up: A small bouquet or potted plant brought home on a random weekday",
  ]),
  ...pack("connection", [
    "Deep Dive Q&A: Spend 30 minutes asking each other open-ended connection questions over a drink",
    "Sunset / Sunrise View: Drive to a local spot to watch the sun go down or come up together",
    "Dream Planning Session: Sit down with notebooks and talk about future travel, home projects, or long-term goals",
    "Unplugged Porch Sit: 30 minutes sitting outside together chatting with zero phones or screens present",
    "Gratitude Exchange: Share five specific things you deeply appreciate about each other right now",
    "Memory Lane Drive: Drive around meaningful local spots (where you first met, first date, early memories)",
    "Shared Podcast / Audio Book: Listen to an episode of an interesting podcast or audiobook chapter together while relaxing",
    "Cook Together Class at Home: Pick a brand-new recipe you've never tried and cook it as a team",
    "Stargazing & Music: Lay out a blanket in the yard or balcony with music playing softly in the background",
    "Photo Album Review: Scroll through photos from a favorite trip or year past and reminisce",
  ]),
];

export const COUPON_USE_OPTIONS = [
  { id: "tonight", label: "Tonight", hint: "Use by end of today" },
  { id: "weekend", label: "This weekend", hint: "Use by Sunday night" },
  { id: "7d", label: "7 days", hint: "A week from now" },
  { id: "30d", label: "30 days", hint: "A month of runway" },
  { id: "none", label: "No expiry", hint: "Stays until redeemed" },
  { id: "custom", label: "Custom", hint: "Pick exact date & time" },
] as const;

export type CouponUseOptionId = (typeof COUPON_USE_OPTIONS)[number]["id"];

export {
  defaultCustomDateTime,
  expiresAtForTiming as expiresAtForUseOption,
  formatExactWhen,
  parseLocalDateTime,
  toLocalDateTimeValue,
  useTimingLabel as useOptionLabel,
} from "@/lib/useTiming";

export function couponIdeaById(id: string): CouponIdea | null {
  return COUPON_IDEAS.find((row) => row.id === id) ?? null;
}

export function ideasInCategory(category: CouponCategoryId): CouponIdea[] {
  return COUPON_IDEAS.filter((row) => row.category === category);
}

export function categoryMeta(id: string | null | undefined): CouponCategory | null {
  return COUPON_CATEGORIES.find((row) => row.id === id) ?? null;
}
