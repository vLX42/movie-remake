import { getMovie } from "@/lib/getMovie";
import { Suspense } from "react";
import { OriginalMovie } from '../../components/original'

export default async function Page({ params }: { params: { id: string } }) {
  const movieData = await getMovie(params.id);
  return (
    <Suspense fallback={<></>}>
      {/* @ts-expect-error Async Server Component */}
      <OriginalMovie promise={movieData} />
    </Suspense>
  );

  }
