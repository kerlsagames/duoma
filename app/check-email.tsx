import { Redirect } from "expo-router";

/** Old email-code screen. Sign-in is email + password on /login. */
export default function CheckEmailScreen() {
  return <Redirect href="/login" />;
}
