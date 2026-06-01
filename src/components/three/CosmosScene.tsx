"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── 좌표 설계 ──────────────────────────────────────────────────
// Sun   : (0, 0, 0)
// Earth : (8, 0, 0)
// Galaxy center : (-600, 0, 0)  →  Sun이 은하 나선팔에 위치

const GALAXY_CENTER = new THREE.Vector3(-600, 0, 0);

// ── 카메라 경로 (줌 0→1) ──────────────────────────────────────
const CAM_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(8,    0.5,    5),   // 0.00 지구 근접
  new THREE.Vector3(4,    3,     24),   // 0.25 후퇴
  new THREE.Vector3(0,   10,     80),   // 0.50 태양계 전체
  new THREE.Vector3(0,   80,    500),   // 0.75 성간 공간
  new THREE.Vector3(0, 1500,    600),   // 1.00 은하 전체
]);

const LOOK_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(8,   0,    0),    // look at Earth
  new THREE.Vector3(3,   0,    0),
  new THREE.Vector3(0,   0,    0),    // look at Sun
  new THREE.Vector3(-200, 0,   0),
  new THREE.Vector3(-600, 0,   0),    // look at Galaxy center
]);

// ── Helper ────────────────────────────────────────────────────
function fade(z: number, i0: number, i1: number, o0: number, o1: number) {
  if (z <= i0 || z >= o1) return 0;
  if (z >= i1 && z <= o0) return 1;
  if (z < i1) return (z - i0) / (i1 - i0);
  return 1 - (z - o0) / (o1 - o0);
}

// ── 배경 별 (항상 표시) ────────────────────────────────────────
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

// ── 지구 + 달 ─────────────────────────────────────────────────
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
    earthMat.current && (earthMat.current.opacity = op);
    atmoMat.current  && (atmoMat.current.opacity  = op * 0.22);
    moonMat.current  && (moonMat.current.opacity  = op);
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

// ── 태양계 ────────────────────────────────────────────────────
const PLANETS = [
  { color: "#b5b5b5", dist: 2.2,  radius: 0.10, speed: 1.60 },
  { color: "#e8cda0", dist: 3.5,  radius: 0.16, speed: 1.17 },
  { color: "#4fa3e0", dist: 8.0,  radius: 0.20, speed: 1.00, isEarth: true },
  { color: "#c1440e", dist: 11.0, radius: 0.14, speed: 0.80 },
  { color: "#c88b3a", dist: 18.0, radius: 0.50, speed: 0.43 },
  { color: "#e4d191", dist: 25.0, radius: 0.42, speed: 0.32, rings: true },
  { color: "#7de8e8", dist: 33.0, radius: 0.28, speed: 0.22 },
  { color: "#3f54ba", dist: 40.0, radius: 0.26, speed: 0.18 },
];

function SolarSystem({ z }: { z: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!);
  const mats  = useRef<THREE.MeshStandardMaterial[]>([]);
  const angles = useRef(PLANETS.map(() => Math.random() * Math.PI * 2));
  const meshes = useRef<THREE.Mesh[]>([]);

  const orbits = useMemo(() =>
    PLANETS.map(p => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: "#ffffff", opacity: 0.06, transparent: true });
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
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color="#FDB813" emissive="#F97316" emissiveIntensity={1.5} />
      </mesh>
      <pointLight intensity={120} distance={200} color="#fff5e0" />

      {/* Orbit rings */}
      {orbits.map((o, i) => <primitive key={i} object={o} />)}

      {/* Planets */}
      {PLANETS.map((p, i) => (
        <mesh key={i} ref={el => { if (el) meshes.current[i] = el; }}>
          <sphereGeometry args={[p.radius, 16, 16]} />
          <meshStandardMaterial
            ref={el => { if (el) mats.current[i] = el; }}
            color={p.isEarth ? "#4fa3e0" : p.color}
            emissive={p.isEarth ? "#1a4a70" : "#000"}
            emissiveIntensity={p.isEarth ? 0.3 : 0}
            transparent
          />
          {p.rings && (
            <mesh rotation={[Math.PI / 2.5, 0, 0]}>
              <torusGeometry args={[p.radius * 1.9, p.radius * 0.28, 2, 64]} />
              <meshStandardMaterial color="#c8b882" transparent opacity={0.55} side={THREE.DoubleSide} />
            </mesh>
          )}
        </mesh>
      ))}
    </group>
  );
}

