import type { APIRoute } from "astro";
import { GeneratePlanCommandSchema } from "../../../lib/schemas/ai.schema";
import { aiService, QuotaExceededError } from "../../../lib/services/ai.service";
import { OpenRouterError } from "../../../lib/services/openrouter.service";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const supabase = context.locals.supabase;

  // 1. Authenticate User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Parse and Validate Request Body
    const body = await context.request.json();
    const validationResult = GeneratePlanCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command = validationResult.data;

    // 3. Generate Plan
    const plan = await aiService.generatePlan(supabase, command, user.id);

    // 4. Return Success Response
    return new Response(JSON.stringify(plan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error generating plan:", error);

    if (error instanceof QuotaExceededError) {
      return new Response(JSON.stringify({ error: error.message, code: "QUOTA_EXCEEDED" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error instanceof OpenRouterError && error.code === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({
          error: "AI Service Rate Limit Exceeded",
          details: "Please try again in a few moments.",
          code: "RATE_LIMIT",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const errorCode = error instanceof OpenRouterError ? error.code : "UNKNOWN";
    return new Response(
      JSON.stringify({
        error: `Internal Server Error (${errorCode})`,
        details: error instanceof Error ? error.message : String(error),
        code: errorCode,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
