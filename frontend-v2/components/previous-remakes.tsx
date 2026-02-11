import Link from "next/link"
import { getPreviousRemakes } from "@/lib/get-previous-remakes"
import styles from "./previous-remakes.module.css"

export async function PreviousRemakes() {
  const remakes = await getPreviousRemakes(4)

  if (remakes.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="previous-remakes-heading">
      <h2 id="previous-remakes-heading" className={styles.heading}>
        Previously Generated Remakes
      </h2>
      <div className={styles.grid}>
        {remakes.map((remake) => (
          <Link
            key={remake.movieId}
            href={`/remake/${remake.movieId}`}
            className={styles.card}
            aria-label={`${remake.originalTitle} remade as ${remake.remakeTitle}`}
          >
            <div className={styles.posters}>
              {remake.originalPosterPath && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${remake.originalPosterPath}`}
                  alt={`Original poster for ${remake.originalTitle}`}
                  className={styles.posterOriginal}
                  loading="lazy"
                />
              )}
              {remake.remakeImageURL && (
                <img
                  src={remake.remakeImageURL}
                  alt={`Remake poster for ${remake.remakeTitle}`}
                  className={styles.posterRemake}
                  loading="lazy"
                />
              )}
            </div>
            <div className={styles.cardBody}>
              <span className={styles.label}>Original</span>
              <p className={styles.originalTitle}>{remake.originalTitle}</p>
              <span className={styles.label}>Remade as</span>
              <p className={styles.remakeTitle}>{remake.remakeTitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function PreviousRemakesSkeleton() {
  return (
    <section className={styles.section}>
      <div
        className={styles.heading}
        style={{ width: "60%", margin: "0 auto 1.5rem", height: "1.5rem", background: "linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: "loading 1.5s infinite" }}
      />
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonPosters} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
