"use client"

import { usePathname } from "next/navigation"
import { SearchInput } from "./search-input"

export function SearchContainer() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  const sizeClass = isHome
    ? "text-2xl md:text-3xl p-6"
    : "text-xl md:text-2xl p-4"

  return (
    <div className="mb-8">
      <SearchInput
        placeholder="Enter a movie title..."
        className={sizeClass}
      />
    </div>
  )
}
