import { MetadataRoute } from "next"
import { getPreviousRemakes } from "@/lib/get-previous-remakes"
import { baseUrl } from "@/lib/config"

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: now,
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
      lastModified: now,
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
