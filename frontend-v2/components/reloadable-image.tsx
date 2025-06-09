"use client"

import { useState } from "react"

interface ReloadableImageProps {
  src: string
  width: string
  height: string
  alt: string
  className?: string
}

export function ReloadableImage({ src, width, height, alt, className }: ReloadableImageProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div className={`${className} bg-gray-800 rounded-lg flex items-center justify-center`}>
        <span className="text-gray-400">Failed to load image</span>
      </div>
    )
  }

  return (
    <img
      src={src || "/placeholder.svg"}
      width={width}
      height={height}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  )
}
