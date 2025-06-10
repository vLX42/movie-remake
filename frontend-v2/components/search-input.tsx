"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"

interface SearchInputProps {
  defaultValue?: string
  placeholder?: string
  className?: string
}

export function SearchInput({
  defaultValue = "",
  placeholder = "Enter a movie title...",
  className = "",
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setSearchTerm(defaultValue)
  }, [defaultValue])

  const navigateToSearch = (value: string) => {
    const trimmed = value.trim()
    const encoded = encodeURIComponent(trimmed)
    const current = encodeURIComponent(defaultValue.trim())

    if (trimmed.length >= 2 && encoded !== current) {
      startTransition(() => {
        router.push(`/search/${encoded}`)
      })
    } else if (trimmed.length === 0) {
      startTransition(() => {
        router.push("/")
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      navigateToSearch(value)
    }, 300)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full bg-transparent border-0 outline-0 placeholder-gray-500 text-white font-light transition-opacity duration-200 ${
          isPending ? "opacity-75" : "opacity-100"
        } ${className}`}
        autoFocus
        autoComplete="off"
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>

      {isPending && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      )}

      {searchTerm.length > 0 && searchTerm.length < 2 && !isPending && (
        <div className="absolute top-full left-0 mt-2 text-sm text-gray-400">
          Type at least 2 characters to search...
        </div>
      )}
    </div>
  )
}
