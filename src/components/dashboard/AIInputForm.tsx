import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import type { GeneratePlanCommand, GeneratedPlanDto } from "../../types";
import { Alert, AlertDescription } from "../ui/alert";

interface AIInputFormProps {
  onPlanGenerated: (plan: GeneratedPlanDto) => void;
  disabled: boolean;
}

export const AIInputForm = ({ onPlanGenerated, disabled }: AIInputFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload: GeneratePlanCommand = { prompt };
      const response = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("You have reached your monthly generation limit.");
        }
        throw new Error(data.error || "Failed to generate plan. Please try again.");
      }

      onPlanGenerated(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate plan";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Textarea
          placeholder="I want a weekend trip to Paris with a focus on art and food..."
          className="min-h-[150px] text-lg resize-none p-4"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled || isLoading}
          name="prompt"
        />
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Be specific about your interests for better results.</span>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full text-lg py-6"
        disabled={disabled || isLoading || !prompt.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating your perfect trip...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Plan
          </>
        )}
      </Button>
    </form>
  );
};
