import type { SexPosition } from "@/lib/sex-positions";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { View } from "react-native";

/** Male silhouette */
export const POSITION_M_COLOR = "#5B8CFF";
/** Female silhouette */
export const POSITION_F_COLOR = "#FF6B9A";
const M = POSITION_M_COLOR;
const F = POSITION_F_COLOR;
const M_DEEP = "#3A6AE8";
const F_DEEP = "#E8457A";

/** Stylized couple silhouettes — blue = M, pink = F. */
export function PositionArt({
  position,
  size = 280,
}: {
  position: SexPosition;
  size?: number;
}) {
  const art = position.art;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignSelf: "center",
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "#140A12",
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 280 280">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="45%" r="55%">
            <Stop offset="0%" stopColor="#FF4D8A" stopOpacity="0.22" />
            <Stop offset="55%" stopColor="#5B8CFF" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#0A0610" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="mGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={M} />
            <Stop offset="100%" stopColor={M_DEEP} />
          </LinearGradient>
          <LinearGradient id="fGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={F} />
            <Stop offset="100%" stopColor={F_DEEP} />
          </LinearGradient>
        </Defs>
        <Ellipse cx="140" cy="150" rx="110" ry="90" fill="url(#glow)" />
        {renderPose(art)}
        {/* Gender key: blue M · pink F */}
        <Circle cx="22" cy="256" r="7" fill={M} />
        <SvgText
          x="34"
          y="260"
          fill={M}
          fontSize="11"
          fontWeight="700"
          letterSpacing="1"
        >
          M
        </SvgText>
        <Circle cx="58" cy="256" r="7" fill={F} />
        <SvgText
          x="70"
          y="260"
          fill={F}
          fontSize="11"
          fontWeight="700"
          letterSpacing="1"
        >
          F
        </SvgText>
      </Svg>
    </View>
  );
}

function Person({
  cx,
  cy,
  scale = 1,
  female,
  lean = 0,
}: {
  cx: number;
  cy: number;
  scale?: number;
  female?: boolean;
  lean?: number;
}) {
  const fill = female ? "url(#fGrad)" : "url(#mGrad)";
  const bodyW = female ? 28 : 32;
  const bodyH = female ? 52 : 58;
  return (
    <G
      transform={`translate(${cx}, ${cy}) scale(${scale}) rotate(${lean})`}
    >
      <Circle cx="0" cy={-bodyH / 2 - 14} r={female ? 13 : 14} fill={fill} />
      <Path
        d={`M ${-bodyW / 2} ${-bodyH / 2}
            Q 0 ${-bodyH / 2 - 4} ${bodyW / 2} ${-bodyH / 2}
            L ${bodyW / 2 - 2} ${bodyH / 2}
            Q 0 ${bodyH / 2 + 6} ${-bodyW / 2 + 2} ${bodyH / 2}
            Z`}
        fill={fill}
      />
      {/* Arms suggestion */}
      <Path
        d={`M ${-bodyW / 2 + 2} ${-bodyH / 4} Q ${-bodyW} 8 ${-bodyW - 4} 28`}
        stroke={fill}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={`M ${bodyW / 2 - 2} ${-bodyH / 4} Q ${bodyW} 8 ${bodyW + 4} 28`}
        stroke={fill}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Legs */}
      <Path
        d={`M ${-8} ${bodyH / 2 - 4} Q ${-18} ${bodyH / 2 + 30} ${-14} ${bodyH / 2 + 52}`}
        stroke={fill}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={`M ${8} ${bodyH / 2 - 4} Q ${18} ${bodyH / 2 + 30} ${14} ${bodyH / 2 + 52}`}
        stroke={fill}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}

