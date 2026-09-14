import { Redirect } from "expo-router";

/** Curiosity Deck is now Discover. Old links land on the swipe deck. */
export default function CuriosityRedirect() {
  return <Redirect href="/hub/discover" />;
}
