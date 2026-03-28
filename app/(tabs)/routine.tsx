import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import { fetchRoutines, fetchRoutineLogs, toggleRoutineLog } from "../../src/lib/api";
import type { Routine, Product, RoutineType } from "../../src/types";

const CATEGORY_COLORS: Record<string, string> = {
  temizleyici: "bg-cream",
  tonik: "bg-cream",
  serum: "bg-lavender",
  nemlendirici: "bg-sage",
  gunes_kremi: "bg-blush",
  diger: "bg-white",
};

function getWeekDays(t: (key: string) => string) {
  const today = new Date();
  const dayNames = [
    t("days.sun"), t("days.mon"), t("days.tue"), t("days.wed"),
    t("days.thu"), t("days.fri"), t("days.sat"),
  ];
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      day: dayNames[d.getDay()],
      date: d.getDate(),
      fullDate: d.toISOString().split("T")[0],
      isToday: i === 0,
    });
  }
  return days;
}

export default function RoutineScreen() {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [activeTab, setActiveTab] = useState<RoutineType>("am");
  const [days] = useState(() => getWeekDays(t));
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [routines, setRoutines] = useState<(Routine & { product: Product })[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!session?.user) return;
    try {
      const [routineData, logData] = await Promise.all([
        fetchRoutines(session.user.id, activeTab),
        fetchRoutineLogs(session.user.id, selectedDate),
      ]);
      setRoutines(routineData);
      setCompletedIds(new Set(logData.map((l) => l.routine_id)));
    } catch {}
    setLoading(false);
  }, [session, activeTab, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const handleToggle = async (routineId: string) => {
    if (!session?.user) return;
    const wasCompleted = completedIds.has(routineId);
    // Optimistic update
    setCompletedIds((prev) => {
      const next = new Set(prev);
      wasCompleted ? next.delete(routineId) : next.add(routineId);
      return next;
    });
    try {
      await toggleRoutineLog(session.user.id, routineId, selectedDate);
    } catch {
      // Revert on error
      setCompletedIds((prev) => {
        const next = new Set(prev);
        wasCompleted ? next.add(routineId) : next.delete(routineId);
        return next;
      });
    }
  };

  const handleQuickRoutine = () => {
    // Show only cleanser + moisturizer
    const quickSteps = routines.filter(
      (r) => r.product.category === "temizleyici" || r.product.category === "nemlendirici"
    );
    if (quickSteps.length === 0) return;
    // Toggle all quick steps as completed
    quickSteps.forEach((step) => {
      if (!completedIds.has(step.id)) {
        handleToggle(step.id);
      }
    });
  };

  const completedCount = routines.filter((r) => completedIds.has(r.id)).length;
  const progress = routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 mt-4 mb-2">
          <Text className="text-2xl font-bold text-charcoal">{t("routine.title")}</Text>
        </View>

        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-5"
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          {days.map((d) => (
            <TouchableOpacity
              key={d.fullDate}
              onPress={() => setSelectedDate(d.fullDate)}
              className={`items-center mx-2 px-4 py-3 rounded-2xl ${
                selectedDate === d.fullDate ? "bg-charcoal" : "bg-white"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs mb-1 ${
                  selectedDate === d.fullDate ? "text-white/70" : "text-smoke"
                }`}
              >
                {d.day}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  selectedDate === d.fullDate ? "text-white" : "text-charcoal"
                }`}
              >
                {d.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AM/PM Toggle */}
        <View className="flex-row mx-6 mb-5 bg-white rounded-2xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("am")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "am" ? "bg-charcoal" : ""
            }`}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold ${activeTab === "am" ? "text-white" : "text-smoke"}`}>
              {t("routine.morning")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("pm")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "pm" ? "bg-charcoal" : ""
            }`}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold ${activeTab === "pm" ? "text-white" : "text-smoke"}`}>
              {t("routine.evening")}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2D2D2D" className="mt-8" />
        ) : routines.length === 0 ? (
          <View className="items-center px-6 mt-8">
            <Ionicons name="leaf-outline" size={48} color="#AAAAAA" />
            <Text className="text-smoke mt-4 text-base text-center">
              {t("routine.noRoutine")}
            </Text>
            <Text className="text-smoke mt-2 text-sm text-center">
              {t("routine.addRoutineHint")}
            </Text>
          </View>
        ) : (
          <>
            {/* Progress */}
            <View className="mx-6 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-smoke text-sm">
                  {t("routine.stepsCompleted", {
                    completed: completedCount,
                    total: routines.length,
                  })}
                </Text>
                <Text className="text-charcoal font-bold">{progress}%</Text>
              </View>
              <View className="h-2 bg-cream rounded-full overflow-hidden">
                <View className="h-full bg-charcoal rounded-full" style={{ width: `${progress}%` }} />
              </View>
            </View>

            {/* Steps */}
            <View className="px-6 gap-3 mb-4">
              {routines.map((routine) => {
                const isCompleted = completedIds.has(routine.id);
                const bgColor = CATEGORY_COLORS[routine.product.category] || "bg-white";
                return (
                  <TouchableOpacity
                    key={routine.id}
                    onPress={() => handleToggle(routine.id)}
                    activeOpacity={0.7}
                    className={`flex-row items-center p-4 rounded-card ${bgColor}`}
                    style={{ opacity: isCompleted ? 0.7 : 1 }}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${
                        isCompleted ? "bg-charcoal" : "bg-white border-2 border-gray-200"
                      }`}
                    >
                      {isCompleted && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base font-medium ${
                          isCompleted ? "text-smoke line-through" : "text-charcoal"
                        }`}
                      >
                        {routine.product.name}
                      </Text>
                      <Text className="text-smoke text-xs mt-1">
                        {t("routine.step", { number: routine.step_order })} •{" "}
                        {t(`products.${routine.product.category}`)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Routine */}
            <View className="px-6 mb-8">
              <TouchableOpacity
                className="bg-cream rounded-card py-4 items-center"
                activeOpacity={0.7}
                onPress={handleQuickRoutine}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="flash-outline" size={18} color="#2D2D2D" />
                  <Text className="text-charcoal font-medium">{t("routine.quickRoutine")}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
