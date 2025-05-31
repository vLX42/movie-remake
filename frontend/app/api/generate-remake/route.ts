import OpenAI from "openai";
import { NextRequest } from "next/server";
import { UTApi, UTFile } from "uploadthing/server";

export const runtime = "edge";

const APP_ID = process.env.UPLOADTHING_APP_ID; // e.g. "abcde12345"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

async function downloadImageWithRetry(imageURL: string, retries = 10, delay = 600) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(imageURL);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } catch {}
    if (i < retries) await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Image download failed");
}

async function generateImageReplicate(prompt: string) {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "7ca7f0d3a51cd993449541539270971d38a24d9a0d42f073caf25190d41346d7",
      input: {
        prompt,
        width: 512,
        height: 512,
        negative_prompt:
          "lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck"
      }
    })
  });

  const { id } = await response.json();

  while (true) {
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    const result = await poll.json();
    if (result.status === "succeeded") return result.output[result.output.length - 1];
    if (result.status === "failed") throw new Error("Image generation failed");
    await new Promise((r) => setTimeout(r, 1000));
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const releaseDate = searchParams.get("releaseDate");
  const movieId = searchParams.get("movieId");

  if (!title || !releaseDate || !movieId) {
    return new Response("Missing title, releaseDate, or movieId", { status: 400 });
  }

  const jsonFile = `${movieId}.json`;
  const imageFile = `${movieId}.jpg`;

  // Check UploadThing cache first
  try {
    const files = await utapi.listFiles();
    const jsonFileMeta = files.files.find((f) => f.name === jsonFile);
    const imageFileMeta = files.files.find((f) => f.name === imageFile);
    console.log(imageFileMeta, jsonFileMeta);
    if (jsonFileMeta && imageFileMeta) {
      const jsonUrl = `https://utfs.io/f/${jsonFileMeta.key}`;
      const imageUrl = `https://utfs.io/f/${imageFileMeta.key}`;
      const res = await fetch(jsonUrl);
      if (res.ok) {
        const cached = await res.json();
        cached.imageURL = imageUrl;
        return new Response(JSON.stringify(cached), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  } catch (err) {
    console.warn(`No cache hit for ${movieId}:`, err);
  }

  // Create a streaming response
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Generate movie synopsis
        const synopsisPrompt = `Create a modern version of the movie called "${title}" that was released in ${releaseDate}.

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

Pick new actors. One can be famous. Include what they're known for.`;

        const synopsisResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: synopsisPrompt }],
          temperature: 0.9,
          max_tokens: 650,
        });

        const synopsis = synopsisResponse.choices[0]?.message?.content?.trim() || "";
        
        // Send synopsis
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'synopsis',
          content: synopsis 
        })}\n\n`));

        // Step 2: Generate title
        const titleResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: "Find a title for this remake. Return title only." }
          ],
          temperature: 0.9,
          max_tokens: 50,
        });

        const rawTitle = titleResponse.choices[0]?.message?.content?.trim() || "";
        // Clean up the title - remove quotes, extra text, etc.
        const newTitle = rawTitle
          .replace(/^["']|["']$/g, '') // Remove surrounding quotes
          .replace(/^Title:\s*/i, '') // Remove "Title:" prefix
          .replace(/^\d+\.\s*/, '') // Remove numbering like "1. "
          .split('\n')[0] // Take only first line
          .trim();
        
        // Send title
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'title', 
          content: newTitle 
        })}\n\n`));

        // Step 3: Generate image prompt
        const imagePromptResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: `Based on this movie synopsis: "${synopsis}" and title: "${newTitle}", create a character poster prompt using the lead actor. No character name.

Brief visual style (keywords only). 85 words max. Like:
portrait of [actor], rim lighting, moody, film grain, ultra sharp, etc.` }
          ],
          temperature: 0.9,
          max_tokens: 100,
        });

        const imagePrompt = imagePromptResponse.choices[0]?.message?.content?.trim() || "";

        // Step 4: Generate and upload image
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'image_generating', 
          content: 'Generating image...' 
        })}\n\n`));

        const replicateImageUrl = await generateImageReplicate(imagePrompt);
        const imageBuffer = await downloadImageWithRetry(replicateImageUrl);

        // Upload files to UploadThing
        const metadata = {
          originalTitle: title,
          title: newTitle,
          description: synopsis,
          imageURL: ""
        };

        const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: "application/json"
        });

        const jsonUTFile = new UTFile([jsonBlob], jsonFile, {
          type: "application/json",
          customId: jsonFile
        });

        const imageUTFile = new UTFile([imageBuffer], imageFile, {
          type: "image/jpeg",
          customId: imageFile
        });

        const [uploadedJson, uploadedImg] = await utapi.uploadFiles([
          jsonUTFile,
          imageUTFile
        ]);

      const finalImageUrl = `https://${APP_ID}.ufs.sh/f/${movieId}.jpg`;

        // Send final image URL
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'image_complete', 
          content: finalImageUrl
        })}\n\n`));

        // Send completion signal
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete',
          data: {
            originalTitle: title,
            title: newTitle,
            description: synopsis,
            imageURL: finalImageUrl
          }
        })}\n\n`));

      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          content: error instanceof Error ? error.message : 'Unknown error' 
        })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}