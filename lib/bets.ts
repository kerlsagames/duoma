export type BetPromptCategory = "everyday" | "sports" | "screen" | "challenge";
export type BetStakeCategory = "app" | "house" | "spicy" | "silly";
export type BetKind = "who" | "will";

export type BetPrompt = {
  id: string;
  text: string;
  category: BetPromptCategory;
  kind: BetKind;
};

export type BetStake = {
  id: string;
  text: string;
  category: BetStakeCategory;
};

export const BET_PROMPT_CATEGORIES: {
  id: BetPromptCategory;
  label: string;
  detail: string;
}[] = [
  { id: "everyday", label: "Everyday", detail: "Habits, house, tiny tells" },
  { id: "sports", label: "Sports & AFL", detail: "Matches, margins, fantasy" },
  { id: "screen", label: "TV & movies", detail: "Plot twists and credits" },
  { id: "challenge", label: "Challenges", detail: "Steps, games, staring contests" },
];

export const BET_STAKE_CATEGORIES: {
  id: BetStakeCategory;
  label: string;
  detail: string;
}[] = [
  { id: "app", label: "App perks", detail: "Coupons, decks, bragging rights" },
  { id: "house", label: "Household", detail: "Coffee, dishes, the remote" },
  { id: "spicy", label: "Romantic & spicy", detail: "Massage, control, tease" },
  { id: "silly", label: "Playful forfeits", detail: "Dance, accent, yes-person hour" },
];

