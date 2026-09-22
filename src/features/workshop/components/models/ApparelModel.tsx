import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ApparelModelProps {
    optionId: string;
    texture: THREE.CanvasTexture | null;
}

export function ApparelModel({ optionId, texture }: ApparelModelProps) {
    const group = useRef<THREE.Group>(null);
    
    // Procedural T-shirt shape
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        // Start bottom left
        s.moveTo(-1.5, -2.5);
        // Up left side
        s.lineTo(-1.5, 0.5);
        // Out to left sleeve
        s.lineTo(-3, 0.5);
        // Up sleeve
        s.lineTo(-3, 2);
        // In to shoulder
        s.lineTo(-1.5, 2.5);
        // Over to neck
        s.lineTo(-0.8, 2.5);
        // Neck hole
        s.quadraticCurveTo(0, 1.5, 0.8, 2.5);
        // Over to right shoulder
        s.lineTo(1.5, 2.5);
        // Out to right sleeve
        s.lineTo(3, 2);
        // Down sleeve
        s.lineTo(3, 0.5);
        // In to right side
        s.lineTo(1.5, 0.5);
        // Down right side
        s.lineTo(1.5, -2.5);
        // Back to start
        s.lineTo(-1.5, -2.5);
        return s;
    }, []);

    const printMaterial = useMemo(() => {
        if (!texture) return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        // Create material with texture
        return new THREE.MeshStandardMaterial({ 
            map: texture, 
            roughness: 0.8,
            color: 0xffffff
        });
    }, [texture]);

    const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), []);

    // [Sides, Front/Back]
    const materials = [baseMaterial, printMaterial];

    return (
        <group ref={group}>
            <mesh 
                castShadow 
                receiveShadow
                material={materials}
                position={[0, 0, 0]}
            >
                <extrudeGeometry args={[shape, { depth: 0.3, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 }]} />
            </mesh>
        </group>
    );
}
