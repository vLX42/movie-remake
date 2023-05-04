import Replicate from "replicate";

export async function generateImageReplicate(prompt, title) {
  try {
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    const model =
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
    const input = {
      prompt: `BOOK COVER STYLE, ${prompt}. Movie poster STYLE, action shot, include face, highly detailed 8k --ar 9:18`,
      negative_prompt:
        "bad anatomy, bad proportions, blurry, cloned face, cropped, deformed, dehydrated, disfigured, duplicate, error, extra arms, extra fingers, extra legs, extra limbs, fused fingers, gross proportions, jpeg artifacts, long neck, low quality, lowres, malformed limbs, missing arms, missing legs, morbid, mutated hands, mutation, mutilated, out of frame, poorly drawn face, poorly drawn hands, signature, text, too many fingers, ugly, username, watermark, worst quality.",
    };
    const output = await replicate.run(model, { input });
    const imageURL = output[0];
    return imageURL;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
