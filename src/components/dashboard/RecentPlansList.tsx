import { PlanSummaryCard } from "../plans/PlanSummaryCard";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import type { PlanDto } from "../../types";

interface RecentPlansListProps {
  plans: PlanDto[];
  isLoading: boolean;
}

export const RecentPlansList = ({ plans, isLoading }: RecentPlansListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recent Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recent Plans</h2>
        <Button variant="link" asChild className="px-0">
          <a href="/plans">View all plans</a>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanSummaryCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};
