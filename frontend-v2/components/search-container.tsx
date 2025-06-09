"use client"

import { SearchInput } from "./search-input"

interface SearchContainerProps {
  searchTerm?: string
  size?: "large" | "medium"
}

export function SearchContainer({ searchTerm = "", size = "large" }: SearchContainerProps) {
  const sizeClasses = {
    large: "text-2xl md:text-3xl p-6",
    medium: "text-xl md:text-2xl p-4",
  }

  return (
    <div className="mb-8">
      <SearchInput defaultValue={searchTerm} placeholder="Enter a movie title..." className={sizeClasses[size]} />
    </div>
  )
}
