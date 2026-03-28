export type SkinType = "kuru" | "yagli" | "karma" | "hassas" | "normal";

export type ProductCategory =
  | "temizleyici"
  | "tonik"
  | "serum"
  | "nemlendirici"
  | "gunes_kremi"
  | "diger";

export type ProductStatus = "gozlemde" | "aktif" | "birakildi";

export type RoutineType = "am" | "pm";

export interface Profile {
  id: string;
  display_name: string;
  skin_type: SkinType;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: ProductCategory;
  status: ProductStatus;
  observation_start_date: string | null;
  observation_end_date: string | null;
  created_at: string;
}

export interface Observation {
  id: string;
  product_id: string;
  user_id: string;
  day_number: number;
  irritation_score: number;
  breakout_score: number;
  hydration_score: number;
  note: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  type: RoutineType;
  product_id: string;
  step_order: number;
  created_at: string;
  product?: Product;
}

export interface RoutineLog {
  id: string;
  routine_id: string;
  user_id: string;
  completed_at: string;
  date: string;
}
