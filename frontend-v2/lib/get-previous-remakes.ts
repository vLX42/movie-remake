import "server-only"
import { UTApi } from "uploadthing/server"

const APP_ID = process.env.UPLOADTHING_APP_ID

export interface PreviousRemake {
  movieId: string
  originalTitle: string
  originalPosterPath: string
  remakeTitle: string
  remakeDescription: string
  remakeImageURL: string
}

const utapi = new UTApi()

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function getPreviousRemakes(count = 4): Promise<PreviousRemake[]> {
  try {
    const { files } = await utapi.listFiles()

    const jsonFiles = files.filter((f) => f.name.endsWith(".json"))
    if (jsonFiles.length === 0) return []

    const picked = shuffle(jsonFiles).slice(0, Math.min(count, jsonFiles.length))

    const results = await Promise.allSettled(
      picked.map(async (file) => {
        const movieId = file.name.replace(".json", "")

        const [remakeRes, tmdbRes] = await Promise.all([
          fetch(`https://${APP_ID}.ufs.sh/f/${movieId}.json`, {
            next: { revalidate: 3600 },
          }),
          fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.THEMOVIEDB_API_KEY}`,
            { next: { revalidate: 3600 } }
          ),
        ])

        if (!remakeRes.ok || !tmdbRes.ok) {
          throw new Error(`Failed to fetch data for movie ${movieId}`)
        }

        const remake = await remakeRes.json()
        const tmdb = await tmdbRes.json()

        return {
          movieId,
          originalTitle: tmdb.title,
          originalPosterPath: tmdb.poster_path,
          remakeTitle: remake.title,
          remakeDescription: remake.description,
          remakeImageURL: remake.imageURL,
        } satisfies PreviousRemake
      })
    )

    return results
      .filter(
        (r): r is PromiseFulfilledResult<PreviousRemake> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value)
  } catch (err) {
    console.error("Error fetching previous remakes:", err)
    return []
  }
}
