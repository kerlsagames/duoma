import type { SexPosition } from "@/lib/sex-positions";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { View } from "react-native";

/** Male silhouette */
export const POSITION_M_COLOR = "#6E9CFF";
/** Female silhouette */
export const POSITION_F_COLOR = "#FF7FA8";
/** Far-side limbs, for depth */
const M_FAR = "#3F6BD8";
const F_FAR = "#D6437A";

type Pt = readonly [number, number];

type Joints = {
  head: Pt;
  neck: Pt;
  chest: Pt;
  pelvis: Pt;
  shoulderA: Pt;
  elbowA: Pt;
  handA: Pt;
  shoulderB: Pt;
  elbowB: Pt;
  handB: Pt;
  hipA: Pt;
  kneeA: Pt;
  footA: Pt;
  hipB: Pt;
  kneeB: Pt;
  footB: Pt;
};

/**
 * Every pose is authored facing left in a local space where the pelvis sits at
 * the origin and one unit is roughly one pixel of a 110-unit-tall body.
 */
const POSES = {
  standing: {
    pelvis: [0, 0],
    chest: [0, -33],
    neck: [0, -45],
    head: [0, -58],
    shoulderA: [-11, -40],
    elbowA: [-15, -21],
    handA: [-16, -3],
    shoulderB: [11, -40],
    elbowB: [15, -21],
    handB: [16, -3],
    hipA: [-7, 3],
    kneeA: [-8, 27],
    footA: [-8, 51],
    hipB: [7, 3],
    kneeB: [8, 27],
    footB: [8, 51],
  },
  standingHooked: {
    pelvis: [0, 0],
    chest: [0, -33],
    neck: [0, -45],
    head: [0, -58],
    shoulderA: [-11, -40],
    elbowA: [-19, -26],
    handA: [-26, -36],
    shoulderB: [11, -40],
    elbowB: [16, -22],
    handB: [18, -5],
    hipA: [-7, 3],
    kneeA: [-23, 3],
    footA: [-31, -9],
    hipB: [7, 3],
    kneeB: [8, 27],
    footB: [8, 51],
  },
  standingBent: {
    pelvis: [0, 0],
    chest: [-28, -10],
    neck: [-39, -13],
    head: [-50, -14],
    shoulderA: [-31, -15],
    elbowA: [-42, 2],
    handA: [-48, 20],
    shoulderB: [-28, -6],
    elbowB: [-39, 10],
    handB: [-45, 26],
    hipA: [-6, 3],
    kneeA: [-7, 27],
    footA: [-7, 51],
    hipB: [6, 3],
    kneeB: [7, 27],
    footB: [7, 51],
  },
  kneeling: {
    pelvis: [0, 0],
    chest: [0, -32],
    neck: [0, -44],
    head: [0, -57],
    shoulderA: [-10, -39],
    elbowA: [-17, -22],
    handA: [-24, -9],
    shoulderB: [10, -39],
    elbowB: [3, -21],
    handB: [-6, -10],
    hipA: [-6, 3],
    kneeA: [-6, 24],
    footA: [12, 31],
    hipB: [6, 3],
    kneeB: [6, 24],
    footB: [23, 30],
  },
  allFours: {
    pelvis: [0, 0],
    chest: [-32, -6],
    neck: [-43, -8],
    head: [-54, -5],
    shoulderA: [-36, -9],
    elbowA: [-40, 10],
    handA: [-42, 29],
    shoulderB: [-32, -2],
    elbowB: [-36, 12],
    handB: [-38, 29],
    hipA: [-5, 2],
    kneeA: [2, 20],
    footA: [20, 27],
    hipB: [5, 2],
    kneeB: [10, 20],
    footB: [28, 27],
  },
  sitting: {
    pelvis: [0, 0],
    chest: [-3, -32],
    neck: [-4, -44],
    head: [-5, -57],
    shoulderA: [-13, -39],
    elbowA: [-21, -22],
    handA: [-27, -8],
    shoulderB: [7, -39],
    elbowB: [1, -20],
    handB: [-7, -6],
    hipA: [-4, 2],
    kneeA: [-26, 4],
    footA: [-30, 28],
    hipB: [3, 4],
    kneeB: [-20, 10],
    footB: [-24, 30],
  },
  straddle: {
    pelvis: [0, 0],
    chest: [-2, -31],
    neck: [-3, -42],
    head: [-4, -55],
    shoulderA: [-12, -38],
    elbowA: [-22, -26],
    handA: [-33, -30],
    shoulderB: [8, -38],
    elbowB: [-2, -24],
    handB: [-14, -31],
    hipA: [-6, 3],
    kneeA: [-18, 16],
    footA: [-14, 32],
    hipB: [6, 3],
    kneeB: [-6, 20],
    footB: [2, 34],
  },
  straddleWrap: {
    pelvis: [0, 0],
    chest: [-2, -30],
    neck: [-3, -41],
    head: [-4, -54],
    shoulderA: [-12, -37],
    elbowA: [-24, -30],
    handA: [-36, -34],
    shoulderB: [8, -37],
    elbowB: [-4, -28],
    handB: [-16, -35],
    hipA: [-6, 3],
    kneeA: [-20, 12],
    footA: [-34, 2],
    hipB: [6, 5],
    kneeB: [-10, 18],
    footB: [-26, 12],
  },
  crossLegged: {
    pelvis: [0, 0],
    chest: [-2, -30],
    neck: [-3, -41],
    head: [-4, -54],
    shoulderA: [-12, -37],
    elbowA: [-20, -22],
    handA: [-25, -8],
    shoulderB: [8, -37],
    elbowB: [0, -22],
    handB: [-6, -8],
    hipA: [-5, 4],
    kneeA: [-23, 10],
    footA: [-4, 17],
    hipB: [5, 6],
    kneeB: [-16, 17],
    footB: [5, 21],
  },
  lyingBack: {
    pelvis: [0, 0],
    chest: [-29, -4],
    neck: [-40, -6],
    head: [-51, -8],
    shoulderA: [-33, -9],
    elbowA: [-44, 2],
    handA: [-54, 10],
    shoulderB: [-31, 1],
    elbowB: [-42, 12],
    handB: [-52, 18],
    hipA: [3, -3],
    kneeA: [16, -23],
    footA: [27, -3],
    hipB: [3, 4],
    kneeB: [20, -14],
    footB: [31, 7],
  },
  legsUp: {
    pelvis: [0, 0],
    chest: [-29, -2],
    neck: [-40, -4],
    head: [-51, -6],
    shoulderA: [-33, -7],
    elbowA: [-45, 4],
    handA: [-55, 12],
    shoulderB: [-31, 3],
    elbowB: [-43, 14],
    handB: [-53, 20],
    hipA: [3, -4],
    kneeA: [8, -29],
    footA: [12, -51],
    hipB: [4, 2],
    kneeB: [15, -24],
    footB: [21, -46],
  },
  lyingFront: {
    pelvis: [0, 0],
    chest: [-29, 2],
    neck: [-40, 2],
    head: [-51, 0],
    shoulderA: [-33, -2],
    elbowA: [-45, 6],
    handA: [-56, 10],
    shoulderB: [-32, 6],
    elbowB: [-44, 14],
    handB: [-55, 18],
    hipA: [4, -2],
    kneeA: [24, -3],
    footA: [45, 0],
    hipB: [4, 5],
    kneeB: [26, 6],
    footB: [47, 9],
  },
  lyingSide: {
    pelvis: [0, 0],
    chest: [-28, -2],
    neck: [-39, -3],
    head: [-50, -5],
    shoulderA: [-32, -6],
    elbowA: [-42, 4],
    handA: [-52, 10],
    shoulderB: [-31, 2],
    elbowB: [-41, 10],
    handB: [-51, 16],
    hipA: [4, -3],
    kneeA: [25, -13],
    footA: [33, 8],
    hipB: [4, 4],
    kneeB: [27, -2],
    footB: [36, 19],
  },
  sitEdge: {
    pelvis: [0, 0],
    chest: [-2, -30],
    neck: [-3, -42],
    head: [-4, -54],
    shoulderA: [-12, -37],
    elbowA: [-21, -20],
    handA: [-27, -6],
    shoulderB: [8, -37],
    elbowB: [1, -20],
    handB: [-5, -6],
    hipA: [-4, 3],
    kneeA: [-25, 10],
    footA: [-31, 30],
    hipB: [4, 4],
    kneeB: [-14, 16],
    footB: [-18, 34],
  },
  bridge: {
    pelvis: [0, -16],
    chest: [-28, 2],
    neck: [-39, 6],
    head: [-50, 9],
    shoulderA: [-32, 0],
    elbowA: [-42, 10],
    handA: [-52, 18],
    shoulderB: [-30, 6],
    elbowB: [-40, 16],
    handB: [-50, 24],
    hipA: [3, -18],
    kneeA: [22, -15],
    footA: [26, 10],
    hipB: [4, -12],
    kneeB: [24, -6],
    footB: [28, 14],
  },
  lifted: {
    pelvis: [0, 0],
    chest: [-2, -30],
    neck: [-3, -41],
    head: [-4, -53],
    shoulderA: [-12, -37],
    elbowA: [-24, -33],
    handA: [-35, -39],
    shoulderB: [8, -37],
    elbowB: [-4, -33],
    handB: [-16, -41],
    hipA: [-6, 2],
    kneeA: [-22, 4],
    footA: [-30, 4],
    hipB: [6, 4],
    kneeB: [-14, 14],
    footB: [-26, 16],
  },
  kneelHeadDown: {
    pelvis: [0, 0],
    chest: [-22, -16],
    neck: [-32, -20],
    head: [-43, -23],
    shoulderA: [-26, -20],
    elbowA: [-34, -6],
    handA: [-40, 7],
    shoulderB: [-22, -12],
    elbowB: [-30, 2],
    handB: [-36, 15],
    hipA: [-6, 3],
    kneeA: [-4, 24],
    footA: [14, 31],
    hipB: [6, 3],
    kneeB: [8, 24],
    footB: [26, 30],
  },
} satisfies Record<string, Joints>;

