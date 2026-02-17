# Frontend-v2

Next.js application for the Hollywood Movie Remake Generator.

## Features

### Sitemap Generation

The application automatically generates a sitemap.xml file for search engine optimization (SEO). The sitemap includes:

- **Static Routes**: Home page and legal page
- **Dynamic Routes**: All previously generated movie remake pages (up to 100)

#### How it works

The sitemap is generated at build time using Next.js's built-in sitemap functionality. It:

1. Fetches all available movie remakes from UploadThing storage
2. Creates sitemap entries for each remake at `/remake/[movieId]`
3. Includes proper metadata like last modified date, change frequency, and priority
4. Revalidates every hour (3600 seconds) in production

The sitemap is accessible at `/sitemap.xml` and is automatically discovered by search engines.

#### Configuration

Set the `NEXT_PUBLIC_BASE_URL` environment variable to configure the base URL used in the sitemap:

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

If not set, it defaults to `https://movie-remake.vlx.dk`.

## Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Required environment variables:

- `UPLOADTHING_TOKEN` - UploadThing API token for file storage
- `UPLOADTHING_APP_ID` - UploadThing application ID
- `THEMOVIEDB_API_KEY` - The Movie Database API key
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application (optional, defaults to https://movie-remake.vlx.dk)
