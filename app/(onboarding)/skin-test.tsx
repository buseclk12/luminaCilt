import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  SKIN_TEST_QUESTIONS,
  calculateSkinType,
} from "../../src/data/skinTestQuestions";
import { useAuthStore } from "../../src/stores/authStore";
import { updateProfile } from "../../src/lib/api";
import { supabase } from "../../src/lib/supabase";

const BG_COLORS = [
  "#FFF8F3", // warm cream
  "#FFF5F0", // soft peach
  "#F8F0FF", // soft lavender
  "#F0F8F3", // soft sage
  "#FFF3F8", // soft pink
  "#F3F8FF", // soft blue
  "#FFF8F0", // soft apricot
  "#F0FFF5", // mint
  "#F8F3FF", // light violet
  "#FFF5F5", // blush
];

function getPersonalMessage(
  name: string,
  skinType: string,
  scores: Record<string, number>,
  lang: string
): { greeting: string; detail: string } {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1] && sorted[1][1] > sorted[0][1] * 0.5 ? sorted[1][0] : null;

  const typeNamesTr: Record<string, string> = {
    kuru: "Kuru", normal: "Normal", karma: "Karma", yagli: "Yagli", hassas: "Hassas",
  };
  const typeNamesEn: Record<string, string> = {
    kuru: "Dry", normal: "Normal", karma: "Combination", yagli: "Oily", hassas: "Sensitive",
  };

  const comboLabel = secondary
    ? lang === "tr"
      ? `${typeNamesTr[secondary]} ${typeNamesTr[primary]}`
      : `${typeNamesEn[secondary]} ${typeNamesEn[primary]}`
    : lang === "tr"
      ? typeNamesTr[primary]
      : typeNamesEn[primary];

  if (lang === "tr") {
    const greetings: Record<string, string> = {
      kuru: `Selam ${name}! Test sonuclarina gore cildin tam bir '${comboLabel}'. Cildin susuzluga meyilli, yani bol bol sevgi ve nem istiyor!`,
      normal: `Selam ${name}! Test sonuclarina gore cildin tam bir '${comboLabel}'. Tebrikler, cildin cok dengeli! Ama bu onu ihmal edebilecegin anlamina gelmiyor.`,
      karma: `Selam ${name}! Test sonuclarina gore cildin tam bir '${comboLabel}'. Yani ilgi istiyor! T bolgendeki parlamayi kontrol altina alirken, yanaklarini simartacak nemlendiricilere odaklanmaliyiz.`,
      yagli: `Selam ${name}! Test sonuclarina gore cildin tam bir '${comboLabel}'. Cildin enerjik ve aktif! Dogru urunlerle bu enerjiyi kontrol altina alalim.`,
      hassas: `Selam ${name}! Test sonuclarina gore cildin tam bir '${comboLabel}'. Cildin cok nazik ve ozel ilgi istiyor. Birlikte ona en uygun rutini olusturacagiz.`,
    };
    const details: Record<string, string> = {
      kuru: "Hyaluronik asit ve seramid iceren nemlendirici serumlar senin en iyi dostun olacak. Hafif, sulufu temizleyiciler kullan ve haftada 1-2 kez nemlendirici maske uygula. SPF'i asla unutma cunku kuru ciltler gunesten daha hizli zarar goruyor.",
      normal: "Temel bir rutin sana yeterli: nazik temizleyici, hafif nemlendirici ve SPF. Antioksidan iceren bir C vitamini serumu cildini parlak ve genclestirici tutacak. Haftada bir hafif peeling ile olü derileri temizleyebilirsin.",
      karma: "T bolgen icin yagisiz, matlaistirici urunler; yanaklar icin besleyici nemlendirici kullan. Niacinamide iceren serumlar hem yaglanmayi kontrol eder hem gozenukleri sikilastirir. Cift bolgesel bakim stratejisi senin anahtarin!",
      yagli: "Yagisiz, hafif jel formuller ve niacinamide senin en iyi dostlarin. Gunluk SPF sart ama yagisiz formuller sec. Salisilik asit iceren temizleyiciler gozeneklerini temiz tutacak. Nemlendiriciyi ASLA atlama, cildin daha fazla yag uretir!",
      hassas: "Parfumsuz, hipoalerjenik urunler hayat kurtarici olacak. Her yeni urunu once kulagin arkasinda 24 saat test et. Bir seferde sadece BIR urun ekle ki hangisinin tepki verdigini anla. Centella ve aloe vera iceren urunler cildini sakinlestirecek.",
    };
    return { greeting: greetings[primary], detail: details[primary] };
  } else {
    const greetings: Record<string, string> = {
      kuru: `Hey ${name}! Based on your results, your skin is '${comboLabel}'. Your skin craves moisture and needs extra love and hydration!`,
      normal: `Hey ${name}! Based on your results, your skin is '${comboLabel}'. Congrats, your skin is beautifully balanced! But that doesn't mean you can skip your routine.`,
      karma: `Hey ${name}! Based on your results, your skin is '${comboLabel}'. Your skin needs attention! We need to control T-zone shine while pampering your cheeks with the right moisturizers.`,
      yagli: `Hey ${name}! Based on your results, your skin is '${comboLabel}'. Your skin is energetic and active! Let's channel that energy with the right products.`,
      hassas: `Hey ${name}! Based on your results, your skin is '${comboLabel}'. Your skin is delicate and needs special care. Together, we'll build the perfect routine for it.`,
    };
    const details: Record<string, string> = {
      kuru: "Serums with hyaluronic acid and ceramides will be your best friends. Use gentle, sulfate-free cleansers and apply a hydrating mask 1-2 times a week. Never skip SPF — dry skin gets sun damage faster.",
      normal: "A basic routine works great for you: gentle cleanser, lightweight moisturizer, and SPF. A vitamin C serum with antioxidants will keep your skin glowing. Try a gentle exfoliant once a week.",
      karma: "Use oil-free, mattifying products for your T-zone and nourishing moisturizer for cheeks. Niacinamide serums control both oiliness and tighten pores. A dual-zone care strategy is your key!",
      yagli: "Oil-free gel formulas and niacinamide are your best friends. Daily SPF is essential but choose oil-free formulas. Salicylic acid cleansers keep pores clean. NEVER skip moisturizer — your skin will produce even more oil!",
      hassas: "Fragrance-free, hypoallergenic products will be lifesavers. Always patch-test new products behind your ear for 24 hours. Add only ONE product at a time to identify reactions. Products with centella and aloe vera will calm your skin.",
    };
    return { greeting: greetings[primary], detail: details[primary] };
  }
}

