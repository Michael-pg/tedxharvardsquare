"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  type Points as PointsType,
  type ShaderMaterial,
} from "three";
import { Scene } from "@/components/canvas/scene";
import { heroMotion } from "@/lib/hero-motion";
import { fragmentShader, vertexShader } from "./shaders";
import { Trail } from "./trail";

const POINT_COUNT = 140_000;

function buildGeometry() {
  const positions = new Float32Array(POINT_COUNT * 3);
  const seeds = new Float32Array(POINT_COUNT);
  const scales = new Float32Array(POINT_COUNT);

  for (let i = 0; i < POINT_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;

    // 0.5 is the uniform-area distribution; above it biases toward the centre.
    // Only a slight bias here — the fragment shader's falloff already grades
    // the mass, and stacking a strong density bias on top collapses the blob
    // into a small bright core instead of filling its 70% of the viewport.
    const radius = Math.pow(Math.random(), 0.54);

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = 0;

    seeds[i] = Math.random() * 10;
    // Mostly fine grain with a few larger motes, so it grades rather than
    // resolving into a uniform stipple.
    scales[i] = 0.35 + Math.pow(Math.random(), 2.2) * 1.6;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("aScale", new BufferAttribute(scales, 1));
  return geometry;
}

function Blob() {
  const points = useRef<PointsType>(null);
  const material = useRef<ShaderMaterial>(null);
  const { viewport, size } = useThree();

  const geometry = useMemo(() => buildGeometry(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uRadius: { value: 3 },
      uPointer: { value: [0, 0] as [number, number] },
      uPointerRadius: { value: 1.6 },
      uPointerStrength: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 26 },
      uOpacity: { value: 1 },
      uReveal: { value: 0.2 },
      uColorCore: { value: new Color("#ff6b7f") },
      uColorMid: { value: new Color("#eb0028") },
      uColorEdge: { value: new Color("#12000a") },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;

    u.uTime.value += delta;

    // Ease the pointer so the field trails the cursor instead of snapping to it.
    const follow = 1 - Math.pow(0.001, delta);
    heroMotion.smoothX += (heroMotion.pointerX - heroMotion.smoothX) * follow;
    heroMotion.smoothY += (heroMotion.pointerY - heroMotion.smoothY) * follow;

    // Half-extents, so NDC -1..1 maps onto the visible world plane at z = 0.
    u.uPointer.value[0] = heroMotion.smoothX * (viewport.width / 2);
    u.uPointer.value[1] = heroMotion.smoothY * (viewport.height / 2);

    u.uProgress.value = heroMotion.progress;
    u.uOpacity.value = heroMotion.opacity;

    // Ease the cursor influence in only once the pointer has genuinely moved,
    // so the blob never loads with a void behind the headline.
    const targetStrength = heroMotion.pointerActive ? 1 : 0;
    u.uPointerStrength.value +=
      (targetStrength - u.uPointerStrength.value) * (1 - Math.pow(0.02, delta));

    // uRadius is the field's *full* extent; what is actually visible at any
    // moment is governed by uReveal below.
    const shortEdge = Math.min(viewport.width, viewport.height);
    u.uRadius.value = shortEdge * 0.46;
    u.uPointerRadius.value = shortEdge * 0.12;
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);

    // 0.18 at rest is a compact orb — one idea. Easing toward 1 lights the
    // outer shells, and the curve is front-loaded so the explosion opens
    // quickly and then keeps spreading rather than arriving all at once.
    //
    // Multiplying by `intro` means the same control also drives the page-load
    // burst: the overshooting ease on that value scatters the orb past its
    // resting radius and lets it settle back.
    const scrollReveal = 0.18 + Math.pow(heroMotion.progress, 0.75) * 0.94;
    u.uReveal.value = scrollReveal * heroMotion.intro;

    // Fine grain: the field should read as dense pixels, not as discs — but
    // small points plus additive blending gets dim fast, so this is the floor
    // rather than the target.
    u.uSize.value = Math.max(size.width, size.height) * 0.013;

    if (points.current) points.current.rotation.z += delta * 0.015;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function PixelBlobScene() {
  return (
    <Scene camera={{ position: [0, 0, 10], fov: 45 }}>
      <Blob />
      <Trail />
    </Scene>
  );
}
