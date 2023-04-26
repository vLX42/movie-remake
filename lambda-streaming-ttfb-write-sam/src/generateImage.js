let fetch;
(async () => {
  const nodeFetch = await import("node-fetch");
  fetch = nodeFetch.default;
})();

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

  module.exports = {
    generateImageEvoke,
  };
