import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateArcMetricsSchema } from '@/lib/validators'
import { withErrorHandler } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'

// GET /api/metrics/[id] - Get specific metrics
async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const metrics = await prisma.arcMetrics.findUnique({
    where: { id: params.id },
    include: {
      arc: {
        select: {
          id: true,
          title: true,
          communityId: true,
        },
      },
    },
  })

  if (!metrics) {
    throw new NotFoundError('Metrics', params.id)
  }

  return NextResponse.json({ metrics })
}

// PATCH /api/metrics/[id] - Update metrics
async function handlePatch(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const validated = updateArcMetricsSchema.parse(body)

  const metrics = await prisma.arcMetrics.update({
    where: { id: params.id },
    data: validated,
    include: {
      arc: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  return NextResponse.json({ metrics })
}

// DELETE /api/metrics/[id] - Delete metrics
async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.arcMetrics.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}

export const GET = withErrorHandler(handleGet)
export const PATCH = withErrorHandler(handlePatch)
export const DELETE = withErrorHandler(handleDelete)
