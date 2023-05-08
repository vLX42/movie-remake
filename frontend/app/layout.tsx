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
          <span></span>
          <p className={styles.siteName}>Hollywood Movie Remake Generator</p>
          <div className={styles.separator}></div>
          <a className={styles.link} href="/legal">
            Legal
          </a>
          <div className={styles.separator}></div>
          <a href="https://vlx.dk/">
            <img className={styles.icon} src="/home.png" alt="Home Icon" />
          </a>
          <a href="https://www.linkedin.com/in/vlx42/">
            <img
              className={styles.icon}
              src="/linkedin.svg"
              alt="LinkedIn Icon"
            />
          </a>
          <div className={styles.separator}></div>
          <a
            className={styles.link}
            href="https://github.com/vLX42/movie-remake"
          >
            <img
              className={styles.icon}
              src="/github.svg"
              alt="Source Code Icon"
            />
            <span className={styles.hideText}>Source Code</span>

          </a>
        </footer>
      </body>
    </html>
  );
}
