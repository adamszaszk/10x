import type { PlanDto } from "@/types";
import { PlanSummaryCard } from "./PlanSummaryCard";

interface PlanListProps {
  plans: PlanDto[];
}

export const PlanList = ({ plans }: PlanListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanSummaryCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
};
