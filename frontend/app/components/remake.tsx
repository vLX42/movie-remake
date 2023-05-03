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
  const [reply1, setReply1] = useState("");
  const [reply2, setReply2] = useState("");
  const [reply3, setReply3] = useState("");
  const [reply4, setReply4] = useState("");
  const [imageUrl, setImageUrl] = useState();

  const delayedSetReply1 = useCallback((newText: string, delay: number = 50) => {
    const words = newText.split(' ');
    let currentIndex = 0;

    const updateWordByWord = () => {
      setReply1((prevText) => {
        if (currentIndex < words.length) {
          return prevText === '' ? words[currentIndex] : prevText + ' ' + words[currentIndex];
        }
        return prevText;
      });
      currentIndex++;
      if (currentIndex <= words.length) {
        setTimeout(updateWordByWord, delay);
      }
    };

    updateWordByWord();
  }, []);




  useEffect(() => {
    const source = new EventSource(
      `https://movie-remake.cloudflare1490.workers.dev/?dd=xx&releaseDate=${releaseDate}&title=${title}&movieId=${movieId}`
    );

    source.addEventListener("add", (e: any) => {
      const json = JSON.parse(e.data);
      switch (json.reply) {
        case 0:
          setReply1((prevValue) => prevValue + json.message);
          break;
        case 2:
          setReply2((prevValue) => prevValue + json.message);
          break;
        case 4:
          setReply3((prevValue) => prevValue + json.message);
          break;
        case 6:
          setReply4((prevValue) => prevValue + json.message);
          source.close();
          break;
        case 7:
          delayedSetReply1(json.message.description,50);
          setReply2(json.message.title);
          setReply3(json.message.title);
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
        {reply2 || (
          <>
            Generating <Loader />
          </>
        )}
      </h1>

      <TextFormatter text={reply1} className={styles.description} />
      {reply3 && (
        <>
          {reply4 || imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element

            <ReloadableImage
              src={imageUrl ? imageUrl : `/api/getImage?UUID=${reply4}`}
              width="512"
              height="512"
              alt={reply3}
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
