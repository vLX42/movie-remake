"use client";
import React, { useState, useEffect } from "react";
import { Loader } from "./loader";
import styles from "./remake.module.css";

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
}: {
  releaseDate: string;
  title: string;
}) => {
  const [reply1, setReply1] = useState("");
  const [reply2, setReply2] = useState("");
  const [reply3, setReply3] = useState("");
  const [reply4, setReply4] = useState("");

  useEffect(() => {
    const source = new EventSource( `/api/remake?releaseDate=${releaseDate}&title=${title}`);

    source.addEventListener("add", (e: any) => {
        console.log(e)
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
            break;
          default:
            break;
        }
    });


    source.onerror = (error) => {
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
          {reply4 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/getImage?UUID=${reply4}`}
              width="512"
              height="512"
              alt={reply3}
            />
          ) : (
            <div className={styles.loadingImage}>
              <h1>
                Generating poster
                <Loader />
              </h1>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Remake;
