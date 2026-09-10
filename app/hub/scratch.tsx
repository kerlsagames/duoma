import { Redirect } from "expo-router";

/** Scratch was replaced by shared Lists. */
export default function ScratchRedirect() {
  return <Redirect href="/hub/lists" />;
}
