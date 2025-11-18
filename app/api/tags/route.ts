import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTagSchema } from '@/lib/validators'
import { withErrorHandler, getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { ValidationError } from '@/lib/errors'

// GET /api/tags - List all tags
async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const { page, limit, skip } = getPaginationParams(request)

  const where = category ? { category } : {}

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            beats: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.tag.count({ where }),
  ])

  return paginatedResponse(tags, page, limit, total)
}

// POST /api/tags - Create a new tag
async function handlePost(request: NextRequest) {
  const body = await request.json()
  const validated = createTagSchema.parse(body)

  // Check if tag name already exists
  const existing = await prisma.tag.findUnique({
    where: { name: validated.name },
  })

  if (existing) {
    throw new ValidationError('Tag with this name already exists')
  }

  const tag = await prisma.tag.create({
    data: validated,
  })

  return NextResponse.json({ tag }, { status: 201 })
}

export const GET = withErrorHandler(handleGet)
export const POST = withErrorHandler(handlePost)
