import { useEffect, useState } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";

export default function SplashScreen() {
  const { session, loading } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [subtitleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Logo fade in + scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    // Subtitle fade in (delayed)
    Animated.timing(subtitleAnim, {
      toValue: 1,
      duration: 600,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(onboarding)/language");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading, session]);

  return (
    <View className="flex-1 bg-cloud items-center justify-center">
      {/* Decorative circles */}
      <View
        className="absolute w-72 h-72 rounded-full bg-blush/20"
        style={{ top: -40, right: -60 }}
      />
      <View
        className="absolute w-56 h-56 rounded-full bg-lavender/20"
        style={{ bottom: -30, left: -40 }}
      />
      <View
        className="absolute w-40 h-40 rounded-full bg-sage/20"
        style={{ top: "40%", left: -20 }}
      />

      {/* Logo */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        <View className="w-28 h-28 rounded-full bg-blush items-center justify-center mb-6">
          <Text style={{ fontSize: 48 }}>✨</Text>
        </View>
        <Text
          className="text-charcoal text-5xl font-bold"
          style={{ letterSpacing: 2 }}
        >
          Lumina
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={{ opacity: subtitleAnim, marginTop: 12 }}>
        <Text className="text-smoke text-base" style={{ letterSpacing: 0.5 }}>
          Your skin, your story.
        </Text>
      </Animated.View>
    </View>
  );
}
