/**
 * Utility functions for working with narrative arcs and beats
 */

import { format, eachMonthOfInterval } from 'date-fns'

export interface Beat {
  id: string
  orderIndex: number
  title: string
  targetMonth: string
}

/**
 * Sort beats by their orderIndex in ascending order
 */
export function sortBeatsByOrder<T extends Beat>(beats: T[]): T[] {
  return [...beats].sort((a, b) => a.orderIndex - b.orderIndex)
}

/**
 * Group beats by their target month
 */
export function groupBeatsByMonth<T extends Beat>(beats: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  for (const beat of beats) {
    const existing = groups.get(beat.targetMonth) || []
    groups.set(beat.targetMonth, [...existing, beat])
  }

  return groups
}

/**
 * Validate that beats have consecutive ordering starting from 0
 */
export function validateBeatOrdering(beats: Beat[]): boolean {
  if (beats.length === 0) return true

  const sorted = sortBeatsByOrder(beats)
  const orderIndices = sorted.map(b => b.orderIndex)

  // Check for duplicates
  if (new Set(orderIndices).size !== orderIndices.length) {
    return false
  }

  // Check for consecutive ordering starting from 0
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].orderIndex !== i) {
      return false
    }
  }

  return true
}

/**
 * Get all months in a date range as YYYY-MM strings
 */
export function getMonthsInRange(start: Date, end: Date): string[] {
  const months = eachMonthOfInterval({ start, end })
  return months.map(month => format(month, 'yyyy-MM'))
}

/**
 * Reorder beats to ensure consecutive ordering
 */
export function reorderBeats<T extends Beat>(beats: T[]): T[] {
  const sorted = sortBeatsByOrder(beats)
  return sorted.map((beat, index) => ({
    ...beat,
    orderIndex: index,
  }))
}

/**
 * Calculate the next available order index
 */
export function getNextOrderIndex(beats: Beat[]): number {
  if (beats.length === 0) return 0
  return Math.max(...beats.map(b => b.orderIndex)) + 1
}
