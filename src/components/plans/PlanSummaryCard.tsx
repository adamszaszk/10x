import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanDto } from "@/types";
import { Calendar } from "lucide-react";

interface PlanSummaryCardProps {
  plan: PlanDto;
}

export const PlanSummaryCard = ({ plan }: PlanSummaryCardProps) => {
  const planData = typeof plan.plan_data === "string" ? JSON.parse(plan.plan_data) : plan.plan_data;

  // Safe access to introduction, handling potential missing fields
  const introduction = planData?.introduction || "No description available.";

  // Truncate introduction
  const truncatedIntro = introduction.length > 150 ? `${introduction.substring(0, 150)}...` : introduction;

  const formattedDate = new Date(plan.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="line-clamp-1">{plan.destination_name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{truncatedIntro}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <a href={`/plans/${plan.id}`}>View Plan</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
