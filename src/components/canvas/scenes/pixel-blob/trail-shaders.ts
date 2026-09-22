/**
 * GLSL for the cursor trail.
 *
 * Particles are simulated entirely in the vertex shader from their spawn state:
 * position at time t is origin + velocity * age. The CPU therefore only writes
 * to the buffers when a particle is *born*, not every frame — which is what
 * makes a few thousand emitted pixels essentially free.
 */

export const trailVertexShader = /* glsl */ `
uniform float uTime;
uniform float uLifetime;
uniform float uPixelRatio;
uniform float uSize;

attribute vec3  aVelocity;
attribute float aBirth;
attribute float aSeed;

varying float vAge;     // 0 at spawn, 1 at death

void main() {
  float age = (uTime - aBirth) / uLifetime;
  vAge = age;

  // Dead and not-yet-born particles are pushed off screen and given zero size,
  // which is cheaper than any branching and keeps the buffer a simple ring.
  if (age < 0.0 || age > 1.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }

  float t = age * uLifetime;
  vec3 pos = position + aVelocity * t;

  // Slight curl so the trail drifts rather than travelling in straight rays.
  pos.x += sin(t * 1.7 + aSeed * 6.28) * 0.08 * t;
  pos.y += cos(t * 1.4 + aSeed * 6.28) * 0.08 * t;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Shrink as they age, so the trail tapers behind the cursor.
  gl_PointSize = uSize * uPixelRatio * (1.0 - age * 0.75);
  gl_PointSize *= 1.0 / -mvPosition.z;
}
`;

export const trailFragmentShader = /* glsl */ `
uniform vec3  uColorHot;
uniform vec3  uColorCool;
uniform float uOpacity;

varying float vAge;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  if (dot(coord, coord) > 0.25) discard;

  // Fresh sparks read hot and cool as they die.
  vec3 color = mix(uColorHot, uColorCool, smoothstep(0.0, 0.7, vAge));

  // Ease in fast, out slow — a linear fade makes the tail end abruptly.
  float alpha = pow(1.0 - vAge, 1.6);

  gl_FragColor = vec4(color, alpha * uOpacity);
}
`;
