import * as THREE from 'three';

const openings: [number, number][][] = [
  [[0.18, 0.04], [0.49, 0.32], [0.49, 0.89], [0.18, 0.89]],
  [[0.54, 0.30], [0.83, 0.56], [0.83, 0.89], [0.54, 0.89]],
];

function traceOpenings(context: CanvasRenderingContext2D, size: number) {
  for (const points of openings) {
    context.moveTo(points[0][0] * size, points[0][1] * size);
    for (const [x, y] of points.slice(1)) context.lineTo(x * size, y * size);
    context.closePath();
  }
}

/** One deterministic window-and-foliage pattern shared by the wall and the real light. */
export function createWindowSunlightTexture(forLight: boolean) {
  const canvas = document.createElement('canvas');
  const size = canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    if (forLight) {
      context.fillStyle = '#000';
      context.fillRect(0, 0, size, size);
    }

    context.save();
    context.beginPath();
    traceOpenings(context, size);
    context.shadowColor = forLight ? '#fff0d5' : 'rgba(225, 184, 118, 0.27)';
    context.shadowBlur = forLight ? 6 : 19;
    context.fillStyle = forLight ? '#fff4df' : 'rgba(231, 185, 111, 0.31)';
    context.fill();
    context.restore();

    // Broad, out-of-focus branches and leaf clusters, clipped to the sun patches.
    context.save();
    context.beginPath();
    traceOpenings(context, size);
    context.clip();
    context.filter = 'blur(4px)';
    context.strokeStyle = forLight ? '#777469' : 'rgba(82, 83, 76, 0.19)';
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(0.11 * size, 0.25 * size);
    context.bezierCurveTo(0.25 * size, 0.39 * size, 0.28 * size, 0.55 * size, 0.50 * size, 0.63 * size);
    context.moveTo(0.48 * size, 0.34 * size);
    context.bezierCurveTo(0.67 * size, 0.49 * size, 0.66 * size, 0.66 * size, 0.86 * size, 0.71 * size);
    context.stroke();

    let seed = 17;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
    context.fillStyle = forLight ? '#79776b' : 'rgba(79, 84, 75, 0.16)';
    for (const [cx, cy, width, height, count] of [
      [0.28, 0.42, 0.19, 0.20, 24],
      [0.40, 0.67, 0.13, 0.15, 16],
      [0.64, 0.53, 0.17, 0.16, 23],
      [0.77, 0.75, 0.10, 0.13, 10],
    ]) {
      for (let index = 0; index < count; index++) {
        const x = (cx + (random() - 0.5) * width * 2) * size;
        const y = (cy + (random() - 0.5) * height * 2) * size;
        context.beginPath();
        context.ellipse(x, y, (5 + random() * 10), (10 + random() * 17), random() * Math.PI, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
