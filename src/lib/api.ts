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