type PoseName = keyof typeof POSES;

/** Unit vector for the direction each pose's chest faces, in local space. */
const FRONT: Record<PoseName, Pt> = {
  standing: [-1, 0],
  standingHooked: [-1, 0],
  standingBent: [0, 1],
  kneeling: [-1, 0],
  allFours: [0, 1],
  sitting: [-1, 0],
  straddle: [-1, 0],
  straddleWrap: [-1, 0],
  crossLegged: [-1, 0],
  lyingBack: [0, -1],
  legsUp: [0, -1],
  lyingFront: [0, 1],
  lyingSide: [-1, 0],
  sitEdge: [-1, 0],
  bridge: [0, -1],
  lifted: [-1, 0],
  kneelHeadDown: [-0.5, 0.87],
};

type Build = {
  shoulderW: number;
  waistW: number;
  hipW: number;
  headR: number;
  neckW: number;
  upperArm: readonly [number, number];
  forearm: readonly [number, number];
  thigh: readonly [number, number];
  calf: readonly [number, number];
};

const FEMALE: Build = {
  shoulderW: 11.5,
  waistW: 7.6,
  hipW: 13.2,
  headR: 8.4,
  neckW: 4.4,
  upperArm: [6, 5],
  forearm: [4.9, 3.8],
  thigh: [10.6, 6.9],
  calf: [6.9, 4.3],
};

