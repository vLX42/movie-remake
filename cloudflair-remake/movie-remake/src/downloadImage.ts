export async function downloadImageWithRetry(
  imageURL,
  retries = 5,
  delay = 1000
) {
    for (let i = 0; i <= retries; i++) {
        try {
          const response = await fetch(imageURL);
          if (response.ok) {
            const imageData = await response.arrayBuffer();
            return imageData;
          }
        } catch (error) {
          console.error(`Attempt ${i} failed: ${error.message}`);
        }
    
        if (i < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      throw new Error("Failed to download image after retries");
}
