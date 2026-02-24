/**
 * Radial chromatic aberration: RGB separation increases toward the edges (anamorphic lens style).
 */
export const ChromaticAberrationShader = {
  name: "ChromaticAberration",
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.003 },
    radialModulation: { value: 1.2 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float radialModulation;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      float strength = dist * radialModulation * amount;
      vec2 dir = normalize(uv + 0.0001);

      float r = texture2D(tDiffuse, vUv - dir * strength).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + dir * strength).b;
      float a = texture2D(tDiffuse, vUv).a;

      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};
