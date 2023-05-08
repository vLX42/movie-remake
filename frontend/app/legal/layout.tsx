import { MovieSearchForm } from "../components/search";
import styles from "../styles.module.css";
import { Abril_Fatface } from "next/font/google";
const abril_fatface = Abril_Fatface({ weight: ["400"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className={`${styles.headline} ${abril_fatface.className}`}>
        Hollywood Movie Remake Generator
      </h1>
      <div className={`${styles.children}`}>{children}</div>
    </div>
  );
}
