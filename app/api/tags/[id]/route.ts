import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTagSchema } from '@/lib/validators'
import { withErrorHandler } from '@/lib/api-utils'
import { NotFoundError } from '@/lib/errors'

// GET /api/tags/[id] - Get a specific tag
async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tag = await prisma.tag.findUnique({
    where: { id: params.id },
    include: {
      beats: {
        include: {
          beat: {
            select: {
              id: true,
              title: true,
              arcId: true,
            },
          },
        },
      },
    },
  })

  if (!tag) {
    throw new NotFoundError('Tag', params.id)
  }

  return NextResponse.json({ tag })
}

// PATCH /api/tags/[id] - Update a tag
async function handlePatch(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const validated = updateTagSchema.parse(body)

  const tag = await prisma.tag.update({
    where: { id: params.id },
    data: validated,
  })

  return NextResponse.json({ tag })
}

// DELETE /api/tags/[id] - Delete a tag
async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.tag.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}

export const GET = withErrorHandler(handleGet)
export const PATCH = withErrorHandler(handlePatch)
export const DELETE = withErrorHandler(handleDelete)
