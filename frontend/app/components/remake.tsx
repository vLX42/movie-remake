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
  remake,
}: {
  releaseDate: string;
  title: string;
  movieId: number;
  remake: any;
}) => {
  const [description, setDescription] = useState(remake?.description as string|| "");
  const [remakeTitle, setRemakeTitle] = useState(remake?.title as string || "");
  const [imagePrompt, setImagePrompt] = useState(remake?.title as string || "");
  const [imageUrl, setImageUrl] = useState(remake?.imageURL as string || "");

  const delayedSetDescription = useCallback(
    (newText: string, delay: number = 200) => {
      const sentences = newText.split(/(?<=\. |\? |\! )/);
      let currentIndex = 0;

      const updateSentenceBySentence = () => {
        setDescription((prevText) => {
          if (currentIndex < sentences.length) {
            return prevText === ""
              ? sentences[currentIndex]
              : prevText + sentences[currentIndex];
          }
          return prevText;
        });
        currentIndex++;
        if (currentIndex <= sentences.length) {
          setTimeout(updateSentenceBySentence, delay);
        }
      };

      updateSentenceBySentence();
    },
    []
  );

  useEffect(() => {
    if (remake) return undefined;
    const source = new EventSource(
      `/api/remake/?dummy=value&releaseDate=${releaseDate}&title=${title}&movieId=${movieId}`
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
          break;
        case 7:
          delayedSetDescription(json.message.description, 200);
          setRemakeTitle(json.message.title);
          setImagePrompt(json.message.title);
          setImageUrl(json.message.imageURL);
          break;
        case 8:
          //all done lets close the event stream
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

      <TextFormatter text={description || ""} className={styles.description} />
      {imagePrompt && (
        <>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element

            <ReloadableImage
              src={imageUrl}
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