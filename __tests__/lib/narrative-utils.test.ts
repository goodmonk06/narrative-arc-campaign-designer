import { describe, it, expect } from '@jest/globals'
import {
  sortBeatsByOrder,
  groupBeatsByMonth,
  validateBeatOrdering,
  getMonthsInRange,
  type Beat
} from '@/lib/narrative-utils'

describe('Narrative Utils', () => {
  describe('sortBeatsByOrder', () => {
    it('should sort beats by orderIndex ascending', () => {
      const beats: Beat[] = [
        { id: '1', orderIndex: 2, title: 'Second', targetMonth: '2025-02' },
        { id: '2', orderIndex: 0, title: 'First', targetMonth: '2025-01' },
        { id: '3', orderIndex: 1, title: 'Third', targetMonth: '2025-03' },
      ]

      const sorted = sortBeatsByOrder(beats)

      expect(sorted[0].orderIndex).toBe(0)
      expect(sorted[1].orderIndex).toBe(1)
      expect(sorted[2].orderIndex).toBe(2)
      expect(sorted[0].title).toBe('First')
    })

    it('should handle empty array', () => {
      const sorted = sortBeatsByOrder([])
      expect(sorted).toEqual([])
    })
  })

  describe('groupBeatsByMonth', () => {
    it('should group beats by targetMonth', () => {
      const beats: Beat[] = [
        { id: '1', orderIndex: 0, title: 'Beat 1', targetMonth: '2025-01' },
        { id: '2', orderIndex: 1, title: 'Beat 2', targetMonth: '2025-01' },
        { id: '3', orderIndex: 2, title: 'Beat 3', targetMonth: '2025-02' },
      ]

      const grouped = groupBeatsByMonth(beats)

      expect(grouped.get('2025-01')).toHaveLength(2)
      expect(grouped.get('2025-02')).toHaveLength(1)
      expect(grouped.get('2025-03')).toBeUndefined()
    })

    it('should handle empty array', () => {
      const grouped = groupBeatsByMonth([])
      expect(grouped.size).toBe(0)
    })
  })

  describe('validateBeatOrdering', () => {
    it('should return true for valid consecutive ordering', () => {
      const beats: Beat[] = [
        { id: '1', orderIndex: 0, title: 'Beat 1', targetMonth: '2025-01' },
        { id: '2', orderIndex: 1, title: 'Beat 2', targetMonth: '2025-02' },
        { id: '3', orderIndex: 2, title: 'Beat 3', targetMonth: '2025-03' },
      ]

      expect(validateBeatOrdering(beats)).toBe(true)
    })

    it('should return false for gaps in ordering', () => {
      const beats: Beat[] = [
        { id: '1', orderIndex: 0, title: 'Beat 1', targetMonth: '2025-01' },
        { id: '2', orderIndex: 2, title: 'Beat 2', targetMonth: '2025-02' },
      ]

      expect(validateBeatOrdering(beats)).toBe(false)
    })

    it('should return false for duplicate order indices', () => {
      const beats: Beat[] = [
        { id: '1', orderIndex: 0, title: 'Beat 1', targetMonth: '2025-01' },
        { id: '2', orderIndex: 0, title: 'Beat 2', targetMonth: '2025-02' },
      ]

      expect(validateBeatOrdering(beats)).toBe(false)
    })

    it('should return true for empty array', () => {
      expect(validateBeatOrdering([])).toBe(true)
    })
  })

  describe('getMonthsInRange', () => {
    it('should return all months in range', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-03-31')

      const months = getMonthsInRange(start, end)

      expect(months).toHaveLength(3)
      expect(months).toContain('2025-01')
      expect(months).toContain('2025-02')
      expect(months).toContain('2025-03')
    })

    it('should handle single month range', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-31')

      const months = getMonthsInRange(start, end)

      expect(months).toHaveLength(1)
      expect(months[0]).toBe('2025-01')
    })

    it('should handle year boundary', () => {
      const start = new Date('2024-12-01')
      const end = new Date('2025-02-28')

      const months = getMonthsInRange(start, end)

      expect(months).toHaveLength(3)
      expect(months).toContain('2024-12')
      expect(months).toContain('2025-01')
      expect(months).toContain('2025-02')
    })
  })
})
