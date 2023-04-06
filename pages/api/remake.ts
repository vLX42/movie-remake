import { OpenAIStream, OpenAIStreamPayload } from "@/lib/openAIStream";
import type { NextApiRequest, NextApiResponse } from "next";

async function generateImageEvoke(prompt: string, title: string) {
  try {
    console.log("generate image")
    const response = await fetch(
      "https://xarrreg662.execute-api.us-east-1.amazonaws.com/sdAddEle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: process.env.EVOKE_AUTH_TOKEN,
          prompt: `BOOK COVER STYLE, ${prompt}. Movie poster STYLE, action shot, highly detailed 8k --ar 9:18`,
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
    console.log("-",JSON.stringify(data))
    const imageURL = data.body.UUID;
    return imageURL;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

const DALLE_API_URL = "https://api.openai.com/v1/images/generations";

async function generateImage(prompt: string): Promise<string | null> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  const body = {
    prompt: prompt,
    model: "image-alpha-001",
    num_images: 1,
    size: "512x512",
    response_format: "url",
  };

  try {
    const response = await fetch(DALLE_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error: ${response.status}. Response body: ${errorBody}`
      );
    }

    const data = await response.json();
    const imageURL = data.data[0].url;
    return imageURL;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { title, releaseDate } = req.query;

  if (typeof title !== "string" || typeof releaseDate !== "string") {
    res.status(400).json({ error: "Missing or invalid query parameters" });
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  function getMessagesPrompt(chat:any) {
    let messages: any[] = [];

    chat.map((message: any) => {
      const role = message.name == "Me" ? "user" : "assistant";
      const m = { role: role, content: message.message };
      messages.push(m);
    });

    return messages;
  }

  async function askQuestions() {
    try {
      // Define your OpenAI API key

      // Define the conversation history as an array of objects
      const conversation = [
        {
          name: "Me",
          message: `Make a moderen remake of the movie: "${title}" from ${releaseDate}
            Update it for a modern audience, make it: woke, lgbt, diversity and add some inclusion to the plot.
            Gender swap the main charater, if the main charater is male. Find present actors for the roles, also up comming names, don't use: Zendaya. Give me a movie synopsis without the movie title, include the actors names in the synopsis `,
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
          message: `Make a AI image generation prompt for a charater poster of the main charater. Actor name in the prompt. Dont use the charaters name in the prompt. Keep the cloating close to the original charater, Describe clothing and style in great detail. Don't include the movie name. Include description of main element of the movie for the background. Don't use words like AI or Generate.  Make the response short, max 85 words`,
        },
        {
          name: "AI",
          message: "",
        },
      ];

      // Loop through each message in the conversation
      for (let i = 0; i < conversation.length; i += 2) {
        // Define the prompt as the previous message from the AI plus the current message from Me
        const prompt =
          conversation[i].message + " " + conversation[i + 1].message;

        // Define the payload for the OpenAIStream function
        const payload: OpenAIStreamPayload = {
          model: "gpt-3.5-turbo",
          messages: getMessagesPrompt(conversation.slice(0, i + 1)),
          temperature: 0.9,
          presence_penalty: 0.6,
          max_tokens: 340,
          stream: true,
        };

        // Call the OpenAIStream function with the payload and API key
        const stream = await OpenAIStream(payload);
        const reader = stream?.getReader();
        const decoder = new TextDecoder();
        let output = "";
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader?.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          output += chunkValue;
          res.write(JSON.stringify({ reply: i, message: chunkValue }) + "\n");
          // @ts-ignore:next-line
          res.flush();
        }

        console.log(`${conversation[i + 1].name}: ${output}`);

        // Save the AI's response to the conversation history
        conversation[i + 1].message = output.trim();
        console.log(conversation.slice(0, i + 1));
      }
      //generateImage
      console.log("prompt", conversation[5].message);
      res.write(
        JSON.stringify({
          reply: 6,
          message: await generateImageEvoke(conversation[5].message, title as string),
        }) + "\n"
      );
      // @ts-ignore:next-line
      res.flush();
      res.end();
    } catch (error) {
      console.error(error);
    }
  }

  // Call the askQuestions function
  askQuestions();
}
/*


  function getMessagesPrompt(chat) {
    let messages = [];



    chat.map((message) => {
      const role = message.name == "Me" ? "user" : "assistant";
      const m = { role: role, content: message.message };
      messages.push(m);
    });

    return messages;
  }



    async function askQuestions() {
      try {
        // Define your OpenAI API key
        const apiKey = 'YOUR_API_KEY';

        // Define the conversation history as an array of objects
        const conversation = [
          {
            name: 'Me',
            message: `Make a moderen remake of the movie: "${movieData.title}" from ${movieData.release_date}
            Update it for a modern audience, make it: woke, lgbt, diversity and add some inclusion to the plot.
            Gender swap the main charater, if the charater is male. Give me a movie synopsis, with the name of the actors, use present actors, don't use: Zendaya`,
          },
          {
            name: 'AI',
            message: '',
          },
          {
            name: 'Me',
            message: "What it the title of the move. Return title only",
          },
          {
            name: 'AI',
            message: '',
          },
          {
            name: 'Me',
            message: `Make a AI image generation prompt for a charater poster of the main charater, name the actor, describe clothing and style in great detail, don't include the movie name, include description of main element of the movie for the background, no copyrighted names, don't use words like AI or Generate, make the response short, max 80 words`,
          },
          {
            name: 'AI',
            message: '',
          },
        ];
    
        // Loop through each message in the conversation
        for (let i = 0; i < conversation.length; i += 2) {
          // Define the prompt as the previous message from the AI plus the current message from Me
          const prompt = conversation[i].message + ' ' + conversation[i + 1].message;


          // Define the payload for the OpenAIStream function
          const payload: OpenAIStreamPayload = {
            model: "gpt-3.5-turbo",
            messages: getMessagesPrompt(conversation.slice(0, i+1)),
            temperature: 0.9,
            presence_penalty: 0.6,
            max_tokens: 340,
            stream: true,
          };
    
          // Call the OpenAIStream function with the payload and API key
          const stream = await OpenAIStream(payload);
          const reader = stream?.getReader();
          const decoder = new TextDecoder();
          let output = "";
          let done = false;
        
          while (!done) {
            const { value, done: doneReading } = await reader?.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            output += chunkValue;
          }
        
          console.log(`${conversation[i + 1].name}: ${output}`);
    
          // Save the AI's response to the conversation history
          conversation[i + 1].message = output.trim();
        }
      } catch (error) {
        console.error(error);
      }
    }
    
    // Call the askQuestions function
    askQuestions();



*/