const MALE: Build = {
  shoulderW: 14.6,
  waistW: 10.8,
  hipW: 11.4,
  headR: 9,
  neckW: 5.6,
  upperArm: [7.1, 6],
  forearm: [5.9, 4.5],
  thigh: [11.2, 7.6],
  calf: [7.6, 5],
};

function tx(p: Pt, x: number, y: number, s: number, flip: boolean): Pt {
  return [x + (flip ? -p[0] : p[0]) * s, y + p[1] * s];
}

/** Tapered segment: a quad between two widths, capped by joint circles. */
function segment(a: Pt, b: Pt, wa: number, wb: number): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return [
    `M ${a[0] + nx * wa} ${a[1] + ny * wa}`,
    `L ${b[0] + nx * wb} ${b[1] + ny * wb}`,
    `L ${b[0] - nx * wb} ${b[1] - ny * wb}`,
    `L ${a[0] - nx * wa} ${a[1] - ny * wa}`,
    "Z",
  ].join(" ");
}

function Limb({
  a,
  b,
  c,
  w,
  fill,
}: {
  a: Pt;
  b: Pt;
  c: Pt;
  w: readonly [number, number, number];
  fill: string;
}) {
  return (
    <G>
      <Path d={segment(a, b, w[0], w[1])} fill={fill} />
      <Path d={segment(b, c, w[1], w[2])} fill={fill} />
      <Circle cx={a[0]} cy={a[1]} r={w[0]} fill={fill} />
      <Circle cx={b[0]} cy={b[1]} r={w[1]} fill={fill} />
      <Circle cx={c[0]} cy={c[1]} r={w[2] * 1.15} fill={fill} />
    </G>
  );
}

