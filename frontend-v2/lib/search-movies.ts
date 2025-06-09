import "server-only"

export async function searchMovies(searchTerm: string): Promise<any> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THEMOVIEDB_API_KEY}&query=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`)
    }

    const contentType = res.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json()
      return data
    } else {
      throw new Error("Expected JSON response, but received something else.")
    }
  } catch (error) {
    console.error("Error fetching movie data:", error)
    return { results: [] }
  }
}
