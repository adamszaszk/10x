import { useState } from "react";
import type { PlanDto } from "../../types";
import { PlanDisplay } from "./PlanDisplay";
import { DeletePlanButton } from "./DeletePlanButton";
import { Button } from "../ui/button";
import { ArrowLeft, Calendar } from "lucide-react";

interface PlanDetailsContainerProps {
  plan: PlanDto;
}

export default function PlanDetailsContainer({ plan }: PlanDetailsContainerProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete plan");
      }

      window.location.href = "/plans";
    } catch {
      alert("Failed to delete plan. Please try again.");
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(plan.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4" data-test-id="plan-details-container">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 mb-4 hover:bg-transparent hover:text-primary" asChild>
          <a href="/plans" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to My Plans
          </a>
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-3">
              {plan.destination_name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Created on {formattedDate}</span>
            </div>
          </div>
          <DeletePlanButton onConfirm={handleDelete} isDeleting={isDeleting} />
        </div>
      </div>

      <div className="bg-white dark:bg-stone-950 border rounded-2xl p-8 shadow-sm">
        <PlanDisplay data={plan.plan_data} destinationName={plan.destination_name} />
      </div>
    </div>
  );
}
