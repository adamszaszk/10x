import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  const { data, error } = await supabase.from("travel_styles").select("*").order("name");

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching travel styles:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
};
