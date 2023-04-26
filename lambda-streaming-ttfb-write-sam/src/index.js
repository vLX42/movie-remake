const { generateImageEvoke } = require("./generateImage");
const { OpenAIStream } = require("./openAIStream");

let fetch;
(async () => {
  const nodeFetch = await import("node-fetch");
  fetch = nodeFetch.default;
})();

const getMessagesPrompt = (chat) => {
  let messages = [];

  chat.map((message) => {
    const role = message.name == "Me" ? "user" : "assistant";
    const m = { role: role, content: message.message };
    messages.push(m);
  });

  return messages;
};

const askQuestions = async (title, releaseDate, responseStream) => {
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
        responseStream.write({ reply: i, message: chunkValue });
      }

      console.log(`${conversation[i + 1].name}: ${output}`);
      conversation[i + 1].message = output.trim();
    }

    responseStream.write({
      reply: 6,
      message: await generateImageEvoke(conversation[5].message, title),
    });

    return conversation;
  } catch (error) {
    console.error(error);
  }
};

exports.handler = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    const queryStringParameters = event.queryStringParameters;

    const title = queryStringParameters ? queryStringParameters.title : null;
    const releaseDate = queryStringParameters
      ? queryStringParameters.releaseDate
      : null;

    const httpResponseMetadata = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
    };

    responseStream = awslambda.HttpResponseStream.from(
      responseStream,
      httpResponseMetadata
    );

    if (!title || !releaseDate) {
      responseStream.write(
        JSON.stringify({
          message: "Bad Request: Missing title and/or releaseDate",
        })
      );
      responseStream.end();
      return;
    }

    await askQuestions(title, releaseDate, responseStream);

    responseStream.end();
  }
);
