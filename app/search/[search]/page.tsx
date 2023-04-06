import { Suspense } from "react";
import {
  MovieSearchResult,
  MovieSearchResultSkeleton,
} from "../../components/result";
import { searchMovies } from "../../../lib/searchMovie";

export default async function Page({ params }: { params: { search: string } }) {
  const movieData = await searchMovies(params.search);
  return (
    <Suspense fallback={<MovieSearchResultSkeleton />}>
      {/* @ts-expect-error Async Server Component */}
      <MovieSearchResult promise={movieData} />
    </Suspense>
  );
}
