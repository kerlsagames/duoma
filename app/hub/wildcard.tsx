import { Redirect } from "expo-router";

/** Legacy route — Challenges & Dares now live under Up for it. */
export default function WildcardRedirect() {
  return <Redirect href="/hub/up-for-it" />;
}
