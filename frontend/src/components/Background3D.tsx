"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// @ts-expect-error no types for maath
import * as random from "maath/random/dist/maath-random.esm";
import { useTheme } from "next-themes";

function Starfield(props: any) {
  const ref = useRef<any>(null);
  // Generate 5000 particles in a sphere of radius 1.5
  const sphere = useMemo(() => random.inSphere(new Float32Array(5001), { radius: 1.5 }), []);
  const { theme, resolvedTheme } = useTheme();

  // Determine color based on theme (subtle white for dark, dark grey for light)
  const isDark = theme === "dark" || resolvedTheme === "dark";
  const particleColor = isDark ? "#ffffff" : "#000000";
  const opacity = isDark ? 0.8 : 0.6; // Increased opacity slightly for wow effect
  
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Base rotation
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
      
      // Interactive parallax based on mouse
      ref.current.position.x += (mouse.current.x * 0.1 - ref.current.position.x) * 0.05;
      ref.current.position.y += (mouse.current.y * 0.1 - ref.current.position.y) * 0.05;
      
      // Slight rotation follow
      ref.current.rotation.x += (mouse.current.y * 0.1) * delta;
      ref.current.rotation.y += (mouse.current.x * 0.1) * delta;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color={particleColor}
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={opacity}
        />
      </Points>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Starfield />
      </Canvas>
    </div>
  );
}
