"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── 타입 ───────────────────────────────────────────────────────
export interface PlanetInfo {
  nameKo: string;
  name: string;
  color: string;
  distAU: string;
  period: string;
  desc: string;
}

export interface DragState {
  azimuth: number;
  elevation: number;
}

interface CosmosProps {
  zoomRef: React.MutableRefObject<number>;
  dragRef: React.MutableRefObject<DragState>;
  wasDraggingRef: React.MutableRefObject<boolean>;
  onPlanetClick: (info: PlanetInfo) => void;
}

// ── 좌표 설계 ──────────────────────────────────────────────────
const GALAXY_CENTER = new THREE.Vector3(-600, 0, 0);

const CAM_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(8,    0.5,    5),
  new THREE.Vector3(4,    3,     24),
  new THREE.Vector3(0,   10,     80),
  new THREE.Vector3(0,   80,    500),
  new THREE.Vector3(0, 1500,    600),
]);

const LOOK_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(8,    0,    0),
  new THREE.Vector3(3,    0,    0),
  new THREE.Vector3(0,    0,    0),
  new THREE.Vector3(-200, 0,    0),
  new THREE.Vector3(-600, 0,    0),
]);

function clamp(v: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }

function fade(z: number, i0: number, i1: number, o0: number, o1: number) {
  if (z <= i0 || z >= o1) return 0;
  if (z >= i1 && z <= o0) return 1;
  if (z < i1) return (z - i0) / (i1 - i0);
  return 1 - (z - o0) / (o1 - o0);
}

// ── 행성 데이터 ────────────────────────────────────────────────
const PLANETS: (PlanetInfo & {
  dist: number; radius: number; speed: number;
  rings?: boolean; isEarth?: boolean;
})[] = [
  { nameKo: "수성",   name: "Mercury",  color: "#b5b5b5", dist: 2.2,  radius: 0.10, speed: 1.60, distAU: "0.39 AU",  period: "88일",  desc: "태양에서 가장 가까운 행성. 대기가 거의 없어 낮과 밤의 온도 차가 600°C에 달합니다." },
  { nameKo: "금성",   name: "Venus",    color: "#e8cda0", dist: 3.5,  radius: 0.16, speed: 1.17, distAU: "0.72 AU",  period: "225일", desc: "태양계에서 가장 뜨거운 행성(465°C). 두꺼운 이산화탄소 대기가 극단적인 온실효과를 만듭니다." },
  { nameKo: "지구",   name: "Earth",    color: "#4fa3e0", dist: 8.0,  radius: 0.20, speed: 1.00, distAU: "1.00 AU",  period: "365일", desc: "생명이 존재하는 유일하게 확인된 행성. 표면의 71%가 물로 덮여 있으며 달을 하나 가지고 있습니다.", isEarth: true },
  { nameKo: "화성",   name: "Mars",     color: "#c1440e", dist: 11.0, radius: 0.14, speed: 0.80, distAU: "1.52 AU",  period: "687일", desc: "붉은 행성. 태양계 최고봉 올림푸스 몬스(21km)와 2개의 위성(포보스, 데이모스)이 있습니다." },
  { nameKo: "목성",   name: "Jupiter",  color: "#c88b3a", dist: 18.0, radius: 0.50, speed: 0.43, distAU: "5.20 AU",  period: "12년",  desc: "태양계 최대 행성. 지구 1,300개가 들어가는 크기. 300년 이상 지속된 대적점 폭풍이 있습니다." },
  { nameKo: "토성",   name: "Saturn",   color: "#e4d191", dist: 25.0, radius: 0.42, speed: 0.32, distAU: "9.58 AU",  period: "29년",  desc: "아름다운 고리로 유명. 밀도가 물보다 낮아 거대한 바다에 띄울 수 있는 유일한 행성입니다.", rings: true },
  { nameKo: "천왕성", name: "Uranus",   color: "#7de8e8", dist: 33.0, radius: 0.28, speed: 0.22, distAU: "19.2 AU",  period: "84년",  desc: "자전축이 98도 기울어져 옆으로 구르듯 공전합니다. 27개의 위성을 가지고 있습니다." },
  { nameKo: "해왕성", name: "Neptune",  color: "#3f54ba", dist: 40.0, radius: 0.26, speed: 0.18, distAU: "30.1 AU",  period: "165년", desc: "시속 2,100km의 강풍이 부는 행성. 태양에서 너무 멀어 공전 주기가 165년에 달합니다." },
];

