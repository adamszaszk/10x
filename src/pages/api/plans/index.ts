import type { APIRoute } from "astro";
import type { PaginatedPlansDto, PlanDto } from "../../../types";
import { CreatePlanCommandSchema } from "../../../lib/schemas/plan.schema";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;

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

  // 2. Parse and Validate Query Parameters
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");
  const sortByParam = url.searchParams.get("sortBy");
  const orderParam = url.searchParams.get("order");

  let page = parseInt(pageParam || "1", 10);
  let limit = parseInt(limitParam || "10", 10);
  let sortBy = sortByParam || "created_at";
  let order = orderParam || "desc";

  // Validate inputs
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50; // Enforce max limit

  const validSortFields = ["created_at", "destination_name"];
  if (!validSortFields.includes(sortBy)) {
    sortBy = "created_at";
  }

  if (order !== "asc" && order !== "desc") {
    order = "desc";
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    // 3. Fetch Plans from Database
    const { data, count, error } = await supabase
      .from("plans")
      .select("*", { count: "exact" })
      .eq("user_id", user.id) // Explicitly filter by user_id
      .order(sortBy, { ascending: order === "asc" })
      .range(from, to);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching plans:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Construct Response
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const responseData: PaginatedPlansDto = {
      data: (data as PlanDto[]) || [],
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
      },
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in GET /api/plans:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;

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

  // 2. Parse and Validate Request Body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parseResult = CreatePlanCommandSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify({ error: "Validation failed", details: parseResult.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { destination_name, plan_data } = parseResult.data;

  try {
    // 3. Insert into Database
    const { data, error } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        destination_name,
        plan_data,
      })
      .select()
      .single();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving plan:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in POST /api/plans:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
