/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["image.tmdb.org", "oaidalleapiprodscus.blob.core.windows.net"],
  },
};
module.exports = nextConfig;
