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
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version:
            "7ca7f0d3a51cd993449541539270971d38a24d9a0d42f073caf25190d41346d7",
          input: {
            prompt: `${prompt}`,
            width: 512,
            height: 512,
            negative_prompt:
              "lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck"          },
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
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
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
