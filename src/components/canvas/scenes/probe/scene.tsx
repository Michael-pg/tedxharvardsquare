"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { Scene } from "@/components/canvas/scene";

/**
 * Stack probe — a slowly rotating wireframe icosahedron.
 *
 * This exists to prove the three.js pipeline renders end to end. It is not a
 * design decision; replace it once the 3D concept is chosen.
 */
function Form() {
  const mesh = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.18;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshBasicMaterial color="#eb0028" wireframe />
    </mesh>
  );
}

export default function ProbeScene() {
  return (
    <Scene>
      <Form />
    </Scene>
  );
}
