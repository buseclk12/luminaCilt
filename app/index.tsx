import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";

const { width } = Dimensions.get("window");
const SPLASH_DURATION = 2500;

export default function SplashScreen() {
  const { session, loading } = useAuthStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  const navigate = () => {
    if (session) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(onboarding)/language");
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.delay(SPLASH_DURATION - 1600),
        Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(scale, { toValue: 1, duration: SPLASH_DURATION, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      if (!loading) navigate();
    }, SPLASH_DURATION);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(navigate, SPLASH_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [loading, session]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/splash-icon.png")}
        style={[styles.image, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
  },
});
