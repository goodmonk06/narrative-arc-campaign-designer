import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createArcMetricsSchema } from '@/lib/validators'
import { withErrorHandler, getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'
import { eventBus, createEvent, EVENT_TYPES } from '@/lib/events'

// GET /api/metrics - List metrics (filtered by arcId)
async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const arcId = searchParams.get('arcId')
  const { page, limit, skip } = getPaginationParams(request)

  if (!arcId) {
    return NextResponse.json(
      { error: 'arcId query parameter is required' },
      { status: 400 }
    )
  }

  const where = { arcId }

  const [metrics, total] = await Promise.all([
    prisma.arcMetrics.findMany({
      where,
      include: {
        arc: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { periodStart: 'desc' },
      skip,
      take: limit,
    }),
    prisma.arcMetrics.count({ where }),
  ])

  return paginatedResponse(metrics, page, limit, total)
}

// POST /api/metrics - Record new metrics
async function handlePost(request: NextRequest) {
  const body = await request.json()
  const validated = createArcMetricsSchema.parse(body)

  // Verify arc exists
  const arc = await prisma.narrativeArc.findUnique({
    where: { id: validated.arcId },
  })

  if (!arc) {
    throw new NotFoundError('Arc', validated.arcId)
  }

  const metrics = await prisma.arcMetrics.create({
    data: {
      arcId: validated.arcId,
      periodStart: new Date(validated.periodStart),
      periodEnd: new Date(validated.periodEnd),
      viewCount: validated.viewCount,
      beatCompletionRate: validated.beatCompletionRate,
      memberEngagement: validated.memberEngagement,
      commentCount: validated.commentCount,
      metricsJson: validated.metricsJson,
    },
    include: {
      arc: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  // Emit event
  await eventBus.emit(
    createEvent(EVENT_TYPES.ANALYTICS_GENERATED, {
      arcId: metrics.arcId,
      periodStart: metrics.periodStart,
      periodEnd: metrics.periodEnd,
      metricsId: metrics.id,
    })
  )

  return NextResponse.json({ metrics }, { status: 201 })
}

export const GET = withErrorHandler(handleGet)
export const POST = withErrorHandler(handlePost)
