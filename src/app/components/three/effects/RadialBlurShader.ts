/**
 * Radial blur: stronger toward the edges (anamorphic / film lens style).
 * Samples along the direction from center; edge factor increases blur.
 */
export const RadialBlurShader = {
  name: "RadialBlur",
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.15 },
    center: { value: [0.5, 0.5] as [number, number] },
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
    uniform float strength;
    uniform vec2 center;
    varying vec2 vUv;

    const float SAMPLES = 8.0;

    void main() {
      vec2 uv = vUv - center;
      float dist = length(uv);
      float edgeFactor = smoothstep(0.2, 0.95, dist);
      float blur = strength * edgeFactor;
      vec2 dir = normalize(uv + 0.0001);

      vec4 acc = vec4(0.0);
      float total = 0.0;
      for (float i = 0.0; i < SAMPLES; i++) {
        float t = (i / (SAMPLES - 1.0)) - 0.5;
        vec2 offset = dir * t * blur;
        float w = 1.0 - abs(t) * 2.0;
        acc += texture2D(tDiffuse, vUv + offset) * w;
        total += w;
      }
      acc /= total;
      gl_FragColor = vec4(acc.rgb, acc.a);
    }
  `,
};
