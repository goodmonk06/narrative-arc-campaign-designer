import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNarrativeArcSchema } from '@/lib/validators'

// GET /api/arcs - List all narrative arcs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId')

    const where = communityId ? { communityId } : {}

    const arcs = await prisma.narrativeArc.findMany({
      where,
      include: {
        beats: {
          orderBy: { orderIndex: 'asc' },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ arcs })
  } catch (error) {
    console.error('Error fetching arcs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch arcs' },
      { status: 500 }
    )
  }
}

// POST /api/arcs - Create a new narrative arc
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createNarrativeArcSchema.parse(body)

    // Check if key already exists
    const existing = await prisma.narrativeArc.findUnique({
      where: { key: validated.key },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Arc with this key already exists' },
        { status: 409 }
      )
    }

    const arc = await prisma.narrativeArc.create({
      data: {
        communityId: validated.communityId,
        key: validated.key,
        title: validated.title,
        theme: validated.theme,
        descriptionMarkdown: validated.descriptionMarkdown,
        horizonStart: new Date(validated.horizonStart),
        horizonEnd: new Date(validated.horizonEnd),
      },
      include: {
        beats: true,
        attachments: true,
      },
    })

    return NextResponse.json({ arc }, { status: 201 })
  } catch (error) {
    console.error('Error creating arc:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create arc' },
      { status: 500 }
    )
  }
}
