// MovieSearch.tsx
import React from "react";
import styles from "./original.module.css";

import { Configuration, OpenAIApi } from "openai";
import Remake from "./remake";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface MovieDetails {
  // Properties
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: object | null;
  budget: number;
  genres: Array<{ id: number; name: string }>;
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
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
      {!!movieData ? (
        <>
          <div className={styles.blurayCover}>
            <img
              className={styles.coverImage}
              src={`https://image.tmdb.org/t/p/w200${movieData.poster_path}`}
              width="150"
              height="200"
              alt={movieData.title}
            />
            <div className={styles.titleLabel}>{movieData.title}</div>
          </div>
        </>
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