function renderPose(art: string) {
  switch (art) {
    case "missionary":
      return (
        <G>
          <Person cx={140} cy={168} female lean={-78} scale={1.05} />
          <Person cx={148} cy={118} lean={8} scale={1.05} />
        </G>
      );
    case "lotus":
      return (
        <G>
          <Person cx={140} cy={168} scale={1} />
          <Person cx={140} cy={118} female scale={0.95} />
        </G>
      );
    case "cowgirl":
      return (
        <G>
          <Person cx={140} cy={175} lean={-85} scale={1} />
          <Person cx={140} cy={115} female scale={1} />
        </G>
      );
    case "folded":
      return (
        <G>
          <Person cx={145} cy={175} female lean={-70} scale={1} />
          <Person cx={155} cy={105} lean={25} scale={1} />
        </G>
      );
    case "embrace":
      return (
        <G>
          <Person cx={132} cy={155} scale={1} />
          <Person cx={152} cy={140} female scale={0.95} lean={-8} />
        </G>
      );
    case "legsup":
      return (
        <G>
          <Person cx={130} cy={175} female lean={-80} scale={1} />
          <Person cx={160} cy={120} lean={20} scale={1} />
        </G>
      );
    case "doggy":
      return (
        <G>
          <Person cx={110} cy={150} female lean={-55} scale={1} />
          <Person cx={175} cy={135} lean={-15} scale={1.05} />
        </G>
      );
    case "spoon":
      return (
        <G>
          <Person cx={125} cy={155} female lean={-90} scale={0.95} />
          <Person cx={155} cy={145} lean={-90} scale={1} />
        </G>
      );
    case "prone":
      return (
        <G>
          <Person cx={140} cy={175} female lean={-90} scale={1} />
          <Person cx={145} cy={125} lean={-90} scale={1} />
        </G>
      );
    case "kneel":
      return (
        <G>
          <Person cx={115} cy={160} female lean={-40} scale={1} />
          <Person cx={175} cy={145} lean={-10} scale={1} />
        </G>
      );
    case "edgerear":
      return (
        <G>
          <Path
            d="M40 190 H240"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <Person cx={120} cy={145} female lean={-50} scale={1} />
          <Person cx={180} cy={135} lean={-5} scale={1} />
        </G>
      );
    case "standdog":
      return (
        <G>
          <Person cx={115} cy={140} female lean={-35} scale={1.05} />
          <Person cx={175} cy={130} lean={5} scale={1.05} />
        </G>
      );
    case "chair":
    case "straddle":
      return (
        <G>
          <Path
            d="M95 200 V150 H185 V200"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="8"
            fill="none"
            strokeLinejoin="round"
          />
          <Person cx={140} cy={155} scale={0.95} />
          <Person cx={140} cy={108} female scale={0.9} />
        </G>
      );
    case "throne":
      return (
        <G>
          <Person cx={140} cy={160} scale={0.95} />
          <Person cx={140} cy={112} female lean={180} scale={0.88} />
        </G>
      );
    case "couch":
      return (
        <G>
          <Path
            d="M50 175 H230"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <Person cx={125} cy={130} female lean={-30} scale={1} />
          <Person cx={175} cy={125} lean={-5} scale={1} />
        </G>
      );
    case "counter":
      return (
        <G>
          <Path
            d="M40 155 H240"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <Person cx={145} cy={115} female lean={-5} scale={0.95} />
          <Person cx={145} cy={175} lean={0} scale={1} />
        </G>
      );
    case "wall":
      return (
        <G>
          <Path
            d="M60 40 V240"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <Person cx={110} cy={145} female lean={5} scale={1.05} />
          <Person cx={155} cy={145} lean={-5} scale={1.05} />
        </G>
      );
    case "lift":
      return (
        <G>
          <Person cx={135} cy={165} scale={1.05} />
          <Person cx={145} cy={105} female scale={0.9} lean={10} />
        </G>
      );
    case "bentstand":
      return (
        <G>
          <Person cx={115} cy={140} female lean={-45} scale={1} />
          <Person cx={175} cy={135} lean={0} scale={1} />
        </G>
      );
    case "shower":
      return (
        <G>
          <Path
            d="M200 50 V90"
            stroke="rgba(120,200,255,0.35)"
            strokeWidth="3"
          />
          <Circle cx="200" cy="48" r="8" fill="rgba(120,200,255,0.3)" />
          <Person cx={130} cy={150} female lean={8} scale={1} />
          <Person cx={165} cy={148} lean={-8} scale={1} />
        </G>
      );
    case "oral-kneel":
      return (
        <G>
          <Person cx={150} cy={115} scale={1} />
          <Person cx={150} cy={185} female lean={0} scale={0.9} />
        </G>
      );
    case "facesit":
      return (
        <G>
          <Person cx={140} cy={185} lean={-90} scale={1} />
          <Person cx={140} cy={115} female scale={0.95} />
        </G>
      );
    case "sixtynine":
      return (
        <G>
          <Person cx={115} cy={140} lean={-90} scale={0.95} />
          <Person cx={170} cy={145} female lean={90} scale={0.95} />
        </G>
      );
    case "edgeoral":
      return (
        <G>
          <Path
            d="M40 150 H200"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <Person cx={145} cy={110} female lean={5} scale={0.95} />
          <Person cx={145} cy={195} scale={0.9} />
        </G>
      );
    case "scissors":
      return (
        <G>
          <Person cx={110} cy={150} female lean={-90} scale={0.95} />
          <Person cx={175} cy={150} lean={90} scale={0.95} />
        </G>
      );
    case "cross":
      return (
        <G>
          <Person cx={120} cy={165} female lean={-85} scale={1} />
          <Person cx={175} cy={140} lean={-10} scale={1} />
        </G>
      );
    case "bridge":
      return (
        <G>
          <Person cx={140} cy={170} female lean={-100} scale={1} />
          <Person cx={145} cy={115} lean={10} scale={1} />
        </G>
      );
    case "table":
    case "butterfly":
      return (
        <G>
          <Path
            d="M40 155 H220"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <Person cx={140} cy={115} female lean={-10} scale={0.95} />
          <Person cx={155} cy={175} lean={5} scale={1} />
        </G>
      );
    case "foldedpress":
      return (
        <G>
          <Person cx={140} cy={175} female lean={-60} scale={1} />
          <Person cx={145} cy={100} lean={15} scale={1} />
        </G>
      );
    default:
      return (
        <G>
          <Person cx={120} cy={150} female />
          <Person cx={170} cy={145} />
        </G>
      );
  }
}
