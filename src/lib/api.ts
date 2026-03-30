import { supabase } from "./supabase";
import type {
  Product,
  ProductCategory,
  ProductStatus,
  Profile,
  SkinType,
  Observation,
  Routine,
  RoutineLog,
  RoutineType,
} from "../types";

// ─── PROFILE ────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: { display_name?: string; skin_type?: SkinType }
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── PRODUCTS ───────────────────────────────────────────

export async function fetchProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createProduct(
  userId: string,
  name: string,
  category: ProductCategory
): Promise<Product> {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: userId,
      name: name.trim(),
      category,
      status: "gozlemde" as ProductStatus,
      observation_start_date: now.toISOString().split("T")[0],
      observation_end_date: endDate.toISOString().split("T")[0],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProductStatus(
  productId: string,
  status: ProductStatus
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId);
  if (error) throw error;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}

// ─── OBSERVATIONS ───────────────────────────────────────

export async function fetchObservations(
  productId: string
): Promise<Observation[]> {
  const { data, error } = await supabase
    .from("observations")
    .select("*")
    .eq("product_id", productId)
    .order("day_number", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createObservation(
  userId: string,
  productId: string,
  dayNumber: number,
  irritationScore: number,
  breakoutScore: number,
  hydrationScore: number,
  note?: string
): Promise<Observation> {
  const { data, error } = await supabase
    .from("observations")
    .insert({
      user_id: userId,
      product_id: productId,
      day_number: dayNumber,
      irritation_score: irritationScore,
      breakout_score: breakoutScore,
      hydration_score: hydrationScore,
      note: note || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── ROUTINES ───────────────────────────────────────────

export async function fetchRoutines(
  userId: string,
  type?: RoutineType
): Promise<(Routine & { product: Product })[]> {
  let query = supabase
    .from("routines")
    .select("*, product:products(*)")
    .eq("user_id", userId)
    .order("step_order", { ascending: true });
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addToRoutine(
  userId: string,
  productId: string,
  type: RoutineType,
  stepOrder: number
): Promise<Routine> {
  const { data, error } = await supabase
    .from("routines")
    .insert({ user_id: userId, product_id: productId, type, step_order: stepOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromRoutine(routineId: string): Promise<void> {
  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", routineId);
  if (error) throw error;
}

// ─── ROUTINE LOGS ───────────────────────────────────────

export async function fetchRoutineLogs(
  userId: string,
  date: string
): Promise<RoutineLog[]> {
  const { data, error } = await supabase
    .from("routine_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date);
  if (error) throw error;
  return data || [];
}

export async function toggleRoutineLog(
  userId: string,
  routineId: string,
  date: string
): Promise<boolean> {
  // Check if already logged
  const { data: existing } = await supabase
    .from("routine_logs")
    .select("id")
    .eq("routine_id", routineId)
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (existing) {
    await supabase.from("routine_logs").delete().eq("id", existing.id);
    return false; // uncompleted
  } else {
    await supabase
      .from("routine_logs")
      .insert({ routine_id: routineId, user_id: userId, date });
    return true; // completed
  }
}

// ─── HOME STATS ─────────────────────────────────────────

export async function fetchHomeStats(userId: string, today: string) {
  const [productsRes, routinesRes, logsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "gozlemde"),
    supabase
      .from("routines")
      .select("id, type")
      .eq("user_id", userId),
    supabase
      .from("routine_logs")
      .select("routine_id")
      .eq("user_id", userId)
      .eq("date", today),
  ]);

  const observingCount = productsRes.data?.length || 0;
  const totalRoutineSteps = routinesRes.data?.length || 0;
  const completedSteps = logsRes.data?.length || 0;
  const progress =
    totalRoutineSteps > 0
      ? Math.round((completedSteps / totalRoutineSteps) * 100)
      : 0;

  // Determine pending routine
  const amIds = (routinesRes.data || [])
    .filter((r) => r.type === "am")
    .map((r) => r.id);
  const completedIds = new Set((logsRes.data || []).map((l) => l.routine_id));
  const amDone = amIds.every((id) => completedIds.has(id));
  const pendingRoutine: "am" | "pm" = amDone ? "pm" : "am";

  return { observingCount, progress, pendingRoutine, totalRoutineSteps };
}

// ─── STREAK ─────────────────────────────────────────────

export async function fetchStreak(userId: string): Promise<number> {
  // Get all routine IDs for this user
  const { data: routines } = await supabase
    .from("routines")
    .select("id")
    .eq("user_id", userId);

  if (!routines || routines.length === 0) return 0;

  const routineIds = new Set(routines.map((r) => r.id));
  const totalStepsPerDay = routines.length;

  // Get logs from last 60 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const { data: logs } = await supabase
    .from("routine_logs")
    .select("date, routine_id")
    .eq("user_id", userId)
    .gte("date", sixtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (!logs || logs.length === 0) return 0;

  // Group logs by date
  const logsByDate = new Map<string, number>();
  logs.forEach((log) => {
    if (routineIds.has(log.routine_id)) {
      logsByDate.set(log.date, (logsByDate.get(log.date) || 0) + 1);
    }
  });

  // Count consecutive days from today backwards
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const completed = logsByDate.get(dateStr) || 0;

    // Day counts if at least half the steps are done
    if (completed >= Math.ceil(totalStepsPerDay / 2)) {
      streak++;
    } else if (i === 0) {
      // Today not done yet is OK, skip
      continue;
    } else {
      break;
    }
  }

  return streak;
}

// ─── WEEKLY SUMMARY ─────────────────────────────────────

export async function fetchWeeklySummary(userId: string) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const [routinesRes, logsRes, observationsRes] = await Promise.all([
    supabase.from("routines").select("id").eq("user_id", userId),
    supabase
      .from("routine_logs")
      .select("date, routine_id")
      .eq("user_id", userId)
      .gte("date", weekAgoStr)
      .lte("date", todayStr),
    supabase
      .from("observations")
      .select("irritation_score, breakout_score, hydration_score")
      .eq("user_id", userId)
      .gte("created_at", weekAgo.toISOString()),
  ]);

  const totalRoutines = routinesRes.data?.length || 0;
  const logs = logsRes.data || [];
  const observations = observationsRes.data || [];

  // Calculate days with completed routines
  const logsByDate = new Map<string, number>();
  logs.forEach((l) => {
    logsByDate.set(l.date, (logsByDate.get(l.date) || 0) + 1);
  });

  let completedDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = logsByDate.get(dateStr) || 0;
    if (totalRoutines > 0 && count >= Math.ceil(totalRoutines / 2)) {
      completedDays++;
    }
  }

  // Average observation scores
  const avgIrritation = observations.length > 0
    ? observations.reduce((s, o) => s + o.irritation_score, 0) / observations.length
    : 0;
  const avgHydration = observations.length > 0
    ? observations.reduce((s, o) => s + o.hydration_score, 0) / observations.length
    : 0;

  return {
    completedDays,
    totalDays: 7,
    completionRate: Math.round((completedDays / 7) * 100),
    observationCount: observations.length,
    avgIrritation: Math.round(avgIrritation * 10) / 10,
    avgHydration: Math.round(avgHydration * 10) / 10,
  };
}
