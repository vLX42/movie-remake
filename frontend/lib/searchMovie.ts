import "server-only";

export async function searchMovies(searchTerm: string): Promise<any> {
  try {
    console.log(
      `https://api.themoviedb.org/3/search/movie?api_key=bc5a29d4da8fafb916e55bda9786d5f0&query=${searchTerm}`
    );
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THEMOVIEDB_API_KEY}&query=${searchTerm}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    } else {
      throw new Error(
        "Expected JSON response and custom header, but received something else."
      );
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return { results: [] };
  }
}
