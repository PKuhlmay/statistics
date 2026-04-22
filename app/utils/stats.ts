/**
 * Pure statistical computation functions.
 * No external libraries — formulas implemented directly for learning transparency.
 */

export function mean(data: number[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, v) => sum + v, 0) / data.length
}

export function median(data: number[]): number {
  if (data.length === 0) return 0
  const sorted = [...data].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function mode(data: number[]): number[] {
  if (data.length === 0) return []
  const freq = new Map<number, number>()
  for (const v of data) {
    freq.set(v, (freq.get(v) ?? 0) + 1)
  }
  const maxFreq = Math.max(...freq.values())
  if (maxFreq === 1) return [] // no mode if all unique
  return [...freq.entries()]
    .filter(([, count]) => count === maxFreq)
    .map(([value]) => value)
    .sort((a, b) => a - b)
}

export function variance(data: number[], population = false): number {
  if (data.length < 2) return 0
  const m = mean(data)
  const sumSq = data.reduce((sum, v) => sum + (v - m) ** 2, 0)
  return sumSq / (population ? data.length : data.length - 1)
}

export function standardDeviation(data: number[], population = false): number {
  return Math.sqrt(variance(data, population))
}

export function iqr(data: number[]): { q1: number; q3: number; iqr: number } {
  if (data.length < 4) return { q1: 0, q3: 0, iqr: 0 }
  const sorted = [...data].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  return { q1, q3, iqr: q3 - q1 }
}

function quantile(sortedData: number[], q: number): number {
  const pos = q * (sortedData.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return sortedData[lo]
  return sortedData[lo] + (pos - lo) * (sortedData[hi] - sortedData[lo])
}

export function pearsonR(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0
  const mx = mean(x.slice(0, n))
  const my = mean(y.slice(0, n))
  let num = 0
  let dx2 = 0
  let dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

/** Normal distribution PDF */
export function normalPdf(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0
  const z = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
}

/** Generate n points along a normal PDF curve */
export function normalCurvePoints(
  mu: number,
  sigma: number,
  n = 200,
  range = 4,
): { x: number[]; y: number[] } {
  const xMin = mu - range * sigma
  const xMax = mu + range * sigma
  const step = (xMax - xMin) / (n - 1)
  const x: number[] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const xi = xMin + i * step
    x.push(xi)
    y.push(normalPdf(xi, mu, sigma))
  }
  return { x, y }
}

/** Generate correlated random data for a target r */
export function generateCorrelatedData(
  n: number,
  targetR: number,
  seed = 42,
): { x: number[]; y: number[] } {
  // Simple seeded PRNG (mulberry32)
  let s = seed
  const rand = (): number => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Box-Muller transform for normal distribution
  const randn = (): number => {
    const u1 = rand() || 0.0001
    const u2 = rand()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  const x: number[] = []
  const y: number[] = []
  const r = Math.max(-1, Math.min(1, targetR))

  for (let i = 0; i < n; i++) {
    const xi = randn()
    const noise = randn()
    const yi = r * xi + Math.sqrt(1 - r * r) * noise
    x.push(xi)
    y.push(yi)
  }

  return { x, y }
}
