"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT_DESKTOP = 16000;
const PARTICLE_COUNT_MOBILE = 8000;
const BOUNDS = { x: 50, yMin: -20, yMax: 40, zMin: -50, zMax: 75 };
const FALL_SPEED = 0.2;
const LEFT_DRIFT = -0.028; // constant drift left (diagonal)
const DRIFT_AMPLITUDE = 0.006; // small wobble (was 0.035)
const Z_DRIFT_AMPLITUDE = 0.004; // slight depth variation (was 0.018)
const BASE_SIZE = 0.22;

// Opacity by distance: full opacity when closer than OPACITY_NEAR, zero beyond OPACITY_FAR
const OPACITY_NEAR = 15;
const OPACITY_FAR = 125;

const SnowPointsVertexShader = /* glsl */ `
  uniform float size;
  uniform float scale;
  uniform float farDist;
  varying float vDistance;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDistance = -mvPosition.z;
    // Cull: behind camera (vDistance < 0) or beyond opacity far (invisible)
    if (vDistance < 0.0 || vDistance > farDist) {
      gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
      return;
    }
    gl_PointSize = size * (scale / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SnowPointsFragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float opacity;
  uniform vec3 color;
  uniform float nearDist;
  uniform float farDist;
  varying float vDistance;
  void main() {
    vec4 texColor = texture2D(map, gl_PointCoord);
    float distFade = 1.0 - smoothstep(nearDist, farDist, vDistance);
    float alpha = texColor.a * opacity * distFade;
    if (alpha < 0.0001) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

// Texture-based trail: circle at leading edge (down-left motion), trail behind = up-right.
// Angled slightly left to match drift. Canvas y=0 is top; sprite may be V-flipped in GPU so we put
// circle at top and trail below in canvas = trail behind (up in world) when displayed.
function createTrailTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const circleR = 22;
  // Circle at top of texture = leading edge (particle position). Trail extends "back" (down in canvas = up in world after flip)
  const circleY = circleR;
  const trailW = 32;
  const trailLen = 234;
  // Trail angle: motion is down-left, so trail (behind) is up-left. In canvas we draw trail downward; negative rotation = trail goes down-left in canvas → up-left on screen after V-flip.
  const trailAngleDeg = -18;
  const trailAngleRad = (trailAngleDeg * Math.PI) / 180;

  // Draw trail first. In canvas we draw trail *below* circle so that after GPU V-flip the trail appears *above* (behind) the particle.
  ctx.save();
  ctx.translate(cx, circleY);
  ctx.rotate(trailAngleRad); // -18° = trail extends down-left in canvas → up-left on screen after flip (matches left drift)
  const trailGrad = ctx.createLinearGradient(0, 0, 0, trailLen);
  trailGrad.addColorStop(0, "rgba(255,255,255,0.88)");
  trailGrad.addColorStop(0.4, "rgba(255,255,255,0.4)");
  trailGrad.addColorStop(0.7, "rgba(255,255,255,0.12)");
  trailGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = trailGrad;
  ctx.fillRect(-trailW / 2, 0, trailW, trailLen);
  ctx.restore();

  // Circle at leading edge (particle head)
  const circleGrad = ctx.createRadialGradient(
    cx, circleY, 0,
    cx, circleY, circleR
  );
  circleGrad.addColorStop(0, "rgba(255,255,255,1)");
  circleGrad.addColorStop(0.5, "rgba(255,255,255,0.92)");
  circleGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = circleGrad;
  ctx.beginPath();
  ctx.arc(cx, circleY, circleR, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Snow({ isMobile = false }: { isMobile?: boolean }) {
  const particleCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  const pointsRef = useRef<THREE.Points>(null);
  const trailTexture = useMemo(() => createTrailTexture(), []);
  const customMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: null as THREE.Texture | null },
        opacity: { value: 0.98 },
        color: { value: new THREE.Color("#ffffff") },
        size: { value: BASE_SIZE },
        scale: { value: 3200 },
        nearDist: { value: OPACITY_NEAR },
        farDist: { value: OPACITY_FAR }, // used in vertex (cull) and fragment (opacity)
      },
      vertexShader: SnowPointsVertexShader,
      fragmentShader: SnowPointsFragmentShader,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return mat;
  }, []);
  customMaterial.uniforms.map.value = trailTexture;

  const { positions, offsets, geometry } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 2 * BOUNDS.x;
      positions[i * 3 + 1] =
        BOUNDS.yMin + Math.random() * (BOUNDS.yMax - BOUNDS.yMin);
      positions[i * 3 + 2] = BOUNDS.zMin + Math.random() * (BOUNDS.zMax - BOUNDS.zMin);
      offsets[i] = Math.random() * Math.PI * 2;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));
    return { positions, offsets, geometry: geom };
  }, [particleCount]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const posAttr = points.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const offsetArray = points.geometry.getAttribute("offset")
      .array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < particleCount; i++) {
      let y = posArray[i * 3 + 1];
      y -= FALL_SPEED;
      if (y < BOUNDS.yMin) {
        y = BOUNDS.yMax;
        posArray[i * 3 + 0] = (Math.random() - 0.5) * 2 * BOUNDS.x;
        posArray[i * 3 + 2] = BOUNDS.zMin + Math.random() * (BOUNDS.zMax - BOUNDS.zMin);
      }
      posArray[i * 3 + 1] = y;
      let x = posArray[i * 3 + 0];
      x += LEFT_DRIFT + Math.sin(time + offsetArray[i]) * DRIFT_AMPLITUDE;
      if (x < -BOUNDS.x) x += 2 * BOUNDS.x;
      if (x > BOUNDS.x) x -= 2 * BOUNDS.x;
      posArray[i * 3 + 0] = x;
      let z = posArray[i * 3 + 2];
      z += Math.cos(time + offsetArray[i] * 0.5) * Z_DRIFT_AMPLITUDE;
      const zRange = BOUNDS.zMax - BOUNDS.zMin;
      if (z < BOUNDS.zMin) z += zRange;
      if (z > BOUNDS.zMax) z -= zRange;
      posArray[i * 3 + 2] = z;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={customMaterial}
    />
  );
}
