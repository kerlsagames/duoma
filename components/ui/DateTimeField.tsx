import { Platform } from "react-native";
import { createElement, useMemo } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  accent?: string;
  background?: string;
  ink?: string;
  border?: string;
};

/** Local `YYYY-MM-DDTHH:mm` field. Uses the browser calendar on web. */
export function DateTimeField({
  value,
  onChange,
  min,
  accent = "#3DE0C5",
  background = "#101820",
  ink = "#E8F4F1",
  border = "rgba(61,224,197,0.28)",
}: Props) {
  const style = useMemo(
    () => ({
      width: "100%",
      marginTop: 12,
      boxSizing: "border-box" as const,
      borderRadius: 16,
      border: `1px solid ${border}`,
      background,
      color: ink,
      padding: "14px 14px",
      fontSize: 16,
      fontFamily: 'Georgia, "Iowan Old Style", Palatino, serif',
      outline: "none",
      colorScheme: "dark" as const,
      accentColor: accent,
    }),
    [accent, background, border, ink]
  );

  if (Platform.OS === "web") {
    return createElement("input", {
      type: "datetime-local",
      value,
      min,
      onChange: (event: { target: { value: string } }) => onChange(event.target.value),
      style,
    });
  }

  // Native fallback: still bind a datetime-local-shaped string.
  return createElement("input", {
    type: "datetime-local",
    value,
    min,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
    style,
  });
}
