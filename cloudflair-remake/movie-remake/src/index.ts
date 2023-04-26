import { createParser } from "eventsource-parser";

addEventListener("fetch", (event) => {
  event.respondWith(fetchAndApply(event.request));
});

async function generateImageEvoke(prompt, title) {
  try {
    console.log("generate image");
    const response = await fetch(
      "https://xarrreg662.execute-api.us-east-1.amazonaws.com/sdAddEle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: process.env.EVOKE_AUTH_TOKEN,
          prompt: `BOOK COVER STYLE, ${prompt}. Movie poster STYLE, action shot, include face, highly detailed 8k --ar 9:18`,
          negative_prompt:
            "bad anatomy, bad proportions, blurry, cloned face, cropped, deformed, dehydrated, disfigured, duplicate, error, extra arms, extra fingers, extra legs, extra limbs, fused fingers, gross proportions, jpeg artifacts, long neck, low quality, lowres, malformed limbs, missing arms, missing legs, morbid, mutated hands, mutation, mutilated, out of frame, poorly drawn face, poorly drawn hands, signature, text, too many fingers, ugly, username, watermark, worst quality.",
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error: ${response.status}. Response body: ${errorBody}`
      );
    }

    const data = await response.json();
    console.log("-", JSON.stringify(data));
    const imageURL = data.body.UUID;
    return imageURL;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

function getMessagesPrompt(chat) {
  let messages = [];

  chat.map((message) => {
    const role = message.name == "Me" ? "user" : "assistant";
    const m = { role: role, content: message.message };
    messages.push(m);
  });

  return messages;
}

async function OpenAIStream(payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}

async function sendEvent(writer, data) {
  console.log("send", data);
  let encoder = new TextEncoder();
  await writer.write(encoder.encode(`event: add\n`));
  await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

async function askQuestions(title, releaseDate, writable) {
  let writer = writable.getWriter();
  try {
    const conversation = [
      {
        name: "Me",
        message: `Create a modern version of the movie called "${title}" that was released in ${releaseDate}?
        The updated the plot for a modern audience by including themes of woke-ness, LGBT representation, diversity, and inclusion into the plot.
        If the main character in the original movie is male, please consider gender-swapping the character.
        Find new actors for the different roles, they should look  like the original actors. Also consider actors that are not known for mainstream movies. Don't use: Zendaya, Emma Stone, Michael B. Jordan.
        Write a medium lenght synopsis of the movie, without revealing its title.
        Including the names of the new actors`,
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
        model: "gpt-3.5-turbo",
        messages: getMessagesPrompt(conversation.slice(0, i + 1)),
        temperature: 0.9,
        presence_penalty: 0.6,
        max_tokens: 340,
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

      console.log(`${conversation[i + 1].name}: ${output}`);
      conversation[i + 1].message = output.trim();
    }

    await sendEvent(writer, {
      reply: 6,
      message: await generateImageEvoke(conversation[5].message, title),
    });

    writer.close();

    return conversation;
  } catch (error) {
    console.error(error);
  }
}

async function fetchAndApply(request) {
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
  console.log({ url: request.url.search, test: "test", title, releaseDate });
  if (!title || !releaseDate) {
    return new Response(readable, init, {
      status: 400,
      statusText: "bad request",
      body: "Title or releaseDate is missing",
    });
  }
  console.log("sss");
  askQuestions(title, releaseDate, writable);
  console.log("xxx");
  return new Response(readable, init);
}
