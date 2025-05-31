"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "./loader";
import styles from "./remake.module.css";
import { ReloadableImage } from "./reload-image";
import { LoadingImage } from "./loading-image";
import Link from "next/link";

const TextFormatter = ({
  text,
  className,
}: {
  text: string;
  className: string;
}) => {
  const paragraphs = text
    .split("\n")
    .map((paragraph, index) => <p key={index}>{paragraph}</p>);
  return <div className={className}>{paragraphs}</div>;
};

const Remake = ({
  releaseDate,
  title,
  movieId,
  remake,
}: {
  releaseDate: string;
  title: string;
  movieId: number;
  remake: any;
}) => {
  const [description, setDescription] = useState(remake?.description || "");
  const [remakeTitle, setRemakeTitle] = useState(remake?.title || "");
  const [imageUrl, setImageUrl] = useState(remake?.imageURL || "");
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const delayedSetDescription = useCallback(
    (newText: string, delay: number = 50) => {
      const words = newText.split(" ");
      let currentIndex = 0;
      setDescription(""); // Reset description

      const updateWord = () => {
        if (currentIndex < words.length) {
          setDescription((prevText: string) => {
            return currentIndex === 0 
              ? words[currentIndex] 
              : prevText + " " + words[currentIndex];
          });
          currentIndex++;
          setTimeout(updateWord, delay);
        }
      };

      updateWord();
    },
    []
  );

  const delayedSetTitle = useCallback(
    (newTitle: string, delay: number = 100) => {
      if (!newTitle || newTitle === 'undefined') return;
      
      const chars = newTitle.split("");
      let currentIndex = 0;
      setRemakeTitle(""); // Reset title

      const updateChar = () => {
        if (currentIndex < chars.length) {
          setRemakeTitle((prevTitle: string) => prevTitle + chars[currentIndex]);
          currentIndex++;
          setTimeout(updateChar, delay);
        }
      };

      updateChar();
    },
    []
  );

  useEffect(() => {
    if (remake) {
      setIsComplete(true);
      return;
    }

    const fetchRemake = async () => {
      try {
        const response = await fetch(
          `/api/generate-remake?releaseDate=${releaseDate}&title=${encodeURIComponent(
            title
          )}&movieId=${movieId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch remake');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        let buffer = '';
        let synopsisReceived = false;
        let titleReceived = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                switch (data.type) {
                  case 'synopsis':
                    if (!synopsisReceived) {
                      synopsisReceived = true;
                      delayedSetDescription(data.content, 50);
                    }
                    break;
                    
                  case 'title':
                    if (!titleReceived && synopsisReceived && data.content && data.content !== 'undefined') {
                      titleReceived = true;
                      // Wait for description animation to finish before showing title
                      const synopsisText = description || '';
                      const descriptionWords = synopsisText.split(' ').length;
                      const descriptionDelay = Math.max(3000, descriptionWords * 50);
                      setTimeout(() => delayedSetTitle(data.content, 100), descriptionDelay);
                    }
                    break;
                    
                  case 'image_generating':
                    setIsImageGenerating(true);
                    break;
                    
                  case 'image_complete':
                    setIsImageGenerating(false);
                    setImageUrl(data.content);
                    break;
                    
                  case 'complete':
                    setIsComplete(true);
                    break;
                    
                  case 'error':
                    console.error('Stream error:', data.content);
                    break;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchRemake();
  }, [releaseDate, title, movieId, remake, delayedSetDescription, delayedSetTitle]);

  return (
    <div>
      <h1 className={styles.h1}>
        {remakeTitle || (
          <>
            Generating <Loader />
          </>
        )}
      </h1>

      <TextFormatter text={description} className={styles.description} />

      {(remakeTitle && description) && (
        <>
          {imageUrl ? (
            <ReloadableImage
              src={imageUrl}
              width="512"
              height="512"
              alt={remakeTitle}
              className={styles.poster}
            />
          ) : isImageGenerating ? (
            <div>
              <LoadingImage />
              <p>Creating character poster...</p>
            </div>
          ) : (
            <LoadingImage />
          )}
          
          {isComplete && (
            <Link className={styles.back} href="/">
              ← Generate another
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default Remake;