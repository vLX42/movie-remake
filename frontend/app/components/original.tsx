// MovieSearch.tsx
import React from "react";
import styles from "./original.module.css";
import Remake from "./remake";

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  remake: any;
}

export async function OriginalMovie({
  promise,
}: {
  promise: Promise<MovieDetails>;
}) {
  const movieData = await promise;

  return (
    <div>
      {movieData ? (
        <div className={styles.blurayCover}>
          <img
            className={styles.coverImage}
            src={`https://image.tmdb.org/t/p/w200${movieData.poster_path}`}
            width="150"
            height="266.67"
            alt={movieData.title}
          />
          <div className={styles.titleLabel}>{movieData.title}</div>
        </div>
      ) : (
        <MovieCoverSkeleton />
      )}

      <Remake
        title={movieData.title}
        releaseDate={movieData.release_date}
        movieId={movieData.id}
        remake={movieData.remake}
      />
    </div>
  );
}

export const MovieCoverSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className={styles.movie}>
        <div className={styles.poster}>
          <div className={styles.skeletonPoster} />
        </div>
        <div className={styles.descption}>
          <h3 className={styles.skeletonHeadline} />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={styles.skeletonLine} />
          ))}
        </div>
      </div>
    ))}
  </>
);
