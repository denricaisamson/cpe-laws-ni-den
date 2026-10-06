'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  still?: boolean;
}

/** Gold + emerald star-dust shell that drifts and leans toward the cursor. */
export function ParticleField({ count = 1400, still = false }: ParticleFieldProps) {
  const points = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const gold = new THREE.Color('#F5A800');
    const green = new THREE.Color('#4ade80');
    const white = new THREE.Color('#e7fff1');

    for (let i = 0; i < count; i++) {
      const r = 3.5 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi) - 2;

      const pick = Math.random();
      const c = pick < 0.45 ? gold : pick < 0.85 ? green : white;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current || still) return;
    points.current.rotation.y += delta * 0.03;
    points.current.rotation.x += (state.pointer.y * 0.08 - points.current.rotation.x) * 0.02;
    points.current.position.x += (state.pointer.x * 0.3 - points.current.position.x) * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
