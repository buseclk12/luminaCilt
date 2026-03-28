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
import type { SkinType } from "../../src/types";

const SKIN_TYPES: SkinType[] = ["kuru", "yagli", "karma", "hassas", "normal"];

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name || !email || !password || !skinType) {
      Alert.alert(t("common.error"), t("auth.fillAll"));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t("common.error"), t("auth.invalidEmail"));
      return false;
    }
    if (password.length < 6) {
      Alert.alert(t("common.error"), t("auth.weakPassword"));
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setLoading(false);
      Alert.alert(t("auth.registerError"), error.message);
      return;
    }
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        display_name: name.trim(),
        skin_type: skinType,
      });
      if (profileError) {
        setLoading(false);
        Alert.alert(t("auth.registerError"), profileError.message);
        return;
      }
    }
    setLoading(false);
    router.replace("/(tabs)");
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
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-charcoal">
              {t("auth.register")}
            </Text>
            <Text className="text-smoke mt-2 text-base">
              {t("auth.skinJourney")}
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm text-smoke mb-2 ml-1">
                {t("auth.name")}
              </Text>
              <TextInput
                className="bg-white rounded-2xl px-5 py-4 text-charcoal text-base"
                placeholder={t("auth.namePlaceholder")}
                placeholderTextColor="#AAAAAA"
                value={name}
                onChangeText={setName}
              />
            </View>

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

            <View>
              <Text className="text-sm text-smoke mb-3 ml-1">
                {t("skinType.title")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SKIN_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSkinType(type)}
                    className={`px-5 py-3 rounded-2xl ${
                      skinType === type ? "bg-charcoal" : "bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        skinType === type ? "text-white" : "text-charcoal"
                      }`}
                    >
                      {t(`skinType.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              className="bg-charcoal rounded-2xl py-4 items-center mt-4"
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? t("auth.registering") : t("auth.registerButton")}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-smoke">{t("auth.hasAccount")} </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-charcoal font-semibold underline">
                  {t("auth.login")}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
