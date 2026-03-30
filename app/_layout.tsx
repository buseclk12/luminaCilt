import "../global.css";
import "../src/i18n";
import { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { PlayfairDisplay_400Regular, PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold } from "@expo-google-fonts/playfair-display";
import { useAuthStore } from "../src/stores/authStore";
import { supabase } from "../src/lib/supabase";
import { fetchProfile } from "../src/lib/api";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setSession, setProfile, setLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        clearTimeout(timeout);
        setSession(session);
        if (session?.user) {
          try {
            const profile = await fetchProfile(session.user.id);
            if (profile) setProfile(profile);
          } catch {}
        }
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          if (profile) setProfile(profile);
        } catch {}
      } else {
        setProfile(null);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
