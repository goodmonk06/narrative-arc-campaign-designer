import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createArcTemplateSchema } from '@/lib/validators'
import { withErrorHandler, getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { NotFoundError, ValidationError } from '@/lib/errors'
import { eventBus, createEvent, EVENT_TYPES } from '@/lib/events'
import { metrics, METRICS } from '@/lib/metrics'

// GET /api/templates - List all arc templates
async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const visibility = searchParams.get('visibility')
  const { page, limit, skip } = getPaginationParams(request)

  const where: any = {}
  if (category) where.category = category
  if (visibility) where.visibility = visibility

  const [templates, total] = await Promise.all([
    prisma.arcTemplate.findMany({
      where,
      include: {
        templateBeats: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            instantiatedArcs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.arcTemplate.count({ where }),
  ])

  return paginatedResponse(templates, page, limit, total)
}

// POST /api/templates - Create a new arc template
async function handlePost(request: NextRequest) {
  const body = await request.json()
  const validated = createArcTemplateSchema.parse(body)

  // Check if key already exists
  const existing = await prisma.arcTemplate.findUnique({
    where: { key: validated.key },
  })

  if (existing) {
    throw new ValidationError('Template with this key already exists')
  }

  const template = await prisma.arcTemplate.create({
    data: validated,
    include: {
      templateBeats: true,
    },
  })

  // Emit event
  await eventBus.emit(
    createEvent(EVENT_TYPES.TEMPLATE_CREATED, {
      templateId: template.id,
      key: template.key,
      name: template.name,
      category: template.category,
      createdBy: template.createdBy,
    })
  )

  // Record metric
  metrics.counter(METRICS.TEMPLATE_CREATED, 1, { category: template.category })

  return NextResponse.json({ template }, { status: 201 })
}

export const GET = withErrorHandler(handleGet)
export const POST = withErrorHandler(handlePost)
