import { describe, it, expect } from 'vitest'
import { mean, median } from '~/utils/stats'

describe('stats utilities', () => {
  it('calculates mean correctly', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3)
  })

  it('calculates median correctly', () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3)
  })
})
