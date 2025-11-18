import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCampaignAttachmentSchema } from '@/lib/validators'

// GET /api/attachments/[id] - Get a specific attachment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attachment = await prisma.campaignAttachment.findUnique({
      where: { id: params.id },
      include: {
        arc: true,
      },
    })

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ attachment })
  } catch (error) {
    console.error('Error fetching attachment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachment' },
      { status: 500 }
    )
  }
}

// PATCH /api/attachments/[id] - Update an attachment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = updateCampaignAttachmentSchema.parse(body)

    const attachment = await prisma.campaignAttachment.update({
      where: { id: params.id },
      data: validated,
      include: {
        arc: true,
      },
    })

    return NextResponse.json({ attachment })
  } catch (error) {
    console.error('Error updating attachment:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update attachment' },
      { status: 500 }
    )
  }
}

// DELETE /api/attachments/[id] - Delete an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.campaignAttachment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}
