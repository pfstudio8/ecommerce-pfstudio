import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface MugModelProps {
    optionId: string;
    texture: THREE.CanvasTexture | null;
    categoryId: string;
}

export function MugModel({ optionId, texture, categoryId }: MugModelProps) {
    const group = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (group.current) {
            group.current.rotation.y -= delta * 0.1;
        }
    });

    const isChopp = optionId.includes("chopp");
    const isMagic = optionId === "taza-magica";
    const isGlass = optionId === "chopp-vidrio";

    // --- Materials ---
    
    const baseColor = isMagic ? 0x1c1c1c : 0xffffff;
    const baseRoughness = isMagic ? 0.9 : 0.1; // Magic mug is ultra matte
    const baseMetalness = 0.05;

    // Exterior material (where the print goes)
    const exteriorMaterial = useMemo(() => {
        if (isGlass) {
            // Frosted Glass Material
            return new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transmission: 0.9, // glass-like
                opacity: 1,
                roughness: 0.4, // frosted
                ior: 1.5,
                thickness: 0.5,
                map: texture || null,
            });
        }
        
        return new THREE.MeshStandardMaterial({ 
            color: baseColor,
            roughness: texture ? 0.3 : baseRoughness,
            metalness: baseMetalness,
            map: texture || null
        });
    }, [texture, isGlass, baseColor, baseRoughness]);

    // Unprinted parts material (handle, base, etc)
    const bodyMaterial = useMemo(() => {
        if (isGlass) return exteriorMaterial; // Glass is glass everywhere
        return new THREE.MeshStandardMaterial({ 
            color: baseColor, 
            roughness: baseRoughness, 
            metalness: baseMetalness 
        });
    }, [isGlass, exteriorMaterial, baseColor, baseRoughness]);

    // Interior material (usually white and glossy for ceramic mugs)
    const interiorMaterial = useMemo(() => {
        if (isGlass) return exteriorMaterial;
        return new THREE.MeshStandardMaterial({ 
            color: 0xf8f9fa, 
            roughness: 0.1, 
            metalness: 0.05,
            side: THREE.BackSide 
        });
    }, [isGlass, exteriorMaterial]);


    // --- Geometries ---

    // Ear-shaped handle for standard mugs
    const mugHandleCurve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(1.4, 0.9, 0),
            new THREE.Vector3(2.3, 0.9, 0),
            new THREE.Vector3(2.5, 0.2, 0),
            new THREE.Vector3(2.2, -0.8, 0),
            new THREE.Vector3(1.4, -1.0, 0),
        ]);
    }, []);

    // Thick geometric handle for chopps with thumb rest
    const choppHandleShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 1.4); // top attach point
        shape.lineTo(1.0, 1.4); // thumb rest
        shape.lineTo(1.4, 1.0);
        shape.lineTo(1.4, -1.2);
        shape.lineTo(0.5, -1.8);
        shape.lineTo(0, -1.8); // bottom attach point
        
        // inner cutout
        shape.lineTo(0, -1.3);
        shape.lineTo(0.3, -1.3);
        shape.lineTo(0.8, -0.8);
        shape.lineTo(0.8, 0.8);
        shape.lineTo(0, 0.8);
        
        return shape;
    }, []);


    if (isChopp) {
        // Chopp Dimensions: taller, thicker base
        const radius = 1.6;
        const height = 4.5;
        const thickness = 0.2;
        
        return (
            <group ref={group}>
                {/* Exterior Body */}
                <mesh material={[exteriorMaterial, bodyMaterial, bodyMaterial]} castShadow receiveShadow>
                    <cylinderGeometry args={[radius, radius, height, 64]} />
                </mesh>
                
                {/* Interior Body (Starts higher to simulate thick glass base) */}
                <mesh position={[0, 0.3, 0]}>
                    <cylinderGeometry args={[radius - thickness, radius - thickness, height - 0.6, 64]} />
                    <meshStandardMaterial color={0xffffff} roughness={isGlass ? 0.4 : 0.1} side={THREE.BackSide} />
                </mesh>
                
                {/* Top Lip smooth edge */}
                <mesh position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[radius - thickness / 2, thickness / 2, 16, 64]} />
                    <primitive object={bodyMaterial} attach="material" />
                </mesh>

                {/* Chopp Handle */}
                <mesh position={[radius - 0.1, 0, -0.3]} castShadow>
                    <extrudeGeometry args={[choppHandleShape, { depth: 0.6, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 }]} />
                    <primitive object={bodyMaterial} attach="material" />
                </mesh>
            </group>
        );
    }

    // Standard Mug Dimensions
    const radius = 1.5;
    const height = 3.2;
    const thickness = 0.15;

    return (
        <group ref={group}>
            {/* Exterior Body */}
            <mesh material={[exteriorMaterial, bodyMaterial, bodyMaterial]} castShadow receiveShadow>
                <cylinderGeometry args={[radius, radius, height, 64]} />
            </mesh>
            
            {/* Interior Body */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[radius - thickness, radius - thickness, height - 0.2, 64]} />
                <primitive object={interiorMaterial} attach="material" />
            </mesh>

            {/* Top Lip smooth edge */}
            <mesh position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius - thickness / 2, thickness / 2, 16, 64]} />
                {/* Lip color should match interior if it's a magic mug so the rim is white, or match exterior if standard */}
                <primitive object={isMagic ? interiorMaterial : bodyMaterial} attach="material" />
            </mesh>

            {/* Classic Mug Handle */}
            <mesh castShadow>
                <tubeGeometry args={[mugHandleCurve, 32, 0.25, 16, false]} />
                <primitive object={bodyMaterial} attach="material" />
            </mesh>
        </group>
    );
}
