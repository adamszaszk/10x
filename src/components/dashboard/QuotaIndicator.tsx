import { Progress } from "../ui/progress";

interface QuotaIndicatorProps {
  used: number;
  limit: number;
}

export const QuotaIndicator = ({ used, limit }: QuotaIndicatorProps) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(limit - used, 0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-muted-foreground">Monthly Usage</span>
        <span className="font-medium">
          {remaining} / {limit} generations left
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};
