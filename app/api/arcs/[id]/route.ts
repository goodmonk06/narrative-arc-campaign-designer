import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateNarrativeArcSchema } from '@/lib/validators'

// GET /api/arcs/[id] - Get a specific narrative arc
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const arc = await prisma.narrativeArc.findUnique({
      where: { id: params.id },
      include: {
        beats: {
          orderBy: { orderIndex: 'asc' },
        },
        attachments: true,
      },
    })

    if (!arc) {
      return NextResponse.json(
        { error: 'Arc not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ arc })
  } catch (error) {
    console.error('Error fetching arc:', error)
    return NextResponse.json(
      { error: 'Failed to fetch arc' },
      { status: 500 }
    )
  }
}

// PATCH /api/arcs/[id] - Update a narrative arc
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = updateNarrativeArcSchema.parse(body)

    const updateData: any = {}
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.theme !== undefined) updateData.theme = validated.theme
    if (validated.descriptionMarkdown !== undefined) {
      updateData.descriptionMarkdown = validated.descriptionMarkdown
    }
    if (validated.horizonStart !== undefined) {
      updateData.horizonStart = new Date(validated.horizonStart)
    }
    if (validated.horizonEnd !== undefined) {
      updateData.horizonEnd = new Date(validated.horizonEnd)
    }

    const arc = await prisma.narrativeArc.update({
      where: { id: params.id },
      data: updateData,
      include: {
        beats: {
          orderBy: { orderIndex: 'asc' },
        },
        attachments: true,
      },
    })

    return NextResponse.json({ arc })
  } catch (error) {
    console.error('Error updating arc:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update arc' },
      { status: 500 }
    )
  }
}

// DELETE /api/arcs/[id] - Delete a narrative arc
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.narrativeArc.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting arc:', error)
    return NextResponse.json(
      { error: 'Failed to delete arc' },
      { status: 500 }
    )
  }
}
