import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler } from '@/lib/api-utils'

// DELETE /api/beats/[id]/tags/[tagId] - Remove a tag from a beat
async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string; tagId: string } }
) {
  await prisma.beatTag.delete({
    where: {
      beatId_tagId: {
        beatId: params.id,
        tagId: params.tagId,
      },
    },
  })

  return NextResponse.json({ success: true })
}

export const DELETE = withErrorHandler(handleDelete)