function Torso({
  chest,
  pelvis,
  build,
  fill,
  female,
  front,
}: {
  chest: Pt;
  pelvis: Pt;
  build: Build;
  fill: string;
  female: boolean;
  front: Pt;
}) {
  const dx = pelvis[0] - chest[0];
  const dy = pelvis[1] - chest[1];
  const len = Math.hypot(dx, dy) || 1;
  const ax = dx / len;
  const ay = dy / len;
  const px = -ay;
  const py = ax;

  const { shoulderW: sw, waistW: ww, hipW: hw } = build;
  const midX = chest[0] + dx * 0.52;
  const midY = chest[1] + dy * 0.52;

  const t1: Pt = [chest[0] + px * sw, chest[1] + py * sw];
  const t2: Pt = [chest[0] - px * sw, chest[1] - py * sw];
  const w1: Pt = [midX + px * ww, midY + py * ww];
  const w2: Pt = [midX - px * ww, midY - py * ww];
  const h1: Pt = [pelvis[0] + px * hw, pelvis[1] + py * hw];
  const h2: Pt = [pelvis[0] - px * hw, pelvis[1] - py * hw];
  const seatX = pelvis[0] + ax * hw * 0.85;
  const seatY = pelvis[1] + ay * hw * 0.85;
  const yokeX = chest[0] - ax * sw * 0.7;
  const yokeY = chest[1] - ay * sw * 0.7;

  const d = [
    `M ${t1[0]} ${t1[1]}`,
    `Q ${w1[0]} ${w1[1]} ${h1[0]} ${h1[1]}`,
    `Q ${seatX} ${seatY} ${h2[0]} ${h2[1]}`,
    `Q ${w2[0]} ${w2[1]} ${t2[0]} ${t2[1]}`,
    `Q ${yokeX} ${yokeY} ${t1[0]} ${t1[1]}`,
    "Z",
  ].join(" ");

  return (
    <G>
      <Path d={d} fill={fill} />
      <Circle cx={t1[0]} cy={t1[1]} r={sw * 0.34} fill={fill} />
      <Circle cx={t2[0]} cy={t2[1]} r={sw * 0.34} fill={fill} />
      <Circle cx={h1[0]} cy={h1[1]} r={hw * 0.42} fill={fill} />
      <Circle cx={h2[0]} cy={h2[1]} r={hw * 0.42} fill={fill} />
      {female ? (
        <G>
          <Circle
            cx={chest[0] + front[0] * sw * 0.5 + ax * sw * 0.16}
            cy={chest[1] + front[1] * sw * 0.5 + ay * sw * 0.16}
            r={sw * 0.5}
            fill={fill}
          />
          <Circle
            cx={chest[0] + front[0] * sw * 0.42 + ax * sw * 0.66}
            cy={chest[1] + front[1] * sw * 0.42 + ay * sw * 0.66}
            r={sw * 0.44}
            fill={fill}
          />
        </G>
      ) : null}
    </G>
  );
}

