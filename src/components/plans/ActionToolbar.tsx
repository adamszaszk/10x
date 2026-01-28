import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface ActionToolbarProps {
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}

export const ActionToolbar = ({ onSave, onDiscard, isSaving }: ActionToolbarProps) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-stone-950/95 border-t border-stone-200 dark:border-stone-800 backdrop-blur-sm flex items-center justify-end gap-3 z-10 rounded-b-xl">
      <Button
        variant="outline"
        onClick={onDiscard}
        disabled={isSaving}
        className="border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-400 text-stone-600"
      >
        <X className="w-4 h-4 mr-2" />
        Discard
      </Button>
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving...
          </span>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save to My Plans
          </>
        )}
      </Button>
    </div>
  );
};
