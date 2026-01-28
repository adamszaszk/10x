import { Separator } from "../ui/separator";

interface PlanData {
  introduction: string;
  why_visit: string;
  things_to_do: string;
  sample_itinerary: string;
}

interface PlanDisplayProps {
  // Accepts either the raw JSON object or parsed object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: PlanData | Record<string, unknown> | string | any;
  destinationName: string;
}

export const PlanDisplay = ({ data, destinationName }: PlanDisplayProps) => {
  // Ensure data is an object
  const content = typeof data === "string" ? JSON.parse(data) : data;

  return (
    <article className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <p className="text-xl leading-relaxed text-stone-700 dark:text-stone-300 font-medium">{content.introduction}</p>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-2xl font-bold mb-4">Why Visit {destinationName}?</h2>
        <div className="whitespace-pre-line leading-relaxed text-stone-600 dark:text-stone-400">
          {content.why_visit}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Things to Do</h2>
        <div className="leading-relaxed text-stone-600 dark:text-stone-400 whitespace-pre-line">
          {content.things_to_do}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Sample Itinerary</h2>
        <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-lg border border-stone-100 dark:border-stone-800">
          <div className="leading-relaxed whitespace-pre-line">{content.sample_itinerary}</div>
        </div>
      </section>
    </article>
  );
};
