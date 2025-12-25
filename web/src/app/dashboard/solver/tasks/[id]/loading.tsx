import { Skeleton } from "@/components/ui/skeleton";

export default function TaskLoading() {
  return (
    <main className="flex flex-col w-full h-full gap-5 items-center p-10">
      <div className="w-full flex flex-col items-end gap-3">
        <Skeleton className="w-[200px] bg-background" />
        <Skeleton className="h-[500px] w-full" />
      </div>
      <div className="w-full flex flex-col bg-background">
        <Skeleton className="h-30 " />
      </div>
    </main>
  );
}