// ── 배경 별 ─────────────────────────────────────────────────────
function BackgroundStars() {
  const pos = useMemo(() => {
    const arr = new Float32Array(6000 * 3);
    for (let i = 0; i < 6000; i++) {
      const r = 1000 + Math.random() * 1500;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(p) * Math.cos(t);
      arr[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      arr[i * 3 + 2] = r * Math.cos(p);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={2.5} color="#ffffff" transparent opacity={0.75} depthWrite={false} />
    </points>
  );
}

// ── 지구 + 달 ───────────────────────────────────────────────────
function EarthSystem({ z }: { z: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!);
  const earthMat = useRef<THREE.MeshStandardMaterial>(null!);
  const atmoMat  = useRef<THREE.MeshStandardMaterial>(null!);
  const moonMat  = useRef<THREE.MeshStandardMaterial>(null!);
  const moonMesh = useRef<THREE.Mesh>(null!);
  const moonAngle = useRef(0);

  useFrame((_, dt) => {
    const op = fade(z.current, 0, 0.02, 0.28, 0.42);
    if (group.current) group.current.visible = op > 0.01;
    if (earthMat.current) earthMat.current.opacity = op;
    if (atmoMat.current)  atmoMat.current.opacity  = op * 0.22;
    if (moonMat.current)  moonMat.current.opacity  = op;
    moonAngle.current += dt * 0.45;
    if (moonMesh.current) {
      moonMesh.current.position.x = 8 + Math.cos(moonAngle.current) * 1.8;
      moonMesh.current.position.z = Math.sin(moonAngle.current) * 1.8;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[8, 0, 0]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial ref={earthMat} color="#2a6fbb" emissive="#0a2a50" emissiveIntensity={0.3} transparent />
      </mesh>
      <mesh position={[8, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial ref={atmoMat} color="#88ccff" transparent depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh ref={moonMesh}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial ref={moonMat} color="#aaaaaa" transparent />
      </mesh>
    </group>
  );
}

// ── 태양계 ─────────────────────────────────────────────────────
function SolarSystem({
  z, wasDraggingRef, onPlanetClick,
}: {
  z: React.MutableRefObject<number>;
  wasDraggingRef: React.MutableRefObject<boolean>;
  onPlanetClick: (info: PlanetInfo) => void;
}) {
  const group   = useRef<THREE.Group>(null!);
  const mats    = useRef<THREE.MeshStandardMaterial[]>([]);
  const meshes  = useRef<THREE.Mesh[]>([]);
  const angles  = useRef(PLANETS.map(() => Math.random() * Math.PI * 2));

  const orbits = useMemo(() =>
    PLANETS.map(p => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: "#ffffff", opacity: 0.07, transparent: true });
      return new THREE.Line(geo, mat);
    }), []);

  useFrame((_, dt) => {
    const op = fade(z.current, 0.04, 0.14, 0.72, 0.86);
    if (group.current) group.current.visible = op > 0.01;
    mats.current.forEach(m => { if (m) m.opacity = op; });
    orbits.forEach(o => { (o.material as THREE.LineBasicMaterial).opacity = op * 0.12; });
    PLANETS.forEach((p, i) => {
      angles.current[i] += dt * p.speed * 0.25;
      if (meshes.current[i]) {
        meshes.current[i].position.x = Math.cos(angles.current[i]) * p.dist;
        meshes.current[i].position.z = Math.sin(angles.current[i]) * p.dist;
      }
    });
  });

  return (
    <group ref={group}>
      {/* 태양 */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color="#FDB813" emissive="#F97316" emissiveIntensity={1.5} />
      </mesh>
      <pointLight intensity={120} distance={200} color="#fff5e0" />

      {orbits.map((o, i) => <primitive key={i} object={o} />)}

      {PLANETS.map((p, i) => (
        <mesh
          key={i}
          ref={el => { if (el) meshes.current[i] = el; }}
          onClick={e => {
            e.stopPropagation();
            if (wasDraggingRef.current) return;
            onPlanetClick(p);
          }}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "grab"; }}
        >
          <sphereGeometry args={[p.radius * 2.5, 20, 20]} />
          <meshStandardMaterial
            ref={el => { if (el) mats.current[i] = el; }}
            color={p.color}
            emissive={p.isEarth ? "#1a4a70" : "#000"}
            emissiveIntensity={p.isEarth ? 0.3 : 0}
            transparent
          />
          {p.rings && (
            <mesh rotation={[Math.PI / 2.5, 0, 0]}>
              <torusGeometry args={[p.radius * 2.5 * 1.9, p.radius * 2.5 * 0.28, 2, 64]} />
              <meshStandardMaterial color="#c8b882" transparent opacity={0.55} side={THREE.DoubleSide} />
            </mesh>
          )}
        </mesh>
      ))}
    </group>
  );
}

// ── 성간 별무리 ─────────────────────────────────────────────────
function MilkyWayArm({ z }: { z: React.MutableRefObject<number> }) {
  const mat   = useRef<THREE.PointsMaterial>(null!);
  const group = useRef<THREE.Group>(null!);
  const pos = useMemo(() => {
    const n = 18000; const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 600;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return arr;
  }, []);
  useFrame(() => {
    const op = fade(z.current, 0.52, 0.64, 0.82, 0.93);
    if (group.current) group.current.visible = op > 0.01;
    if (mat.current) mat.current.opacity = op * 0.55;
  });
  return (
    <group ref={group}>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
        <pointsMaterial ref={mat} size={0.6} color="#d0e8ff" transparent depthWrite={false} />
      </points>
    </group>
  );
}

// ── 은하 나선 ──────────────────────────────────────────────────
function Galaxy({ z }: { z: React.MutableRefObject<number> }) {
  const mat1 = useRef<THREE.PointsMaterial>(null!);
  const mat2 = useRef<THREE.PointsMaterial>(null!);
  const group = useRef<THREE.Group>(null!);

  const [arm1, arm2, core] = useMemo(() => {
    const n = 15000;
    const a1 = new Float32Array(n * 3), a2 = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      [0, 1].forEach((ai) => {
        const arr = ai === 0 ? a1 : a2;
        const r = Math.pow(Math.random(), 0.5) * 1400;
        const spin = r * 0.0018;
        const angle = ai * Math.PI + spin + (Math.random() - 0.5) * 0.5;
        const spread = (Math.random() - 0.5) * (r * 0.18);
        arr[i * 3]     = Math.cos(angle) * r + spread;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 35;
        arr[i * 3 + 2] = Math.sin(angle) * r + spread;
      });
    }
    const cn = 5000; const cArr = new Float32Array(cn * 3);
    for (let i = 0; i < cn; i++) {
      const r = Math.pow(Math.random(), 2) * 250, a = Math.random() * Math.PI * 2;
      cArr[i * 3] = Math.cos(a) * r; cArr[i * 3 + 1] = (Math.random() - 0.5) * 20; cArr[i * 3 + 2] = Math.sin(a) * r;
    }
    return [a1, a2, cArr];
  }, []);

  const sunMarker = useMemo(() => { const a = new Float32Array(3); a[0] = 600; return a; }, []);

  useFrame(() => {
    const op = fade(z.current, 0.72, 0.84, 0.96, 1.01);
    if (group.current) group.current.visible = op > 0.01;
    if (mat1.current) mat1.current.opacity = op * 0.7;
    if (mat2.current) mat2.current.opacity = op * 0.55;
  });

  return (
    <group ref={group} position={GALAXY_CENTER}>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[arm1, 3]} /></bufferGeometry>
        <pointsMaterial ref={mat1} size={0.9} color="#8ab4f8" transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[arm2, 3]} /></bufferGeometry>
        <pointsMaterial ref={mat2} size={0.9} color="#b89ef8" transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[core, 3]} /></bufferGeometry>
        <pointsMaterial size={1.2} color="#ffe8a0" transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[sunMarker, 3]} /></bufferGeometry>
        <pointsMaterial size={10} color="#ffffff" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
    </group>
  );
}

