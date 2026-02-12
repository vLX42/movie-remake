"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  const gradientClasses =
    "font-display uppercase tracking-wider bg-gradient-to-r from-neon-gold via-neon-red to-neon-pink bg-clip-text text-transparent animate-neon-pulse"

  if (isHome) {
    return (
      <div className="text-center mb-12">
        <h1 className={`text-4xl md:text-6xl ${gradientClasses} mb-4`}>
          Hollywood Movie Remake Generator
        </h1>
        <p className="text-lg text-muted-foreground font-body mb-8">
          Search for movies to reimagine and remake in Hollywood style
        </p>
      </div>
    )
  }

  return (
    <div className="text-center mb-8">
      <Link
        href="/"
        className={`inline-block text-2xl md:text-4xl ${gradientClasses} hover:opacity-80 transition-opacity mb-4`}
      >
        Hollywood Movie Remake Generator
      </Link>
    </div>
  )
}
