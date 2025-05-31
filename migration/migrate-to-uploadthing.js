import dotenv from "dotenv";
import fetch from "node-fetch";
import { UTApi, UTFile } from "uploadthing/server";

dotenv.config();

const {
  UPLOADTHING_SECRET,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} = process.env;

const utapi = new UTApi({ apiKey: UPLOADTHING_SECRET });

async function uploadBufferAsFile(buffer, filename, mimeType, customId) {
  try {
    const file = new UTFile([buffer], filename, {
      type: mimeType,
      customId,
    });

    console.log(`⬆️  Uploading ${filename} as ${customId} (${mimeType}, ${buffer.length} bytes)`);

    const res = await utapi.uploadFiles([file]);

    if (!Array.isArray(res) || !res[0] || res[0].error) {
      console.error("❌ UploadThing error response:", res[0]?.error || res);
      throw new Error(`UploadThing error uploading ${filename}`);
    }

    const url = res[0].data?.ufsUrl;

    if (!url) {
      console.error("❌ No ufsUrl returned:", res[0].data);
      throw new Error(`UploadThing returned no ufsUrl for ${filename}`);
    }

    return url;
  } catch (err) {
    console.error(`❌ Upload failed for ${filename}:`, err.message);
    throw err;
  }
}

async function listKVKeys() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/keys?limit=1000`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to list KV keys: ${res.status}`);
  }

  const { result } = await res.json();
  return result.map((r) => r.name);
}

async function fetchKVValue(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${encodeURIComponent(
    key
  )}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to get KV for ${key}`);
  return await res.text();
}

async function migrate() {
  const keys = await listKVKeys();

  for (const key of keys) {
    const movieId = key.replace(/^movie:/, "").toLowerCase().replace(/[^a-z0-9-_]/gi, "-");

    let kvRaw;
    let kvData;
    try {
      kvRaw = await fetchKVValue(key);
      kvData = JSON.parse(kvRaw);
    } catch (err) {
      console.warn(`⚠️ Failed to fetch or parse KV for ${movieId}: ${err.message}`);
      continue;
    }

    // Upload image and set imageURL
    try {
      const imageUrl = kvData.imageURL;
      if (!imageUrl) throw new Error("No imageURL in KV JSON");

      console.log(`🌐 Fetching image from: ${imageUrl}`);
      const imageRes = await fetch(imageUrl);

      if (!imageRes.ok) {
        const text = await imageRes.text();
        throw new Error(`Image fetch failed: ${imageRes.status} - ${text}`);
      }

      const contentType = imageRes.headers.get("content-type") || "image/jpeg";
      const imageBuffer = await imageRes.buffer();

      await uploadBufferAsFile(imageBuffer, `${movieId}.jpg`, contentType, `${movieId}.jpg`);

      kvData.imageURL = `https://vcnin240i2.ufs.sh/f/${movieId}.jpg`;

      console.log(`🖼️  Uploaded image and set new imageURL for ${movieId}`);
    } catch (err) {
      console.warn(`⚠️ Image upload failed for ${movieId}: ${err.message}`);
      continue; // Skip JSON upload if image fails
    }

    // Upload updated JSON
    try {
      const kvFormatted = JSON.stringify(kvData, null, 2);
      const kvBuffer = Buffer.from(kvFormatted, "utf-8");

      await uploadBufferAsFile(kvBuffer, `${movieId}.json`, "application/json", `${movieId}.json`);

      console.log(`📄 Uploaded updated JSON for ${movieId}`);
    } catch (err) {
      console.warn(`⚠️ JSON upload failed for ${movieId}: ${err.message}`);
    }
  }

  console.log("✅ Migration complete");
}

migrate().catch((err) => {
  console.error("🔥 Migration failed:", err);
});
