import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n from "../../src/i18n";
import { useAuthStore } from "../../src/stores/authStore";
import { updateProfile } from "../../src/lib/api";
import { requestPermissions, scheduleRoutineReminders, cancelAllReminders } from "../../src/lib/notifications";
import type { SkinType } from "../../src/types";

const SKIN_TYPES: SkinType[] = ["kuru", "yagli", "karma", "hassas", "normal"];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { profile, setProfile, signOut } = useAuthStore();

  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || "");
  const [editSkinType, setEditSkinType] = useState<SkinType>(
    (profile?.skin_type as SkinType) || "normal"
  );
  const [saving, setSaving] = useState(false);

  const handleSignOut = () => {
    Alert.alert(t("auth.logout"), t("auth.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!profile?.id || !editName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, {
        display_name: editName.trim(),
        skin_type: editSkinType,
      });
      if (updated) setProfile(updated);
      setEditModal(false);
      Alert.alert(t("common.success"), t("profile.saved"));
    } catch (err: any) {
      Alert.alert(t("common.error"), err.message);
    }
    setSaving(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(newLang);
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      await cancelAllReminders();
      setNotificationsEnabled(false);
      Alert.alert(
        t("common.success"),
        i18n.language === "tr" ? "Bildirimler kapatildi." : "Notifications disabled."
      );
    } else {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleRoutineReminders();
        setNotificationsEnabled(true);
        Alert.alert(
          t("common.success"),
          i18n.language === "tr"
            ? "Sabah 08:00 ve aksam 21:00 hatirlatici ayarlandi."
            : "Morning 8:00 and evening 9:00 PM reminders set."
        );
      } else {
        Alert.alert(
          t("common.error"),
          i18n.language === "tr"
            ? "Bildirim izni gerekli. Ayarlardan izin verin."
            : "Notification permission required. Please enable in Settings."
        );
      }
    }
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      label: t("profile.editProfile"),
      bg: "bg-cream",
      onPress: () => {
        setEditName(profile?.display_name || "");
        setEditSkinType((profile?.skin_type as SkinType) || "normal");
        setEditModal(true);
      },
    },
    {
      icon: "language-outline" as const,
      label: `${t("profile.language")}: ${i18n.language === "tr" ? "Turkce" : "English"}`,
      bg: "bg-blush",
      onPress: toggleLanguage,
    },
    {
      icon: "notifications-outline" as const,
      label: `${t("profile.notifications")}: ${notificationsEnabled ? (i18n.language === "tr" ? "Acik" : "On") : (i18n.language === "tr" ? "Kapali" : "Off")}`,
      bg: "bg-sage",
      onPress: toggleNotifications,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <View className="flex-1 px-6">
        <View className="mt-4 mb-8">
          <Text className="text-2xl font-bold text-charcoal">{t("profile.title")}</Text>
        </View>

        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-blush items-center justify-center mb-4">
            <Text className="text-3xl">
              {profile?.display_name?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-charcoal">
            {profile?.display_name || t("profile.user")}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View className="bg-cream px-4 py-1.5 rounded-xl">
              <Text className="text-smoke text-sm">
                {t("profile.skinTypeLabel", {
                  type: t(`skinType.${profile?.skin_type || "unknown"}`),
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View className="gap-2">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              className="bg-white rounded-card p-5 flex-row items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View
                className={`w-10 h-10 rounded-full ${item.bg} items-center justify-center mr-4`}
              >
                <Ionicons name={item.icon} size={20} color="#2D2D2D" />
              </View>
              <Text className="flex-1 text-charcoal font-medium text-base">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#AAAAAA" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View className="flex-1 justify-end mb-8">
          <TouchableOpacity
            className="bg-white rounded-card py-4 items-center border border-gray-100"
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text className="text-red-400 font-medium text-base">
              {t("auth.logout")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-charcoal">
                {t("profile.editProfile")}
              </Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#6B6B6B" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-smoke mb-2 ml-1">
              {t("profile.editName")}
            </Text>
            <TextInput
              className="bg-cloud rounded-2xl px-5 py-4 text-charcoal text-base mb-4"
              value={editName}
              onChangeText={setEditName}
            />

            <Text className="text-sm text-smoke mb-3 ml-1">
              {t("profile.editSkinType")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {SKIN_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setEditSkinType(type)}
                  className={`px-5 py-3 rounded-2xl ${
                    editSkinType === type ? "bg-charcoal" : "bg-cloud"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-medium ${
                      editSkinType === type ? "text-white" : "text-charcoal"
                    }`}
                  >
                    {t(`skinType.${type}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-charcoal rounded-2xl py-4 items-center"
              onPress={handleSaveProfile}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                {saving ? t("common.loading") : t("common.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
