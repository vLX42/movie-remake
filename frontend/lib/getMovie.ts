import "server-only";

const APP_ID = process.env.UPLOADTHING_APP_ID; // e.g. "abcde12345"

export async function getMovie(movieId: string): Promise<any> {
  console.log("Fetching movie data for ID:", movieId);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.THEMOVIEDB_API_KEY}`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!res.ok) throw new Error(`TMDB error ${res.status}`);

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("Expected JSON from TMDB");
    }

    const data = await res.json();

    let remake = undefined;
    try {
      const customId = `${movieId}.json`;
      const url = `https://${APP_ID}.ufs.sh/f/${customId}`;

      const remakeRes = await fetch(url);
      if (remakeRes.ok) {
        remake = await remakeRes.json();
      } else {
        console.warn(`Remake not found at ${url}: ${remakeRes.status}`);
      }
    } catch (err) {
      console.warn(`Could not fetch remake JSON:`, err);
    }

    return { ...data, remake };
  } catch (err) {
    console.error("Error fetching movie data:", err);
    return { results: [] };
  }
}
