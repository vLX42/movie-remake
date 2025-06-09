import { SearchContainer } from "@/components/search-container"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Hollywood Movie Remake Generator
          </h1>
          <p className="text-lg text-gray-300 mb-8">Search for movies to reimagine and remake in Hollywood style</p>
        </div>

        {/* Search Container */}
        <SearchContainer size="large" />

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl text-gray-400">Start typing to search for movies to remake</p>
        </div>
      </div>
    </div>
  )
}
