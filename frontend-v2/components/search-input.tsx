"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

interface SearchInputProps {
  placeholder?: string
  className?: string
}

export function SearchInput({
  placeholder = "Enter a movie title...",
  className = "",
}: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ search?: string }>()

  const urlSearchTerm = params.search
    ? decodeURIComponent(params.search)
    : ""

  const [inputValue, setInputValue] = useState(urlSearchTerm)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastNavigatedRef = useRef(urlSearchTerm)

  // Sync URL → input for back/forward navigation only
  useEffect(() => {
    if (urlSearchTerm === lastNavigatedRef.current) return
    // External navigation (back/forward button)
    lastNavigatedRef.current = urlSearchTerm
    setInputValue(urlSearchTerm)
  }, [urlSearchTerm])

  const navigateToSearch = (value: string) => {
    const trimmed = value.trim()
    const encoded = encodeURIComponent(trimmed)

    if (trimmed.length >= 2) {
      lastNavigatedRef.current = trimmed
      const isOnSearchPage = pathname.startsWith("/search/")
      startTransition(() => {
        if (isOnSearchPage) {
          router.replace(`/search/${encoded}`)
        } else {
          router.push(`/search/${encoded}`)
        }
      })
    } else if (trimmed.length === 0) {
      lastNavigatedRef.current = ""
      startTransition(() => {
        router.push("/")
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      navigateToSearch(value)
    }, 300)
  }

  const invalidSearchTerm =
    inputValue.length > 0 && inputValue.length < 2

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full bg-transparent border-0 outline-0 placeholder-neutral-500 text-foreground font-body tracking-wide transition-opacity duration-200 ${
          isPending ? "opacity-75" : "opacity-100"
        } ${className}`}
        autoFocus
        autoComplete="off"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-neon-gold via-neon-red to-neon-pink"
        style={{ boxShadow: "0 1px 8px hsla(43, 96%, 56%, 0.3)" }}
      ></div>

      {isPending && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-noir-border border-t-neon-gold rounded-full animate-spin"></div>
        </div>
      )}

      {invalidSearchTerm && !isPending && (
        <div className="absolute top-full left-0 mt-2 text-sm text-muted-foreground">
          Type at least 2 characters to search...
        </div>
      )}
    </div>
  )
}
