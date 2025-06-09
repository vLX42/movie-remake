import { Home, Linkedin, Github } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-1">Hollywood Movie Remake Generator</h3>
            <Link href="/legal" className="text-gray-400 hover:text-white text-sm transition-colors">
              Legal
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://vlx.dk/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Home"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Home</span>
            </a>

            <a
              href="https://www.linkedin.com/in/vlx42/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>

            <a
              href="https://github.com/vLX42/movie-remake"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Source Code"
            >
              <Github size={20} />
              <span className="hidden sm:inline">Source Code</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
