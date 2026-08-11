import supabase from "./supabase";

export const DAILY_REQUEST_LIMIT = 20;

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

export async function incrementApiUsage() {
  const today = todayDate();

  const { data, error } = await supabase.rpc("increment_api_usage", {
    p_date: today,
  });

  if (error) {
    console.error("incrementApiUsage error:", error);
    return { count: 0, limit: DAILY_REQUEST_LIMIT, date: today };
  }

  return { count: data, limit: DAILY_REQUEST_LIMIT, date: today };
}

export async function getApiUsage() {
  const today = todayDate();

  const { data, error } = await supabase
    .from("api_usage")
    .select("request_count")
    .eq("usage_date", today)
    .maybeSingle();

  if (error) {
    console.error("getApiUsage error:", error);
    return { count: 0, limit: DAILY_REQUEST_LIMIT, date: today };
  }

  return {
    count: data?.request_count || 0,
    limit: DAILY_REQUEST_LIMIT,
    date: today,
  };
}