'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewArcPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      communityId: formData.get('communityId') as string,
      key: formData.get('key') as string,
      title: formData.get('title') as string,
      theme: formData.get('theme') as string,
      descriptionMarkdown: formData.get('descriptionMarkdown') as string,
      horizonStart: new Date(formData.get('horizonStart') as string).toISOString(),
      horizonEnd: new Date(formData.get('horizonEnd') as string).toISOString(),
    }

    try {
      const response = await fetch('/api/arcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create arc')
      }

      const { arc } = await response.json()
      router.push(`/arcs/${arc.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/arcs"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Arcs
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Create New Narrative Arc
      </h1>
      <p className="text-gray-600 mb-8">
        Define a story arc for your community over a 3-12 month period
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="communityId" className="block text-sm font-medium text-gray-700 mb-2">
            Community ID *
          </label>
          <input
            type="text"
            id="communityId"
            name="communityId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="community-123"
          />
        </div>

        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
            Key (unique identifier) *
          </label>
          <input
            type="text"
            id="key"
            name="key"
            required
            pattern="[a-z0-9-]+"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="year-of-expansion-2025"
          />
          <p className="text-sm text-gray-500 mt-1">
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Year of Inner Expansion"
          />
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <input
            type="text"
            id="theme"
            name="theme"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Growth and Discovery"
          />
        </div>

        <div>
          <label htmlFor="descriptionMarkdown" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Markdown)
          </label>
          <textarea
            id="descriptionMarkdown"
            name="descriptionMarkdown"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="A year-long journey focused on personal growth..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="horizonStart" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              id="horizonStart"
              name="horizonStart"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="horizonEnd" className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              id="horizonEnd"
              name="horizonEnd"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Arc'}
          </button>
          <Link
            href="/arcs"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
