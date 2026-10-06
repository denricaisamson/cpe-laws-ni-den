'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import { SigningHand, type HandPose } from './SigningHand';
import { ParticleField } from './ParticleField';

interface HeroCanvasProps {
  pose: HandPose;
  active: boolean;
  still: boolean;
}

function OrbitRing({ radius, color, tilt, speed }: { radius: number; color: string; tilt: number; speed: number }) {
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={0.4}>
      <mesh rotation={[tilt, 0.3, 0]}>
        <torusGeometry args={[radius, 0.012, 16, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </Float>
  );
}

/**
 * Hero WebGL scene. Purely decorative (aria-hidden by parent) and
 * rendered client-side only. Uses local Lightformers so no HDR is fetched.
 */
export default function HeroCanvas({ pose, active, still }: HeroCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-3, 1, 2]} intensity={18} color="#22c55e" />
      <pointLight position={[3, -2, 2]} intensity={14} color="#F5A800" />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#4ade80" position={[-4, 2, 3]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#F5A800" position={[4, -1, 3]} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 4, -3]} scale={3} />
      </Environment>

      <SigningHand pose={pose} still={still} />
      {!still && (
        <>
          <OrbitRing radius={2.1} color="#F5A800" tilt={1.25} speed={1.2} />
          <OrbitRing radius={2.6} color="#4ade80" tilt={1.45} speed={0.9} />
        </>
      )}
      <ParticleField count={still ? 600 : 1400} still={still} />
    </Canvas>
  );
}
