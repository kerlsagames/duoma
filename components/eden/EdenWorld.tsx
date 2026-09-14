import { EdenFallback, canUseWebGL } from "@/components/eden/EdenFallback";
import type { EdenPhase, EdenSnapshot } from "@/lib/eden";
import { ContactShadows, Float, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";
import * as THREE from "three";

class WebGlGate extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.setState({ failed: true });
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const SKY: Record<EdenPhase, string> = {
  dawn: "#F0B8A0",
  day: "#87B8E8",
  golden: "#F0A060",
  night: "#0B1024",
};

const FOG_FAR: Record<EdenPhase, number> = {
  dawn: 36,
  day: 48,
  golden: 34,
  night: 28,
};

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Island({ dormancy }: { dormancy: boolean }) {
  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(7.2, 80);
    const pos = geo.attributes.position!;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.hypot(x, y);
      const n =
        hash(x * 0.7 + y * 0.4) * 0.38 +
        hash(x * 1.6 + y * 1.1) * 0.16 +
        (1 - r / 7.2) * 0.55;
      pos.setZ(i, n);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow>
      <meshStandardMaterial
        color={dormancy ? "#4A5A48" : "#3E8A52"}
        roughness={0.86}
        metalness={0.04}
      />
    </mesh>
  );
}

function WaterRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = -0.22 + Math.sin(clock.elapsedTime * 0.6) * 0.03;
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, -0.2, 0]}>
      <ringGeometry args={[7.3, 10.4, 80]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.18}
        metalness={0.22}
        transparent
        opacity={0.88}
        emissive={color}
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}

function Tree({
  position,
  scale = 1,
  leaf = "#2F8A4A",
  trunk = "#5A3A24",
}: {
  position: [number, number, number];
  scale?: number;
  leaf?: string;
  trunk?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.9, 7]} />
        <meshStandardMaterial color={trunk} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.55} />
      </mesh>
      <mesh position={[0.18, 1.42, -0.1]} castShadow>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Hearth({
  onPress,
  glow,
}: {
  onPress: () => void;
  glow: number;
}) {
  const flame = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!flame.current) return;
    const t = clock.elapsedTime;
    flame.current.scale.setScalar(0.85 + Math.sin(t * 7) * 0.12);
    flame.current.position.y = 0.42 + Math.sin(t * 5) * 0.04;
  });
  return (
    <group
      position={[0, 0.12, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onPress();
      }}
      onPointerOver={() => {
        if (typeof document !== "undefined") document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (typeof document !== "undefined") document.body.style.cursor = "auto";
      }}
    >
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh
            key={deg}
            position={[Math.cos(rad) * 0.62, 0.12, Math.sin(rad) * 0.62]}
            castShadow
          >
            <dodecahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color="#8A7460" roughness={0.95} />
          </mesh>
        );
      })}
      <mesh ref={flame} position={[0, 0.4, 0]}>
        <coneGeometry args={[0.18, 0.48, 7]} />
        <meshStandardMaterial
          color="#FFB040"
          emissive="#FF6A1A"
          emissiveIntensity={glow}
        />
      </mesh>
      <pointLight color="#FF8A3A" intensity={glow * 4.2} distance={8} position={[0, 0.7, 0]} />
    </group>
  );
}

function Fountain({ pebbles, color }: { pebbles: number; color: string }) {
  return (
    <group position={[2.1, 0.08, 1.4]}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.62, 0.18, 16]} />
        <meshStandardMaterial color="#8E8A86" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 16]} />
        <meshPhysicalMaterial color={color} roughness={0.15} transparent opacity={0.8} />
      </mesh>
      {Array.from({ length: pebbles }).map((_, i) => {
        const a = (i / Math.max(1, pebbles)) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.22, 0.16, Math.sin(a) * 0.22]}
          >
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
              color="#C8F4FF"
              emissive="#7BE7FF"
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Blossom({
  position,
  hue,
}: {
  position: [number, number, number];
  hue: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 0.7 + Math.sin(clock.elapsedTime * 2.2 + position[0]) * 0.3;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
  });
  return (
    <Float speed={1.4} floatIntensity={0.25} rotationIntensity={0.2}>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial color={hue} emissive={hue} emissiveIntensity={0.8} />
      </mesh>
    </Float>
  );
}

