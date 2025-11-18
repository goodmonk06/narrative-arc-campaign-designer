import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCampaignAttachmentSchema } from '@/lib/validators'

// GET /api/attachments - List attachments (optionally filtered by arcId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const arcId = searchParams.get('arcId')

    const where = arcId ? { arcId } : {}

    const attachments = await prisma.campaignAttachment.findMany({
      where,
      include: {
        arc: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ attachments })
  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

// POST /api/attachments - Create a new campaign attachment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createCampaignAttachmentSchema.parse(body)

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

    const attachment = await prisma.campaignAttachment.create({
      data: validated,
      include: {
        arc: true,
      },
    })

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (error) {
    console.error('Error creating attachment:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create attachment' },
      { status: 500 }
    )
  }
}