// ── 성간 별무리 (우리 나선팔) ──────────────────────────────────
function MilkyWayArm({ z }: { z: React.MutableRefObject<number> }) {
  const mat = useRef<THREE.PointsMaterial>(null!);
  const group = useRef<THREE.Group>(null!);

  const pos = useMemo(() => {
    const n = 18000;
    const arr = new Float32Array(n * 3);
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
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={mat} size={0.6} color="#d0e8ff" transparent depthWrite={false} />
      </points>
    </group>
  );
}

// ── 은하 나선 ─────────────────────────────────────────────────
function Galaxy({ z }: { z: React.MutableRefObject<number> }) {
  const mat1 = useRef<THREE.PointsMaterial>(null!);
  const mat2 = useRef<THREE.PointsMaterial>(null!);
  const sunMarkerMat = useRef<THREE.PointsMaterial>(null!);
  const group = useRef<THREE.Group>(null!);

  const [arm1, arm2, core] = useMemo(() => {
    const n = 15000;
    const a1 = new Float32Array(n * 3);
    const a2 = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      for (let armIdx = 0; armIdx < 2; armIdx++) {
        const arr = armIdx === 0 ? a1 : a2;
        const armOffset = armIdx * Math.PI;
        const r = Math.pow(Math.random(), 0.5) * 1400;
        const spin = r * 0.0018;
        const angle = armOffset + spin + (Math.random() - 0.5) * 0.5;
        const spread = (Math.random() - 0.5) * (r * 0.18);
        arr[i * 3]     = Math.cos(angle) * r + spread;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 35;
        arr[i * 3 + 2] = Math.sin(angle) * r + spread;
      }
    }
    const coreN = 5000;
    const cArr = new Float32Array(coreN * 3);
    for (let i = 0; i < coreN; i++) {
      const r = Math.pow(Math.random(), 2) * 250;
      const a = Math.random() * Math.PI * 2;
      cArr[i * 3]     = Math.cos(a) * r;
      cArr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      cArr[i * 3 + 2] = Math.sin(a) * r;
    }
    return [a1, a2, cArr];
  }, []);

  // 태양 위치 마커: 은하 중심에서 약 600 units
  const sunMarkerPos = useMemo(() => {
    const arr = new Float32Array(3);
    arr[0] = 600; arr[1] = 0; arr[2] = 0;
    return arr;
  }, []);

  useFrame(() => {
    const op = fade(z.current, 0.72, 0.84, 0.96, 1.01);
    if (group.current) group.current.visible = op > 0.01;
    if (mat1.current) mat1.current.opacity = op * 0.7;
    if (mat2.current) mat2.current.opacity = op * 0.55;
    if (sunMarkerMat.current) sunMarkerMat.current.opacity = op;
  });

  return (
    <group ref={group} position={GALAXY_CENTER}>
      {/* 나선팔 1 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[arm1, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={mat1} size={0.9} color="#8ab4f8" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {/* 나선팔 2 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[arm2, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={mat2} size={0.9} color="#b89ef8" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {/* 은하 코어 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[core, 3]} />
        </bufferGeometry>
        <pointsMaterial size={1.2} color="#ffe8a0" transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {/* 태양계 위치 마커 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sunMarkerPos, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={sunMarkerMat} size={8} color="#ffffff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

// ── 카메라 컨트롤러 ───────────────────────────────────────────
function CameraController({ z }: { z: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const currentZ = useRef(0);
  const camPos = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    currentZ.current += (z.current - currentZ.current) * 0.06;
    const t = Math.max(0, Math.min(1, currentZ.current));

    CAM_CURVE.getPoint(t, camPos.current);
    LOOK_CURVE.getPoint(t, lookAt.current);

    camera.position.lerp(camPos.current, 0.08);
    camera.lookAt(lookAt.current);
    camera.near = 0.1;
    camera.far  = 10000;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}

// ── 메인 씬 ───────────────────────────────────────────────────
export default function CosmosScene({ zoomRef }: { zoomRef: React.MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#000005"]} />
      <ambientLight intensity={0.04} />
      <CameraController z={zoomRef} />
      <BackgroundStars />
      <EarthSystem z={zoomRef} />
      <SolarSystem z={zoomRef} />
      <MilkyWayArm z={zoomRef} />
      <Galaxy z={zoomRef} />
    </>
  );
}
