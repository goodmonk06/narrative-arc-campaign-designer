'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Edit, Plus, Trash2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Timeline } from '@/components/timeline'
import { BeatEditor } from '@/components/beat-editor'

interface NarrativeArc {
  id: string
  communityId: string
  key: string
  title: string
  theme?: string
  descriptionMarkdown?: string
  horizonStart: string
  horizonEnd: string
  createdAt: string
  beats: NarrativeBeat[]
  attachments: CampaignAttachment[]
}

interface NarrativeBeat {
  id: string
  arcId: string
  orderIndex: number
  title: string
  descriptionMarkdown?: string
  targetMonth: string
  tagsJson?: string
  linkedRitualTemplateId?: string
  linkedCampaignId?: string
}

interface CampaignAttachment {
  id: string
  arcId: string
  externalSystem: string
  externalRef: string
  descriptionMarkdown?: string
}

export default function ArcDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [arc, setArc] = useState<NarrativeArc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBeatEditor, setShowBeatEditor] = useState(false)
  const [editingBeat, setEditingBeat] = useState<NarrativeBeat | undefined>()

  useEffect(() => {
    loadArc()
  }, [params.id])

  async function loadArc() {
    try {
      const response = await fetch(`/api/arcs/${params.id}`)
      if (!response.ok) throw new Error('Failed to load arc')
      const data = await response.json()
      setArc(data.arc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteArc() {
    if (!confirm('Are you sure you want to delete this arc? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/arcs/${params.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete arc')
      router.push('/arcs')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete arc')
    }
  }

  async function handleDeleteBeat(beatId: string) {
    if (!confirm('Are you sure you want to delete this beat?')) {
      return
    }

    try {
      const response = await fetch(`/api/beats/${beatId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete beat')
      await loadArc()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete beat')
    }
  }

  function handleBeatClick(beat: NarrativeBeat) {
    setEditingBeat(beat)
    setShowBeatEditor(true)
  }

  function handleNewBeat() {
    setEditingBeat(undefined)
    setShowBeatEditor(true)
  }

  function handleBeatSaved() {
    setShowBeatEditor(false)
    setEditingBeat(undefined)
    loadArc()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error || !arc) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error || 'Arc not found'}</div>
      </div>
    )
  }

  const maxOrderIndex = Math.max(...arc.beats.map(b => b.orderIndex), -1)

  return (
    <div>
      <Link
        href="/arcs"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Arcs
      </Link>

      {/* Arc Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{arc.title}</h1>
            {arc.theme && (
              <p className="text-lg text-blue-600 font-medium mb-2">{arc.theme}</p>
            )}
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Calendar size={18} />
              <span>
                {format(new Date(arc.horizonStart), 'MMM d, yyyy')} -{' '}
                {format(new Date(arc.horizonEnd), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <button
            onClick={handleDeleteArc}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete arc"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {arc.descriptionMarkdown && (
          <div className="prose max-w-none text-gray-600 mb-4">
            {arc.descriptionMarkdown}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Community:</span> {arc.communityId}
          </div>
          <div>
            <span className="font-medium">Key:</span> {arc.key}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Narrative Beats</h2>
        <button
          onClick={handleNewBeat}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Beat
        </button>
      </div>

      {/* Timeline */}
      <Timeline
        horizonStart={arc.horizonStart}
        horizonEnd={arc.horizonEnd}
        beats={arc.beats}
        onBeatClick={handleBeatClick}
      />

      {/* Beats List */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">All Beats</h3>
        {arc.beats.length === 0 ? (
          <p className="text-gray-600">No beats yet. Add your first beat to get started.</p>
        ) : (
          <div className="space-y-3">
            {arc.beats.map((beat) => (
              <div
                key={beat.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm text-gray-500">#{beat.orderIndex}</span>
                    <h4 className="font-medium text-gray-900">{beat.title}</h4>
                    <span className="text-sm text-gray-600">{beat.targetMonth}</span>
                  </div>
                  {beat.descriptionMarkdown && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {beat.descriptionMarkdown}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBeatClick(beat)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit beat"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteBeat(beat.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete beat"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      {arc.attachments.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Campaign Attachments</h3>
          <div className="space-y-3">
            {arc.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {attachment.externalSystem}
                    </span>
                    <ExternalLink size={14} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Ref: {attachment.externalRef}</p>
                  {attachment.descriptionMarkdown && (
                    <p className="text-sm text-gray-600 mt-1">
                      {attachment.descriptionMarkdown}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beat Editor Modal */}
      {showBeatEditor && (
        <BeatEditor
          arcId={arc.id}
          beat={editingBeat}
          maxOrderIndex={maxOrderIndex}
          onSave={handleBeatSaved}
          onCancel={() => {
            setShowBeatEditor(false)
            setEditingBeat(undefined)
          }}
        />
      )}
    </div>
  )
}
