import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemName?: string;
  onPageChange: (page: number) => void;
}

export default function DataPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemName = "items",
  onPageChange,
}: DataPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    safeTotalPages,
  );

  const startItem =
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;

  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  const visiblePages = Array.from(
    { length: safeTotalPages },
    (_, index) => index + 1,
  ).filter(
    (page) =>
      page === 1 ||
      page === safeTotalPages ||
      Math.abs(page - safeCurrentPage) <= 1,
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {startItem}–{endItem} of {totalItems} {itemName}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text="Previous"
              aria-disabled={safeCurrentPage <= 1}
              className={
                safeCurrentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              onClick={(event) => {
                event.preventDefault();

                if (safeCurrentPage > 1) {
                  onPageChange(safeCurrentPage - 1);
                }
              }}
            />
          </PaginationItem>

          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];

            return (
              <PaginationItem key={page}>
                {previousPage !== undefined &&
                page - previousPage > 1 ? (
                  <>
                    <PaginationEllipsis />
                    <PaginationLink
                      href="#"
                      isActive={safeCurrentPage === page}
                      onClick={(event) => {
                        event.preventDefault();
                        onPageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </>
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={safeCurrentPage === page}
                    aria-label={`Go to page ${page}`}
                    onClick={(event) => {
                      event.preventDefault();
                      onPageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              text="Next"
              aria-disabled={safeCurrentPage >= safeTotalPages}
              className={
                safeCurrentPage >= safeTotalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              onClick={(event) => {
                event.preventDefault();

                if (safeCurrentPage < safeTotalPages) {
                  onPageChange(safeCurrentPage + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}