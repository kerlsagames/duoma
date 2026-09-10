import { Redirect } from "expo-router";

/** Pick-your-own deck building was removed. Live deal-3 play starts immediately. */
export default function SelectScreen() {
  return <Redirect href="/game/play" />;
}
