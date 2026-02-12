import type React from "react"
import type { Metadata } from "next"
import { Bebas_Neue, Source_Sans_3 } from "next/font/google"
import { Footer } from "@/components/footer"
import "./globals.css"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3",
})

export const metadata: Metadata = {
  title: "Hollywood Movie Remake Generator",
  description: "Search for movies to reimagine and remake in Hollywood style",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className={`${bebasNeue.variable} ${sourceSans.variable} font-body bg-noir-dark min-h-screen flex flex-col`}>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
