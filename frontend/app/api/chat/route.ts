import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
} from "openai-edge/types/api";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

interface MovieDetails {
  title: string;
  overview: string;
  genres: string[];
  releaseDate: string;
  director: string;
  mainCast: string[];
}

  const functions: ChatCompletionFunctions[] = [
    {
      name: "get_movie_info",
      description: "Get movie information based on movieId",
      parameters: {
        type: "object",
        properties: {
          movieId: {
            type: "string",

            description: "The movieId",
          },
        },
        required: ["movieId"],
      },
    },
  ];

function processMovieRequest(
  messages: ChatCompletionRequestMessage[]
): ChatCompletionRequestMessage[] {
  const movieMessageIndex = messages.findIndex(
    (message) =>
      message.role === "user" && message.content?.includes("movieId:")
  );

  if (movieMessageIndex !== 0) {
    return messages; // No movieId found in the messages, so return the original messages.
  }

  const movieIdMatch =
    messages[movieMessageIndex].content?.match(/movieId:(\d+)/);
  if (!movieIdMatch) {
    return messages; // Invalid movieId format in the message, so return the original messages.
  }

  const movieId = movieIdMatch[1];
  const topics = [
    "Diverse casting: Remakes feature more diverse casts, promoting representation on screen.",
    "Updated references: Cultural references, jokes, or language are modernized for today's audience.",
    "Gender swaps: Key characters' genders may be swapped, offering fresh perspectives.",
    "Environmental themes: Remakes may incorporate environmental messages or eco-friendly practices.",
    "Modernized settings: Settings and backdrops are updated to reflect contemporary life.",
    "Social issues: Themes like mental health or LGBTQ+ rights may be included to raise awareness.",
    "Expanded female roles: Female characters are given more agency and complex storylines.",
    "Evolving dynamics: Character dynamics change, such as introducing same-sex relationships.",
    "Tonal shifts: The tone may be altered to fit contemporary preferences, e.g., more comedic.",
    "Reinterpretation: Remakes take creative liberties, altering storylines or characters.",
  ];

  // Randomly select 2-3 topics for the plot.
  const selectedTopics = topics
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 2);

  let response = `Create a modern version of the movie with the movieId: ${movieId}.\n\n`;
  response +=
    "Do not use the movidId in the response, only use the title from the response.\n\n";
  response += "Write a maximum 275 word synopsis of the movie.\n\n";
  response += "The updated plot for a modern audience includes:\n";
  response += selectedTopics.join("\n") + "\n\n";
  response +=
    "Include fan-service if possible with original cast members for a small unimportant cameo.\n\n";
  response +=
    "Find new actors for the different roles, they should look like the original actors. Also consider actors that are not known for mainstream movies. Also include tv-show actors if they fit the role. Only one famous actor.\n\n";
  response += "Don't write the title of the new movie.\n\n";
  response += "Including the names of the new actors, plus what they know for.";

  messages[movieMessageIndex].content = response;

  return messages;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const movieMessageIndex = messages.findIndex(
    (message:Message) =>
      message.role === "user" && message.content?.includes("movieId:")
  );
  const replacedMessages = processMovieRequest(messages);
  const response = await openai.createChatCompletion({
    model: "gpt-4-0613",
    stream: true,
    messages: replacedMessages,
    functions ,
  });

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages
    ) => {

      if (name === "get_movie_info") {
        const API_KEY: string = process.env.THEMOVIEDB_API_KEY!;
        const movieEndpoint: string = `https://api.themoviedb.org/3/movie/${args.movieId}?api_key=${API_KEY}`;
        const creditsEndpoint: string = `https://api.themoviedb.org/3/movie/${args.movieId}/credits?api_key=${API_KEY}`;

        let newMessages;
        try {
          const movieResponse = await fetch(movieEndpoint);
          const creditsResponse = await fetch(creditsEndpoint);

          const movieData: any = await movieResponse.json();
          const creditsData: any = await creditsResponse.json();

          const director: any = creditsData.crew.find(
            (person: any) => person.job === "Director"
          );

          const movieDetails: MovieDetails = {
            title: movieData.title,
            overview: movieData.overview,
            genres: movieData.genres.map((genre: any) => genre.name),
            releaseDate: movieData.release_date,
            director: director ? director.name : "N/A",
            mainCast: creditsData.cast
              .slice(0, 5)
              .map(
                (actor: any) =>
                  `${actor.name}${actor.character && ` (${actor.character})`}`
              ),
          };

          console.log("feched data", movieDetails);
          newMessages = createFunctionCallMessages(movieDetails as any);
        } catch (error) {
          console.error("Error fetching movie details:", error);
          return "Failed to fetch movie details.";
        }


        return openai.createChatCompletion({
          messages: [...messages, ...newMessages],
          stream: true,
          model: "gpt-4-0613",
          functions,
        });
      }
    },
  });

  return new StreamingTextResponse(stream);
}
