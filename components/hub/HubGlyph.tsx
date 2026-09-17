import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import Svg, { Path } from "react-native-svg";
import type { HubMark } from "@/lib/hubs";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Bite-lip mark, same weight and colour as the Ionicons around it. */
function LipsMark({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <Path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.6c1.7-2.2 4.3-3.1 6.7-2.2 2.7 1 3.8 4.2 2.2 7.1C19.3 14.2 12 18.5 12 18.5S4.7 14.2 3.1 10.5C1.5 7.6 2.6 4.4 5.3 3.4c2.4-.9 5 0 6.7 2.2Zm0 2.3c-1.2-1.6-3-2.3-4.6-1.7-1.7.6-2.3 2.5-1.3 4.3C7.3 12.7 12 15.6 12 15.6s4.7-2.9 5.9-5.1c1-1.8.4-3.7-1.3-4.3-1.6-.6-3.4.1-4.6 1.7Z"
      />
    </Svg>
  );
}

export function HubGlyph({
  icon,
  mark,
  size,
  color,
}: {
  icon: IconName;
  mark?: HubMark;
  size: number;
  color: string;
}) {
  if (mark === "lips") return <LipsMark size={size} color={color} />;
  return <Ionicons name={icon} size={size} color={color} />;
}
