import type { GeneratedPlanDto } from "@/types";
import { PlanDisplay } from "./PlanDisplay";
import { ActionToolbar } from "./ActionToolbar";
import { DisclaimerBanner } from "../common/DisclaimerBanner";

interface PlanPreviewContainerProps {
  plan: GeneratedPlanDto;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  isSaving: boolean;
}

export const PlanPreviewContainer = ({ plan, onSave, onDiscard, isSaving }: PlanPreviewContainerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-950 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Trip to {plan.destination_name}</h2>
          <p className="text-sm text-muted-foreground mt-1">Preview your generated itinerary</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <DisclaimerBanner />
          <PlanDisplay data={plan.plan_data} destinationName={plan.destination_name} />
        </div>

        {/* Footer Actions */}
        <ActionToolbar onSave={onSave} onDiscard={onDiscard} isSaving={isSaving} />
      </div>
    </div>
  );
};
