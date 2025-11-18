import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNarrativeBeatSchema } from '@/lib/validators'

// GET /api/beats - List beats (optionally filtered by arcId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const arcId = searchParams.get('arcId')

    const where = arcId ? { arcId } : {}

    const beats = await prisma.narrativeBeat.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        arc: true,
      },
    })

    return NextResponse.json({ beats })
  } catch (error) {
    console.error('Error fetching beats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beats' },
      { status: 500 }
    )
  }
}

// POST /api/beats - Create a new narrative beat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createNarrativeBeatSchema.parse(body)

    // Check if arc exists
    const arc = await prisma.narrativeArc.findUnique({
      where: { id: validated.arcId },
    })

    if (!arc) {
      return NextResponse.json(
        { error: 'Arc not found' },
        { status: 404 }
      )
    }

    const beat = await prisma.narrativeBeat.create({
      data: validated,
      include: {
        arc: true,
      },
    })

    return NextResponse.json({ beat }, { status: 201 })
  } catch (error) {
    console.error('Error creating beat:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create beat' },
      { status: 500 }
    )
  }
}
