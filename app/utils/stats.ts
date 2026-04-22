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

/** Simple OLS regression: y = beta0 + beta1 * x */
export function olsRegression(x: number[], y: number[]): {
  beta0: number
  beta1: number
  r2: number
  residuals: number[]
  predicted: number[]
} {
  const n = Math.min(x.length, y.length)
  if (n < 2) return { beta0: 0, beta1: 0, r2: 0, residuals: [], predicted: [] }

  const mx = mean(x.slice(0, n))
  const my = mean(y.slice(0, n))

  let ssXY = 0
  let ssXX = 0
  for (let i = 0; i < n; i++) {
    ssXY += (x[i] - mx) * (y[i] - my)
    ssXX += (x[i] - mx) ** 2
  }

  const beta1 = ssXX === 0 ? 0 : ssXY / ssXX
  const beta0 = my - beta1 * mx

  const predicted = x.slice(0, n).map((xi) => beta0 + beta1 * xi)
  const residuals = y.slice(0, n).map((yi, i) => yi - predicted[i])

  // R² = 1 - SS_res / SS_tot
  const ssTot = y.slice(0, n).reduce((sum, yi) => sum + (yi - my) ** 2, 0)
  const ssRes = residuals.reduce((sum, r) => sum + r * r, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { beta0, beta1, r2, residuals, predicted }
}

/** Multiple OLS regression: y = b0 + b1*x1 + b2*x2 + ... */
export function multipleRegression(
  predictors: number[][],
  y: number[],
): {
  coefficients: number[]
  intercept: number
  r2: number
  adjR2: number
  residuals: number[]
} {
  const n = y.length
  const k = predictors.length
  if (n < k + 2) return { coefficients: [], intercept: 0, r2: 0, adjR2: 0, residuals: [] }

  // Build X matrix with intercept column [1, x1, x2, ...]
  const X: number[][] = []
  for (let i = 0; i < n; i++) {
    const row = [1]
    for (let j = 0; j < k; j++) {
      row.push(predictors[j][i])
    }
    X.push(row)
  }

  // Normal equation: (X'X)^-1 X'y
  const cols = k + 1
  const XtX = matMul(transpose(X), X)
  const Xty = matVecMul(transpose(X), y)
  const XtXinv = invertMatrix(XtX)
  if (!XtXinv) return { coefficients: [], intercept: 0, r2: 0, adjR2: 0, residuals: [] }

  const beta: number[] = []
  for (let i = 0; i < cols; i++) {
    let val = 0
    for (let j = 0; j < cols; j++) {
      val += XtXinv[i][j] * Xty[j]
    }
    beta.push(val)
  }

  const intercept = beta[0]
  const coefficients = beta.slice(1)

  const predicted = X.map((row) => row.reduce((sum, xi, j) => sum + xi * beta[j], 0))
  const residuals = y.map((yi, i) => yi - predicted[i])

  const my = mean(y)
  const ssTot = y.reduce((sum, yi) => sum + (yi - my) ** 2, 0)
  const ssRes = residuals.reduce((sum, r) => sum + r * r, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  const adjR2 = 1 - ((1 - r2) * (n - 1)) / (n - k - 1)

  return { coefficients, intercept, r2, adjR2, residuals }
}

// --- Matrix helpers for multiple regression ---

function transpose(m: number[][]): number[][] {
  const rows = m.length
  const cols = m[0].length
  const t: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      t[j][i] = m[i][j]
    }
  }
  return t
}

function matMul(a: number[][], b: number[][]): number[][] {
  const rows = a.length
  const cols = b[0].length
  const inner = b.length
  const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < inner; k++) {
        result[i][j] += a[i][k] * b[k][j]
      }
    }
  }
  return result
}

function matVecMul(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((sum, val, j) => sum + val * v[j], 0))
}

function invertMatrix(m: number[][]): number[][] | null {
  const n = m.length
  // Augmented matrix [m | I]
  const aug: number[][] = m.map((row, i) => {
    const extended = [...row]
    for (let j = 0; j < n; j++) extended.push(i === j ? 1 : 0)
    return extended
  })

  for (let col = 0; col < n; col++) {
    // Pivot
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row
    }
    ;[aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]

    if (Math.abs(aug[col][col]) < 1e-12) return null

    const pivot = aug[col][col]
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot

    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const factor = aug[row][col]
      for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j]
    }
  }

  return aug.map((row) => row.slice(n))
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
