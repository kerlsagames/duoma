export type MealCategoryId =
  | "easy"
  | "pasta"
  | "asian"
  | "comfort"
  | "grill"
  | "fresh"
  | "takeout"
  | "breakfast";

export type MealIdea = {
  id: string;
  title: string;
  blurb: string;
  category: MealCategoryId;
};

export type MealCategory = {
  id: MealCategoryId;
  label: string;
  detail: string;
};

export const MEAL_CATEGORIES: MealCategory[] = [
  { id: "easy", label: "Easy weeknight", detail: "Fast, familiar, low fuss" },
  { id: "pasta", label: "Pasta", detail: "Bowls of carbs" },
  { id: "asian", label: "Asian-ish", detail: "Noodles, rice, curry" },
  { id: "comfort", label: "Comfort", detail: "Roasts, pies, mash" },
  { id: "grill", label: "Grill & BBQ", detail: "Flame, steak, skewers" },
  { id: "fresh", label: "Fresh & light", detail: "Bowls, salads, soup" },
  { id: "takeout", label: "Takeout", detail: "Order in, no dishes" },
  { id: "breakfast", label: "Breakfast for dinner", detail: "Eggs, pancakes, fry-up" },
];

export const MEAL_IDEAS: MealIdea[] = [
  meal("chicken-burgers", "Chicken burgers", "Crispy or grilled, buns, slaw.", "easy"),
  meal("quesadillas", "Quesadillas", "Cheese, whatever’s in the fridge, hot pan.", "easy"),
  meal("sausages-mash", "Sausages and mash", "Onion gravy if you have the patience.", "easy"),
  meal("chicken-wraps", "Chicken wraps", "Leftover chicken, salad, sauce, wrap.", "easy"),
  meal("tuna-melts", "Tuna melts", "Toastie press, tuna, cheese, pickle.", "easy"),
  meal("loaded-nachos", "Loaded nachos", "Chips, beans, cheese, oven, fight over the corner.", "easy"),
  meal("stir-fry-noodles", "Stir-fry noodles", "One pan, soy, veg, ten minutes.", "easy"),
  meal("omelette-toast", "Omelette and toast", "Eggs for dinner and nobody apologises.", "easy"),
  meal("ham-toasties", "Ham toasties", "Butter the outside. Non-negotiable.", "easy"),
  meal("fish-fingers", "Fish fingers and salad", "Kid dinner, adult portions.", "easy"),

  meal("spaghetti-bolognese", "Spaghetti bolognese", "The classic. Extra cheese.", "pasta"),
  meal("carbonara", "Carbonara", "Eggs, pecorino, pepper. No cream arguments.", "pasta"),
  meal("pesto-pasta", "Pesto pasta", "Jar pesto is allowed. Add a tomato if you’re fancy.", "pasta"),
  meal("lasagne", "Lasagne", "Worth the dishes if you both eat it.", "pasta"),
  meal("mac-and-cheese", "Mac and cheese", "Crunchy top if you can be bothered.", "pasta"),
  meal("prawn-linguine", "Prawn linguine", "Garlic, chilli, lemon, done.", "pasta"),
  meal("arrabbiata", "Arrabbiata", "Angry tomato. Good with garlic bread.", "pasta"),
  meal("tuna-pasta-bake", "Tuna pasta bake", "Weeknight tray, leftover lunch.", "pasta"),
  meal("aglio-olio", "Aglio e olio", "Garlic, oil, chilli. Prove you can cook with nothing.", "pasta"),
  meal("baked-ziti", "Baked ziti", "Sauce, cheese, oven. Crowd-pleaser.", "pasta"),

  meal("chicken-fried-rice", "Chicken fried rice", "Day-old rice is the move.", "asian"),
  meal("pad-thai", "Pad thai", "Kit or takeout-style at home.", "asian"),
  meal("teriyaki-salmon", "Teriyaki salmon", "Sticky, rice, greens.", "asian"),
  meal("beef-ramen", "Beef ramen", "Packet broth plus something real.", "asian"),
  meal("dumplings-rice", "Dumplings and rice", "Frozen dumplings, no shame.", "asian"),
  meal("green-curry", "Green curry", "Tin of coconut milk, veg, rice.", "asian"),
  meal("sweet-sour-pork", "Sweet and sour pork", "Crispy bits, pineapple optional.", "asian"),
  meal("bibimbap", "Bibimbap", "Rice, veg, egg, gochujang.", "asian"),
  meal("satay-chicken", "Satay chicken", "Peanut sauce and cucumber.", "asian"),
  meal("katsu-curry", "Chicken katsu curry", "Crumbed, saucy, rice mountain.", "asian"),

  meal("roast-chicken", "Roast chicken", "One tray, potatoes, whatever veg is left.", "comfort"),
  meal("shepherds-pie", "Shepherd’s pie", "Mash lid, oven, couch.", "comfort"),
  meal("cottage-pie", "Cottage pie", "Beef mince, mash, peas on the side.", "comfort"),
  meal("meatballs-mash", "Meatballs and mash", "Red sauce or gravy — you pick.", "comfort"),
  meal("chicken-pot-pie", "Chicken pot pie", "Creamy filling, pastry hat.", "comfort"),
  meal("beef-stew", "Beef stew", "Slow if you started early, pressure cooker if not.", "comfort"),
  meal("schnitzel", "Chicken schnitzel", "Crumbed, lemon, slaw.", "comfort"),
  meal("fish-and-chips", "Fish and chips at home", "Oven chips count.", "comfort"),
  meal("loaded-potatoes", "Loaded baked potatoes", "Cheese, beans, sour cream, spring onion.", "comfort"),
  meal("chicken-parm", "Chicken parmigiana", "Schnitzel, sauce, mozzarella.", "comfort"),

  meal("steak-salad", "Steak and salad", "Pan-hot steak, leaves, mustard.", "grill"),
  meal("bbq-chicken", "BBQ chicken", "Char, sauce, corn.", "grill"),
  meal("homemade-burgers", "Homemade beef burgers", "Smash them thin.", "grill"),
  meal("lamb-chops", "Lamb chops", "Garlic, rosemary, five minutes a side.", "grill"),
  meal("halloumi-skewers", "Halloumi skewers", "Peppers, onion, lemon.", "grill"),
  meal("pork-ribs", "Pork ribs", "Slow then sticky.", "grill"),
  meal("grilled-salmon", "Grilled salmon", "Skin on, greens, lemon.", "grill"),
  meal("hot-dogs", "Hot dogs", "Mustard fight, pickles if you have them.", "grill"),
  meal("chicken-souvlaki", "Chicken souvlaki", "Pita, tzatziki, chips.", "grill"),
  meal("steak-corn", "Steak and corn", "Butter, salt, no extra sides required.", "grill"),

  meal("poke-bowls", "Poke bowls", "Rice, raw or cooked fish, crunchy bits.", "fresh"),
  meal("greek-salad", "Greek salad and bread", "Feta, olives, olive oil, done.", "fresh"),
  meal("grain-bowls", "Grain bowls", "Quinoa or rice, roast veg, tahini.", "fresh"),
  meal("veggie-stir-fry", "Veggie stir-fry", "Whatever’s wilting, garlic, soy.", "fresh"),
  meal("caprese-chicken", "Caprese chicken", "Tomato, basil, mozzarella on top.", "fresh"),
  meal("prawn-salad", "Prawn salad", "Cold, lemon, avocado.", "fresh"),
  meal("sushi-night", "Sushi night at home", "Kits or a supermarket platter.", "fresh"),
  meal("tomato-soup-cheese", "Tomato soup and grilled cheese", "Dip the corner.", "fresh"),
  meal("buddha-bowls", "Buddha bowls", "Roast chickpeas, greens, a sauce you like.", "fresh"),
  meal("zucchini-noodles", "Zucchini noodles", "With pesto or a quick tomato.", "fresh"),

  meal("pizza-order", "Pizza delivery", "One you both like, one wildcard.", "takeout"),
  meal("shop-burgers", "Burgers from the shop", "Fries. Don’t skip the fries.", "takeout"),
  meal("sushi-order", "Sushi order-in", "Too many salmon rolls.", "takeout"),
  meal("indian-curry", "Indian takeout", "One creamy, one hot, rice and garlic naan.", "takeout"),
  meal("chinese-banquet", "Chinese banquet", "Shared plates, leftover lunch.", "takeout"),
  meal("thai-takeout", "Thai takeout", "Pad see ew plus something spicy.", "takeout"),
  meal("shop-fish-chips", "Fish and chips shop", "Newspaper energy, couch.", "takeout"),
  meal("kebab-night", "Kebab night", "Garlic sauce negotiations.", "takeout"),
  meal("burritos", "Burritos", "Chipotle-style or the place down the road.", "takeout"),
  meal("fried-chicken", "Fried chicken", "Crispy, slaw, no plates if you’re tired.", "takeout"),

  meal("pancakes", "Pancakes", "Proper stack, maple, maybe bacon.", "breakfast"),
  meal("bacon-eggs", "Bacon and eggs", "The honest dinner.", "breakfast"),
  meal("breakfast-burritos", "Breakfast burritos", "Eggs, salsa, cheese, wrap.", "breakfast"),
  meal("french-toast", "French toast", "Brioche if you have it.", "breakfast"),
  meal("shakshuka", "Shakshuka", "Eggs in spicy tomato, bread for dipping.", "breakfast"),
  meal("avo-toast-feast", "Avocado toast feast", "Make it a whole plate, not a snack.", "breakfast"),
  meal("waffles", "Waffles", "Frozen iron is fine.", "breakfast"),
  meal("fry-up", "Full fry-up", "Eggs, beans, something fried, tea.", "breakfast"),
  meal("huevos", "Huevos rancheros", "Eggs, salsa, tortillas.", "breakfast"),
  meal("smoothie-bowls", "Smoothie bowls", "When dinner wants to be cold and sweet.", "breakfast"),
];

