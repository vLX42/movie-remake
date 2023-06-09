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

        Write a maximum 275 word synopsis of the movie.

        The updated the plot for a modern audience by including 2-3 of these topics to the plot:
        1. Diverse casting: Remakes feature more diverse casts, promoting representation on screen.
        2. Updated references: Cultural references, jokes, or language are modernized for today's audience.
        3. Gender swaps: Key characters' genders may be swapped, offering fresh perspectives.
        4. Environmental themes: Remakes may incorporate environmental messages or eco-friendly practices.
        5. Modernized settings: Settings and backdrops are updated to reflect contemporary life.
        6. Social issues: Themes like mental health or LGBTQ+ rights may be included to raise awareness.
        7. Expanded female roles: Female characters are given more agency and complex storylines.
        8. Evolving dynamics: Character dynamics change, such as introducing same-sex relationships.
        9. Tonal shifts: The tone may be altered to fit contemporary preferences, e.g., more comedic.
        10. Reinterpretation: Remakes take creative liberties, altering storylines or characters.
        
        Include fan-service if possible with original cast members for a small unimportant cameo.
        
        Find new actors for the different roles, they should look  like the original actors. Also consider actors that are not known for mainstream movies. Also include tv-show actors if they fit the role. Only one famos actor.

        Don't write the title of the new movie.
        
        Including the names of the new actors, plus what they know for.`,
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
        message: `Use the lead actor from the summary to create a character poster.

        Don't mentioning the character's name in the description use the actors name.

        Keep the appearance of the character faithful to the original, including clothing and style details.

        Use the main element of the movie for the background. Avoid using terms like "AI" or "generate."

        Describe it in such detail that you can draw it without having seen the original.

        Keep the response brief, with no more than 85 words. 

        Keywords only

        Make it in a style like this:
        character movie poster of young [woman:Ana de Armas:0.4], highlight hair, sitting outside restaurant, wearing dress, rim lighting, studio lighting, looking at the camera, dslr, ultra quality, sharp focus, tack sharp, dof, film grain, Fujifilm XT3, crystal clear, 8K UHD, highly detailed glossy eyes, high detailed skin, skin pores
        `,
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
        max_tokens: 635,
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

    const imageUrl = await generateImageReplicate(
      conversation[5].message,
      title
    );
    await sendEvent(writer, {
      reply: 6,
      message: imageUrl,
    });

    try {
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
          console.log(`Failed ${error}`);
          await sendEvent(writer, { reply: 10, message: error });
          return `Failed ${error}`;
        }

        if (storeResponse.ok) {
          const storeResponseData = await storeResponse.json();
          const imageURLInCloudflare = storeResponseData.result.variants[0];
          const movieData = {
            originalTitle: title,
            title: conversation[3].message,
            description: conversation[1].message,
            imageURL: imageURLInCloudflare,
          };
          await MOVIE_DATA.put(movieId, JSON.stringify(movieData));
        } else {
          const errorText = await storeResponse.text();
          console.error(
            `Failed response ${storeResponse.status} (${storeResponse.statusText}): ${errorText}`
          );
          return `Failed response ${storeResponse.status} (${storeResponse.statusText}): ${errorText}`;
        }
        sendEvent(writer, { reply: 8, message: "all done" });
      }

      writer.close();

      return conversation;
    } catch (error) {
      await sendEvent(writer, { reply: 11, message: error });
      console.error(error);
    }
  } catch (error) {
    console.error("outer try", error);
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
