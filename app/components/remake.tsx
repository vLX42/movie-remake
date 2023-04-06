"use client";
import React, { useState, useEffect } from "react";
import { Loader } from "./loader";
import styles from "./remake.module.css";

const TextFormatter = ({ text, className }) => {
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
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/remake?releaseDate=${releaseDate}&title=${title}`
        );
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (reader) {
          let buffer = "";

          const readChunk = async () => {
            const { value, done } = await reader.read();

            if (done) {
              return;
            }

            buffer += decoder.decode(value, { stream: true });

            let newlineIndex;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
              const jsonStr = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);
              if (jsonStr !== "" && jsonStr !== "[]") {
                console.log(jsonStr);
                const json = JSON.parse(jsonStr);
                console.log({ jsonStr, json });
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
              }
            }

            readChunk();
          };

          readChunk();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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
            <img
              src={`/api/getImage?UUID=${reply4}`}
              with="512"
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
