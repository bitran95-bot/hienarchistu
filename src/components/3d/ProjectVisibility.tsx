import { useMemo, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Frustum, Matrix4, Sphere, Vector3 } from 'three';
import { ProjectSpotlight } from './ProjectSpotlight';

/** Prefetch just outside the camera, with a margin to avoid flicker at the edge. */
export function ProjectVisibility({ position, night, children }: { position: [number, number, number]; night: boolean; children: ReactNode }) {
  const camera = useThree(state => state.camera);
  const bounds = useMemo(() => new Sphere(new Vector3(position[0], position[1] - 3.9, position[2] - 1), 7), [position]);
  const exitBounds = useMemo(() => new Sphere(bounds.center, 9), [bounds]);
  const frustum = useMemo(() => new Frustum(), []);
  const matrix = useMemo(() => new Matrix4(), []);
  const [visible, setVisible] = useState(() => {
    camera.updateMatrixWorld();
    return frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)).intersectsSphere(bounds);
  });
  useFrame(() => {
    const next = frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)).intersectsSphere(visible ? exitBounds : bounds);
    if (next !== visible) setVisible(next);
  });
  return visible ? <>{night && <ProjectSpotlight position={position} />}{children}</> : null;
}
