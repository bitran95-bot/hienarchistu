import * as THREE from 'three';

const verticalSlats = [-10, -6, -2, 2, 6, 10];
const windowPositions = [16, 44];
const shadowOnlyMaterial = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
const verticalGeometry = new THREE.BoxGeometry(0.28, 16, 0.2);

/** Invisible window bars cast real directional-light shadows across the room. */
export function WindowSlatShadows() {
  return (
    <group>
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
