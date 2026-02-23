"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/app/lib/store";

const LERP_FACTOR = 0.01; // half speed = ~2x longer initial zoom
const ORBIT_SPEED = 0.8; // radians per second for WASD
const PAN_TILT_AMOUNT = 0.25; // how far look-at shifts with pointer (world units) — barely noticeable
const PAN_TILT_LERP = 0.04;

const DESKTOP_START_Z = 45;
const DESKTOP_END_Z = 10;
const MOBILE_START_Z = 35;
const MOBILE_END_Z = 7;

const ANCHOR = new THREE.Vector3(0, 0, 0);

export function CameraController({ isMobile = false }: { isMobile?: boolean }) {
  const { camera } = useThree();
  const targetPos = useExperienceStore((s) => s.cameraPosition);
  const startZ = isMobile ? MOBILE_START_Z : DESKTOP_START_Z;
  const endZ = isMobile ? MOBILE_END_Z : DESKTOP_END_Z;
  const radiusRef = useRef(startZ);
  const thetaRef = useRef(0);
  const phiRef = useRef(0);
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const hasStarted = useRef(false);

  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const windowPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      windowPointerRef.current.x = x;
      windowPointerRef.current.y = y;
    };
    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const keys = keysRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.w = true;
      if (k === "a") keys.a = true;
      if (k === "s") keys.s = true;
      if (k === "d") keys.d = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.w = false;
      if (k === "a") keys.a = false;
      if (k === "s") keys.s = false;
      if (k === "d") keys.d = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    useExperienceStore.getState().setCameraPosition({ x: 0, y: 0, z: startZ });
    radiusRef.current = startZ;
    camera.position.set(0, 0, startZ);
    camera.lookAt(ANCHOR);

    const t = setTimeout(() => {
      useExperienceStore.getState().setCameraPosition({ x: 0, y: 0, z: endZ });
      useExperienceStore.getState().setInitialLoadComplete(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [camera, startZ, endZ]);

  const setCameraProgress = useExperienceStore((s) => s.setCameraProgress);

  useFrame((_state, delta) => {
    const keys = keysRef.current;
    const pointer = windowPointerRef.current;

    const moveH = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
    const moveV = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
    thetaRef.current += moveH * ORBIT_SPEED * delta;
    phiRef.current += moveV * ORBIT_SPEED * delta;
    phiRef.current = THREE.MathUtils.clamp(phiRef.current, -Math.PI * 0.4, Math.PI * 0.4);

    radiusRef.current = THREE.MathUtils.lerp(radiusRef.current, targetPos.z, LERP_FACTOR);

    const progress = THREE.MathUtils.clamp(
      (startZ - radiusRef.current) / (startZ - endZ),
      0,
      1
    );
    setCameraProgress(progress);

    const r = radiusRef.current;
    const theta = thetaRef.current;
    const phi = phiRef.current;

    const x = r * Math.cos(phi) * Math.sin(theta);
    const y = r * Math.sin(phi);
    const z = r * Math.cos(phi) * Math.cos(theta);

    camera.position.set(x, y, z);

    const targetLookX = pointer.x * PAN_TILT_AMOUNT;
    const targetLookY = pointer.y * PAN_TILT_AMOUNT;
    lookAtRef.current.x = THREE.MathUtils.lerp(lookAtRef.current.x, targetLookX, PAN_TILT_LERP);
    lookAtRef.current.y = THREE.MathUtils.lerp(lookAtRef.current.y, targetLookY, PAN_TILT_LERP);
    lookAtRef.current.z = 0;
    camera.lookAt(lookAtRef.current);
  });

  return null;
}
