import { View, Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import i18n from "../../src/i18n";

export default function LanguageScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const selectLanguage = (lang: "tr" | "en") => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    setTimeout(() => {
      router.push("/(auth)/login");
    }, 300);
  };

  return (
    <Animated.View
      className="flex-1 bg-cloud items-center justify-center px-8"
      style={{ opacity: fadeAnim }}
    >
      {/* Decorative */}
      <View
        className="absolute w-64 h-64 rounded-full bg-blush/15"
        style={{ top: 60, right: -80 }}
      />
      <View
        className="absolute w-48 h-48 rounded-full bg-sage/15"
        style={{ bottom: 100, left: -60 }}
      />

      {/* Icon */}
      <View className="w-20 h-20 rounded-full bg-blush items-center justify-center mb-8">
        <Text style={{ fontSize: 36 }}>🌍</Text>
      </View>

      <Text className="text-3xl font-bold text-charcoal mb-2">
        Choose Language
      </Text>
      <Text className="text-smoke text-base mb-10">
        Dilinizi secin
      </Text>

      {/* Language Options */}
      <View className="w-full gap-4">
        <TouchableOpacity
          onPress={() => selectLanguage("tr")}
          className={`flex-row items-center p-5 rounded-card border-2 ${
            selectedLang === "tr" ? "border-charcoal bg-cream" : "border-transparent bg-white"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 32 }} className="mr-4">
            🇹🇷
          </Text>
          <View>
            <Text className="text-charcoal font-semibold text-lg">Turkce</Text>
            <Text className="text-smoke text-sm">Turkce olarak devam et</Text>
          </View>
          {selectedLang === "tr" && (
            <View className="ml-auto w-6 h-6 rounded-full bg-charcoal items-center justify-center">
              <Text className="text-white text-xs">✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => selectLanguage("en")}
          className={`flex-row items-center p-5 rounded-card border-2 ${
            selectedLang === "en" ? "border-charcoal bg-cream" : "border-transparent bg-white"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 32 }} className="mr-4">
            🇬🇧
          </Text>
          <View>
            <Text className="text-charcoal font-semibold text-lg">English</Text>
            <Text className="text-smoke text-sm">Continue in English</Text>
          </View>
          {selectedLang === "en" && (
            <View className="ml-auto w-6 h-6 rounded-full bg-charcoal items-center justify-center">
              <Text className="text-white text-xs">✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
