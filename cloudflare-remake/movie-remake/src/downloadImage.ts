import {  sendEvent } from "./messageHandling";
export async function downloadImageWithRetry(
  imageURL,
  retries = 10,
  delay = 500,
  writer
) {
    for (let i = 0; i <= retries; i++) {
        try {
          sendEvent(writer,  { reply: 8, message: "fetch start" })
          const response = await fetch(imageURL);
          if (response.ok) {
            sendEvent(writer,  { reply: 8, message: "image ok" })
            const imageData = await response.arrayBuffer();
            return imageData;
          }
        } catch (error) {
          sendEvent(writer,  { reply: 8, message: error })
          console.error(`Attempt ${i} failed: ${error.message}`);
        }
    
        if (i < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      console.error("Failed to download image after retries")
      return
}
