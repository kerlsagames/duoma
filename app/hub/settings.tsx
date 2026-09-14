import { Redirect } from "expo-router";

/** Couple settings now live on the Home cog. Old links land there. */
export default function SettingsRedirect() {
  return <Redirect href="/" />;
}
