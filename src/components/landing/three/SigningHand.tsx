'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Handshapes the procedural hand can form.
 * OPEN = flat "B"/hello hand, F/S/L = FSL manual alphabet, ILY = "I love you".
 */
export type HandPose = 'OPEN' | 'F' | 'S' | 'L' | 'ILY';

interface PoseDef {
  /** Curl amount (0 = straight, 1 = fully bent) for index, middle, ring, pinky. */
  curls: [number, number, number, number];
  thumbCurl: number;
  thumbSpread: number;
}

const POSES: Record<HandPose, PoseDef> = {
  OPEN: { curls: [0, 0, 0, 0], thumbCurl: 0.1, thumbSpread: 0.35 },
  F: { curls: [0.78, 0.05, 0.1, 0.15], thumbCurl: 0.75, thumbSpread: 0.15 },
  S: { curls: [1, 1, 1, 1], thumbCurl: 0.85, thumbSpread: 0 },
  L: { curls: [0, 1, 1, 1], thumbCurl: 0, thumbSpread: 1 },
  ILY: { curls: [0, 1, 1, 0], thumbCurl: 0, thumbSpread: 1 },
};

// Right hand, palm facing the viewer: index sits nearest the thumb (+x).
const FINGERS = [
  { x: 0.42, r: 0.125, len: [0.48, 0.3, 0.24] },
  { x: 0.14, r: 0.13, len: [0.54, 0.34, 0.26] },
  { x: -0.14, r: 0.125, len: [0.5, 0.32, 0.24] },
  { x: -0.42, r: 0.11, len: [0.38, 0.24, 0.2] },
] as const;

const JOINT_ANGLES = [1.45, 1.7, 1.2];

function Segment({ len, r, material }: { len: number; r: number; material: THREE.Material }) {
  return (
    <mesh position={[0, len / 2, 0]} material={material} castShadow>
      <capsuleGeometry args={[r, Math.max(len - r, 0.01), 8, 16]} />
    </mesh>
  );
}

interface SigningHandProps {
  pose: HandPose;
  /** Disable pointer-follow and idle float (reduced motion). */
  still?: boolean;
}

export function SigningHand({ pose, still = false }: SigningHandProps) {
  const root = useRef<THREE.Group>(null);
  const joints = useRef<(THREE.Group | null)[][]>([[], [], [], []]);
  const thumbBase = useRef<THREE.Group>(null);
  const thumbTip = useRef<THREE.Group>(null);
  const current = useRef<PoseDef>({ ...POSES.OPEN, curls: [...POSES.OPEN.curls] as PoseDef['curls'] });

  const skin = useRef(
    new THREE.MeshPhysicalMaterial({
      color: '#8dffc0',
      emissive: '#0b6b3d',
      emissiveIntensity: 0.55,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      iridescence: 1,
      iridescenceIOR: 1.4,
      sheen: 1,
      sheenColor: new THREE.Color('#F5A800'),
    })
  ).current;

  useFrame((state, delta) => {
    const target = POSES[pose];
    const k = still ? 1 : 1 - Math.exp(-delta * 7);
    const cur = current.current;

    for (let i = 0; i < 4; i++) {
      cur.curls[i] += (target.curls[i] - cur.curls[i]) * k;
      const fingerJoints = joints.current[i];
      for (let j = 0; j < 3; j++) {
        const joint = fingerJoints[j];
        if (joint) joint.rotation.x = cur.curls[i] * JOINT_ANGLES[j];
      }
    }

    cur.thumbCurl += (target.thumbCurl - cur.thumbCurl) * k;
    cur.thumbSpread += (target.thumbSpread - cur.thumbSpread) * k;

    if (thumbBase.current) {
      thumbBase.current.rotation.set(
        cur.thumbCurl * 0.7,
        0,
        -(0.35 + 0.85 * cur.thumbSpread) + cur.thumbCurl * 1.35
      );
    }
    if (thumbTip.current) thumbTip.current.rotation.x = cur.thumbCurl * 0.9;

    if (root.current && !still) {
      const t = state.clock.elapsedTime;
      const targetY = -0.25 + state.pointer.x * 0.45;
      const targetX = -state.pointer.y * 0.3 + Math.sin(t * 0.8) * 0.05;
      root.current.rotation.y += (targetY - root.current.rotation.y) * 0.06;
      root.current.rotation.x += (targetX - root.current.rotation.x) * 0.06;
      root.current.position.y = -0.35 + Math.sin(t * 1.1) * 0.08;
    }
  });

  return (
    <group ref={root} position={[0, -0.35, 0]} rotation={[0, -0.25, 0]} scale={1.15}>
      {/* Palm */}
      <RoundedBox args={[1.22, 1.25, 0.38]} radius={0.16} smoothness={5} material={skin} />
      {/* Wrist */}
      <mesh position={[0, -0.85, 0]} material={skin}>
        <cylinderGeometry args={[0.42, 0.5, 0.6, 32]} />
      </mesh>

      {/* Fingers */}
      {FINGERS.map((f, i) => (
        <group key={i} position={[f.x, 0.58, 0]}>
          <group ref={(el) => { joints.current[i][0] = el; }}>
            <Segment len={f.len[0]} r={f.r} material={skin} />
            <group position={[0, f.len[0], 0]} ref={(el) => { joints.current[i][1] = el; }}>
              <Segment len={f.len[1]} r={f.r * 0.92} material={skin} />
              <group position={[0, f.len[1], 0]} ref={(el) => { joints.current[i][2] = el; }}>
                <Segment len={f.len[2]} r={f.r * 0.85} material={skin} />
              </group>
            </group>
          </group>
        </group>
      ))}

      {/* Thumb */}
      <group position={[0.6, -0.28, 0.06]} ref={thumbBase}>
        <Segment len={0.44} r={0.14} material={skin} />
        <group position={[0, 0.44, 0]} ref={thumbTip}>
          <Segment len={0.34} r={0.125} material={skin} />
        </group>
      </group>
    </group>
  );
}
