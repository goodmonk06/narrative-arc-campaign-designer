import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Narrative Arc Designer
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Design compelling narrative arcs for your community.
        Create 3-12 month story arcs, break them into beats, and connect them to real-world events.
      </p>
      <Link
        href="/arcs"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        View Narrative Arcs
      </Link>
    </div>
  )
}
