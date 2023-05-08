// MovieSearch.tsx
import React from "react";
import styles from "./styles.module.css";

import Link from 'next/link';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
}

interface MovieResponse {
  results: Movie[];
}

export async function MovieSearchResult({
  promise,
}: {
  promise: Promise<MovieResponse>;
}) {
  const movieData = await promise;

  return (
    <div>
      {!!movieData ? (
        movieData.results.map((movie) => (
          <Link href={`/remake/${movie.id}`} className={styles.movieWrapper} key={movie.id}>
            <div className={styles.movie}>
              <div className={styles.poster}>
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className={styles.posterImage}
                  width={200}
                  height={300}
                />
              </div>
              <div className={styles.description}>
                <h3>{movie.title}</h3>
                <p>{movie.overview}</p>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <MovieSearchResultSkeleton />
      )}
    </div>
  );
}

export const MovieSearchResultSkeleton = () => (
  <>
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className={styles.movie}>
        <div className={styles.poster}>
          <div className={styles.skeletonPoster}></div>
        </div>
        <div className={styles.descption}>
          <h3 className={styles.skeletonHeadline}></h3>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
        </div>
      </div>
    ))}
  </>
);
