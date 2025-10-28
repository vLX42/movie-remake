import {
  MovieSearchResult,
  MovieSearchResultSkeleton,
} from "@/components/movie-search-result";
import { searchMovies } from "@/lib/search-movies";
import { Suspense } from "react";
import type { PageProps } from "./page-props";

export default async function SearchPage({ params }: PageProps) {
  const searchTerm = decodeURIComponent((await params).search);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">
        Search results for "{searchTerm}"
      </h2>
      <Suspense key={searchTerm} fallback={<MovieSearchResultSkeleton />}>
        <MovieSearchResult promise={searchMovies(searchTerm)} />
      </Suspense>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const searchTerm = decodeURIComponent((await params).search)

  return {
    title: `Search: ${searchTerm} | Hollywood Movie Remake Generator`,
    description: `Search results for "${searchTerm}" - Find movies to reimagine and remake in Hollywood style`,
  }
}
