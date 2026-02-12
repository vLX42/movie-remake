import styles from "./styles.module.css"
import Link from "next/link"

interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
}

interface MovieResponse {
  results: Movie[]
}

export async function MovieSearchResult({
  promise,
}: {
  promise: Promise<MovieResponse>
}) {
  const movieData = await promise

  if (!movieData || !movieData.results || movieData.results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🎭</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No movies found</h3>
        <p className="text-muted-foreground">Try searching with a different movie title</p>
      </div>
    )
  }

  return (
    <div>
      {movieData.results.map((movie) => (
        <Link href={`/remake/${movie.id}`} className={styles.movieWrapper} key={movie.id}>
          <div className={styles.movie}>
            <div className={styles.poster}>
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className={styles.posterImage}
                  width={200}
                  height={300}
                />
              ) : (
                <div className="w-[200px] h-[300px] bg-noir-card rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-4xl">🎬</span>
                </div>
              )}
            </div>
            <div className={styles.description}>
              <h3>{movie.title}</h3>
              <p>{movie.overview || "No description available."}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export const MovieSearchResultSkeleton = () => (
  <>
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className={styles.movie}>
        <div className={styles.poster}>
          <div className={styles.skeletonPoster}></div>
        </div>
        <div className={styles.description}>
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
)
