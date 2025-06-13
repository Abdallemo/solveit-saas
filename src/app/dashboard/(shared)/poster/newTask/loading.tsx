import { Skeleton } from "@/components/ui/skeleton"

export default function TaskSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4">
   
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-5 w-full max-w-2xl mb-8" />

      <div className="border rounded-md w-full">
   
        <div className="flex items-center gap-1 p-3 bg-gray-50 border-b">
         
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />

          <div className="h-6 border-r border-gray-300 mx-2"></div>

         
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />

          <div className="flex-grow"></div>

      
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>

      
        <div className="p-6 h-[668px] max-h-[668px] overflow-hidden">
          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-5/6 mb-3" />
          <Skeleton className="h-6 w-4/6 mb-6" />

          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-6 w-5/6 mb-6" />

          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-2/3 mb-6" />

          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-4/5 mb-3" />
          <Skeleton className="h-6 w-3/5 mb-6" />

          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-5/6 mb-3" />
          <Skeleton className="h-6 w-4/6 mb-6" />

          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-6 w-2/3 mb-6" />

          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-4/5 mb-3" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>

      
      <div className="mt-8 border-2 border-dashed border-gray-300 rounded-md p-10 flex flex-col items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full mb-3" />
        <Skeleton className="h-5 w-56" />
      </div>
    </div>
  )
}
