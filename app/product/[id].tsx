import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import { supabase } from "../../src/lib/supabase";
import { fetchObservations } from "../../src/lib/api";
import type { Product, Observation } from "../../src/types";

const SCORE_COLORS = ["#4CAF50", "#8BC34A", "#FFC107", "#FF9800", "#F44336"];
const HYDRATION_COLORS = ["#F44336", "#FF9800", "#FFC107", "#4CAF50", "#2196F3"];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { session } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    const [prodRes, obsData] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      fetchObservations(id),
    ]);
    if (prodRes.data) setProduct(prodRes.data);
    setObservations(obsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cloud items-center justify-center">
        <ActivityIndicator size="large" color="#2D2D2D" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-cloud items-center justify-center">
        <Text className="text-smoke">{t("productDetail.notFound")}</Text>
      </SafeAreaView>
    );
  }

  // Calculate averages
  const avgIrritation = observations.length > 0
    ? observations.reduce((s, o) => s + o.irritation_score, 0) / observations.length
    : 0;
  const avgBreakout = observations.length > 0
    ? observations.reduce((s, o) => s + o.breakout_score, 0) / observations.length
    : 0;
  const avgHydration = observations.length > 0
    ? observations.reduce((s, o) => s + o.hydration_score, 0) / observations.length
    : 0;

  // Summary verdict
  const getVerdict = () => {
    if (observations.length < 7) return null;
    const badScore = avgIrritation + avgBreakout;
    if (badScore <= 4 && avgHydration >= 3) {
      return { emoji: "✅", text: t("observation.goodResult"), color: "#D4E2D3" };
    }
    if (badScore >= 7) {
      return { emoji: "⚠️", text: t("observation.badResult"), color: "#FFE8E8" };
    }
    return { emoji: "📊", text: t("observation.neutralResult"), color: "#E8E0F0" };
  };

  const verdict = getVerdict();

  const ScoreBar = ({ label, value, colors }: { label: string; value: number; colors: string[] }) => (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-smoke text-xs">{label}</Text>
        <Text className="text-charcoal text-xs font-bold">{value.toFixed(1)}/5</Text>
      </View>
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <View
            key={n}
            className="flex-1 h-3 rounded-full"
            style={{
              backgroundColor: n <= Math.round(value) ? colors[n - 1] : "#E5E5E5",
            }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-6 mt-4 mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="chevron-back" size={24} color="#2D2D2D" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-charcoal">{product.name}</Text>
            <Text className="text-smoke text-sm">{t(`products.${product.category}`)}</Text>
          </View>
        </View>

        {/* 7-Day Summary Verdict */}
        {verdict && (
          <View className="mx-6 mb-4 p-5 rounded-card" style={{ backgroundColor: verdict.color }}>
            <View className="flex-row items-center gap-3">
              <Text style={{ fontSize: 32 }}>{verdict.emoji}</Text>
              <View className="flex-1">
                <Text className="text-charcoal font-semibold text-base">
                  {lang === "tr" ? t("observation.summary") : t("observation.summary")}
                </Text>
                <Text className="text-charcoal text-sm mt-1">{verdict.text}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Average Scores */}
        {observations.length > 0 && (
          <View className="mx-6 mb-4 bg-white rounded-card p-5" style={{
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
          }}>
            <Text className="text-charcoal font-semibold text-sm mb-4">
              {t("productDetail.averageScores")}
              {` (${observations.length} ${t("productDetail.days")})`}
            </Text>
            <ScoreBar label={t("observation.irritation")} value={avgIrritation} colors={SCORE_COLORS} />
            <ScoreBar label={t("observation.breakout")} value={avgBreakout} colors={SCORE_COLORS} />
            <ScoreBar label={t("observation.hydration")} value={avgHydration} colors={HYDRATION_COLORS} />
          </View>
        )}

        {/* Daily Observation Chart */}
        {observations.length > 0 && (
          <View className="mx-6 mb-4 bg-white rounded-card p-5" style={{
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
          }}>
            <Text className="text-charcoal font-semibold text-sm mb-4">
              {t("productDetail.dailyProgress")}
            </Text>
            {observations.map((obs) => (
              <View key={obs.id} className="mb-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-charcoal font-medium text-sm">
                    {t("observation.day", { number: obs.day_number })}
                  </Text>
                  <View className="flex-row gap-3">
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: SCORE_COLORS[obs.irritation_score - 1] }} />
                      <Text className="text-smoke text-xs">{obs.irritation_score}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: SCORE_COLORS[obs.breakout_score - 1] }} />
                      <Text className="text-smoke text-xs">{obs.breakout_score}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: HYDRATION_COLORS[obs.hydration_score - 1] }} />
                      <Text className="text-smoke text-xs">{obs.hydration_score}</Text>
                    </View>
                  </View>
                </View>
                {obs.note && (
                  <Text className="text-smoke text-xs italic">"{obs.note}"</Text>
                )}
              </View>
            ))}
            <View className="flex-row justify-center gap-6 mt-2">
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-red-400" />
                <Text className="text-smoke text-xs">{t("productDetail.irritationLabel")}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-orange-400" />
                <Text className="text-smoke text-xs">{t("productDetail.breakoutLabel")}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-blue-400" />
                <Text className="text-smoke text-xs">{t("productDetail.hydrationLabel")}</Text>
              </View>
            </View>
          </View>
        )}

        {/* No observations */}
        {observations.length === 0 && (
          <View className="mx-6 items-center py-12">
            <Ionicons name="analytics-outline" size={48} color="#AAAAAA" />
            <Text className="text-smoke mt-4 text-base text-center">
              {t("productDetail.noObservations")}
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