const RESULT_COLORS: Record<string, { emoji: string; color: string }> = {
  kuru: { emoji: "🏜️", color: "#F4E1D2" },
  normal: { emoji: "✨", color: "#D4E2D3" },
  karma: { emoji: "🎭", color: "#E8E0F0" },
  yagli: { emoji: "💧", color: "#E0F0E8" },
  hassas: { emoji: "🌸", color: "#FFE8E8" },
};

export default function SkinTestScreen() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const { profile, setProfile, session } = useAuthStore();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateSkinType> | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const question = SKIN_TEST_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / SKIN_TEST_QUESTIONS.length) * 100;

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);

    setTimeout(() => {
      const newAnswers = [...answers, optionIndex];
      setAnswers(newAnswers);

      if (currentQ < SKIN_TEST_QUESTIONS.length - 1) {
        animateTransition(() => {
          setCurrentQ((prev) => prev + 1);
          setSelectedOption(null);
        });
      } else {
        // Calculate result
        const res = calculateSkinType(newAnswers);
        setResult(res);

        animateTransition(() => {
          setShowResult(true);
        });

        // Save to profile + DB
        if (session?.user && profile) {
          updateProfile(session.user.id, { skin_type: res.skinType }).then(
            (updated) => {
              if (updated) setProfile(updated);
            }
          );
          supabase.from("skin_test_results").insert({
            user_id: session.user.id,
            answers: newAnswers,
            scores: res.scores,
            result_skin_type: res.skinType,
          });
        }
      }
    }, 400);
  };

  const handleGoBack = () => {
    if (currentQ > 0) {
      animateTransition(() => {
        setAnswers((prev) => prev.slice(0, -1));
        setCurrentQ((prev) => prev - 1);
        setSelectedOption(null);
      });
    }
  };

  const handleFinish = () => {
    router.replace("/(tabs)");
  };

  // ─── RESULT SCREEN ─────────────────────────────────────
  if (showResult && result) {
    const rc = RESULT_COLORS[result.skinType];
    const userName = profile?.display_name || "";
    const msg = getPersonalMessage(userName, result.skinType, result.scores, lang);
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: rc.color }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32 }}>
          <View className="items-center mt-8">
            <Text style={{ fontSize: 72 }}>{rc.emoji}</Text>

            {/* Personal greeting */}
            <View className="mt-6 bg-white/70 rounded-card p-6 w-full">
              <Text className="text-charcoal text-lg font-bold leading-7 text-center">
                {msg.greeting}
              </Text>
            </View>

            {/* Detailed advice */}
            <View className="mt-4 bg-white/50 rounded-card p-5 w-full">
              <Text className="text-charcoal font-semibold text-sm mb-2">
                {lang === "tr" ? "Sana Ozel Onerimiz" : "Our Recommendation for You"}
              </Text>
              <Text className="text-smoke text-sm leading-6">
                {msg.detail}
              </Text>
            </View>

            {/* Score breakdown */}
            <View className="mt-4 w-full bg-white/60 rounded-card p-5">
              <Text className="text-charcoal font-semibold text-sm mb-3">
                {lang === "tr" ? "Detayli Analiz" : "Detailed Analysis"}
              </Text>
              {Object.entries(result.scores)
                .sort((a, b) => b[1] - a[1])
                .map(([type, score]) => {
                  const maxScore = Math.max(...Object.values(result.scores));
                  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
                  const labelMap: Record<string, string> = lang === "tr"
                    ? { kuru: "Kuru", normal: "Normal", karma: "Karma", yagli: "Yagli", hassas: "Hassas" }
                    : { kuru: "Dry", normal: "Normal", karma: "Combination", yagli: "Oily", hassas: "Sensitive" };
                  return (
                    <View key={type} className="mb-2">
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-smoke text-xs">{labelMap[type]}</Text>
                        <Text className="text-smoke text-xs">{score}</Text>
                      </View>
                      <View className="h-2 bg-white rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full bg-charcoal"
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
            </View>

            <TouchableOpacity
              className="bg-charcoal rounded-2xl py-4 px-12 mt-8"
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                {lang === "tr" ? "Rutinime Basla" : "Start My Routine"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── QUESTION SCREEN ───────────────────────────────────
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG_COLORS[currentQ] }}>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-2 mb-4">
          <TouchableOpacity
            onPress={handleGoBack}
            disabled={currentQ === 0}
            style={{ opacity: currentQ === 0 ? 0.3 : 1 }}
          >
            <Ionicons name="chevron-back" size={24} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-smoke text-sm">
            {currentQ + 1} / {SKIN_TEST_QUESTIONS.length}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress */}
        <View className="h-1.5 bg-white/50 rounded-full mb-8 overflow-hidden">
          <View
            className="h-full bg-charcoal rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Question */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            flex: 1,
          }}
        >
          <Text className="text-sm text-smoke mb-2">
            {lang === "tr" ? "Soru" : "Question"} {currentQ + 1}
          </Text>
          <Text className="text-charcoal text-xl font-bold leading-7 mb-8">
            {lang === "tr" ? question.text_tr : question.text_en}
          </Text>

          {/* Options */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {question.options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelect(idx)}
                  disabled={selectedOption !== null}
                  className={`p-5 rounded-card border-2 ${
                    selectedOption === idx
                      ? "border-charcoal bg-charcoal"
                      : "border-transparent bg-white"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${
                        selectedOption === idx
                          ? "bg-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          selectedOption === idx ? "text-charcoal" : "text-smoke"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text
                      className={`flex-1 text-base leading-5 ${
                        selectedOption === idx ? "text-white font-medium" : "text-charcoal"
                      }`}
                    >
                      {lang === "tr" ? option.label_tr : option.label_en}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
