import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "../../src/lib/supabase";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.fillAll"));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t("common.error"), t("auth.invalidEmail"));
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert(t("auth.loginError"), error.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cloud"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8">
          <View className="items-center mb-12">
            <View className="w-20 h-20 rounded-full bg-blush items-center justify-center mb-4">
              <Text className="text-3xl">✨</Text>
            </View>
            <Text className="text-4xl font-bold text-charcoal">
              {t("brand.name")}
            </Text>
            <Text className="text-smoke mt-2 text-base">{t("brand.motto")}</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm text-smoke mb-2 ml-1">
                {t("auth.email")}
              </Text>
              <TextInput
                className="bg-white rounded-2xl px-5 py-4 text-charcoal text-base"
                placeholder={t("auth.emailPlaceholder")}
                placeholderTextColor="#AAAAAA"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-sm text-smoke mb-2 ml-1">
                {t("auth.password")}
              </Text>
              <TextInput
                className="bg-white rounded-2xl px-5 py-4 text-charcoal text-base"
                placeholder={t("auth.passwordPlaceholder")}
                placeholderTextColor="#AAAAAA"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className="bg-charcoal rounded-2xl py-4 items-center mt-4"
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? t("auth.loggingIn") : t("auth.loginButton")}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-smoke">{t("auth.noAccount")} </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-charcoal font-semibold underline">
                  {t("auth.register")}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
