"use client";


import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { KeychainModel } from "@/features/workshop/components/models/KeychainModel";
import { MugModel } from "@/features/workshop/components/models/MugModel";
import { ApparelModel } from "@/features/workshop/components/models/ApparelModel";

interface Viewer3DProps {
    categoryId: string;
    optionId: string;
    textureCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    isMultiSide: boolean;
}

// Helper to update the texture from the 2D canvas on every frame
function TextureUpdater({ textureCanvasRef, onTextureUpdate }: { textureCanvasRef: React.RefObject<HTMLCanvasElement | null>, onTextureUpdate: (tex: THREE.CanvasTexture) => void }) {
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

    useEffect(() => {
        if (textureCanvasRef.current) {
            const tex = new THREE.CanvasTexture(textureCanvasRef.current);
            tex.anisotropy = 16;
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
            onTextureUpdate(tex);
        }
    }, [textureCanvasRef, onTextureUpdate]);

    useFrame(() => {
        if (texture) {
            texture.needsUpdate = true;
        }
    });

    return null;
}

export default function Viewer3D({ categoryId, optionId, textureCanvasRef, isMultiSide }: Viewer3DProps) {
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

    const renderModel = () => {
        if (categoryId === "llaveros") {
            return <KeychainModel optionId={optionId} texture={texture} isMultiSide={isMultiSide} />;
        }
        if (categoryId === "chopps-tazas" || categoryId === "vasos-botellas") {
            return <MugModel optionId={optionId} texture={texture} categoryId={categoryId} />;
        }
        if (categoryId === "remeras" || categoryId === "buzos") {
            return <ApparelModel optionId={optionId} texture={texture} />;
        }
        // Fallback generic box
        return (
            <mesh>
                <boxGeometry args={[2, 2, 0.2]} />
                <meshStandardMaterial map={texture} />
            </mesh>
        );
    };

    const getCameraSettings = () => {
        if (categoryId === "remeras" || categoryId === "buzos") {
            return { position: [0, 0, 10] as [number, number, number], fov: 40 };
        }
        if (categoryId === "chopps-tazas" || categoryId === "vasos-botellas") {
            return { position: [0, 0, 8.5] as [number, number, number], fov: 40 };
        }
        // Llaveros and defaults
        return { position: [0, 0, 7] as [number, number, number], fov: 40 };
    };

    const cameraSettings = getCameraSettings();

    return (
        <div className="w-full h-full min-h-125 bg-linear-to-b from-surface to-surface-container rounded-2xl overflow-hidden relative cursor-grab active:cursor-grabbing">
            <div className="absolute top-4 left-4 z-10 bg-surface/80 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full border border-outline-variant shadow-sm text-on-surface flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                VISTA 3D INTERACTIVA
            </div>

            <div className="absolute inset-0">
                <Canvas camera={cameraSettings}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
                <directionalLight position={[-10, -10, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <Center>
                        {renderModel()}
                    </Center>

                    {textureCanvasRef.current && (
                        <TextureUpdater textureCanvasRef={textureCanvasRef} onTextureUpdate={setTexture} />
                    )}
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    target={[0, 0, 0]}
                    minDistance={3.5}
                    maxDistance={12}
                />
                </Canvas>
            </div>
        </div>
    );
}
