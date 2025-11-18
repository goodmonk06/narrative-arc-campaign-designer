import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addTagToBeatSchema } from '@/lib/validators'
import { withErrorHandler } from '@/lib/api-utils'
import { NotFoundError, ValidationError } from '@/lib/errors'

// GET /api/beats/[id]/tags - Get all tags for a beat
async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const beatTags = await prisma.beatTag.findMany({
    where: { beatId: params.id },
    include: {
      tag: true,
    },
  })

  const tags = beatTags.map((bt) => bt.tag)

  return NextResponse.json({ tags })
}

// POST /api/beats/[id]/tags - Add a tag to a beat
async function handlePost(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { tagId } = body

  if (!tagId) {
    throw new ValidationError('tagId is required')
  }

  // Verify beat exists
  const beat = await prisma.narrativeBeat.findUnique({
    where: { id: params.id },
  })

  if (!beat) {
    throw new NotFoundError('Beat', params.id)
  }

  // Verify tag exists
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  })

  if (!tag) {
    throw new NotFoundError('Tag', tagId)
  }

  // Create the association
  try {
    await prisma.beatTag.create({
      data: {
        beatId: params.id,
        tagId,
      },
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ValidationError('Tag already added to this beat')
    }
    throw error
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

export const GET = withErrorHandler(handleGet)
export const POST = withErrorHandler(handlePost)
