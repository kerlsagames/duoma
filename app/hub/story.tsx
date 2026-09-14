import { Redirect } from "expo-router";

/** Choose-Your-Own Adventure is gone. Old links land in Fun. */
export default function StoryRedirect() {
  return <Redirect href="/hub/play" />;
}
