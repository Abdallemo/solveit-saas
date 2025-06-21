import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PricingSkeleton() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-9 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Skeleton for 2 pricing cards */}
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="flex flex-col justify-between h-full">
              <CardHeader>
                <Skeleton className="h-8 w-32" />
                <div className="mt-2">
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2 mt-4">
                  {/* Skeleton for features list */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex items-center">
                      <Skeleton className="h-5 w-5 rounded mr-2" />
                      <Skeleton className="h-4 flex-1" />
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
