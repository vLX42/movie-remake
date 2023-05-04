import { downloadImageWithRetry } from "./downloadImage";
import { generateImageReplicate } from "./imageGeneration";
import { getMessagesPrompt, sendEvent } from "./messageHandling";
import { OpenAIStream } from "./openAIStream";

declare var MOVIE_DATA: KVNamespace;

export async function askQuestions(title, releaseDate, movieId, writable) {
  let writer = writable.getWriter();
  try {
    const conversation = [
      {
        name: "Me",
        message: `Create a modern version of the movie called "${title}" that was released in ${releaseDate}.
          The updated the plot for a modern audience by including themes of woke-ness, LGBT representation, diversity, and inclusion into the plot.
          Include fan-service if possible with original cast members for a small unimportant cameo.
          If the main character in the original movie is male, please consider gender-swapping or racebending the character.
          Find new actors for the different roles, they should look  like the original actors. Also consider actors that are not known for mainstream movies. Don't use: Zendaya, Emma Stone, Michael B. Jordan.
          Write a maximum 400 word synopsis of the movie.
          Don't write the title of the new movie.
          Including the names of the new actors.`,
      },
      {
        name: "AI",
        message: "",
      },
      {
        name: "Me",
        message: "Find a title for this remake. Return title only",
      },
      {
        name: "AI",
        message: "",
      },
      {
        name: "Me",
        message: `Use the lead actor from the summary to create a character poster. Don't mentioning the character's name in the description use the actors name.
          Keep the appearance of the character faithful to the original, including clothing and style details.
          Use the main element of the movie for the background. Avoid using terms like "AI" or "generate."
          Keep the response brief, with no more than 85 words. Make it in a style like this:
          (cinematic portrait of ((super mario:1.0) and (princess peach:1.0):1.0) in ((avengers movie:1.0):1.0), (hyperrealism, skin, sharp detail, octane render, soft light:0.9), (by (dave dorman:1.0):1.1)`,
      },
      {
        name: "AI",
        message: "",
      },
    ];

    for (let i = 0; i < conversation.length; i += 2) {
      const payload = {
        model: "gpt-4",
        messages: getMessagesPrompt(conversation.slice(0, i + 1)),
        temperature: 0.9,
        presence_penalty: 0.6,
        max_tokens: 605,
        stream: true,
      };

      const stream = await OpenAIStream(payload);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let output = "";
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        output += chunkValue;
        await sendEvent(writer, { reply: i, message: chunkValue });
      }

      conversation[i + 1].message = output.trim();
    }

    const imageUrl = await generateImageReplicate(conversation[5].message, title);
    await sendEvent(writer, {
      reply: 6,
      message: imageUrl,
    });


    const imageResponse = await downloadImageWithRetry(imageUrl);
    if (imageResponse) {
      let storeResponse;
      try {
        // Store the image in Cloudflare Images

        const formData = new FormData();
        const blob = new Blob([imageResponse], { type: "image/png" }); // Adjust the MIME type according to the image format
        formData.append("file", blob, movieId);
        formData.append("requireSignedURLs", false);

        storeResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${IMAGES_ACCOUNT_ID}/images/v1`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${IMAGES_TOKEN}`,
            },
            body: formData,
          }
        );
      } catch (error) {
        throw new Error(`Failed ${error}`);
      }

      if (storeResponse.ok) {
        const storeResponseData = await storeResponse.json();
        const imageURLInCloudflare = storeResponseData.result.variants[0];
        const movieData = {
          title: conversation[3].message,
          description: conversation[1].message,
          imageURL: imageURLInCloudflare,
        };
        await MOVIE_DATA.put(movieId, JSON.stringify(movieData));
      } else {
        const errorText = await storeResponse.text();
        throw new Error(
          `Failed response ${storeResponse.status} (${storeResponse.statusText}): ${errorText}`
        );
      }
    }
    writer.close();

    return conversation;
  } catch (error) {
    console.error(error);
  }
}

export async function fetchAndApply(request) {
  let { readable, writable } = new TransformStream();
  var headers = new Headers();
  headers.append("Content-Type", "text/event-stream");
  headers.append("Cache-Control", "no-cache");
  headers.append("Connection", "keep-alive");
  headers.append("Access-Control-Allow-Origin", "*");
  headers.append(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Add the methods used in your application

  var init = { status: 200, statusText: "ok", headers: headers };
  const url = new URL(request.url);
  const title = url.searchParams.get("title");
  const releaseDate = url.searchParams.get("releaseDate");
  const movieId = url.searchParams.get("movieId");

  if (!title || !releaseDate || !movieId) {
    return new Response(readable, {
      ...init,
      status: 400,
      statusText: "bad request",
      body: "Title, releaseDate or MovieId is missing",
    });
  }
  // Check if the data is already in the KV store
  const existingData = await MOVIE_DATA.get(movieId);
  if (existingData) {
    const data = JSON.parse(existingData);
    let writer = writable.getWriter();
    await sendEvent(writer, { reply: 7, message: data });
  }

  askQuestions(title, releaseDate, movieId, writable);

  return new Response(readable, init);
}
