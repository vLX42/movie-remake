// MovieSearch.tsx
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { debounce } from "lodash";
import styles from "./styles.module.css";
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
}

export const MovieSearchForm: React.FC = () => {
  const inputRef = useRef(null);

  useEffect(() => {
    // @ts-ignore:next-line
    inputRef?.current?.focus();
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(
    pathname ? decodeURIComponent(pathname.split("/search/")[1] || "") : ""
  );

  const debouncedSearchTerm = useCallback(
    debounce((search) => router.push(`/search/${search}`), 100),
    []
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const value = event.target.value;

    if (value.length === 1) {
      router.push(`/search/${value}`);
    } else {
      debouncedSearchTerm(value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          onChange={handleChange}
          placeholder="Search for movies"
          value={searchTerm}
          ref={inputRef}
        />
        <button type="submit" hidden>
          Search
        </button>
      </form>
    </div>
  );
};

export default MovieSearchForm;
