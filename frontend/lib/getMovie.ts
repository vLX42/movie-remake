import "server-only";

const endpoint = (key: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.KV_ACCOUNT_ID}/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}/values/${key}`;

const fetchEndpoint = async (movieId: string): Promise<any> => {
  const response = await fetch(endpoint(movieId), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_KV_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return { result: data };
};

export async function getMovie(movieId: string): Promise<any> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.THEMOVIEDB_API_KEY}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      const { result } = await fetchEndpoint(movieId);
      return { ...data, remake: result?.success == false ? undefined : result };
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
