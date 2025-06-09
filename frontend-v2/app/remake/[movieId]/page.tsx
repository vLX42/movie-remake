import { Suspense } from "react"
import Link from "next/link"
import { getMovie } from "@/lib/get-movie"
import { OriginalMovie, MovieCoverSkeleton } from "@/components/original-movie"
import type { Metadata } from "next"

interface PageProps {
  params: { movieId: string }
}

export default function RemakePage({ params }: PageProps) {
  const { movieId } = params

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with back link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity mb-4"
          >
            Hollywood Movie Remake Generator
          </Link>
        </div>

        {/* Movie Content */}
        <Suspense fallback={<MovieCoverSkeleton />}>
          <OriginalMovie promise={getMovie(movieId)} />
        </Suspense>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const movie = await getMovie(params.movieId)

    // Base title and description
    const title = movie.remake?.title || `${movie.title} Remake`
    const description =
      movie.remake?.description || `Generate a Hollywood remake of ${movie.title} with AI-powered creativity`

    // Image URLs
    const remakeImageUrl = movie.remake?.imageURL
    const originalImageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
    const imageUrl = remakeImageUrl || originalImageUrl

    return {
      title: `${title} | Hollywood Movie Remake Generator`,
      description: description.substring(0, 160) + (description.length > 160 ? "..." : ""),
      openGraph: {
        title: title,
        description: description.substring(0, 160) + (description.length > 160 ? "..." : ""),
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : [],
        type: "website",
        siteName: "Hollywood Movie Remake Generator",
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: description.substring(0, 160) + (description.length > 160 ? "..." : ""),
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch {
    return {
      title: "Movie Remake | Hollywood Movie Remake Generator",
      description: "Generate Hollywood movie remakes with AI-powered creativity",
    }
  }
}
