import { Suspense } from "react"
import { PreviousRemakes, PreviousRemakesSkeleton } from "@/components/previous-remakes"

export const revalidate = 3600

export default function Page() {
  return (
    <>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Search for a movie above to generate a remake</p>
      </div>

      <Suspense fallback={<PreviousRemakesSkeleton />}>
        <PreviousRemakes />
      </Suspense>
    </>
  )
}
