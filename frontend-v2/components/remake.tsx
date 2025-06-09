"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader } from "./loader"
import { ReloadableImage } from "./reloadable-image"
import { LoadingImage } from "./loading-image"
import styles from "./remake.module.css"

const TextFormatter = ({ text, className }: { text: string; className: string }) => (
  <div className={className}>
    {text.split("\n").map((p, i) => (
      <p key={i}>{p}</p>
    ))}
  </div>
)

interface CachedRemake {
  description?: string
  title?: string
  imageURL?: string
}

interface RemakeProps {
  releaseDate: string
  title: string
  movieId: number
  remake: CachedRemake | null
}

const Remake = ({ releaseDate, title, movieId, remake }: RemakeProps) => {
  const [description, setDescription] = useState(remake?.description ?? "")
  const [remakeTitle, setRemakeTitle] = useState(remake?.title ?? "")
  const [imageUrl, setImageUrl] = useState(remake?.imageURL ?? "")
  const [isImageGenerating, setIsImageGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(!!remake)

  useEffect(() => {
    if (remake) return

    const abortCtrl = new AbortController()

    const run = async () => {
      const res = await fetch(
        `/api/generate-remake?releaseDate=${releaseDate}&title=${encodeURIComponent(title)}&movieId=${movieId}`,
        { signal: abortCtrl.signal },
      )
      if (!res.ok) throw new Error("Failed to fetch remake")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      let buffer = ""
      let desc = ""
      let titleBuf = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        let sepIdx
        while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, sepIdx).trim()
          buffer = buffer.slice(sepIdx + 2)

          if (!raw.startsWith("data: ")) continue
          const payload = JSON.parse(raw.slice(6))

          switch (payload.type) {
            case "synopsis_token":
              desc += payload.content
              setDescription(desc)
              break
            case "synopsis_done":
              break
            case "title_token":
              titleBuf += payload.content
              setRemakeTitle(titleBuf)
              break
            case "title_done":
              break
            case "image_prompt_token":
              break
            case "image_prompt_done":
              break
            case "image_generating":
              setIsImageGenerating(true)
              break
            case "image_complete":
              setIsImageGenerating(false)
              setImageUrl(payload.content)
              break
            case "complete":
              setIsComplete(true)
              break
            case "error":
              console.error("Stream error:", payload.content)
              break
          }
        }
      }
    }

    run().catch((err) => console.error(err))

    return () => abortCtrl.abort()
  }, [releaseDate, title, movieId, remake])

  return (
    <div className={styles.remakeContainer}>
      <h1 className={styles.h1}>
        {remakeTitle ? (
          remakeTitle
        ) : (
          <>
            Generating <Loader />
          </>
        )}
      </h1>

      <div className={styles.contentWrapper}>
        {description && <TextFormatter text={description} className={styles.description} />}

        {imageUrl ? (
          <div className={styles.posterWrapper}>
            <ReloadableImage src={imageUrl} width="512" height="512" alt={remakeTitle} className={styles.poster} />
          </div>
        ) : isImageGenerating ? (
          <div className={styles.imageGenerating}>
            <LoadingImage />
            <p className="text-gray-300 mt-4">Creating character poster...</p>
          </div>
        ) : description ? (
          <div className={styles.imageGenerating}>
            <LoadingImage />
          </div>
        ) : null}


      </div>

      {isComplete && (
        <div className={styles.actions}>
          <Link className={styles.back} href="/">
            ← Generate another
          </Link>

          {imageUrl && (
            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className={styles.viewImage}>
              View full poster
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default Remake
