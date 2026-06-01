"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const PLANETS = [
  { name: "Mercury",  nameKo: "수성",  radius: 0.18, distance: 3.2,  speed: 1.60, color: "#b5b5b5", desc: "태양에서 가장 가까운 행성. 대기가 거의 없어 낮과 밤의 온도 차가 극심합니다." },
  { name: "Venus",    nameKo: "금성",  radius: 0.28, distance: 4.5,  speed: 1.17, color: "#e8cda0", desc: "태양계에서 가장 뜨거운 행성. 두꺼운 이산화탄소 대기로 온실효과가 극단적입니다." },
  { name: "Earth",    nameKo: "지구",  radius: 0.30, distance: 6.0,  speed: 1.00, color: "#4fa3e0", desc: "생명이 존재하는 유일하게 확인된 행성. 표면의 71%가 물로 덮여 있습니다." },
  { name: "Mars",     nameKo: "화성",  radius: 0.22, distance: 7.8,  speed: 0.80, color: "#c1440e", desc: "붉은 행성. 태양계에서 가장 높은 화산 올림푸스 몬스가 있습니다." },
  { name: "Jupiter",  nameKo: "목성",  radius: 0.70, distance: 10.5, speed: 0.43, color: "#c88b3a", desc: "태양계 최대 행성. 대적점이라 불리는 300년 이상 지속된 폭풍이 있습니다." },
  { name: "Saturn",   nameKo: "토성",  radius: 0.58, distance: 13.5, speed: 0.32, color: "#e4d191", rings: true, desc: "아름다운 고리로 유명한 행성. 밀도가 물보다 낮아 물에 뜰 수 있습니다." },
  { name: "Uranus",   nameKo: "천왕성", radius: 0.40, distance: 16.5, speed: 0.22, color: "#7de8e8", desc: "자전축이 98도 기울어진 독특한 행성. 옆으로 굴러가듯 공전합니다." },
  { name: "Neptune",  nameKo: "해왕성", radius: 0.38, distance: 19.0, speed: 0.18, color: "#3f54ba", desc: "태양계에서 가장 강한 바람이 부는 행성. 시속 2,100km의 바람이 관측됩니다." },
];

function OrbitRing({ distance }: { distance: number }) {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * distance, 0, Math.sin(a) * distance));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: "#ffffff", opacity: 0.08, transparent: true });
  const lineObj = new THREE.Line(geometry, material);
  return <primitive object={lineObj} />;
}

function Planet({ data, onSelect }: { data: typeof PLANETS[0]; onSelect: (p: typeof PLANETS[0] | null) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    angle.current += delta * data.speed * 0.3;
    if (ref.current) {
      ref.current.position.x = Math.cos(angle.current) * data.distance;
      ref.current.position.z = Math.sin(angle.current) * data.distance;
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      onPointerOver={() => document.body.style.cursor = "pointer"}
      onPointerOut={() => document.body.style.cursor = "default"}
    >
      <sphereGeometry args={[data.radius, 32, 32]} />
      <meshStandardMaterial color={data.color} roughness={0.8} metalness={0.1} />
      {data.rings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[data.radius * 1.8, data.radius * 0.25, 2, 64]} />
          <meshStandardMaterial color="#c8b882" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </mesh>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial color="#FDB813" emissive="#F97316" emissiveIntensity={1.2} />
    </mesh>
  );
}

export default function SolarSystem({ onSelect }: { onSelect: (p: typeof PLANETS[0] | null) => void }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={80} distance={60} color="#fff5e0" />
      <Sun />
      {PLANETS.map((p) => (
        <group key={p.name}>
          <OrbitRing distance={p.distance} />
          <Planet data={p} onSelect={onSelect} />
        </group>
      ))}
    </>
  );
}

export { PLANETS };
