// pages/api/image.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface ImageResponse {
  body: string;
}

async function fetchImage(UUID: string): Promise<string> {
  const response = await fetch('https://qrlh34e4y6.execute-api.us-east-1.amazonaws.com/sdCheckEle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: process.env.EVOKE_AUTH_TOKEN,
      UUID,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching image: ${response.statusText}`);
  }

  const { body: imageUrl } = (await response.json()) as ImageResponse;
  return imageUrl;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { UUID } = req.query;

  if (typeof UUID !== 'string') {
    res.status(400).json({ error: 'UUID parameter is missing or invalid.' });
    return;
  }

  try {
    const imageUrl = await fetchImage(UUID);
    res.redirect(imageUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the image.' });
  }
}