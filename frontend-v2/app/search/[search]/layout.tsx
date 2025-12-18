import Link from "next/link";

interface PageProps {
  params: Promise<{ search: string }>;
}

export default function layout({
  children,
  search,
}: {
  children: React.ReactNode;
  search: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity mb-4"
          >
            Hollywood Movie Remake Generator
          </Link>
        </div>

        {/* Search Container */}
        {search}

        {/* Search Results */}
        {children}
      </div>
    </div>
  );
}