export const BET_PROMPTS: BetPrompt[] = [
  p("everyday", "who", "snooze", "Who will press snooze first tomorrow?"),
  p("everyday", "will", "delivery-eta", "Will the food delivery arrive before the estimated time?"),
  p("everyday", "who", "spill", "Who will drop or spill something first today?"),
  p("everyday", "will", "laundry-9", "Will the laundry get folded and put away before 9pm?"),
  p("everyday", "who", "bins", "Who will remember the bins without being reminded?"),
  p("everyday", "will", "leave-10", "Will we leave the house within 10 minutes of the plan?"),
  p("everyday", "who", "movie-sleep", "Who will fall asleep first during the movie?"),
  p("everyday", "will", "see-someone", "Will either of us see someone we know on errands?"),
  p("everyday", "who", "temp-complain", "Who will complain about being cold or hot first?"),
  p("everyday", "will", "dishwasher-noon", "Will the dishwasher be empty by noon?"),
  p("everyday", "who", "phone-wake", "Who will check their phone first after waking?"),
  p("everyday", "will", "shop-even", "Will the supermarket bill be an even dollar amount?"),
  p("everyday", "who", "love-you", "Who will say I love you first today?"),
  p("everyday", "will", "pets-7", "Will the kids or pets wake up before 7am this weekend?"),
  p("everyday", "who", "lost-item", "Who will find the lost thing first?"),
  p("everyday", "will", "parcel-2", "Will the parcel arrive before 2pm?"),
  p("everyday", "who", "dinner-idea", "Who will propose dinner first tonight?"),
  p("everyday", "will", "green-lights", "Will we hit every green light on the main road out?"),
  p("everyday", "who", "coffee-first", "Who will finish their coffee or tea first?"),
  p("everyday", "will", "dinner-ping", "Will anyone call or text during dinner?"),
  p("everyday", "who", "bed-first", "Who will suggest bed first tonight?"),
  p("everyday", "will", "mail-today", "Will the mail carrier leave mail today?"),
  p("everyday", "who", "water", "Who will get up for a glass of water first tonight?"),
  p("everyday", "will", "ice-cream", "Will we finish the whole ice cream tonight?"),
  p("everyday", "who", "get-ready", "Who will take longer to get ready for the date?"),

  p("sports", "who", "h2h", "Who will win the head-to-head this weekend?"),
  p("sports", "will", "margin-15", "Will our team win by more than 15 points?"),
  p("sports", "who", "first-goal", "Who will kick the first goal?"),
  p("sports", "will", "over-160", "Will the total match score go over 160?"),
  p("sports", "who", "fantasy-round", "Who will score more fantasy points this round?"),
  p("sports", "will", "goal-2min", "Will a goal go in within the first 2 minutes?"),
  p("sports", "will", "win-100", "Will the winning team score over 100 points?"),
  p("sports", "who", "disposals", "Who will record more disposals this round?"),
  p("sports", "will", "four-goals", "Will any player kick 4 or more goals?"),
  p("sports", "will", "ht-10", "Will the half-time margin be under 10 points?"),
  p("sports", "will", "centre-bounce", "Will our team win the opening centre clearance?"),
  p("sports", "will", "poster-q1", "Will there be a poster in the first quarter?"),
  p("sports", "who", "fantasy-rank", "Who will rank higher in weekly fantasy?"),
  p("sports", "will", "last-2", "Will it be inside a goal with 2 minutes left?"),
  p("sports", "will", "50m-q1", "Will a 50-metre penalty land in the opening term?"),
  p("sports", "will", "toss", "Will the home team win the toss?"),
  p("sports", "who", "margin-guess", "Who will guess the winning margin closer?"),
  p("sports", "will", "key-q4", "Will a key player kick a goal in the last quarter?"),
  p("sports", "will", "set-shot-50", "Will someone nail a set shot from outside 50?"),
  p("sports", "will", "10-goals-half", "Will there be more than 10 goals in the first half?"),
  p("sports", "will", "underdog-lead", "Will the underdog lead at any break?"),
  p("sports", "who", "tips", "Who will tip more correct winners this round?"),
  p("sports", "will", "3-2", "Will the leading goalkicker finish over 3.2?"),
  p("sports", "will", "report", "Will there be a report, yellow, or red in the match?"),
  p("sports", "will", "fav-60", "Will our favourite player touch it in the first 60 seconds?"),

  p("screen", "will", "alive", "Will the main character make it through tonight’s episode?"),
  p("screen", "who", "twist", "Who will guess the plot twist first?"),
  p("screen", "will", "villain-out", "Will the contestant we dislike get eliminated tonight?"),
  p("screen", "will", "over-2h", "Will the movie run longer than 2 hours?"),
  p("screen", "who", "actor", "Who will clock a supporting actor’s other role first?"),
  p("screen", "will", "breakup", "Will the main couple break up before the finale?"),
  p("screen", "will", "open-action", "Will the opening scene be action, not talk?"),
  p("screen", "who", "culprit", "Who will name the culprit first?"),
  p("screen", "will", "cliffhanger", "Will tonight end on a cliffhanger?"),
  p("screen", "will", "cry-30", "Will someone cry in the next 30 minutes?"),
  p("screen", "will", "post-credits", "Will there be a post-credits scene?"),
  p("screen", "who", "rt-score", "Who will pick the movie with the higher Rotten Tomatoes?"),
  p("screen", "will", "throwback", "Will the credits song be a throwback?"),
  p("screen", "will", "villain-face", "Will the trailer show the villain’s face?"),
  p("screen", "who", "song", "Who will name the background song first?"),
  p("screen", "will", "job-offer", "Will they accept the job or proposition this episode?"),
  p("screen", "will", "jump-15", "Will there be a jump scare in the next 15 minutes?"),
  p("screen", "who", "full-name", "Who will remember the character’s full name first?"),
  p("screen", "will", "imdb-85", "Will the finale score above 8.5 on IMDb?"),
  p("screen", "will", "kiss", "Will the main characters kiss before it ends?"),
  p("screen", "will", "cameo", "Will there be a cameo?"),
  p("screen", "who", "last-line", "Who will predict the last line of the movie?"),
  p("screen", "will", "burn-dish", "Will the cooking contestant burn or undercook it?"),
  p("screen", "will", "resolve", "Will the main storyline resolve tonight?"),
  p("screen", "who", "talent", "Who will guess the talent-show winner?"),

  p("challenge", "who", "steps", "Who will log more steps today?"),
  p("challenge", "who", "social", "Who can go longer without socials (screen time)?"),
  p("challenge", "who", "cards", "Who will win the 3-round card or board game?"),
  p("challenge", "who", "paper-bin", "Who lands the paper ball in the bin from 3 metres first?"),
  p("challenge", "who", "plank", "Who holds the plank longer?"),
  p("challenge", "who", "puzzle", "Who finishes a 100-piece puzzle chunk faster?"),
  p("challenge", "who", "trivia-5", "Who wins a 5-question trivia showdown?"),
  p("challenge", "who", "silent-car", "Who stays silent longer on a 10-minute car ride?"),
  p("challenge", "who", "strike", "Who throws the first bowling strike?"),
  p("challenge", "who", "minigolf", "Who wins mini-golf by the 18th?"),
  p("challenge", "who", "wordle", "Who solves the daily word puzzle in fewer tries?"),
  p("challenge", "who", "arcade", "Who scores higher at the arcade?"),
  p("challenge", "who", "coin-glass", "Who lands a coin in the glass from across the table?"),
  p("challenge", "who", "darts", "Who hits the first bullseye?"),
  p("challenge", "who", "spoon-nose", "Who balances a spoon on their nose longer?"),
  p("challenge", "who", "portrait", "Who draws the better 60-second portrait?"),
  p("challenge", "who", "category-10", "Who names 10 things in a category in 15 seconds?"),
  p("challenge", "who", "rps", "Who wins best-of-five rock paper scissors?"),
  p("challenge", "who", "coin-stack", "Who stacks 10 coins higher without a collapse?"),
  p("challenge", "who", "price", "Who guesses the price without going over?"),
  p("challenge", "who", "chores", "Who finishes their chore list first today?"),
  p("challenge", "who", "songs", "Who lists more songs by one artist in 30 seconds?"),
  p("challenge", "who", "8-ball", "Who sinks the 8-ball first?"),
  p("challenge", "who", "ping-pong", "Who bounces a ping-pong ball into a cup in fewer tries?"),
  p("challenge", "who", "stare", "Who wins a 60-second staring contest?"),
];