function Figure({
  pose,
  x,
  y,
  s = 1,
  flip = false,
  female = false,
}: {
  pose: PoseName;
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  female?: boolean;
}) {
  const raw = POSES[pose];
  const build = female ? FEMALE : MALE;
  const near = female ? POSITION_F_COLOR : POSITION_M_COLOR;
  const far = female ? F_FAR : M_FAR;
  const k = (p: Pt) => tx(p, x, y, s, flip);

  const head = k(raw.head);
  const neck = k(raw.neck);
  const chest = k(raw.chest);
  const pelvis = k(raw.pelvis);
  const scaled: Build = {
    ...build,
    shoulderW: build.shoulderW * s,
    waistW: build.waistW * s,
    hipW: build.hipW * s,
    headR: build.headR * s,
    neckW: build.neckW * s,
  };
  const facing: Pt = [
    flip ? -FRONT[pose][0] : FRONT[pose][0],
    FRONT[pose][1],
  ];
  const arm = (w: readonly [number, number]) =>
    [w[0] * s, ((w[0] + w[1]) / 2) * s, w[1] * s] as const;
  const leg = (a: readonly [number, number], b: readonly [number, number]) =>
    [a[0] * s, b[0] * s, b[1] * s] as const;

  return (
    <G>
      {/* Far side first so the near limbs read as closer */}
      <Limb
        a={k(raw.hipA)}
        b={k(raw.kneeA)}
        c={k(raw.footA)}
        w={leg(build.thigh, build.calf)}
        fill={far}
      />
      <Limb
        a={k(raw.shoulderA)}
        b={k(raw.elbowA)}
        c={k(raw.handA)}
        w={arm([build.upperArm[0], build.forearm[1]])}
        fill={far}
      />

      <Torso
        chest={chest}
        pelvis={pelvis}
        build={scaled}
        fill={near}
        female={female}
        front={facing}
      />

      <Path
        d={segment(neck, head, scaled.neckW, scaled.neckW * 0.9)}
        fill={near}
      />
      {female ? (
        <Ellipse
          cx={head[0] - facing[0] * scaled.headR * 0.5}
          cy={head[1] - facing[1] * scaled.headR * 0.5 + scaled.headR * 0.35}
          rx={scaled.headR}
          ry={scaled.headR * 1.15}
          fill={far}
        />
      ) : null}
      <Ellipse
        cx={head[0]}
        cy={head[1]}
        rx={scaled.headR * 0.92}
        ry={scaled.headR}
        fill={near}
      />

      <Limb
        a={k(raw.hipB)}
        b={k(raw.kneeB)}
        c={k(raw.footB)}
        w={leg(build.thigh, build.calf)}
        fill={near}
      />
      <Limb
        a={k(raw.shoulderB)}
        b={k(raw.elbowB)}
        c={k(raw.handB)}
        w={arm([build.upperArm[0], build.forearm[1]])}
        fill={near}
      />
    </G>
  );
}

function Prop({ d, width = 10 }: { d: string; width?: number }) {
  return (
    <Path
      d={d}
      stroke="rgba(255,255,255,0.13)"
      strokeWidth={width}
      strokeLinecap="round"
      fill="none"
    />
  );
}

