import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface KeychainModelProps {
    optionId: string;
    texture: THREE.CanvasTexture | null;
    isMultiSide: boolean;
}

export function KeychainModel({ optionId, texture, isMultiSide }: KeychainModelProps) {
    const group = useRef<THREE.Group>(null);
    
    // Slow rotation idle animation
    useFrame((state, delta) => {
        if (group.current) {
            // Optional: group.current.rotation.y += delta * 0.2;
        }
    });

    const thickness = 0.15; // Keychain thickness

    // Use a white basic material for the body, and the user's texture for the print areas
    const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1 }), []);
    const printMaterial = useMemo(() => {
        if (!texture) return baseMaterial;
        return new THREE.MeshStandardMaterial({ 
            map: texture, 
            roughness: 0.4,
            metalness: 0.1
        });
    }, [texture, baseMaterial]);

    // Materials array: [Side, Top, Bottom] for cylinders, [Sides, Top, Bottom, ... ] for boxes
    const cylinderMaterials = [baseMaterial, printMaterial, isMultiSide ? printMaterial : baseMaterial];
    
    const boxMaterials = [
        baseMaterial, baseMaterial, baseMaterial, baseMaterial, // sides
        printMaterial, // front
        isMultiSide ? printMaterial : baseMaterial // back
    ];

    const getGeometryAndMaterial = () => {
        switch (optionId) {
            case "llavero-circulo":
                return (
                    <group>
                        <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]} material={[baseMaterial, printMaterial, baseMaterial]} castShadow receiveShadow>
                            <cylinderGeometry args={[1.5, 1.5, thickness, 32]} />
                        </mesh>
                        {isMultiSide && (
                            <group rotation={[0, Math.PI, 0]}>
                                <mesh position={[0, 0, thickness / 2 + 0.001]} rotation={[Math.PI / 2, Math.PI / 2, 0]} material={[baseMaterial, printMaterial, baseMaterial]} castShadow receiveShadow>
                                    <cylinderGeometry args={[1.5, 1.5, 0.002, 32]} />
                                </mesh>
                            </group>
                        )}
                    </group>
                );
            case "llavero-elipse":
                return (
                    <group>
                        <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]} scale={[1, 1, 1.5]} material={[baseMaterial, printMaterial, baseMaterial]} castShadow receiveShadow>
                            <cylinderGeometry args={[1.2, 1.2, thickness, 32]} />
                        </mesh>
                        {isMultiSide && (
                            <group rotation={[0, Math.PI, 0]}>
                                <mesh position={[0, 0, thickness / 2 + 0.001]} rotation={[Math.PI / 2, Math.PI / 2, 0]} scale={[1, 1, 1.5]} material={[baseMaterial, printMaterial, baseMaterial]} castShadow receiveShadow>
                                    <cylinderGeometry args={[1.2, 1.2, 0.002, 32]} />
                                </mesh>
                            </group>
                        )}
                    </group>
                );
            case "llavero-rectangulo":
            case "llavero-credencial":
            case "llavero-portafoto":
                return (
                    <mesh material={boxMaterials} castShadow receiveShadow>
                        <boxGeometry args={[2, 3, thickness]} />
                    </mesh>
                );
            case "botinero":
                return (
                    <mesh material={boxMaterials} castShadow receiveShadow>
                        <boxGeometry args={[3, 2, thickness]} />
                    </mesh>
                );
            case "llavero-corazon-chico":
            case "llavero-corazon-grande": {
                // Heart shape extrusion
                const shape = new THREE.Shape();
                const x = 0, y = 0;
                shape.moveTo( x + 5, y + 5 );
                shape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
                shape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
                shape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
                shape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
                shape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
                shape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

                return (
                    <mesh rotation={[Math.PI, 0, 0]} scale={0.15} position={[-0.75, 1.5, 0]} castShadow receiveShadow>
                        <extrudeGeometry args={[shape, { depth: thickness / 0.15, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 }]} />
                        {/* Material mapping on extruded shapes is complex without custom UVs. We use basic material for now */}
                        <meshStandardMaterial map={texture || undefined} color={!texture ? 0xffffff : undefined} />
                    </mesh>
                );
            }
            default:
                return (
                    <mesh material={boxMaterials} castShadow receiveShadow>
                        <boxGeometry args={[2, 2, thickness]} />
                    </mesh>
                );
        }
    };

    return (
        <group ref={group}>
            {/* The metal ring for the keychain */}
            <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.3, 0.05, 16, 32]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* The keychain body */}
            {getGeometryAndMaterial()}
        </group>
    );
}
