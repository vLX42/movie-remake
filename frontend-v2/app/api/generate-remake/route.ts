import OpenAI from "openai";
import { NextRequest } from "next/server";
import { UTApi, UTFile } from "uploadthing/server";
import { getMovie } from "@/lib/get-movie";

export const runtime = "edge";

const APP_ID = process.env.UPLOADTHING_APP_ID!;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

async function downloadImage(imageURL: string) {
  const res = await fetch(imageURL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Image download failed: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadImageWithRetry(
  imageURL: string,
  retries = 20,
  delay = 1_000
) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(imageURL, { cache: "no-store" });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      if (![403, 404].includes(res.status))
        throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries) throw err;
    }
    await new Promise((r) => setTimeout(r, delay * Math.pow(1.3, i)));
  }
  throw new Error("Image download failed (timeout)");
}

async function generateImageImagen4(prompt: string): Promise<string> {
  const res = await fetch(
    "https://api.replicate.com/v1/models/google/imagen-4/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: "16:9",
          safety_filter_level: "block_medium_and_above",
        },
      }),
    }
  );

  if (!res.ok)
    throw new Error(`Replicate error ${res.status}: ${await res.text()}`);

  const { output } = await res.json();
  if (!output?.length) throw new Error("Replicate returned no image URLs");
  return output;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const releaseDate = searchParams.get("releaseDate");
  const movieId = searchParams.get("movieId");

  if (!title || !releaseDate || !movieId) {
    return new Response("Missing title, releaseDate, or movieId", {
      status: 400,
    });
  }

  const jsonFile = `${movieId}.json`;
  const imageFile = `${movieId}.jpg`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const files = await utapi.listFiles();
        const jsonMeta = files.files.find((f) => f.name === jsonFile);
        const imgMeta = files.files.find((f) => f.name === imageFile);

        if (jsonMeta && imgMeta) {
          const jsonUrl = `https://utfs.io/f/${jsonMeta.key}`;
          const imgUrl = `https://utfs.io/f/${imgMeta.key}`;
          const cached = await (await fetch(jsonUrl)).json();
          cached.imageURL = imgUrl;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", data: cached })}

`
            )
          );
          controller.close();
          return;
        }

        const movie = await getMovie(movieId);
        const existingPlot = movie?.overview || "";

        let existingCast = "";
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.THEMOVIEDB_API_KEY}`
          );
          if (res.ok) {
            const credits = await res.json();
            const topCast = credits.cast?.slice(0, 5) || [];
            existingCast = topCast
              .map((c: any) => `${c.name} as ${c.character}`)
              .join(", ");
          }
        } catch (e) {
          console.warn("Failed to fetch cast info", e);
        }

        let synopsis = "";
        const synopsisPrompt = `Create a modern version of the movie called \"${title}\" that was released in ${releaseDate}.

Original Plot: ${existingPlot}

Main Cast: ${existingCast}

Write a maximum 275 word synopsis of the movie. Include 2–3 of these themes:
- Diverse casting
- Updated references
- Gender swaps
- Environmental themes
- Social issues (LGBTQ+, mental health)
- Expanded female roles
- Modern setting

Add a fan-service cameo from the original cast.

NO markdown code, Don't write the new title of the movie!

Pick new actors. One can be famous, maybe has done something simular in the past. Include what they're known for. Be creative when selecting actors, make a choice based on the time stamp right now`;

        const synopsisStream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          messages: [{ role: "user", content: synopsisPrompt }],
          temperature: 0.9,
          max_tokens: 650,
        });

        for await (const chunk of synopsisStream) {
          const token = chunk.choices?.[0]?.delta?.content;
          if (token) {
            synopsis += token;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "synopsis_token",
                  content: token,
                })}

`
              )
            );
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "synopsis_done" })}

`
          )
        );

        let newTitle = "";
        const newTitleStream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "You are a film‑marketing copywriter. Reply with a concise remake title only, no quotes or extra text.",
            },
            {
              role: "user",
              content: `Synopsis:
${synopsis}

Provide the new title.`,
            },
          ],
          temperature: 0.8,
          max_tokens: 20,
        });

        for await (const chunk of newTitleStream) {
          const token = chunk.choices?.[0]?.delta?.content;
          if (token) {
            newTitle += token;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "title_token",
                  content: token,
                })}

`
              )
            );
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "title_done" })}

`)
        );

        let imgPrompt = "";
        const promptStream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          messages: [
            {
              role: "user",
              content: `Based on this movie synopsis: \"${synopsis}\" and title: \"${newTitle}\", create a character poster prompt using the lead actor. No character name.
Describe the lead actor in detail, including their appearance, clothing, and any notable scene in the movie.
Brief visual style (keywords only). 185 words max. Like:
portrait of [actor], ultra realistic, moody, film grain, ultra sharp, Movie poster, etc.`,
            },
          ],
          temperature: 0.9,
          max_tokens: 100,
        });

        for await (const chunk of promptStream) {
          const token = chunk.choices?.[0]?.delta?.content;
          if (token) {
            imgPrompt += token;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "image_prompt_token",
                  content: token,
                })}

`
              )
            );
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "image_prompt_done" })}

`
          )
        );
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "image_generating",
              content: "Generating image...",
            })}

`
          )
        );

        const finalImgUrl = `https://${APP_ID}.ufs.sh/f/${movieId}.jpg`;
        const imagen4Url = await generateImageImagen4(imgPrompt);
        const imgBuffer = await downloadImageWithRetry(imagen4Url);

        const metadata = {
          originalTitle: title,
          title: newTitle,
          description: synopsis,
          imageURL: finalImgUrl,
        };

        const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: "application/json",
        });

        await utapi.uploadFiles([
          new UTFile([jsonBlob], jsonFile, {
            type: "application/json",
            customId: jsonFile,
          }),
          new UTFile([imgBuffer], imageFile, {
            type: "image/jpeg",
            customId: imageFile,
          }),
        ]);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "image_complete",
              content: finalImgUrl,
            })}

`
          )
        );
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              data: {
                originalTitle: title,
                title: newTitle,
                description: synopsis,
                imageURL: finalImgUrl,
              },
            })}

`
          )
        );
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              content: err instanceof Error ? err.message : "Unknown error",
            })}

`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
