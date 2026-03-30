import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import { fetchHomeStats, fetchStreak, fetchWeeklySummary, fetchProducts } from "../../src/lib/api";
import { F } from "../../src/lib/fonts";
import type { Product } from "../../src/types";

const { width } = Dimensions.get("window");

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  temizleyici: "water-outline", tonik: "beaker-outline", serum: "sparkles-outline",
  nemlendirici: "snow-outline", gunes_kremi: "sunny-outline", diger: "ellipse-outline",
};

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const router = useRouter();
  const { profile, session } = useAuthStore();
  const [stats, setStats] = useState({ progress: 0, observingCount: 0, pendingRoutine: "am" as "am" | "pm", totalRoutineSteps: 0 });
  const [streak, setStreak] = useState(0);
  const [weekly, setWeekly] = useState<{ completedDays: number; completionRate: number; observationCount: number } | null>(null);
  const [observingProducts, setObservingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const [d, s, w, prods] = await Promise.all([
        fetchHomeStats(session.user.id, today),
        fetchStreak(session.user.id),
        fetchWeeklySummary(session.user.id),
        fetchProducts(session.user.id),
      ]);
      setStats(d); setStreak(s); setWeekly(w);
      setObservingProducts(prods.filter((p) => p.status === "gozlemde"));
    } catch {} setLoading(false);
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? (lang === "tr" ? "Gunaydın" : "Good morning") : hour < 18 ? (lang === "tr" ? "Iyi gunler" : "Good afternoon") : (lang === "tr" ? "Iyi aksamlar" : "Good evening");

  const skinTips = [
    lang === "tr" ? "Suyu ihmal etme. Cildin icten disa parlak olsun." : "Don't skip water. Glow from the inside out.",
    lang === "tr" ? "SPF'siz dis cikma. Cildin sana tesekkur edecek." : "Never go out without SPF. Your skin will thank you.",
    lang === "tr" ? "Yeni urun? Sabir. Sonuclari gormek 4-6 hafta surer." : "New product? Patience. Results take 4-6 weeks to show.",
    lang === "tr" ? "Gece rutinini atlama. Cilt kendini uykuda onarir." : "Don't skip your night routine. Skin repairs itself during sleep.",
  ];
  const todayTip = skinTips[new Date().getDate() % skinTips.length];

  const isEmpty = stats.totalRoutineSteps === 0 && stats.observingCount === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#000" />}>

        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginTop: 12 }}>
          <Text style={{ fontFamily: F.heading, fontSize: 18, color: "#000" }}>lumina</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: F.heading, color: "#FFF", fontSize: 13 }}>{profile?.display_name?.[0]?.toUpperCase() || "?"}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={{ paddingHorizontal: 24, marginTop: 28, marginBottom: 6 }}>
          <Text style={{ fontFamily: F.light, fontSize: 13, color: "#BBB" }}>{greeting},</Text>
          <Text style={{ fontFamily: F.heading, fontSize: 30, color: "#000", marginTop: 2 }}>
            {profile?.display_name || ""}
          </Text>
        </View>

        {/* Badges */}
        {profile?.skin_type && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ backgroundColor: "#FFF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }}>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: "#888" }}>
                  {t(`skinType.${profile.skin_type}`)} {lang === "tr" ? "cilt" : "skin"}
                </Text>
              </View>
              {streak > 0 && (
                <View style={{ backgroundColor: "#000", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ fontFamily: F.medium, fontSize: 11, color: "#FFF" }}>{streak} {lang === "tr" ? "gun seri" : "day streak"}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Empty state */}
        {!loading && isEmpty && (
          <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
            <View style={{
              backgroundColor: "#FFF", borderRadius: 20, padding: 28, alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10,
            }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#F8F8F8", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ionicons name="sparkles-outline" size={24} color="#000" />
              </View>
              <Text style={{ fontFamily: F.heading, fontSize: 18, color: "#000", textAlign: "center", marginBottom: 6 }}>
                {lang === "tr" ? "Yolculugun basliyor" : "Your journey begins"}
              </Text>
              <Text style={{ fontFamily: F.light, fontSize: 12, color: "#BBB", textAlign: "center", lineHeight: 18, marginBottom: 20 }}>
                {lang === "tr" ? "Ilk urununu ekle ve cilt bakim rutinini olusturmaya basla." : "Add your first product and start building your skincare routine."}
              </Text>
              <TouchableOpacity style={{ backgroundColor: "#000", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 32 }} onPress={() => router.push("/(tabs)/products")}>
                <Text style={{ fontFamily: F.medium, color: "#FFF", fontSize: 13 }}>{lang === "tr" ? "Ilk urununu ekle" : "Add your first product"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Today's routine card */}
        {!isEmpty && (
          <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#000", borderRadius: 20, padding: 22, overflow: "hidden",
              }}
              onPress={() => router.push("/(tabs)/routine")} activeOpacity={0.85}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontFamily: F.light, fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 2 }}>
                  {lang === "tr" ? "Bugunun rutini" : "Today's routine"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name={stats.pendingRoutine === "am" ? "sunny-outline" : "moon-outline"} size={12} color="#666" />
                  <Text style={{ fontFamily: F.light, fontSize: 11, color: "#666" }}>
                    {stats.pendingRoutine === "am" ? (lang === "tr" ? "Sabah" : "AM") : (lang === "tr" ? "Aksam" : "PM")}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontFamily: F.heading, fontSize: 44, color: "#FFF", lineHeight: 48 }}>
                    {stats.progress}<Text style={{ fontSize: 18, color: "#666" }}>%</Text>
                  </Text>
                  <Text style={{ fontFamily: F.light, fontSize: 11, color: "#555", marginTop: 4 }}>
                    {stats.progress === 100
                      ? (lang === "tr" ? "Tamamlandi" : "Complete")
                      : stats.pendingRoutine === "pm"
                        ? (lang === "tr" ? "Aksam bekliyor" : "Evening waiting")
                        : (lang === "tr" ? "Sabaha basla" : "Start morning")}
                  </Text>
                </View>
                <View style={{
                  width: 40, height: 40, borderRadius: 20, backgroundColor: "#222",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </View>
              </View>

              <View style={{ marginTop: 18, height: 3, backgroundColor: "#333", borderRadius: 2 }}>
                <View style={{ height: "100%", backgroundColor: "#FFF", borderRadius: 2, width: `${stats.progress}%` }} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats row */}
        {!isEmpty && (
          <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{
                flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16,
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
              }}>
                <Ionicons name="flame-outline" size={18} color="#999" />
                <Text style={{ fontFamily: F.heading, fontSize: 22, color: "#000", marginTop: 8 }}>{streak}</Text>
                <Text style={{ fontFamily: F.light, fontSize: 10, color: "#BBB", marginTop: 2 }}>{lang === "tr" ? "gun seri" : "day streak"}</Text>
              </View>
              <View style={{
                flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16,
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
              }}>
                <Ionicons name="eye-outline" size={18} color="#999" />
                <Text style={{ fontFamily: F.heading, fontSize: 22, color: "#000", marginTop: 8 }}>{observingProducts.length}</Text>
                <Text style={{ fontFamily: F.light, fontSize: 10, color: "#BBB", marginTop: 2 }}>{lang === "tr" ? "gozlemde" : "observing"}</Text>
              </View>
              {weekly && (
                <View style={{
                  flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
                }}>
                  <Ionicons name="calendar-outline" size={18} color="#999" />
                  <Text style={{ fontFamily: F.heading, fontSize: 22, color: "#000", marginTop: 8 }}>{weekly.completedDays}/7</Text>
                  <Text style={{ fontFamily: F.light, fontSize: 10, color: "#BBB", marginTop: 2 }}>{lang === "tr" ? "bu hafta" : "this week"}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Observing products */}
        {observingProducts.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ paddingHorizontal: 24, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 2 }}>
                {lang === "tr" ? "Gozlem altinda" : "Under observation"}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/products")}>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: "#999" }}>{lang === "tr" ? "Tumu" : "See all"}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}>
              {observingProducts.map((p) => {
                const start = new Date(p.observation_start_date || "");
                const day = Math.min(Math.max(Math.floor((Date.now() - start.getTime()) / 86400000) + 1, 1), 7);
                return (
                  <TouchableOpacity key={p.id} onPress={() => router.push(`/product/${p.id}`)} activeOpacity={0.8}
                    style={{
                      width: width * 0.42, backgroundColor: "#FFF", borderRadius: 16, padding: 14,
                      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
                    }}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 10, backgroundColor: "#F8F8F8",
                      alignItems: "center", justifyContent: "center", marginBottom: 10,
                    }}>
                      <Ionicons name={CAT_ICON[p.category] || "ellipse-outline"} size={16} color="#333" />
                    </View>
                    <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#000", marginBottom: 2 }} numberOfLines={1}>{p.name}</Text>
                    <Text style={{ fontFamily: F.light, fontSize: 10, color: "#BBB" }}>{t(`products.${p.category}`)}</Text>
                    <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ flex: 1, height: 3, backgroundColor: "#F0F0F0", borderRadius: 2 }}>
                        <View style={{ height: "100%", backgroundColor: "#000", borderRadius: 2, width: `${(day / 7) * 100}%` }} />
                      </View>
                      <Text style={{ fontFamily: F.medium, fontSize: 9, color: "#BBB" }}>{day}/7</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Weekly dots */}
        {weekly && weekly.completedDays > 0 && (
          <View style={{
            marginHorizontal: 24, marginBottom: 20, backgroundColor: "#FFF", borderRadius: 16, padding: 18,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
          }}>
            <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
              {lang === "tr" ? "Bu hafta" : "This week"}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (6 - i));
                const filled = i < weekly.completedDays;
                const isToday = i === 6;
                return (
                  <View key={i} style={{ alignItems: "center", gap: 6 }}>
                    <View style={{
                      width: 30, height: 30, borderRadius: 15,
                      backgroundColor: filled ? "#000" : "transparent",
                      borderWidth: isToday && !filled ? 1.5 : 0, borderColor: "#E0E0E0",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      {filled && <Ionicons name="checkmark" size={12} color="#FFF" />}
                    </View>
                    <Text style={{ fontFamily: F.light, fontSize: 9, color: isToday ? "#000" : "#CCC" }}>
                      {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick actions */}
        {!isEmpty && (
          <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1, backgroundColor: "#FFF", borderRadius: 16, paddingVertical: 18, alignItems: "center",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
                }}
                onPress={() => router.push("/(tabs)/products")} activeOpacity={0.7}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F8F8F8", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <Ionicons name="add" size={18} color="#000" />
                </View>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: "#888" }}>{t("home.addProduct")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1, backgroundColor: "#FFF", borderRadius: 16, paddingVertical: 18, alignItems: "center",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
                }}
                onPress={() => router.push("/(tabs)/routine")} activeOpacity={0.7}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F8F8F8", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <Ionicons name="flash" size={18} color="#000" />
                </View>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: "#888" }}>{t("home.quickRoutine")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Daily tip */}
        <View style={{
          marginHorizontal: 24, marginBottom: 100, backgroundColor: "#FFF", borderRadius: 16, padding: 18,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Ionicons name="bulb-outline" size={14} color="#999" />
            <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 2 }}>
              {lang === "tr" ? "Gunun notu" : "Daily note"}
            </Text>
          </View>
          <Text style={{ fontFamily: F.headingRegular, fontSize: 14, color: "#555", lineHeight: 22, fontStyle: "italic" }}>
            "{todayTip}"
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
