import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateNarrativeBeatSchema } from '@/lib/validators'

// GET /api/beats/[id] - Get a specific beat
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const beat = await prisma.narrativeBeat.findUnique({
      where: { id: params.id },
      include: {
        arc: true,
      },
    })

    if (!beat) {
      return NextResponse.json(
        { error: 'Beat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ beat })
  } catch (error) {
    console.error('Error fetching beat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beat' },
      { status: 500 }
    )
  }
}

// PATCH /api/beats/[id] - Update a beat
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = updateNarrativeBeatSchema.parse(body)

    const beat = await prisma.narrativeBeat.update({
      where: { id: params.id },
      data: validated,
      include: {
        arc: true,
      },
    })

    return NextResponse.json({ beat })
  } catch (error) {
    console.error('Error updating beat:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update beat' },
      { status: 500 }
    )
  }
}

// DELETE /api/beats/[id] - Delete a beat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.narrativeBeat.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting beat:', error)
    return NextResponse.json(
      { error: 'Failed to delete beat' },
      { status: 500 }
    )
  }
}
