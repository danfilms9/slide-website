"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FLOAT_AMPLITUDE = 0.1;
const FLOAT_PERIOD = 6;

const WIDTH = 7.2;
const HEIGHT = 12.8;

export function ScreenOccluder() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y =
        Math.sin((t * (Math.PI * 2)) / FLOAT_PERIOD) * FLOAT_AMPLITUDE;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshBasicMaterial
        colorWrite={false}
        depthWrite={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
