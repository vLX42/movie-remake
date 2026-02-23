import Link from "next/link"
import { baseUrl } from "@/lib/config"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-dark via-black to-noir-dark">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl md:text-4xl font-display uppercase tracking-wider bg-gradient-to-r from-neon-gold via-neon-red to-neon-pink bg-clip-text text-transparent hover:opacity-80 transition-opacity mb-4 animate-neon-pulse"
          >
            Hollywood Movie Remake Generator
          </Link>
        </div>

        {/* Legal Content */}
        <div className="bg-noir-card backdrop-blur-sm p-6 md:p-8 rounded-xl border border-noir-border">
          <h1 className="text-3xl font-display uppercase tracking-wider text-neon-gold mb-6">Legal Disclaimer</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              Hollywood Movie Remake Generator is an independent platform providing AI-generated parodies, synopses, and
              character posters for entertainment purposes. We claim no affiliation with or endorsement by any movies or
              actors featured. Our use of names, images, and trademarks falls under Fair Use as parody, satire, or
              commentary.
            </p>

            <p className="text-gray-300 mb-4">
              The AI-generated content on this site is provided under a Creative Commons Attribution 4.0 International
              License, allowing you to share and adapt the content freely, as long as you give appropriate credit to
              Hollywood Movie Remake Generator as the source.
            </p>

            <p className="text-gray-300 mb-4">
              By using our site, you acknowledge doing so at your own risk and agree that we are not liable for any
              damages or losses. We encourage you to share the content, credit our platform, and spread the joy of
              Hollywood Movie Remake Generator&apos;s unique creations!
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-noir-border">
            <h2 className="text-xl font-display uppercase tracking-wider text-neon-gold mb-4">License Information</h2>
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                  fill="#d1d5db"
                />
              </svg>
              <span className="text-gray-300">Creative Commons Attribution 4.0 International License</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Legal | Hollywood Movie Remake Generator",
  description: "Legal disclaimer and license information for the Hollywood Movie Remake Generator",
  alternates: {
    canonical: `${baseUrl}/legal`,
  },
}
