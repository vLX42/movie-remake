import styles from "./original.module.css"
import Remake from "./remake"

interface MovieDetails {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  remake: any
  overview?: string
}

export async function OriginalMovie({
  promise,
}: {
  promise: Promise<MovieDetails>
}) {
  const movieData = await promise

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Original Movie Section - 4 columns on large screens */}
      <div className="lg:col-span-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-6">Original Movie</h2>
        {movieData ? (
          <div className={styles.blurayCover}>
            <div className={styles.posterContainer}>
              <img
                className={styles.coverImage}
                src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`}
                width="300"
                height="450"
                alt={movieData.title}
              />
              <div className={styles.titleOverlay}>
                <span>{movieData.title}</span>
                <span className={styles.releaseYear}>
                  {movieData.release_date ? new Date(movieData.release_date).getFullYear() : ""}
                </span>
              </div>
            </div>
            {movieData.overview && (
              <div className={styles.overview}>
                <h3 className="text-lg font-semibold mb-2">Original Plot</h3>
                <p>{movieData.overview}</p>
              </div>
            )}
          </div>
        ) : (
          <MovieCoverSkeleton />
        )}
      </div>

      {/* Remake Section - 8 columns on large screens */}
      <div className="lg:col-span-8 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6">Hollywood Remake</h2>
        <Remake
          title={movieData.title}
          releaseDate={movieData.release_date}
          movieId={movieData.id}
          remake={movieData.remake}
        />
      </div>
    </div>
  )
}

export const MovieCoverSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div className="lg:col-span-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-white mb-6">Original Movie</h2>
      <div className={styles.skeletonCover}>
        <div className={styles.skeletonPoster} />
        <div className={styles.skeletonTitle} />
      </div>
    </div>
    <div className="lg:col-span-8 flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-6">Hollywood Remake</h2>
      <div className={styles.skeletonRemake}>
        <div className={styles.skeletonHeadline} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonLine} />
        ))}
      </div>
    </div>
  </div>
)
