import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { supabase } = locals;
  const { id } = params;

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

  // 2. Validate ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response(JSON.stringify({ error: "Invalid plan ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Fetch Plan
  // RLS ensures the user can only fetch their own plans
  const { data, error } = await supabase.from("plans").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // eslint-disable-next-line no-console
    console.error("Error fetching plan:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase } = locals;
  const { id } = params;

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

  // 2. Validate ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response(JSON.stringify({ error: "Invalid plan ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Delete Plan
  // RLS ensures the user can only delete their own plans
  const { error, count } = await supabase.from("plans").delete({ count: "exact" }).eq("id", id);

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting plan:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If count is 0, it means either the plan didn't exist or it didn't belong to the user
  if (count === 0) {
    return new Response(JSON.stringify({ error: "Plan not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, {
    status: 204,
  });
};