export const BET_STAKES: BetStake[] = [
  s("app", "swipe-unlock", "Winner unlocks one card of their choice from the partner’s deck."),
  s("app", "favor-credit", "Winner gets +1 wildcard coupon in the ledger."),
  s("app", "set-next-bet", "Winner sets next week’s couple bet."),
  s("app", "nickname-week", "Winner renames the partner in-app for 7 days."),
  s("app", "veto-pass", "Winner can veto one daily prompt or chore ping."),
  s("app", "deck-tonight", "Winner picks tonight’s swipe deck vibe."),
  s("app", "streak-shield", "Winner gets a one-time streak save."),
  s("app", "double-next", "Winner’s next bet pays double."),
  s("app", "wheel", "Winner spins the favors wheel."),
  s("app", "force-match", "Winner can force one swipe into a mutual match."),
  s("app", "trophy", "Winner unlocks Predictor Champion on the board."),
  s("app", "custom-push", "Winner writes a custom push to the other phone."),
  s("app", "priority-redeem", "Winner redeems any saved coupon first."),
  s("app", "make-polls", "Winner writes the next 3 in-app questions."),
  s("app", "immunity", "Winner is immune from the next forfeit."),
  s("app", "favor-upgrade", "Winner turns 2 small favors into 1 big one."),
  s("app", "home-theme", "Winner picks the partner’s home wallpaper for a week."),
  s("app", "alert-chime", "Winner picks the partner’s app alert sound."),
  s("app", "back-rub-card", "Winner gets a 15-minute back rub coupon now."),
  s("app", "keep-coupon", "Loser keeps one favor live until it’s used."),
  s("app", "deal-3", "Winner deals 3 cards. Partner must pick one to do."),
  s("app", "vault-24", "Winner gets 24 hours in the partner’s hidden wishlist."),
  s("app", "brag-cert", "Winner gets a bragging-rights certificate."),
  s("app", "super-like", "Winner tags 3 swipe items as high priority."),
  s("app", "palette-week", "Winner picks the app palette for a week."),

  s("house", "breakfast-bed", "Loser cooks weekend breakfast in bed."),
  s("house", "dishes-3", "Loser does dinner dishes for 3 nights."),
  s("house", "coffee-week", "Loser makes the morning coffee exactly right for a week."),
  s("house", "remote-night", "Winner owns the remote all evening. No debate."),
  s("house", "make-bed-5", "Loser makes the bed every morning for 5 days."),
  s("house", "takeout-pick", "Winner picks tonight’s takeout, whole order."),
  s("house", "chore-swap", "Loser takes one of the winner’s weekly chores."),
  s("house", "car-wash", "Loser washes and vacuums the car."),
  s("house", "neck-rub", "Loser gives a 15-minute foot or neck rub during TV."),
  s("house", "errand-solo", "Loser runs the next grocery or chemist run alone."),
  s("house", "weekend-menu", "Winner writes the whole weekend cook menu."),
  s("house", "bins-2w", "Loser does bins and recycling for 2 weeks."),
  s("house", "sleep-in", "Winner sleeps in. Loser runs the morning."),
  s("house", "snack-fetch", "Loser fetches snacks on demand movie night."),
  s("house", "laundry-2", "Loser folds and puts away two full loads."),
  s("house", "sofa-week", "Winner gets the good sofa spot for a week."),
  s("house", "car-dj", "Winner DJs every car ride for a month."),
  s("house", "bed-side", "Winner picks the side of the bed tonight."),
  s("house", "desk-tidy", "Loser tidies the winner’s desk."),
  s("house", "lunch-3", "Loser packs the winner’s lunch for 3 days."),
  s("house", "thermostat", "Winner sets the house temperature. No arguing."),
  s("house", "pet-bath", "Loser does the next pet bath."),
  s("house", "yard", "Loser does 30 minutes of yard or the mow."),
  s("house", "pillows", "Loser fluffs the pillows every night this week."),
  s("house", "quiet-hour", "Winner gets one undisturbed quiet hour."),

  s("spicy", "oil-massage", "Loser gives a 20-minute full-body oil massage, lights low."),
  s("spicy", "blindfold-15", "Loser spends 15 minutes blindfolded while the winner teases."),
  s("spicy", "outfit-bed", "Winner picks what the loser wears to bed."),
  s("spicy", "oral-unlimited", "Winner gets unhurried oral. No clock."),
  s("spicy", "spicy-cards", "Loser plays a spicy card or dice game the winner picks."),
  s("spicy", "pace-control", "Winner controls positions, pace, and timing."),
  s("spicy", "lingerie-show", "Loser does a private modelling show in the winner’s pick."),
  s("spicy", "orgasm-call", "Winner decides when the loser is allowed to come."),
  s("spicy", "ear-filth", "Loser whispers filthy compliments into the winner’s ear."),
  s("spicy", "strip-3", "Loser strips to 3 songs the winner picks."),
  s("spicy", "morning-start", "Loser starts morning intimacy before the alarm."),
  s("spicy", "ice-oil", "Loser brings ice or warm oil into foreplay, winner’s call."),
  s("spicy", "kneel-ask", "Loser kneels and asks permission to get in bed."),
  s("spicy", "wrists", "Loser agrees to wrists bound tonight."),
  s("spicy", "shower-wash", "Loser soaps the winner down in the shower."),
  s("spicy", "non-genital", "Loser spends 15 minutes on the winner’s non-obvious spots."),
  s("spicy", "spank-10", "Winner gives 10 playful spankings."),
  s("spicy", "roleplay-pick", "Loser plays the roleplay the winner chooses."),
  s("spicy", "underwear-serve", "Loser serves drinks in underwear."),
  s("spicy", "edge-3", "Winner edges the loser 3 times before release."),
  s("spicy", "feather", "Loser uses a feather or brush on the winner for 10 minutes."),
  s("spicy", "work-photo", "Loser sends one private photo during the workday."),
  s("spicy", "kiss-5", "Loser starts a 5-minute kiss and doesn’t break it."),
  s("spicy", "nude-dance", "Loser slow-dances nude with the winner, lights dim."),
  s("spicy", "match-fantasy", "Winner cashes in one mutual fantasy-match card."),

  s("silly", "dance-30", "Loser does a 30-second all-in living-room dance."),
  s("silly", "serenade", "Loser sings a full song at the winner, loud."),
  s("silly", "dinner-outfit", "Loser wears the winner’s ridiculous outfit to dinner at home."),
  s("silly", "public-3", "Loser loudly names 3 reasons the winner is amazing, in public."),
  s("silly", "majesty", "Loser says Your Majesty (or My Lord / Lady) all evening."),
  s("silly", "accent-hour", "Loser does a pirate or posh accent for one hour."),
  s("silly", "feet-on-demand", "Loser gives a 5-minute foot rub whenever asked tonight."),
  s("silly", "social-post", "Loser posts a cute or funny appreciation of the winner."),
  s("silly", "phone-drawer", "Loser puts their phone in a drawer for 3 hours."),
  s("silly", "pet-name-day", "Loser uses the winner’s silly pet name all day."),
  s("silly", "car-karaoke", "Loser lip-syncs a whole song in the car, committed."),
  s("silly", "fridge-art", "Loser draws the winner and it lives on the fridge 3 days."),
  s("silly", "romance-read", "Loser reads a romance passage out loud, extra dramatic."),
  s("silly", "tea-party", "Loser throws a proper tea service, tiny sandwiches included."),
  s("silly", "10-compliments", "Loser gives 10 real compliments in 60 seconds."),
  s("silly", "bow-2h", "Loser bows every time the winner enters a room for 2 hours."),
  s("silly", "carry-bags", "Loser carries all the bags next shop."),
  s("silly", "rhyme-15", "Loser speaks in rhymes for 15 minutes."),
  s("silly", "3-jokes", "Loser tells jokes until the winner actually laughs. Three minimum."),
  s("silly", "piggyback", "Loser piggybacks the winner from the car to the door."),
  s("silly", "shoes", "Loser cleans the winner’s favourite shoes."),
  s("silly", "high-five", "Loser high-fives on demand for the rest of the day."),
  s("silly", "poem-4", "Loser writes a 4-line poem about how good the winner is."),
  s("silly", "half-dessert", "Loser gives up half their dessert."),
  s("silly", "yes-hour", "Loser says yes, absolutely to every reasonable ask for one hour."),
];

function p(
  category: BetPromptCategory,
  kind: BetKind,
  id: string,
  text: string
): BetPrompt {
  return { id: `bet-${id}`, category, kind, text };
}

function s(category: BetStakeCategory, id: string, text: string): BetStake {
  return { id: `stake-${id}`, category, text };
}

export function betPromptsIn(category: BetPromptCategory): BetPrompt[] {
  return BET_PROMPTS.filter((row) => row.category === category);
}

export function betStakesIn(category: BetStakeCategory): BetStake[] {
  return BET_STAKES.filter((row) => row.category === category);
}

export function pickRandomPrompt(avoidId?: string | null): BetPrompt {
  const pool = BET_PROMPTS.filter((row) => row.id !== avoidId);
  return pool[Math.floor(Math.random() * pool.length)] ?? BET_PROMPTS[0]!;
}

export function pickRandomStake(avoidId?: string | null): BetStake {
  const pool = BET_STAKES.filter((row) => row.id !== avoidId);
  return pool[Math.floor(Math.random() * pool.length)] ?? BET_STAKES[0]!;
}

export function betPromptById(id: string): BetPrompt | null {
  return BET_PROMPTS.find((row) => row.id === id) ?? null;
}
