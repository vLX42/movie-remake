"use client";

import { Message } from "ai/react";
import { useChat } from "ai/react";

import { useEffect, useState } from "react";

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

export default function Chat({
  releaseDate,
  title,
  movieId,
  remake,
}: {
  releaseDate: string;
  title: string;
  movieId: number;
  remake: any;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [aiPoster, setAiPoster] = useState("");

  const generateImage = async (prompt, title) => {
    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, title }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiPoster(data.imageUrl);
      } else {
        console.error("Failed to generate image");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const {
    messages: aiImagePrompts,
    setMessages: setAiImagePromptMesssages,
    append: appendAiPrompt,
  } = useChat({
    api: "/api/chat/normal",
    onFinish: (message) => {
      console.log("ai message", message);
      generateImage(message.content, "Your title here"); // Replace "Your title here" with the desired title
    },
  });

  const {
    messages: remakeTitleMessages,
    append: appendTitle,
    setMessages,
  } = useChat({
    api: "/api/chat/normal",
    onFinish: (message) => {
      setNewTitle(message.content);
      console.log("remakeTitleMessages", remakeTitleMessages);
      setAiImagePromptMesssages([...remakeTitleMessages]);
      appendAiPrompt({
        role: "user",
        content: `Use the lead actor from the summary to create a character poster.

      Don't mentioning the character's name in the description use the actors name.

      Keep the appearance of the character faithful to the original, including clothing and style details.

      Use the main element of the movie for the background. Avoid using terms like "AI" or "generate."

      Describe it in such detail that you can draw it without having seen the original.

      Keep the response brief, with no more than 85 words.

      Keywords only

      Make it in a style like this:
      character movie poster of young [woman:Ana de Armas:0.4], highlight hair, sitting outside restaurant, wearing dress, rim lighting, studio lighting, looking at the camera, dslr, ultra quality, sharp focus, tack sharp, dof, film grain, Fujifilm XT3, crystal clear, 8K UHD, highly detailed glossy eyes, high detailed skin, skin pores
      `,
      });
    },
  });
  const { messages: plot, append } = useChat({
    onFinish: (message) => {
      setMessages([message]);
      appendTitle({
        role: "user",
        content: `Find a title for this remake. Return title only`,
      });
    },
  });

  useEffect(() => {
    append({ role: "user", content: `movieId:${movieId}` });
  }, []);

  // Generate a map of message role to text color
  const roleToColorMap: Record<Message["role"], string> = {
    system: "red",
    user: "black",
    function: "blue",
    assistant: "green",
  };

  return (
    <div>
      {/* Title Section */}
      <h1 className={styles.h1}>
        {newTitle || (
          <>
            Generating <Loader />
          </>
        )}
      </h1>

      {/* Description Section */}
      <TextFormatter
        text={plot && plot.length > 1 ? plot[1].content : ""}
        className={styles.description}
      />

      {/* Image Section */}
      {newTitle && (
        <>
          {aiPoster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <ReloadableImage
              src={aiPoster}
              width="512"
              height="512"
              alt={""}
              className={styles.poster}
            />
          ) : (
            <LoadingImage />
          )}
        </>
      )}

            {!!aiPoster &&   <Link className={`${styles.back}`} href="/">
        ← Generate another
      </Link>}

    </div>
  );
}
