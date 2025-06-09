import { Suspense } from "react"
import Link from "next/link"
import { searchMovies } from "@/lib/search-movies"
import { MovieSearchResult, MovieSearchResultSkeleton } from "@/components/movie-search-result"
import { SearchContainer } from "@/components/search-container"

interface PageProps {
  params: { search: string }
}

export default function SearchPage({ params }: PageProps) {
  const searchTerm = decodeURIComponent(params.search)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity mb-4"
          >
            Hollywood Movie Remake Generator
          </Link>
        </div>

        {/* Search Container */}
        <SearchContainer searchTerm={searchTerm} size="medium" />

        {/* Search Results */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Search results for "{searchTerm}"</h2>
          <Suspense key={searchTerm} fallback={<MovieSearchResultSkeleton />}>
            <MovieSearchResult promise={searchMovies(searchTerm)} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const searchTerm = decodeURIComponent(params.search)

  return {
    title: `Search: ${searchTerm} | Hollywood Movie Remake Generator`,
    description: `Search results for "${searchTerm}" - Find movies to reimagine and remake in Hollywood style`,
  }
}
