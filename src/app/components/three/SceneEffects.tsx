"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ChromaticAberrationShader } from "./effects/ChromaticAberrationShader";
import { RadialBlurShader } from "./effects/RadialBlurShader";
import * as THREE from "three";

const CHROMATIC_AMOUNT = 0.0015;
const RADIAL_BLUR_STRENGTH = 0.05;
const BLOOM_STRENGTH = 0.5;
const BLOOM_RADIUS = 0.4;
const BLOOM_THRESHOLD = 0.2;
const FILM_INTENSITY = 0.35;
const FILM_GRAYSCALE = false;

export function SceneEffects() {
  const composerRef = useRef<EffectComposer | null>(null);
  const { gl, scene, camera, size } = useThree();

  const passes = useMemo(() => {
    const chromaticUniforms = THREE.UniformsUtils.clone(ChromaticAberrationShader.uniforms);
    (chromaticUniforms.amount as THREE.Uniform).value = CHROMATIC_AMOUNT;
    (chromaticUniforms.radialModulation as THREE.Uniform).value = 1.2;

    const radialUniforms = THREE.UniformsUtils.clone(RadialBlurShader.uniforms);
    (radialUniforms.strength as THREE.Uniform).value = RADIAL_BLUR_STRENGTH;
    (radialUniforms.center as THREE.Uniform).value = new THREE.Vector2(0.5, 0.5);

    const chromaticPass = new ShaderPass({
      ...ChromaticAberrationShader,
      uniforms: chromaticUniforms,
    });
    const radialPass = new ShaderPass({
      ...RadialBlurShader,
      uniforms: radialUniforms,
    });
    const filmPass = new FilmPass(FILM_INTENSITY, FILM_GRAYSCALE);
    filmPass.renderToScreen = true;

    return { chromaticPass, radialPass, filmPass };
  }, []);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    // Clear to transparent so the portal (screen) and grey background show through the canvas
    const renderPass = new RenderPass(
      scene,
      camera,
      null,
      new THREE.Color(0, 0, 0),
      0
    );
    const resolution = new THREE.Vector2(size.width, size.height);
    const bloomPass = new UnrealBloomPass(
      resolution,
      BLOOM_STRENGTH,
      BLOOM_RADIUS,
      BLOOM_THRESHOLD
    );
    composer.addPass(renderPass);
    composer.addPass(passes.chromaticPass);
    composer.addPass(passes.radialPass);
    composer.addPass(bloomPass);
    composer.addPass(passes.filmPass);
    composerRef.current = composer;
    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  }, [gl, scene, camera, passes, size.width, size.height]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(gl.getPixelRatio());
  }, [gl, size]);

  useFrame((_, delta) => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.render(delta);
  }, 1);

  return null;
}
