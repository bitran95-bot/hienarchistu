import { useMemo } from 'react';
import * as THREE from 'three';

const verticalSlats = [-10, -6, -2, 2, 6, 10];
const windowPositions = [16, 44];
const shadowOnlyMaterial = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
const verticalGeometry = new THREE.BoxGeometry(0.28, 16, 0.2);

/** Invisible window bars cast real directional-light shadows across the room. */
export function WindowSlatShadows() {
  const sunlightTarget = useMemo(() => new THREE.Object3D(), []);
  const sunlightMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#000000';
      context.fillRect(0, 0, 256, 256);
      context.fillStyle = '#fff4df';
      for (let x = 30; x < 230; x += 39) context.fillRect(x, 42, 31, 172);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <group>
      <primitive object={sunlightTarget} position={[10, -4, -3]} />
      <spotLight
        position={[-8, 14, 15]}
        target={sunlightTarget}
        map={sunlightMap}
        color="#ffe8ba"
        intensity={2.2}
        angle={0.72}
        penumbra={0.35}
        decay={0}
      />
      {windowPositions.map(x => (
        <group key={x} position={[x, 9, 6]}>
          {verticalSlats.map(offset => (
            <mesh key={offset} position={[offset, 0, 0]} geometry={verticalGeometry} material={shadowOnlyMaterial} castShadow />
          ))}
        </group>
      ))}
    </group>
  );
}
