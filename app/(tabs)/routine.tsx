import { useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Animated as RNAnimated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import { fetchRoutines, fetchRoutineLogs, toggleRoutineLog, removeFromRoutine } from "../../src/lib/api";
import { supabase } from "../../src/lib/supabase";
import type { Routine, Product, RoutineType } from "../../src/types";
import { F } from "../../src/lib/fonts";

const { width } = Dimensions.get("window");

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  temizleyici: "water-outline", tonik: "beaker-outline", serum: "sparkles-outline",
  nemlendirici: "snow-outline", gunes_kremi: "sunny-outline", diger: "ellipse-outline",
};

function getWeekDays() {
  const today = new Date();
  const dn = ["S", "M", "T", "W", "T", "F", "S"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i - 3);
    return { day: dn[d.getDay()], date: d.getDate(), fullDate: d.toISOString().split("T")[0], isToday: i === 3 };
  });
}

export default function RoutineScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const router = useRouter();
  const { session } = useAuthStore();
  const [tab, setTab] = useState<RoutineType>("am");
  const [days] = useState(getWeekDays);
  const [selDate, setSelDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [routines, setRoutines] = useState<(Routine & { product: Product })[]>([]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showCeleb, setShowCeleb] = useState(false);
  const celebAnim = useRef(new RNAnimated.Value(0)).current;

  const load = useCallback(async () => {
    if (!session?.user) return;
    try {
      const [r, l] = await Promise.all([fetchRoutines(session.user.id, tab), fetchRoutineLogs(session.user.id, selDate)]);
      setRoutines(r); setDoneIds(new Set(l.map((x) => x.routine_id)));
    } catch {} setLoading(false);
  }, [session, tab, selDate]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const toggle = async (id: string) => {
    if (!session?.user) return;
    const was = doneIds.has(id);
    setDoneIds((p) => { const n = new Set(p); was ? n.delete(id) : n.add(id); return n; });
    try {
      await toggleRoutineLog(session.user.id, id, selDate);
      if (!was) {
        const nd = new Set(doneIds); nd.add(id);
        if (nd.size === routines.length && routines.length > 0) {
          setShowCeleb(true);
          RNAnimated.sequence([
            RNAnimated.timing(celebAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            RNAnimated.delay(2500),
            RNAnimated.timing(celebAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start(() => setShowCeleb(false));
        }
      }
    } catch { setDoneIds((p) => { const n = new Set(p); was ? n.add(id) : n.delete(id); return n; }); }
  };

  const move = async (id: string, dir: "up" | "down") => {
    const i = routines.findIndex((r) => r.id === id); const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= routines.length) return;
    await Promise.all([
      supabase.from("routines").update({ step_order: routines[j].step_order }).eq("id", routines[i].id),
      supabase.from("routines").update({ step_order: routines[i].step_order }).eq("id", routines[j].id),
    ]); load();
  };

  const doneCount = routines.filter((r) => doneIds.has(r.id)).length;
  const pct = routines.length > 0 ? Math.round((doneCount / routines.length) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      {/* Celebration overlay */}
      {showCeleb && (
        <RNAnimated.View style={{
          opacity: celebAnim,
          transform: [{ scale: celebAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
          position: "absolute", top: 80, left: 24, right: 24, zIndex: 100,
          backgroundColor: "#000", borderRadius: 20, padding: 24, alignItems: "center",
          shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20,
        }}>
          <Ionicons name="checkmark-done-circle-outline" size={32} color="#FFF" style={{ marginBottom: 8 }} />
          <Text style={{ fontFamily: F.semibold, color: "#FFF", fontSize: 16 }}>{t("routine.completedToday")}</Text>
          <Text style={{ fontFamily: F.light, color: "#888", fontSize: 12, marginTop: 4 }}>{t("routine.routineReset")}</Text>
        </RNAnimated.View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#000" />
      }>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: F.heading, fontSize: 26, color: "#000" }}>{t("routine.title")}</Text>
            {routines.length > 0 && (
              <TouchableOpacity onPress={() => setEdit(!edit)} style={{ paddingVertical: 4, paddingHorizontal: 12 }}>
                <Text style={{ fontFamily: F.medium, fontSize: 13, color: edit ? "#000" : "#AAA" }}>{edit ? t("common.done") : t("common.edit")}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress summary */}
          {!loading && routines.length > 0 && (
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4, gap: 8 }}>
              <Text style={{ fontFamily: F.light, fontSize: 13, color: "#999" }}>
                {doneCount}/{routines.length} {lang === "tr" ? "tamamlandi" : "completed"}
              </Text>
            </View>
          )}
        </View>

        {/* Date strip */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
            {days.map((d) => {
              const sel = selDate === d.fullDate;
              return (
                <TouchableOpacity key={d.fullDate} onPress={() => setSelDate(d.fullDate)}
                  style={{
                    alignItems: "center", paddingVertical: 10, paddingHorizontal: 12,
                    backgroundColor: sel ? "#000" : "#FFF",
                    borderRadius: 16, minWidth: 44,
                    shadowColor: sel ? "transparent" : "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: sel ? 0 : 0.04,
                    shadowRadius: 4,
                  }}>
                  <Text style={{ fontFamily: F.light, fontSize: 10, color: sel ? "#888" : "#BBB", textTransform: "uppercase", marginBottom: 6 }}>{d.day}</Text>
                  <Text style={{ fontFamily: sel ? F.semibold : F.regular, fontSize: 15, color: sel ? "#FFF" : d.isToday ? "#000" : "#666" }}>{d.date}</Text>
                  {d.isToday && !sel && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#000", marginTop: 4 }} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* AM/PM pill toggle */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", backgroundColor: "#F0F0F0", borderRadius: 14, padding: 3 }}>
            {(["am", "pm"] as const).map((t2) => (
              <TouchableOpacity key={t2} onPress={() => setTab(t2)}
                style={{
                  flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 12,
                  backgroundColor: tab === t2 ? "#000" : "transparent",
                }}>
                <Text style={{ fontFamily: tab === t2 ? F.semibold : F.regular, fontSize: 13, color: tab === t2 ? "#FFF" : "#999" }}>
                  {t2 === "am" ? (lang === "tr" ? "Sabah" : "Morning") : (lang === "tr" ? "Aksam" : "Evening")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator size="small" color="#000" style={{ marginTop: 48 }} />
        ) : routines.length === 0 ? (
          /* Empty state */
          <View style={{ alignItems: "center", paddingHorizontal: 40, marginTop: 40 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36, backgroundColor: "#FFF",
              alignItems: "center", justifyContent: "center", marginBottom: 20,
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
            }}>
              <Ionicons name="leaf-outline" size={28} color="#CCC" />
            </View>
            <Text style={{ fontFamily: F.medium, color: "#666", fontSize: 15, textAlign: "center", marginBottom: 6 }}>{t("routine.noRoutine")}</Text>
            <Text style={{ fontFamily: F.light, color: "#BBB", fontSize: 12, textAlign: "center", lineHeight: 18, marginBottom: 24 }}>{t("routine.addRoutineHint")}</Text>
            <TouchableOpacity style={{ backgroundColor: "#000", borderRadius: 26, paddingVertical: 12, paddingHorizontal: 32 }} onPress={() => router.push("/(tabs)/products")}>
              <Text style={{ fontFamily: F.medium, color: "#FFF", fontSize: 13 }}>{lang === "tr" ? "Urun ekle" : "Add products"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Routine steps as cards */
          <View style={{ paddingHorizontal: 24 }}>
            {/* Progress bar */}
            <View style={{ height: 3, backgroundColor: "#ECECEC", borderRadius: 2, marginBottom: 24 }}>
              <View style={{ height: "100%", backgroundColor: "#000", borderRadius: 2, width: `${pct}%` }} />
            </View>

            {routines.map((r, i) => {
              const done = doneIds.has(r.id);
              const isLast = i === routines.length - 1;

              return (
                <TouchableOpacity key={r.id} onPress={() => !edit && toggle(r.id)} activeOpacity={0.7}
                  style={{
                    flexDirection: "row", alignItems: "center",
                    backgroundColor: "#FFF", borderRadius: 16, padding: 16,
                    marginBottom: isLast ? 0 : 10,
                    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: done ? 0 : 0.05, shadowRadius: 6,
                    opacity: done ? 0.5 : 1,
                  }}>
                  {/* Checkbox */}
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: done ? "#000" : "#FFF",
                    borderWidth: done ? 0 : 1.5, borderColor: "#E0E0E0",
                    alignItems: "center", justifyContent: "center", marginRight: 14,
                  }}>
                    {done ? <Ionicons name="checkmark" size={14} color="#FFF" /> : <Text style={{ fontFamily: F.medium, fontSize: 10, color: "#CCC" }}>{i + 1}</Text>}
                  </View>

                  {/* Icon */}
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: done ? "#F5F5F5" : "#F8F8F8",
                    alignItems: "center", justifyContent: "center", marginRight: 12,
                  }}>
                    <Ionicons name={CAT_ICON[r.product.category] || "ellipse-outline"} size={18} color={done ? "#CCC" : "#333"} />
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontFamily: F.medium, fontSize: 14, color: done ? "#BBB" : "#000",
                      textDecorationLine: done ? "line-through" : "none",
                    }}>
                      {r.product.name}
                    </Text>
                    <Text style={{ fontFamily: F.light, fontSize: 11, color: "#CCC", marginTop: 2 }}>
                      {t(`products.${r.product.category}`)} · {lang === "tr" ? `Adim ${i + 1}` : `Step ${i + 1}`}
                    </Text>
                  </View>

                  {/* Edit actions */}
                  {edit && (
                    <View style={{ flexDirection: "row", gap: 10, marginLeft: 8 }}>
                      <TouchableOpacity onPress={() => move(r.id, "up")} disabled={i === 0} style={{ opacity: i === 0 ? 0.15 : 1 }}>
                        <Ionicons name="chevron-up" size={18} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => move(r.id, "down")} disabled={isLast} style={{ opacity: isLast ? 0.15 : 1 }}>
                        <Ionicons name="chevron-down" size={18} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => Alert.alert(t("common.delete"), r.product.name, [
                        { text: t("common.cancel"), style: "cancel" },
                        { text: t("common.delete"), style: "destructive", onPress: () => { removeFromRoutine(r.id); load(); } },
                      ])}>
                        <Ionicons name="trash-outline" size={18} color="#E00" />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Quick routine button */}
            <TouchableOpacity
              style={{
                marginTop: 20, marginBottom: 100,
                backgroundColor: "#F5F5F5", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onPress={() => routines.filter((r) => r.product.category === "temizleyici" || r.product.category === "nemlendirici").forEach((r) => { if (!doneIds.has(r.id)) toggle(r.id); })}
              activeOpacity={0.7}>
              <Ionicons name="flash" size={16} color="#666" />
              <Text style={{ fontFamily: F.medium, fontSize: 12, color: "#666" }}>{t("routine.quickRoutine")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