function Arch({ blooms }: { blooms: number }) {
  return (
    <group position={[-2.6, 0, -1.8]} rotation={[0, 0.4, 0]}>
      <mesh position={[-0.7, 0.7, 0]} castShadow>
        <boxGeometry args={[0.16, 1.4, 0.16]} />
        <meshStandardMaterial color="#8B8074" />
      </mesh>
      <mesh position={[0.7, 0.7, 0]} castShadow>
        <boxGeometry args={[0.16, 1.4, 0.16]} />
        <meshStandardMaterial color="#8B8074" />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[1.7, 0.16, 0.16]} />
        <meshStandardMaterial color="#8B8074" />
      </mesh>
      {Array.from({ length: blooms }).map((_, i) => (
        <mesh
          key={i}
          position={[-0.7 + (i % 4) * 0.45, 1.15 + (i % 3) * 0.12, 0.12]}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#C9A0DC" emissive="#B07AD4" emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Gazebo() {
  return (
    <group position={[3.4, 0.08, -2.2]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.85, 0.9, 0.1, 8]} />
        <meshStandardMaterial color="#C4A484" />
      </mesh>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh
            key={deg}
            position={[Math.cos(rad) * 0.72, 0.55, Math.sin(rad) * 0.72]}
            castShadow
          >
            <cylinderGeometry args={[0.04, 0.05, 0.9, 6]} />
            <meshStandardMaterial color="#E8D8B8" />
          </mesh>
        );
      })}
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[1.05, 0.45, 8]} />
        <meshStandardMaterial color="#B88858" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Pavilion() {
  return (
    <group position={[-3.6, 0.1, 2.6]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.3, 0.7, 1.1]} />
        <meshStandardMaterial color="#5A1630" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.95, 0.4, 4]} />
        <meshStandardMaterial color="#8B1E3A" emissive="#FF4D6A" emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

function MemoryFrame({
  url,
  position,
  tilt,
}: {
  url: string;
  position: [number, number, number];
  tilt: number;
}) {
  const texture = useMemo(() => {
    if (!url.startsWith("data:image") && !url.startsWith("http")) return null;
    const tex = new THREE.TextureLoader().load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [url]);
  return (
    <Float speed={0.8} floatIntensity={0.2} rotationIntensity={0.15}>
      <group position={position} rotation={[0, tilt, 0.08]}>
        <mesh>
          <boxGeometry args={[0.72, 0.9, 0.05]} />
          <meshStandardMaterial color="#E8D8C0" />
        </mesh>
        <mesh position={[0, 0.02, 0.032]}>
          <planeGeometry args={[0.58, 0.72]} />
          {texture ? (
            <meshBasicMaterial map={texture} />
          ) : (
            <meshStandardMaterial
              color="#8EC8FF"
              emissive="#5AA0E8"
              emissiveIntensity={0.55}
            />
          )}
        </mesh>
      </group>
    </Float>
  );
}

function Fireflies({ count, color }: { count: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: hash(i + 1) * Math.PI * 2,
        r: 1.2 + hash(i + 9) * 5.4,
        y: 0.4 + hash(i + 17) * 1.8,
        s: 0.6 + hash(i + 3) * 1.4,
      })),
    [count]
  );
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    seeds.forEach((seed, i) => {
      const t = clock.elapsedTime * seed.s;
      dummy.position.set(
        Math.cos(seed.a + t * 0.25) * seed.r,
        seed.y + Math.sin(t) * 0.18,
        Math.sin(seed.a + t * 0.25) * seed.r
      );
      dummy.scale.setScalar(0.045);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} />
    </instancedMesh>
  );
}

function Rainbow({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh position={[0, 2.8, -4.5]} rotation={[0.1, 0, 0]}>
      <torusGeometry args={[3.4, 0.05, 8, 40, Math.PI]} />
      <meshStandardMaterial color="#F2A0C8" emissive="#C080FF" emissiveIntensity={0.55} />
    </mesh>
  );
}

