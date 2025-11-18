'use client'

import { useState } from 'react'
import { NarrativeBeat } from '@prisma/client'
import { X } from 'lucide-react'

interface BeatEditorProps {
  arcId: string
  beat?: NarrativeBeat
  maxOrderIndex: number
  onSave: () => void
  onCancel: () => void
}

export function BeatEditor({ arcId, beat, maxOrderIndex, onSave, onCancel }: BeatEditorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Parse tags as JSON array
    const tagsInput = formData.get('tags') as string
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const data = {
      arcId,
      orderIndex: parseInt(formData.get('orderIndex') as string),
      title: formData.get('title') as string,
      descriptionMarkdown: formData.get('descriptionMarkdown') as string,
      targetMonth: formData.get('targetMonth') as string,
      tagsJson: JSON.stringify(tags),
      linkedRitualTemplateId: formData.get('linkedRitualTemplateId') as string || undefined,
      linkedCampaignId: formData.get('linkedCampaignId') as string || undefined,
    }

    try {
      const url = beat ? `/api/beats/${beat.id}` : '/api/beats'
      const method = beat ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save beat')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const defaultTags = beat?.tagsJson
    ? JSON.parse(beat.tagsJson).join(', ')
    : ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {beat ? 'Edit Beat' : 'New Beat'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={beat?.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="The Awakening"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700 mb-2">
                Order Index *
              </label>
              <input
                type="number"
                id="orderIndex"
                name="orderIndex"
                required
                min={0}
                defaultValue={beat?.orderIndex ?? maxOrderIndex + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="targetMonth" className="block text-sm font-medium text-gray-700 mb-2">
                Target Month (YYYY-MM) *
              </label>
              <input
                type="month"
                id="targetMonth"
                name="targetMonth"
                required
                defaultValue={beat?.targetMonth}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="descriptionMarkdown" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Markdown)
            </label>
            <textarea
              id="descriptionMarkdown"
              name="descriptionMarkdown"
              rows={4}
              defaultValue={beat?.descriptionMarkdown || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="A pivotal moment in the journey..."
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              defaultValue={defaultTags}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="milestone, celebration, reflection"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="linkedRitualTemplateId" className="block text-sm font-medium text-gray-700 mb-2">
                Linked Ritual Template ID
              </label>
              <input
                type="text"
                id="linkedRitualTemplateId"
                name="linkedRitualTemplateId"
                defaultValue={beat?.linkedRitualTemplateId || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ritual-template-123"
              />
            </div>

            <div>
              <label htmlFor="linkedCampaignId" className="block text-sm font-medium text-gray-700 mb-2">
                Linked Campaign ID
              </label>
              <input
                type="text"
                id="linkedCampaignId"
                name="linkedCampaignId"
                defaultValue={beat?.linkedCampaignId || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="campaign-456"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : beat ? 'Update Beat' : 'Create Beat'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
