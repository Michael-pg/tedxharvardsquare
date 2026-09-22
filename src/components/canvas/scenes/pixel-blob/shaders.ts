/**
 * GLSL for the hero pixel blob.
 *
 * The blob is ~60k points distributed over a unit disc. The vertex shader
 * handles shape (noise wobble, scroll expansion, mouse repulsion); the fragment
 * shader handles colour and the radial fade to black that keeps the blob from
 * having a hard edge.
 */

/** Ashima's simplex noise, used for both the shape wobble and the colour drift. */
const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;    // 0 at rest, 1 once the blob fills the screen
uniform float uRadius;      // blob radius in world units
uniform vec2  uPointer;     // cursor in world units
uniform float uPointerRadius;
uniform float uPointerStrength; // ramps 0→1 once the cursor has actually moved
uniform float uPixelRatio;
uniform float uSize;

attribute float aSeed;
attribute float aScale;

varying float vRadial;      // 0 at centre, 1 at the blob's rim
varying float vNoise;
varying float vPointer;

${SIMPLEX_3D}

void main() {
  // Positions arrive on a unit disc so the radial term is trivially available
  // and stays correct no matter how the blob is scaled afterwards.
  vec3 pos = position;
  vRadial = length(pos.xy);

  // Scroll expands the field outward past the viewport edges. Note this only
  // ever grows — the fade-out at the end of the sequence is driven by uOpacity,
  // so the ideas dissipate in place rather than collapsing back to a point.
  float radius = uRadius * mix(0.7, 1.35, uProgress);
  pos.xy *= radius;

  // Organic drift. Two octaves so the surface never reads as a clean sphere.
  float n1 = snoise(vec3(pos.xy * 0.22, uTime * 0.12));
  float n2 = snoise(vec3(pos.xy * 0.6, uTime * 0.2 + aSeed));
  float n = n1 * 0.7 + n2 * 0.3;
  vNoise = n;

  vec2 outward = vRadial > 0.001 ? normalize(pos.xy) : vec2(0.0);
  pos.xy += outward * n * radius * 0.14;
  pos.z += n * 1.2;

  // Cursor repulsion — the field parts around the pointer.
  //
  // Kept deliberately gentle. A strong push evacuates the area completely and
  // piles the displaced points into a bright ring, which reads as a hard hole
  // punched in the blob rather than as a fluid response. uPointerStrength
  // stays at 0 until the cursor has actually moved, so the blob does not load
  // with a void sitting exactly where the headline goes.
  vec2 toPointer = pos.xy - uPointer;
  float dist = length(toPointer);
  float influence = 1.0 - smoothstep(0.0, uPointerRadius, dist);
  influence = smoothstep(0.0, 1.0, influence) * uPointerStrength;
  vPointer = influence;
  pos.xy += (dist > 0.001 ? normalize(toPointer) : vec2(1.0, 0.0))
            * influence * uPointerRadius * 0.16;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Perspective-correct point size, with a nudge so displaced points brighten.
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 + influence * 1.4);
  gl_PointSize *= 1.0 / -mvPosition.z;
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3  uColorCore;
uniform vec3  uColorMid;
uniform vec3  uColorEdge;
uniform float uOpacity;
uniform float uReveal;      // radius on the unit disc that is currently lit
uniform float uTime;

varying float vRadial;
varying float vNoise;
varying float vPointer;

void main() {
  // Round the point sprite; square pixels read as artefacts at this density.
  vec2 coord = gl_PointCoord - 0.5;
  if (dot(coord, coord) > 0.25) discard;

  // The gradient: hot core, brand red through the body, black at the rim. The
  // noise term is what makes it *move* rather than sit as a static gradient.
  float t = clamp(vRadial * 1.15 + vNoise * 0.18, 0.0, 1.0);
  vec3 color = mix(uColorCore, uColorMid, smoothstep(0.0, 0.55, t));
  color = mix(color, uColorEdge, smoothstep(0.5, 1.0, t));

  // Continuous fade toward the rim. A smoothstep would leave the inner region
  // flat, reading as a disc with a soft edge; the power curve gives a true
  // gradient across the whole field. Much above ~1.2 and the mass collapses
  // into a dim smudge, since it is down to a third of full brightness by the
  // halfway point.
  float falloff = pow(1.0 - clamp(vRadial, 0.0, 1.0), 0.95);

  // The reveal front — the core of the concept.
  //
  // At rest only the innermost shell is lit: one idea. As uReveal climbs with
  // scroll, successive shells ignite outward, so the growth reads as ideas
  // multiplying into a community rather than as one sprite being scaled up.
  float reveal = 1.0 - smoothstep(uReveal - 0.3, uReveal, vRadial);
  falloff *= reveal;

  // Cursor highlight.
  color += vPointer * 0.4;

  float alpha = falloff * (0.6 + 0.4 * smoothstep(-1.0, 1.0, vNoise));
  gl_FragColor = vec4(color, alpha * uOpacity);
}
`;