function meal(
  id: string,
  title: string,
  blurb: string,
  category: MealCategoryId
): MealIdea {
  return { id: `meal-${id}`, title, blurb, category };
}

export function mealById(id: string): MealIdea | null {
  return MEAL_IDEAS.find((item) => item.id === id) ?? null;
}

export function mealCategoryMeta(id: MealCategoryId): MealCategory {
  return MEAL_CATEGORIES.find((item) => item.id === id) ?? MEAL_CATEGORIES[0]!;
}

export function mealsInCategories(ids: MealCategoryId[]): MealIdea[] {
  const allowed = new Set(ids);
  return MEAL_IDEAS.filter((item) => allowed.has(item.category));
}

export function pickRandomMeal(
  ids: MealCategoryId[],
  avoidIds: Iterable<string> = []
): MealIdea | null {
  const blocked = new Set(avoidIds);
  const pool = mealsInCategories(ids).filter((item) => !blocked.has(item.id));
  const source = pool.length ? pool : mealsInCategories(ids);
  if (!source.length) return null;
  return source[Math.floor(Math.random() * source.length)] ?? null;
}

export function groupMealsByCategory(ideas: MealIdea[] = MEAL_IDEAS) {
  return MEAL_CATEGORIES.map((category) => ({
    category,
    items: ideas.filter((item) => item.category === category.id),
  })).filter((row) => row.items.length > 0);
}
