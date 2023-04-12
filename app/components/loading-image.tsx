"use client";

import { Loader } from "./loader";
import styles from "./loading-image.module.css";

export const LoadingImage = () => (
  <div className={styles.loadingImage}>
    <h1>
      Generating poster
      <Loader />
    </h1>
  </div>
);
