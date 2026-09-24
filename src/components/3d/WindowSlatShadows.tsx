import * as THREE from 'three';

const verticalSlats = [-12, -8, -4, 0, 4, 8, 12];
const windowPositions = [16, 44];
const shadowOnlyMaterial = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
const verticalGeometry = new THREE.BoxGeometry(0.38, 22, 0.2);
const horizontalGeometry = new THREE.BoxGeometry(25, 0.38, 0.2);

/** Invisible window bars cast real directional-light shadows across the room. */
export function WindowSlatShadows() {
  return (
    <group>
      {windowPositions.map(x => (
        <group key={x} position={[x, 9, 6]}>
          {verticalSlats.map(offset => (
            <mesh key={offset} position={[offset, 0, 0]} geometry={verticalGeometry} material={shadowOnlyMaterial} castShadow />
          ))}
          <mesh position={[0, -11, 0]} geometry={horizontalGeometry} material={shadowOnlyMaterial} castShadow />
          <mesh position={[0, 11, 0]} geometry={horizontalGeometry} material={shadowOnlyMaterial} castShadow />
        </group>
      ))}
    </group>
  );
}
