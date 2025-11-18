import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateArcTemplateSchema } from '@/lib/validators'
import { withErrorHandler } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'

// GET /api/templates/[id] - Get a specific template
async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const template = await prisma.arcTemplate.findUnique({
    where: { id: params.id },
    include: {
      templateBeats: {
        orderBy: { orderIndex: 'asc' },
      },
      instantiatedArcs: {
        select: {
          id: true,
          title: true,
          communityId: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!template) {
    throw new NotFoundError('Template', params.id)
  }

  return NextResponse.json({ template })
}

// PATCH /api/templates/[id] - Update a template
async function handlePatch(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const validated = updateArcTemplateSchema.parse(body)

  const template = await prisma.arcTemplate.update({
    where: { id: params.id },
    data: validated,
    include: {
      templateBeats: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  return NextResponse.json({ template })
}

// DELETE /api/templates/[id] - Delete a template
async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.arcTemplate.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}

export const GET = withErrorHandler(handleGet)
export const PATCH = withErrorHandler(handlePatch)
export const DELETE = withErrorHandler(handleDelete)
