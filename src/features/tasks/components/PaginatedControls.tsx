import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils/utils";

export default function PaginationControls({
  page,
  hasNext,
  hasPrevious,
  type = "regular",
  className,
  setPage,
}: {
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  type?: "regular" | "table";
  className?: string;
  setPage: (p: number) => void;
}) {
  return (
    <Pagination className={cn("w-full", className)}>
      <PaginationContent>
        {hasPrevious && (
          <PaginationItem>
            <PaginationPrevious onClick={() => setPage(page - 1)} />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationLink isActive>{page}</PaginationLink>
        </PaginationItem>
        {hasNext && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem>
              <PaginationNext onClick={() => setPage(page + 1)} />
            </PaginationItem>
          </>
        )}
      </PaginationContent>
      {/* //
      //   <PaginationContent>
      //     <PaginationItem>
      //       <Button
      //         variant={"outline"}
      //         className="h-8"
      //         onClick={() => setPage(page - 1)}
      //         disabled={!hasPrevious}>
      //         Previous
      //       </Button>
      //     </PaginationItem>
      //     <PaginationItem>
      //       <Button
      //         variant={"outline"}
      //         className="h-8"
      //         onClick={() => setPage(page + 1)}
      //         disabled={!hasNext}>
      //         Next
      //       </Button>
      //     </PaginationItem>
      //   </PaginationContent>
      // ) */}
    </Pagination>
  );
}
