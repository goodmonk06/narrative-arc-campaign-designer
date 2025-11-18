'use client'

import { format, eachMonthOfInterval, parseISO } from 'date-fns'
import { NarrativeBeat } from '@prisma/client'
import { Calendar, Tag } from 'lucide-react'

interface TimelineProps {
  horizonStart: Date | string
  horizonEnd: Date | string
  beats: NarrativeBeat[]
  onBeatClick?: (beat: NarrativeBeat) => void
}

export function Timeline({ horizonStart, horizonEnd, beats, onBeatClick }: TimelineProps) {
  const start = typeof horizonStart === 'string' ? parseISO(horizonStart) : horizonStart
  const end = typeof horizonEnd === 'string' ? parseISO(horizonEnd) : horizonEnd

  // Generate all months in the range
  const months = eachMonthOfInterval({ start, end })

  // Group beats by target month
  const beatsByMonth = new Map<string, NarrativeBeat[]>()
  beats.forEach((beat) => {
    const existing = beatsByMonth.get(beat.targetMonth) || []
    beatsByMonth.set(beat.targetMonth, [...existing, beat])
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar size={24} />
        Timeline
      </h2>

      {/* Desktop: Horizontal Timeline */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-max">
          {/* Month headers */}
          <div className="flex gap-2 mb-4">
            {months.map((month) => {
              const monthKey = format(month, 'yyyy-MM')
              const monthBeats = beatsByMonth.get(monthKey) || []

              return (
                <div
                  key={monthKey}
                  className="flex-1 min-w-[180px]"
                >
                  <div className="bg-gray-100 rounded-t-lg px-3 py-2 text-center">
                    <div className="font-semibold text-gray-900">
                      {format(month, 'MMM')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(month, 'yyyy')}
                    </div>
                  </div>
                  <div className="border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg min-h-[200px] p-2 space-y-2">
                    {monthBeats.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">
                        No beats
                      </div>
                    ) : (
                      monthBeats.map((beat) => (
                        <BeatCard
                          key={beat.id}
                          beat={beat}
                          onClick={onBeatClick}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="lg:hidden space-y-4">
        {months.map((month) => {
          const monthKey = format(month, 'yyyy-MM')
          const monthBeats = beatsByMonth.get(monthKey) || []

          return (
            <div key={monthKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3">
                <div className="font-semibold text-gray-900">
                  {format(month, 'MMMM yyyy')}
                </div>
              </div>
              <div className="p-4 space-y-2">
                {monthBeats.length === 0 ? (
                  <div className="text-gray-400 text-sm">No beats this month</div>
                ) : (
                  monthBeats.map((beat) => (
                    <BeatCard
                      key={beat.id}
                      beat={beat}
                      onClick={onBeatClick}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface BeatCardProps {
  beat: NarrativeBeat
  onClick?: (beat: NarrativeBeat) => void
}

function BeatCard({ beat, onClick }: BeatCardProps) {
  const tags = beat.tagsJson ? JSON.parse(beat.tagsJson) : []

  return (
    <div
      onClick={() => onClick?.(beat)}
      className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${
        onClick ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {beat.title}
        </h4>
        <span className="text-xs text-gray-500 flex-shrink-0">
          #{beat.orderIndex}
        </span>
      </div>

      {beat.descriptionMarkdown && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {beat.descriptionMarkdown}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <Tag size={12} className="text-gray-400" />
          {tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {(beat.linkedRitualTemplateId || beat.linkedCampaignId) && (
        <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-gray-600">
          {beat.linkedRitualTemplateId && (
            <div>Ritual: {beat.linkedRitualTemplateId}</div>
          )}
          {beat.linkedCampaignId && (
            <div>Campaign: {beat.linkedCampaignId}</div>
          )}
        </div>
      )}
    </div>
  )
}
