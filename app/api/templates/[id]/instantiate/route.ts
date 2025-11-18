import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { instantiateTemplateSchema } from '@/lib/validators'
import { withErrorHandler } from '@/lib/api-utils'
import { NotFoundError, ValidationError } from '@/lib/errors'
import { eventBus, createEvent, EVENT_TYPES } from '@/lib/events'
import { metrics, METRICS } from '@/lib/metrics'
import { addMonths, format } from 'date-fns'

// POST /api/templates/[id]/instantiate - Create an arc from a template
async function handlePost(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const validated = instantiateTemplateSchema.parse(body)

  // Get template with beats
  const template = await prisma.arcTemplate.findUnique({
    where: { id: params.id },
    include: {
      templateBeats: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  if (!template) {
    throw new NotFoundError('Template', params.id)
  }

  // Check if arc key already exists
  const existingArc = await prisma.narrativeArc.findUnique({
    where: { key: validated.key },
  })

  if (existingArc) {
    throw new ValidationError('Arc with this key already exists')
  }

  // Calculate horizon end based on template duration
  const horizonStart = new Date(validated.horizonStart)
  const horizonEnd = addMonths(horizonStart, template.durationMonths)

  // Create arc and beats in a transaction
  const arc = await prisma.$transaction(async (tx) => {
    // Create the arc
    const createdArc = await tx.narrativeArc.create({
      data: {
        communityId: validated.communityId,
        key: validated.key,
        title: validated.title,
        theme: template.name,
        descriptionMarkdown: template.description,
        horizonStart,
        horizonEnd,
        status: 'DRAFT',
        templateId: template.id,
        metadataJson: JSON.stringify({
          instantiatedFrom: template.key,
          templateVersion: '1.0',
        }),
      },
    })

    // Create beats from template beats
    const beatPromises = template.templateBeats.map((templateBeat) => {
      const targetDate = addMonths(horizonStart, templateBeat.suggestedMonth)
      const targetMonth = format(targetDate, 'yyyy-MM')

      return tx.narrativeBeat.create({
        data: {
          arcId: createdArc.id,
          orderIndex: templateBeat.orderIndex,
          title: templateBeat.title,
          descriptionMarkdown: templateBeat.descriptionMarkdown,
          targetMonth,
          status: 'PENDING',
        },
      })
    })

    await Promise.all(beatPromises)

    // Return arc with beats
    return tx.narrativeArc.findUnique({
      where: { id: createdArc.id },
      include: {
        beats: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })
  })

  // Emit event
  await eventBus.emit(
    createEvent(EVENT_TYPES.TEMPLATE_INSTANTIATED, {
      templateId: template.id,
      arcId: arc!.id,
      communityId: validated.communityId,
      instantiatedBy: undefined, // TODO: Get from auth context
    })
  )

  // Record metric
  metrics.counter(METRICS.TEMPLATE_INSTANTIATED, 1, {
    templateKey: template.key,
    category: template.category,
  })

  return NextResponse.json({ arc }, { status: 201 })
}

export const POST = withErrorHandler(handlePost)
