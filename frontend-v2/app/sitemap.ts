import { MetadataRoute } from "next"
import { getPreviousRemakes } from "@/lib/get-previous-remakes"

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://movie-remake.vercel.app"

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Dynamic routes from generated movie remakes
  try {
    // Get all available movie remakes (fetch more than the 6 shown on homepage)
    const remakes = await getPreviousRemakes(100)

    const dynamicRoutes: MetadataRoute.Sitemap = remakes.map((remake) => ({
      url: `${baseUrl}/remake/${remake.movieId}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    return [...staticRoutes, ...dynamicRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return at least the static routes if dynamic routes fail
    return staticRoutes
  }
}
