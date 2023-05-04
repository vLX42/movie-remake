interface Prediction {
    id: string;
    status: string;
    output: string[];
  }
  
  async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  export async function generateImageReplicate(
    prompt: string,
    title: string
  ): Promise<string | null> {
    try {
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version:
            "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
          input: {
            prompt: `BOOK COVER STYLE, ${prompt}. Movie poster STYLE, action shot, include face, highly detailed 8k --ar 9:18`,
            negative_prompt:
              "bad anatomy, bad proportions, blurry, cloned face, cropped, deformed, dehydrated, disfigured, duplicate, error, extra arms, extra fingers, extra legs, extra limbs, fused fingers, gross proportions, jpeg artifacts, long neck, low quality, lowres, malformed limbs, missing arms, missing legs, morbid, mutated hands, mutation, mutilated, out of frame, poorly drawn face, poorly drawn hands, signature, text, too many fingers, ugly, username, watermark, worst quality.",
          },
        }),
      });
  
      if (response.status !== 201) {
        const error = await response.json();
        console.error(JSON.stringify({ error1: error }));
        return "error";
      }
  
      const prediction = (await response.json()) as Prediction;
      let imagePrediction: Prediction;
  
      while (true) {
        const responsePrediction = await fetch(
          "https://api.replicate.com/v1/predictions/" + prediction.id,
          {
            headers: {
              Authorization: `Token ${REPLICATE_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (responsePrediction.status !== 200) {
          const error = await responsePrediction.json();
          console.error(JSON.stringify({ error2: error }));
          return "error";
        }
  
        imagePrediction = (await responsePrediction.json()) as Prediction;
  
        if (
          imagePrediction.status === "succeeded" ||
          imagePrediction.status === "failed"
        ) {
          break;
        }
  
        await sleep(1000); // Wait for 1 second before retrying
      }
  
      return imagePrediction.output
        ? imagePrediction.output[imagePrediction.output.length - 1]
        : "no image";
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  }