// ── 카메라 컨트롤러 ────────────────────────────────────────────
function CameraController({
  zoomRef, dragRef,
}: {
  zoomRef: React.MutableRefObject<number>;
  dragRef: React.MutableRefObject<DragState>;
}) {
  const { camera } = useThree();
  const currentZoom = useRef(0);
  const smoothDrag  = useRef<DragState>({ azimuth: 0, elevation: 0 });
  const tmpCamPos   = useRef(new THREE.Vector3());
  const tmpLookAt   = useRef(new THREE.Vector3());

  useFrame(() => {
    // 줌 부드럽게
    currentZoom.current += (zoomRef.current - currentZoom.current) * 0.06;
    const t = clamp(currentZoom.current);

    // 드래그 부드럽게
    smoothDrag.current.azimuth   += (dragRef.current.azimuth   - smoothDrag.current.azimuth)   * 0.1;
    smoothDrag.current.elevation += (dragRef.current.elevation - smoothDrag.current.elevation) * 0.1;

    CAM_CURVE.getPoint(t, tmpCamPos.current);
    LOOK_CURVE.getPoint(t, tmpLookAt.current);

    // 드래그 회전: offset 벡터를 구면 좌표로 변환 후 회전
    const offset = tmpCamPos.current.clone().sub(tmpLookAt.current);
    const sph = new THREE.Spherical().setFromVector3(offset);
    sph.theta += smoothDrag.current.azimuth;
    sph.phi    = clamp(sph.phi + smoothDrag.current.elevation, 0.08, Math.PI - 0.08);
    offset.setFromSpherical(sph);

    const finalPos = tmpLookAt.current.clone().add(offset);
    camera.position.lerp(finalPos, 0.08);
    camera.lookAt(tmpLookAt.current);
    camera.near = 0.1;
    camera.far  = 12000;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}

// ── 메인 씬 ────────────────────────────────────────────────────
export default function CosmosScene({ zoomRef, dragRef, wasDraggingRef, onPlanetClick }: CosmosProps) {
  return (
    <>
      <color attach="background" args={["#000005"]} />
      <ambientLight intensity={0.04} />
      <CameraController zoomRef={zoomRef} dragRef={dragRef} />
      <BackgroundStars />
      <EarthSystem z={zoomRef} />
      <SolarSystem z={zoomRef} wasDraggingRef={wasDraggingRef} onPlanetClick={onPlanetClick} />
      <MilkyWayArm z={zoomRef} />
      <Galaxy z={zoomRef} />
    </>
  );
}
