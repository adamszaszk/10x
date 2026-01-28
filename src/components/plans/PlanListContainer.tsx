import { useState, useEffect } from "react";
import type { PlanDto, PaginatedPlansDto } from "@/types";
import { PageHeader } from "./PageHeader";
import { PlanList } from "./PlanList";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const PlanListContainer = () => {
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/plans?page=${page}&limit=9`);
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data: PaginatedPlansDto = await response.json();
      setPlans(data.data);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load plans. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(pagination.currentPage);
  }, [pagination.currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader />

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          {error}
          <button onClick={() => fetchPlans(pagination.currentPage)} className="ml-4 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <PlanList plans={plans} />

          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pagination.currentPage - 1);
                      }}
                      className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === pagination.currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pagination.currentPage + 1);
                      }}
                      className={
                        pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};
