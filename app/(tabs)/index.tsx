import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import { fetchHomeStats } from "../../src/lib/api";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, session } = useAuthStore();

  const [stats, setStats] = useState({
    progress: 0,
    observingCount: 0,
    pendingRoutine: "am" as "am" | "pm",
    totalRoutineSteps: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!session?.user) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await fetchHomeStats(session.user.id, today);
      setStats(data);
    } catch {}
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const getPendingText = () => {
    if (stats.progress === 100) return t("home.allDone");
    return stats.pendingRoutine === "pm"
      ? t("home.eveningWaiting")
      : t("home.morningStart");
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadStats();
              setRefreshing(false);
            }}
            tintColor="#2D2D2D"
          />
        }
      >
        {/* Header */}
        <View className="mt-4 mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-charcoal">
                {t("home.greeting")}
                {profile?.display_name ? ` ${profile.display_name}` : ""},
              </Text>
              <Text className="text-smoke text-base mt-1">
                {t("home.subtitle")}
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-blush items-center justify-center">
              <Text className="text-lg">
                {profile?.display_name?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          </View>
        </View>

        {/* Onboarding - first time user */}
        {!loading && stats.totalRoutineSteps === 0 && stats.observingCount === 0 && (
          <View className="mb-6">
            <View className="bg-blush/30 rounded-card p-6 mb-4">
              <Text className="text-charcoal font-bold text-lg mb-2">
                {t("onboarding.welcomeTitle")}
              </Text>
              <Text className="text-smoke text-sm mb-5 leading-5">
                {t("onboarding.welcomeDesc")}
              </Text>

              <View className="gap-4">
                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center mt-0.5">
                    <Text className="text-charcoal font-bold text-xs">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-charcoal font-semibold text-sm">{t("onboarding.step1")}</Text>
                    <Text className="text-smoke text-xs mt-0.5">{t("onboarding.step1Desc")}</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center mt-0.5">
                    <Text className="text-charcoal font-bold text-xs">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-charcoal font-semibold text-sm">{t("onboarding.step2")}</Text>
                    <Text className="text-smoke text-xs mt-0.5">{t("onboarding.step2Desc")}</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center mt-0.5">
                    <Text className="text-charcoal font-bold text-xs">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-charcoal font-semibold text-sm">{t("onboarding.step3")}</Text>
                    <Text className="text-smoke text-xs mt-0.5">{t("onboarding.step3Desc")}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="bg-charcoal rounded-2xl py-3.5 items-center mt-5"
                onPress={() => router.push("/(tabs)/products")}
                activeOpacity={0.8}
              >
                <Text className="text-white text-sm font-semibold">
                  {t("onboarding.getStarted")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Daily Routine Progress */}
        <TouchableOpacity
          className="bg-white rounded-card p-5 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
          onPress={() => router.push("/(tabs)/routine")}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-cream items-center justify-center">
                <Ionicons name="sparkles-outline" size={20} color="#2D2D2D" />
              </View>
              <View>
                <Text className="text-charcoal font-semibold text-base">
                  {t("home.dailyRoutine")}
                </Text>
                <Text className="text-smoke text-sm">{getPendingText()}</Text>
              </View>
            </View>
            <Text className="text-charcoal font-bold text-lg">
              {stats.progress}%
            </Text>
          </View>
          <View className="mt-4 h-2 bg-cream rounded-full overflow-hidden">
            <View
              className="h-full bg-charcoal rounded-full"
              style={{ width: `${stats.progress}%` }}
            />
          </View>
        </TouchableOpacity>

        {/* Observation Alert */}
        {stats.observingCount > 0 && (
          <TouchableOpacity
            className="bg-blush/40 rounded-card p-5 mb-4"
            onPress={() => router.push("/(tabs)/products")}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                <Ionicons name="eye-outline" size={20} color="#2D2D2D" />
              </View>
              <View className="flex-1">
                <Text className="text-charcoal font-semibold text-base">
                  {t("home.observing")}
                </Text>
                <Text className="text-smoke text-sm">
                  {t("home.productsObserving", { count: stats.observingCount })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B6B6B" />
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text className="text-charcoal font-semibold text-lg mt-4 mb-3">
          {t("home.quickActions")}
        </Text>
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-white rounded-card p-5 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
            onPress={() => router.push("/(tabs)/products")}
            activeOpacity={0.8}
          >
            <View className="w-12 h-12 rounded-full bg-lavender items-center justify-center mb-3">
              <Ionicons name="add" size={24} color="#2D2D2D" />
            </View>
            <Text className="text-charcoal font-medium text-sm">
              {t("home.addProduct")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-card p-5 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
            onPress={() => router.push("/(tabs)/routine")}
            activeOpacity={0.8}
          >
            <View className="w-12 h-12 rounded-full bg-sage items-center justify-center mb-3">
              <Ionicons name="flash-outline" size={24} color="#2D2D2D" />
            </View>
            <Text className="text-charcoal font-medium text-sm">
              {t("home.quickRoutine")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View className="bg-cream rounded-card p-5 mb-8">
          <Text className="text-charcoal font-semibold text-base mb-2">
            {t("home.tipTitle")}
          </Text>
          <Text className="text-smoke text-sm leading-5">
            {t("home.tipText")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
