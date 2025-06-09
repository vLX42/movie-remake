"use client"

import type React from "react"

import { useState, useEffect, useTransition, useRef } from "react"
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

  // Sync internal state with defaultValue prop when it changes
  useEffect(() => {
    setSearchTerm(defaultValue)
  }, [defaultValue])

  // Maintain focus after transitions
  useEffect(() => {
    if (inputRef.current && !isPending) {
      inputRef.current.focus()
    }
  }, [isPending, defaultValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        const encodedTerm = encodeURIComponent(value.trim())
        // Only navigate if the current search term is different from the URL
        if (encodedTerm !== encodeURIComponent(defaultValue)) {
          startTransition(() => {
            router.push(`/search/${encodedTerm}`)
          })
        }
      } else if (value.trim().length === 0) {
        // If search is cleared, go back to home
        startTransition(() => {
          router.push("/")
        })
      }
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
        style={{
          background: "none",
          border: "none",
          boxShadow: "none",
        }}
        autoFocus
        autoComplete="off"
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>

      {/* Loading indicator */}
      {isPending && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Character count hint */}
      {searchTerm.length > 0 && searchTerm.length < 2 && !isPending && (
        <div className="absolute top-full left-0 mt-2 text-sm text-gray-400">
          Type at least 2 characters to search...
        </div>
      )}
    </div>
  )
}
