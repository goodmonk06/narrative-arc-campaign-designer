import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBeatCommentSchema } from '@/lib/validators'
import { withErrorHandler, getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'
import { eventBus, createEvent, EVENT_TYPES } from '@/lib/events'
import { metrics, METRICS } from '@/lib/metrics'

// GET /api/comments - List comments (filtered by beatId or arcId)
async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const beatId = searchParams.get('beatId')
  const arcId = searchParams.get('arcId')
  const resolved = searchParams.get('resolved')
  const { page, limit, skip } = getPaginationParams(request)

  const where: any = {}
  if (beatId) where.beatId = beatId
  if (resolved !== null) where.resolved = resolved === 'true'

  // If arcId provided, get all beat IDs for that arc first
  if (arcId && !beatId) {
    const beats = await prisma.narrativeBeat.findMany({
      where: { arcId },
      select: { id: true },
    })
    where.beatId = { in: beats.map((b) => b.id) }
  }

  const [comments, total] = await Promise.all([
    prisma.beatComment.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.beatComment.count({ where }),
  ])

  return paginatedResponse(comments, page, limit, total)
}

// POST /api/comments - Create a new comment
async function handlePost(request: NextRequest) {
  const body = await request.json()
  const validated = createBeatCommentSchema.parse(body)

  // Verify beat exists and get arcId
  const beat = await prisma.narrativeBeat.findUnique({
    where: { id: validated.beatId },
    select: { id: true, arcId: true },
  })

  if (!beat) {
    throw new NotFoundError('Beat', validated.beatId)
  }

  const comment = await prisma.beatComment.create({
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

  // Emit event
  await eventBus.emit(
    createEvent(EVENT_TYPES.COMMENT_CREATED, {
      commentId: comment.id,
      beatId: comment.beatId,
      arcId: beat.arcId,
      userId: comment.userId,
      type: comment.type,
    })
  )

  // Record metric
  metrics.counter(METRICS.COMMENT_CREATED, 1, { type: comment.type })

  return NextResponse.json({ comment }, { status: 201 })
}

export const GET = withErrorHandler(handleGet)
export const POST = withErrorHandler(handlePost)