/** Stylized couple silhouettes — blue = M, pink = F. */
export function PositionArt({
  position,
  size = 280,
}: {
  position: SexPosition;
  size?: number;
}) {
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
            <Stop offset="0%" stopColor="#FF4D8A" stopOpacity="0.2" />
            <Stop offset="55%" stopColor="#5B8CFF" stopOpacity="0.09" />
            <Stop offset="100%" stopColor="#0A0610" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="140" cy="150" rx="112" ry="92" fill="url(#glow)" />
        <Ellipse cx="140" cy="228" rx="86" ry="12" fill="rgba(0,0,0,0.35)" />
        {renderPose(position.art)}
        <Circle cx="22" cy="256" r="7" fill={POSITION_M_COLOR} />
        <SvgText
          x="34"
          y="260"
          fill={POSITION_M_COLOR}
          fontSize="11"
          fontWeight="700"
          letterSpacing="1"
        >
          M
        </SvgText>
        <Circle cx="58" cy="256" r="7" fill={POSITION_F_COLOR} />
        <SvgText
          x="70"
          y="260"
          fill={POSITION_F_COLOR}
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

/**
 * Poses face left by default and right when flipped, so partners facing each
 * other need the left figure flipped and the right one not. Rear-entry and
 * kneeling-over poses face the same way as the partner in front of them.
 */
function renderPose(art: string) {
  switch (art) {
    // She on her back, he propped between her legs, chests close.
    case "missionary":
      return (
        <G>
          <Prop d="M26 198 H254" width={13} />
          <Figure pose="lyingBack" x={150} y={190} s={1.3} female />
          <Figure pose="allFours" x={158} y={150} s={1.3} />
        </G>
      );
    // He sits cross-legged, she straddles his lap with legs wrapped around him.
    case "lotus":
      return (
        <G>
          <Figure pose="crossLegged" x={155} y={196} s={1.35} />
          <Figure pose="straddleWrap" x={146} y={176} s={1.25} flip female />
        </G>
      );
    // He on his back, she straddles facing him — so she faces his head.
    case "cowgirl":
      return (
        <G>
          <Prop d="M26 212 H254" width={13} />
          <Figure pose="lyingBack" x={152} y={200} s={1.3} />
          <Figure pose="straddle" x={150} y={172} s={1.2} female />
        </G>
      );
    // Her knees drawn toward her chest, he stays face to face.
    case "folded":
      return (
        <G>
          <Prop d="M26 214 H254" width={13} />
          <Figure pose="legsUp" x={150} y={192} s={1.3} female />
          <Figure pose="kneeling" x={188} y={182} s={1.3} />
        </G>
      );
    // Both upright, her in his lap facing him.
    case "embrace":
      return (
        <G>
          <Figure pose="sitting" x={162} y={186} s={1.3} />
          <Figure pose="straddle" x={146} y={180} s={1.2} flip female />
        </G>
      );
    // Her ankles up at his shoulders, still face to face.
    case "legsup":
      return (
        <G>
          <Prop d="M26 214 H254" width={13} />
          <Figure pose="legsUp" x={148} y={192} s={1.3} female />
          <Figure pose="kneeling" x={190} y={182} s={1.3} />
        </G>
      );
    // She on hands and knees, he kneels behind with hands at her hips.
    case "doggy":
      return (
        <G>
          <Prop d="M26 212 H254" width={13} />
          <Figure pose="allFours" x={140} y={172} s={1.3} female />
          <Figure pose="kneeling" x={188} y={168} s={1.35} />
        </G>
      );
    // Both on your sides, him behind her.
    case "spoon":
      return (
        <G>
          <Prop d="M22 200 H258" width={13} />
          <Figure pose="lyingSide" x={140} y={182} s={1.25} female />
          <Figure pose="lyingSide" x={152} y={168} s={1.3} />
        </G>
      );
    // She flat on her stomach, he on top from behind.
    case "prone":
      return (
        <G>
          <Prop d="M22 204 H258" width={13} />
          <Figure pose="lyingFront" x={135} y={190} s={1.25} female />
          <Figure pose="lyingFront" x={145} y={172} s={1.3} />
        </G>
      );
    // She kneels down onto her forearms, he kneels behind.
    case "kneel":
      return (
        <G>
          <Prop d="M26 214 H254" width={13} />
          <Figure pose="kneelHeadDown" x={145} y={175} s={1.3} female />
          <Figure pose="kneeling" x={192} y={170} s={1.35} />
        </G>
      );
    // She bent over the edge of the bed, he stands behind.
    case "edgerear":
      return (
        <G>
          <Prop d="M20 142 H150" width={14} />
          <Figure pose="standingBent" x={135} y={150} s={1.25} female />
          <Figure pose="standing" x={178} y={150} s={1.3} />
        </G>
      );
    // She bent forward holding a wall, he stands behind.
    case "standdog":
      return (
        <G>
          <Prop d="M24 216 H256" width={11} />
          <Figure pose="standingBent" x={128} y={148} s={1.3} female />
          <Figure pose="standing" x={176} y={148} s={1.32} />
        </G>
      );
    // He sits, she straddles facing him.
    case "chair":
    case "straddle":
      return (
        <G>
          <Prop d="M118 226 V190 H184 V146" width={10} />
          <Figure pose="sitting" x={158} y={180} s={1.25} />
          <Figure pose="straddle" x={142} y={176} s={1.15} flip female />
        </G>
      );
    // She sits on him facing away, so both face the same way.
    case "throne":
      return (
        <G>
          <Prop d="M118 226 V190 H184 V146" width={10} />
          <Figure pose="sitting" x={158} y={182} s={1.25} />
          <Figure pose="straddle" x={140} y={176} s={1.15} female />
        </G>
      );
    // She kneels facing the backrest, he behind.
    case "couch":
      return (
        <G>
          <Prop d="M34 202 H246" width={17} />
          <Figure pose="kneelHeadDown" x={132} y={164} s={1.2} female />
          <Figure pose="kneeling" x={180} y={158} s={1.3} />
        </G>
      );
    // She sits up on the counter, he stands between her legs.
    case "counter":
      return (
        <G>
          <Prop d="M100 160 H256" width={14} />
          <Figure pose="sitEdge" x={178} y={150} s={1.25} female />
          <Figure pose="standing" x={128} y={158} s={1.3} flip />
        </G>
      );
    // She backed to the wall, he presses in close.
    case "wall":
      return (
        <G>
          <Prop d="M56 40 V228" width={12} />
          <Prop d="M24 222 H256" width={11} />
          <Figure pose="standingHooked" x={96} y={150} s={1.35} flip female />
          <Figure pose="standing" x={138} y={150} s={1.4} />
        </G>
      );
    // He lifts her, legs wrapped around his waist.
    case "lift":
      return (
        <G>
          <Prop d="M56 40 V228" width={12} />
          <Figure pose="standing" x={152} y={155} s={1.35} />
          <Figure pose="lifted" x={130} y={140} s={1.2} flip female />
        </G>
      );
    // She folds forward onto a table, he stands behind.
    case "bentstand":
      return (
        <G>
          <Prop d="M20 138 H146" width={14} />
          <Figure pose="standingBent" x={130} y={146} s={1.3} female />
          <Figure pose="standing" x={178} y={146} s={1.32} />
        </G>
      );
    // Face to face under the water, bodies close.
    case "shower":
      return (
        <G>
          <Prop d="M56 40 V228" width={12} />
          <Circle cx="212" cy="54" r="10" fill="rgba(140,205,255,0.3)" />
          <Path
            d="M212 66 V104 M200 70 V100 M224 70 V100"
            stroke="rgba(140,205,255,0.25)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Figure pose="standingHooked" x={110} y={154} s={1.3} flip female />
          <Figure pose="standing" x={150} y={152} s={1.35} />
        </G>
      );
    // She kneels in front of him while he stands.
    case "oral-kneel":
      return (
        <G>
          <Prop d="M24 212 H256" width={11} />
          <Figure pose="standing" x={158} y={140} s={1.35} />
          <Figure pose="kneelHeadDown" x={108} y={172} s={1.2} flip female />
        </G>
      );
    // She kneels up over his face.
    case "facesit":
      return (
        <G>
          <Prop d="M22 210 H258" width={13} />
          <Figure pose="lyingBack" x={172} y={196} s={1.3} />
          <Figure pose="straddle" x={100} y={158} s={1.2} flip female />
        </G>
      );
    // Head to toe on your sides.
    case "sixtynine":
      return (
        <G>
          <Prop d="M18 196 H262" width={13} />
          <Figure pose="lyingSide" x={178} y={158} s={1.25} />
          <Figure pose="lyingSide" x={104} y={176} s={1.2} flip female />
        </G>
      );
    // She sits on the edge, he kneels between her thighs.
    case "edgeoral":
      return (
        <G>
          <Prop d="M100 154 H256" width={14} />
          <Figure pose="sitEdge" x={176} y={144} s={1.25} female />
          <Figure pose="kneelHeadDown" x={122} y={178} s={1.2} flip />
        </G>
      );
    // On your sides, legs interleaved in the middle.
    case "scissors":
      return (
        <G>
          <Prop d="M18 196 H262" width={13} />
          <Figure pose="lyingSide" x={108} y={172} s={1.25} female />
          <Figure pose="lyingSide" x={186} y={166} s={1.25} flip />
        </G>
      );
    // She on her back, he up on his knees with her legs across him.
    case "cross":
      return (
        <G>
          <Prop d="M26 212 H254" width={13} />
          <Figure pose="lyingBack" x={140} y={190} s={1.3} female />
          <Figure pose="kneeling" x={196} y={176} s={1.3} />
        </G>
      );
    // She arches her hips up, he kneels between.
    case "bridge":
      return (
        <G>
          <Prop d="M26 212 H254" width={13} />
          <Figure pose="bridge" x={140} y={186} s={1.3} female />
          <Figure pose="kneeling" x={192} y={178} s={1.3} />
        </G>
      );
    // She perched on the edge with legs open, he standing.
    case "table":
    case "butterfly":
      return (
        <G>
          <Prop d="M104 160 H258" width={14} />
          <Figure pose="sitEdge" x={180} y={150} s={1.25} female />
          <Figure pose="standing" x={132} y={152} s={1.3} flip />
        </G>
      );
    // Hips elevated, knees toward her shoulders, he kneeling over.
    case "foldedpress":
      return (
        <G>
          <Prop d="M26 212 H254" width={13} />
          <Figure pose="legsUp" x={144} y={188} s={1.3} female />
          <Figure pose="kneeling" x={182} y={176} s={1.3} />
        </G>
      );
    default:
      return (
        <G>
          <Figure pose="standing" x={110} y={152} s={1.3} flip female />
          <Figure pose="standing" x={166} y={150} s={1.35} />
        </G>
      );
  }
}
