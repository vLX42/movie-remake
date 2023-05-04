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

interface TypewriterProps {
  delay?: number;
}

const Remake = ({
  releaseDate,
  title,
  movieId,
}: {
  releaseDate: string;
  title: string;
  movieId: number;
}) => {
  const [description, setDescription] = useState("");
  const [remakeTitle, setRemakeTitle] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUUID, setImageUUID] = useState("");
  const [imageUrl, setImageUrl] = useState();

  const delayedsetDescription = useCallback(
    (newText: string, delay: number = 25) => {
      const words = newText.split(" ");
      let currentIndex = 0;

      const updateWordByWord = () => {
        setDescription((prevText) => {
          if (currentIndex < words.length) {
            return prevText === ""
              ? words[currentIndex]
              : prevText + " " + words[currentIndex];
          }
          return prevText;
        });
        currentIndex++;
        if (currentIndex <= words.length) {
          setTimeout(updateWordByWord, delay);
        }
      };

      updateWordByWord();
    },
    []
  );

  useEffect(() => {
    const source = new EventSource(
      `https://movie-remake.cloudflare1490.workers.dev/?dummy=value&releaseDate=${releaseDate}&title=${title}&movieId=${movieId}`
    );

    source.addEventListener("add", (e: any) => {
      const json = JSON.parse(e.data);
      switch (json.reply) {
        case 0:
          setDescription((prevValue) => prevValue + json.message);
          break;
        case 2:
          setRemakeTitle((prevValue) => prevValue + json.message);
          break;
        case 4:
          setImagePrompt((prevValue) => prevValue + json.message);
          break;
        case 6:
          setImageUrl(json.message);
          source.close();
          break;
        case 7:
          delayedsetDescription(json.message.description, 25);
          setRemakeTitle(json.message.title);
          setImagePrompt(json.message.title);
          setImageUrl(json.message.imageURL);
          source.close();
          break;
        default:
          break;
      }
    });

    source.onerror = (error) => {
      source.close();
      console.error("Error:", error);
    };

    // Cleanup function
    return () => {
      source.close();
    };
  }, []);

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
      {imagePrompt && (
        <>
          {imageUUID || imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element

            <ReloadableImage
              src={imageUrl ? imageUrl : `/api/getImage?UUID=${imageUUID}`}
              width="512"
              height="512"
              alt={imagePrompt}
              className={styles.poster}
            />
          ) : (
            <LoadingImage />
          )}

          <Link className={`${styles.back}`} href="/">
            ← Generate another
          </Link>
        </>
      )}
    </div>
  );
};

export default Remake;
