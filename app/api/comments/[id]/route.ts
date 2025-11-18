import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateBeatCommentSchema, resolveCommentSchema } from '@/lib/validators'
import { withErrorHandler } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'
import { eventBus, createEvent, EVENT_TYPES } from '@/lib/events'
import { metrics, METRICS } from '@/lib/metrics'

// GET /api/comments/[id] - Get a specific comment
async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const comment = await prisma.beatComment.findUnique({
    where: { id: params.id },
    include: {
      beat: {
        select: {
          id: true,
          title: true,
          arcId: true,
        },
      },
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!comment) {
    throw new NotFoundError('Comment', params.id)
  }

  return NextResponse.json({ comment })
}

// PATCH /api/comments/[id] - Update a comment
async function handlePatch(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const validated = updateBeatCommentSchema.parse(body)

  const comment = await prisma.beatComment.update({
    where: { id: params.id },
    data: validated,
    include: {
      beat: {
        select: {
          id: true,
          title: true,
          arcId: true,
        },
      },
    },
  })

  return NextResponse.json({ comment })
}

// DELETE /api/comments/[id] - Delete a comment
async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.beatComment.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}

export const GET = withErrorHandler(handleGet)
export const PATCH = withErrorHandler(handlePatch)
export const DELETE = withErrorHandler(handleDelete)
