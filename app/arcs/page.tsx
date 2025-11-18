import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { Calendar, ChevronRight, Plus } from 'lucide-react'

async function getArcs() {
  const arcs = await prisma.narrativeArc.findMany({
    include: {
      beats: {
        orderBy: { orderIndex: 'asc' },
      },
      attachments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return arcs
}

export default async function ArcsListPage() {
  const arcs = await getArcs()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Narrative Arcs</h1>
          <p className="text-gray-600 mt-2">
            Manage your community narrative arcs and campaigns
          </p>
        </div>
        <Link
          href="/arcs/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Arc
        </Link>
      </div>

      {arcs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No narrative arcs yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first narrative arc
          </p>
          <Link
            href="/arcs/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Your First Arc
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {arcs.map((arc) => (
            <Link
              key={arc.id}
              href={`/arcs/${arc.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {arc.title}
                    </h3>
                    {arc.theme && (
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {arc.theme}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                </div>

                {arc.descriptionMarkdown && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {arc.descriptionMarkdown}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar size={16} />
                  <span>
                    {format(new Date(arc.horizonStart), 'MMM d, yyyy')} -{' '}
                    {format(new Date(arc.horizonEnd), 'MMM d, yyyy')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900">
                      {arc.beats.length}
                    </span>
                    <span className="text-gray-600">beats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900">
                      {arc.attachments.length}
                    </span>
                    <span className="text-gray-600">attachments</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
