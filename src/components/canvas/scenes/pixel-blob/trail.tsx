"use client";

/* eslint-disable react-hooks/immutability -- see note below */

// Why the disable above:
//
// This component owns a GPU-bound particle ring buffer written inside
// `useFrame`, sixty times a second, then uploaded to the GPU. React's
// immutability rule exists to stop that pattern for *state*, where mutation
// breaks reconciliation — but these typed arrays are never read by React, never
// trigger a render, and are deliberately allocated once and recycled. Copying
// them per frame to satisfy the rule would churn ~200kb/sec of garbage to
// express exactly the same effect.
//
// The rule stays on everywhere else in the project; this is the one place where
// the imperative escape hatch is the correct design.

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  type ShaderMaterial,
} from "three";
import { heroMotion } from "@/lib/hero-motion";
import { trailFragmentShader, trailVertexShader } from "./trail-shaders";

const MAX_PARTICLES = 4000;
const LIFETIME = 1.3;
/** Spawned per unit of world distance the cursor travels. */
const DENSITY = 90;
/** Cap per frame so a flick across the screen cannot exhaust the buffer. */
const MAX_PER_FRAME = 90;

/**
 * Cursor emitter: moving the mouse sprays pixels that drift and die.
 *
 * Particles are spawned along the *segment* between the previous and current
 * cursor position rather than at the cursor itself. Emitting at a point leaves
 * visible gaps whenever the pointer moves faster than the frame rate, which
 * reads as a dotted line instead of a trail.
 */
export function Trail() {
  const material = useRef<ShaderMaterial>(null);
  const { viewport } = useThree();

  const cursor = useRef({ x: 0, y: 0, seeded: false });
  const head = useRef(0);
  const elapsed = useRef(0);

  const geometry = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const velocities = new Float32Array(MAX_PARTICLES * 3);
    const births = new Float32Array(MAX_PARTICLES);
    const seeds = new Float32Array(MAX_PARTICLES);

    // Born long ago, so nothing renders until genuinely emitted.
    births.fill(-1000);

    // Hash-derived rather than Math.random(): render must stay pure, and a
    // deterministic buffer also means the trail looks identical across a
    // StrictMode double-mount instead of subtly reshuffling.
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const hashed = Math.sin(i * 12.9898) * 43758.5453;
      seeds[i] = hashed - Math.floor(hashed);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aVelocity", new BufferAttribute(velocities, 3));
    geometry.setAttribute("aBirth", new BufferAttribute(births, 1));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return geometry;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLifetime: { value: LIFETIME },
      uPixelRatio: { value: 1 },
      uSize: { value: 9 },
      uOpacity: { value: 1 },
      uColorHot: { value: new Color("#ffd9de") },
      uColorCool: { value: new Color("#eb0028") },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;

    elapsed.current += delta;
    u.uTime.value = elapsed.current;
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);

    // The trail belongs to the resting hero; it recedes as the field explodes
    // so it does not compete with the main event.
    u.uOpacity.value = heroMotion.opacity * (1 - heroMotion.progress * 0.85);

    const targetX = heroMotion.pointerX * (viewport.width / 2);
    const targetY = heroMotion.pointerY * (viewport.height / 2);

    if (!heroMotion.pointerActive) return;

    if (!cursor.current.seeded) {
      cursor.current = { x: targetX, y: targetY, seeded: true };
      return;
    }

    const prevX = cursor.current.x;
    const prevY = cursor.current.y;
    const dx = targetX - prevX;
    const dy = targetY - prevY;
    const distance = Math.hypot(dx, dy);

    cursor.current.x = targetX;
    cursor.current.y = targetY;

    if (distance < 0.001) return;

    // Reached through the geometry rather than closed over from the memo: these
    // are GPU-bound ring buffers written every frame, which is exactly what
    // React's immutability rules exist to prevent for ordinary state.
    const positions = geometry.attributes.position.array as Float32Array;
    const velocities = geometry.attributes.aVelocity.array as Float32Array;
    const births = geometry.attributes.aBirth.array as Float32Array;

    const count = Math.min(Math.ceil(distance * DENSITY), MAX_PER_FRAME);

    for (let n = 0; n < count; n++) {
      const i = head.current;
      head.current = (head.current + 1) % MAX_PARTICLES;

      // Distribute along the segment travelled this frame.
      const t = n / count;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.12 + Math.random() * 0.55;

      positions[i * 3] = prevX + dx * t + Math.cos(angle) * 0.04;
      positions[i * 3 + 1] = prevY + dy * t + Math.sin(angle) * 0.04;
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = Math.sin(angle) * speed;
      velocities[i * 3 + 2] = 0;

      // Stagger births across the frame so the spray is not a hard ring.
      births[i] = elapsed.current - delta * (1 - t);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aVelocity.needsUpdate = true;
    geometry.attributes.aBirth.needsUpdate = true;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={trailVertexShader}
        fragmentShader={trailFragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
