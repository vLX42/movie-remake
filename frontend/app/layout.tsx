import "./globals.css";
import { Archivo_Narrow } from "next/font/google";
import styles from "./styles.module.css";
const archivo_narrow = Archivo_Narrow({ subsets: ["latin"] });

export const metadata = {
  title: "Movie Remake Generator",
  description:
    "Discover Hollywood Movie Remake Generator, where AI creates hilarious movie parodies, synopses, and unique character posters featuring your favorite stars. Share the fun and credit our platform for endless entertainment!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${styles.body} ${archivo_narrow.className}`}>
        <main className={styles.main}>
          <div>{children}</div>
        </main>
        <footer className={styles.footer}>

          <div></div>
          <p>
            &copy; 2023 Hollywood Movie Remake Generator. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
