import { getMovie } from "@/lib/getMovie";
import { Suspense } from "react";
import { OriginalMovie } from "../../components/original";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const movieData = await getMovie(params.id);
  if (movieData.remake)
    return {
      title: `${movieData.original_title} AI generated remake`,
      description: `Reamke of the clasic movie ${movieData.original_title} generated by chatGPT - Hollywood Movie Remake Generator
      ${movieData.remake.description}
      `,
      openGraph: {
        images: movieData.remake.imageURL? [
          {
            url: movieData.remake.imageURL,
            width: 512,
            height: 412,
          },
        ] : [],
        locale: "en-US",
        type: "website",
      },
    };
  return {}
}

export default async function Page({ params }: { params: { id: string } }) {
  const movieData = await getMovie(params.id);
  return (
    <Suspense fallback={<></>}>
      {/* @ts-expect-error Async Server Component */}
      <OriginalMovie promise={movieData} />
    </Suspense>
  );
}
