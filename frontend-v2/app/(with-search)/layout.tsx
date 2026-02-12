import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SearchContainer } from "@/components/search-container"

export default function WithSearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-dark via-black to-noir-dark">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SiteHeader />
        <SearchContainer />
        {children}
      </div>
    </div>
  )
}
