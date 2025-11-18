import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveCommentSchema } from '@/lib/validators'
import { withErrorHandler } from '@/lib/api-utils'
import { eventBus, createEvent, EVENT_TYPES } from '@/lib/events'
import { metrics, METRICS } from '@/lib/metrics'

// POST /api/comments/[id]/resolve - Mark comment as resolved/unresolved
async function handlePost(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const validated = resolveCommentSchema.parse(body)

  const comment = await prisma.beatComment.update({
    where: { id: params.id },
    data: {
      resolved: validated.resolved,
      resolvedAt: validated.resolved ? new Date() : null,
      resolvedBy: validated.resolvedBy || null,
    },
    include: {
      beat: {
        select: {
          id: true,
          arcId: true,
        },
      },
    },
  })

  if (validated.resolved) {
    // Emit event
    await eventBus.emit(
      createEvent(EVENT_TYPES.COMMENT_RESOLVED, {
        commentId: comment.id,
        beatId: comment.beatId,
        arcId: comment.beat.arcId,
        resolvedBy: comment.resolvedBy!,
      })
    )

    // Record metric
    metrics.counter(METRICS.COMMENT_RESOLVED, 1)
  }

  return NextResponse.json({ comment })
}

export const POST = withErrorHandler(handlePost)