function Lagoon({ visible, sleep }: { visible: boolean; sleep: boolean }) {
  if (!visible) return null;
  return (
    <group position={[3.1, 0.02, 3.15]}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.35, 28]} />
        <meshPhysicalMaterial
          color={sleep ? "#2A4050" : "#3ECFBF"}
          roughness={0.12}
          transparent
          opacity={0.82}
          emissive={sleep ? "#1A3038" : "#2BB4A8"}
          emissiveIntensity={0.25}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i * 1.4) * 0.55, 0.04, Math.sin(i * 1.4) * 0.55]}
          rotation-x={-Math.PI / 2}
        >
          <circleGeometry args={[0.16, 8]} />
          <meshStandardMaterial color={sleep ? "#4A6058" : "#7CB86A"} />
        </mesh>
      ))}
    </group>
  );
}

function Runes({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const t = i / Math.max(1, count - 1);
        return (
          <mesh
            key={i}
            position={[-2.2 + t * 1.8, 0.08, 0.4 + Math.sin(i) * 0.25]}
            rotation-x={-Math.PI / 2}
          >
            <ringGeometry args={[0.08, 0.13, 6]} />
            <meshStandardMaterial
              color="#FF8A4A"
              emissive="#FF4D6A"
              emissiveIntensity={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ShootingStars({ count, night }: { count: number; night: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.15 + i * 0.18) % 1;
      child.position.set(-6 + t * 14, 4.2 + Math.sin(i) * 0.8, -5 + i * 0.4);
    });
  });
  if (!night || count <= 0) return null;
  return (
    <group ref={ref}>
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.55, 0.02, 0.02]} />
          <meshStandardMaterial color="#FFF6D8" emissive="#FFF6D8" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  snapshot,
  onHearth,
}: {
  snapshot: EdenSnapshot;
  onHearth: () => void;
}) {
  const sky = snapshot.dormancy ? "#2A3040" : SKY[snapshot.phase];
  const water =
    snapshot.biomes.crimson && !snapshot.dormancy ? "#6A2040" : "#1C4A68";
  const glow = snapshot.dormancy ? 0.25 : snapshot.phase === "night" ? 1.6 : 1.05;
  const trees = snapshot.biomes.meadow ? 7 : 3;
  const redTrees = snapshot.biomes.crimson ? 4 : 0;

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, snapshot.dormancy ? 8 : 14, FOG_FAR[snapshot.phase]]} />
      <hemisphereLight
        args={[
          snapshot.dormancy ? "#6A82A0" : "#FFD1FF",
          snapshot.dormancy ? "#1A2030" : "#1D2671",
          snapshot.dormancy ? 0.28 : 0.75,
        ]}
      />
      <ambientLight intensity={snapshot.dormancy ? 0.22 : 0.45} color="#6A82FB" />
      <directionalLight
        position={[6, 10, 4]}
        intensity={snapshot.dormancy ? 0.35 : snapshot.phase === "night" ? 0.25 : 1.55}
        color={snapshot.phase === "golden" ? "#FFD1A0" : "#FFF3D1"}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {snapshot.phase === "night" || snapshot.dormancy ? (
        <Stars radius={40} depth={20} count={snapshot.dormancy ? 400 : 900} fade />
      ) : null}
      <Island dormancy={snapshot.dormancy} />
      <WaterRing color={water} />
      <Hearth onPress={onHearth} glow={glow} />
      <Fountain
        pebbles={snapshot.visuals.pebbles}
        color={snapshot.dormancy ? "#2A5068" : "#3ECFBF"}
      />
      {Array.from({ length: trees }).map((_, i) => {
        const a = (i / trees) * Math.PI * 2 + 0.4;
        return (
          <Tree
            key={`t-${i}`}
            position={[Math.cos(a) * 4.4, 0.05, Math.sin(a) * 4.4]}
            scale={0.75 + hash(i + 2) * 0.45}
            leaf={snapshot.dormancy ? "#355044" : "#2F8A4A"}
          />
        );
      })}
      {Array.from({ length: redTrees }).map((_, i) => {
        const a = (i / Math.max(1, redTrees)) * Math.PI * 1.2 + 2.4;
        return (
          <Tree
            key={`r-${i}`}
            position={[Math.cos(a) * 3.6, 0.05, Math.sin(a) * 3.6]}
            scale={0.85}
            leaf={snapshot.dormancy ? "#5A3038" : "#C23B4A"}
            trunk="#3A2018"
          />
        );
      })}
      {snapshot.biomes.meadow ? <Arch blooms={snapshot.visuals.vineBlooms} /> : null}
      {snapshot.visuals.gazebo ? <Gazebo /> : null}
      {snapshot.visuals.pavilion ? <Pavilion /> : null}
      {snapshot.visuals.echoBlossoms
        ? Array.from({ length: snapshot.visuals.echoBlossoms }).map((_, i) => {
            const a = (i / snapshot.visuals.echoBlossoms) * Math.PI * 2;
            return (
              <Blossom
                key={`b-${i}`}
                position={[Math.cos(a) * 2.4, 0.28, Math.sin(a) * 2.4]}
                hue={snapshot.dormancy ? "#6A7A88" : "#8EC8FF"}
              />
            );
          })
        : null}
      {snapshot.visuals.emberLilies
        ? Array.from({ length: snapshot.visuals.emberLilies }).map((_, i) => (
            <Blossom
              key={`e-${i}`}
              position={[
                -1.6 + (i % 4) * 0.35,
                0.26,
                2.1 + Math.floor(i / 4) * 0.35,
              ]}
              hue={snapshot.dormancy ? "#6A4030" : "#FF6B3A"}
            />
          ))
        : null}
      {snapshot.visuals.frames.length
        ? snapshot.visuals.frames.map((url, i) => (
            <MemoryFrame
              key={`${i}-${url.slice(0, 18)}`}
              url={url}
              position={[3.2, 1.1 + i * 0.08, 0.8 - i * 0.55]}
              tilt={-0.5 + i * 0.18}
            />
          ))
        : snapshot.biomes.canopy
          ? Array.from({ length: 3 }).map((_, i) => (
              <MemoryFrame
                key={`crystal-${i}`}
                url=""
                position={[3.2, 1.1 + i * 0.08, 0.8 - i * 0.55]}
                tilt={-0.5 + i * 0.18}
              />
            ))
          : null}
      <Lagoon visible={snapshot.biomes.lagoon} sleep={snapshot.dormancy} />
      <Runes count={snapshot.visuals.runes} />
      <ShootingStars
        count={snapshot.visuals.shootingStars}
        night={snapshot.phase === "night" || snapshot.dormancy}
      />
      <Fireflies
        count={snapshot.visuals.fireflies}
        color={snapshot.dormancy ? "#8A9AAA" : "#F0C75E"}
      />
      <Rainbow visible={snapshot.visuals.rainbow && !snapshot.dormancy} />
      <ContactShadows opacity={0.35} scale={18} blur={2.4} far={2.2} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={0.55}
        maxPolarAngle={1.25}
        target={[0, 0.4, 0]}
      />
    </>
  );
}

export function EdenWorld({
  snapshot,
  onHearth,
}: {
  snapshot: EdenSnapshot;
  onHearth: () => void;
}) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    setWebgl(canUseWebGL());
  }, []);
  const fallback = <EdenFallback snapshot={snapshot} onHearth={onHearth} />;
  if (webgl === false) return fallback;
  if (webgl === null) {
    return <View style={{ flex: 1, backgroundColor: "#0B1020" }} />;
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#0B1020" }}>
      <WebGlGate fallback={fallback}>
        <Canvas
          shadows
          camera={{ position: [8.5, 6.2, 8.5], fov: 42, near: 0.1, far: 80 }}
          gl={{
            antialias: true,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.05;
          }}
          style={{ width: "100%", height: "100%", touchAction: "none" }}
        >
          <Scene snapshot={snapshot} onHearth={onHearth} />
        </Canvas>
      </WebGlGate>
    </View>
  );
}
