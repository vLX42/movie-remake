"use client";

import { debounce } from "lodash";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";

export default function page() {
  const params = useParams<{ search: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    appendSearchToUrl(value);
  }, []);

  const appendSearchToUrl = useCallback(
    debounce((search: string) => {
      startTransition(() => {
        const encoded = encodeURIComponent(search);
        router.replace("/search/" + encoded);
      });
    }),
    []
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        defaultValue={params.search}
        onChange={handleSearch}
        className={`w-full bg-transparent border-0 outline-0 placeholder-gray-500 text-white font-light transition-opacity duration-200 ${
          isPending ? "opacity-75" : "opacity-100"
        }`}
        autoFocus
        autoComplete="off"
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>

      {isPending && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      )}

      {searchTerm &&
        searchTerm.length > 0 &&
        searchTerm.length < 2 &&
        !isPending && (
          <div className="absolute top-full left-0 mt-2 text-sm text-gray-400">
            Type at least 2 characters to search...
          </div>
        )}
    </div>
  );
}
