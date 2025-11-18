import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reorderBeatsSchema } from '@/lib/validators'

// POST /api/beats/reorder - Reorder beats
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = reorderBeatsSchema.parse(body)

    // Update each beat's orderIndex based on position in the array
    const updatePromises = validated.beatIds.map((beatId, index) =>
      prisma.narrativeBeat.update({
        where: { id: beatId },
        data: { orderIndex: index },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering beats:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to reorder beats' },
      { status: 500 }
    )
  }
}
