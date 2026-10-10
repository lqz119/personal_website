import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Symmetric Joukowski airfoil, steady incompressible potential flow,
// six-degree incidence with circulation set by the Kutta condition. This is an idealized illustration,
// not a CFD result. See https://www.grc.nasa.gov/WWW/K-12/airplane/map.html.
// The generating circle is centered at (-offset, 0) and passes through z=1.
const offset = 0.16;
const radius = 1 + offset;
const scale = 44;
const samples = 600;
const angleDegrees = 6;
const angle = angleDegrees * Math.PI / 180;
const cosine = Math.cos(angle);
const sine = Math.sin(angle);
// W = exp(-i alpha) w + R^2 exp(i alpha)/w + i k log(w/R).
// At the trailing edge w=R, dW/dw=0 requires k=2 R sin(alpha).
const circulationCoefficient = 2 * radius * sine;
const levels = [-2.3, -1.9, -1.5, -1.1, -0.8, -0.5, -0.28, -0.12,
  0.12, 0.28, 0.5, 0.8, 1.1, 1.5, 1.9, 2.3];

function map(x, y) {
  const modulusSquared = x * x + y * y;
  const mappedX = x + x / modulusSquared;
  const mappedY = y - y / modulusSquared;
  // Rotate the complete solution so the freestream is horizontal on screen.
  return [mappedX * cosine + mappedY * sine, -mappedX * sine + mappedY * cosine];
}

function streamFunction(x, y) {
  const centeredX = x + offset;
  const rSquared = centeredX * centeredX + y * y;
  return (y * cosine - centeredX * sine) * (1 - radius * radius / rSquared)
    + circulationCoefficient * Math.log(Math.sqrt(rSquared) / radius);
}

function streamline(level) {
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const x = -4 + 8 * i / samples;
    const boundarySquared = radius * radius - (x + offset) ** 2;
    let low = -6;
    let high = 6;
    // Inside the circle's x extent, choose the exterior upper/lower branch.
    // The generating-circle boundary is psi=0, including at nonzero incidence.
    if (boundarySquared > 0) {
      const boundary = Math.sqrt(boundarySquared);
      if (level > 0) low = boundary;
      else high = -boundary;
    }
    if (streamFunction(x, low) > level || streamFunction(x, high) < level) {
      throw new Error('Stream-function root is not bracketed');
    }
    for (let step = 0; step < 60; step++) {
      const mid = (low + high) / 2;
      if (streamFunction(x, mid) < level) low = mid;
      else high = mid;
    }
    const y = (low + high) / 2;
    if (Math.abs(streamFunction(x, y) - level) > 1e-10) {
      throw new Error('Stream-function contour did not converge');
    }
    if ((x + offset) ** 2 + y * y <= radius * radius) {
      throw new Error('Streamline entered the generating circle');
    }
    points.push(map(x, y));
  }
  return points;
}

const streamlines = levels.map(streamline);
// Verify the rendered polylines, not only the analytical contours: each is
// monotone in x and their interpolated heights maintain their ordering.
for (const points of streamlines) {
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] <= points[i - 1][0]) throw new Error('Non-monotone contour');
  }
}
function heightAt(points, x) {
  let index = 0;
  while (index + 1 < points.length && points[index + 1][0] < x) index++;
  const a = points[index];
  const b = points[index + 1];
  return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
}
let minimumGap = Infinity;
for (let i = 1; i < streamlines.length; i++) {
  const low = streamlines[i - 1], high = streamlines[i];
  const start = Math.max(low[0][0], high[0][0]);
  const end = Math.min(low.at(-1)[0], high.at(-1)[0]);
  const knots = [...low, ...high].map(p => p[0]).filter(x => x >= start && x < end);
  for (const x of knots) {
    const gap = heightAt(high, x) - heightAt(low, x);
    if (gap <= 0) throw new Error('Rendered streamlines intersect');
    minimumGap = Math.min(minimumGap, gap * scale);
  }
}

const body = Array.from({ length: 801 }, (_, i) => {
  const angle = 2 * Math.PI * i / 800;
  return map(-offset + radius * Math.cos(angle), radius * Math.sin(angle));
});
function isInsideAirfoil(x, y) {
  let inside = false;
  for (let i = 0, j = body.length - 1; i < body.length; j = i++) {
    const a = body[i], b = body[j];
    if ((a[1] > y) !== (b[1] > y)
        && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
for (const points of streamlines) {
  for (const [x, y] of points) {
    if (isInsideAirfoil(x, y)) throw new Error('Streamline entered the mapped airfoil');
  }
}
if (Math.abs(-2 * sine + circulationCoefficient / radius) > 1e-12) {
  throw new Error('Trailing-edge Kutta condition is not satisfied');
}
const coordinates = points => points.map(([x, y]) =>
  `${(210 + scale * x).toFixed(3)},${(135 - scale * y).toFixed(3)}`).join(' ');
const paths = streamlines
  .map(points => `    <polyline points="${coordinates(points)}"/>`).join('\n');
const leading = map(-offset - radius, 0);
const leadingX = (210 + scale * leading[0]).toFixed(3);
const leadingY = (135 - scale * leading[1]).toFixed(3);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300" role="img" aria-labelledby="title description">
  <title id="title">Idealized flow around a symmetric airfoil</title>
  <desc id="description">Non-intersecting streamlines of steady potential flow around a symmetric Joukowski airfoil at a six-degree angle of attack, with circulation satisfying the trailing-edge Kutta condition.</desc>
  <g fill="none" stroke="#7d8977" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
${paths}
  </g>
  <polygon points="${coordinates(body)}" fill="#f7f5ef" stroke="#282d2b" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M${leadingX},${leadingY} L65,275 H147" fill="none" stroke="#62665f" stroke-width="1" stroke-dasharray="3 4"/>
  <circle cx="${leadingX}" cy="${leadingY}" r="3.5" fill="#a44832"/>
  <text x="155" y="279" fill="#62665f" font-family="Arial,sans-serif" font-size="10" letter-spacing="1.4">ADAPT · LEARN · CONTROL</text>
</svg>
`;
const output = fileURLToPath(new URL('../images/airfoil-flow.svg', import.meta.url));
mkdirSync(fileURLToPath(new URL('../images/', import.meta.url)), { recursive: true });
writeFileSync(output, svg);
console.log(`Airfoil generated at ${angleDegrees} degrees: ${streamlines.length} streamlines, no intersections; minimum neighboring gap ${minimumGap.toFixed(2)} px.`);
