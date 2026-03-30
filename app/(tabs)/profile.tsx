import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n from "../../src/i18n";
import { useAuthStore } from "../../src/stores/authStore";
import { updateProfile } from "../../src/lib/api";
import { requestPermissions, scheduleRoutineReminders, cancelAllReminders } from "../../src/lib/notifications";
import type { SkinType } from "../../src/types";
import { F } from "../../src/lib/fonts";

const SKIN_TYPES: SkinType[] = ["kuru", "yagli", "karma", "hassas", "normal"];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const lang = i18n.language;
  const { profile, setProfile, signOut } = useAuthStore();
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || "");
  const [editSkinType, setEditSkinType] = useState<SkinType>((profile?.skin_type as SkinType) || "normal");
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState(false);

  const save = async () => {
    if (!profile?.id || !editName.trim()) return;
    setSaving(true);
    try { const u = await updateProfile(profile.id, { display_name: editName.trim(), skin_type: editSkinType }); if (u) setProfile(u); setEditModal(false); } catch (e: any) { Alert.alert(t("common.error"), e.message); }
    setSaving(false);
  };

  const toggleNotifs = async () => {
    if (notifs) { await cancelAllReminders(); setNotifs(false); }
    else { const ok = await requestPermissions(); if (ok) { await scheduleRoutineReminders(); setNotifs(true); } }
  };

  const menuSections: { title: string; items: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; value?: string; color?: string }[] }[] = [
    {
      title: lang === "tr" ? "Hesap" : "Account",
      items: [
        { icon: "person-outline", label: t("profile.editProfile"), onPress: () => { setEditName(profile?.display_name || ""); setEditSkinType((profile?.skin_type as SkinType) || "normal"); setEditModal(true); } },
        { icon: "leaf-outline", label: lang === "tr" ? "Cilt Testini Tekrarla" : "Retake Skin Test", onPress: () => router.push("/(onboarding)/skin-test") },
      ],
    },
    {
      title: lang === "tr" ? "Tercihler" : "Preferences",
      items: [
        { icon: "language-outline", label: t("profile.language"), value: lang === "tr" ? "Turkce" : "English", onPress: () => i18n.changeLanguage(lang === "tr" ? "en" : "tr") },
        { icon: "notifications-outline", label: t("profile.notifications"), value: notifs ? (lang === "tr" ? "Acik" : "On") : (lang === "tr" ? "Kapali" : "Off"), onPress: toggleNotifs },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <Text style={{ fontFamily: F.heading, fontSize: 26, color: "#000" }}>{t("profile.title")}</Text>
        </View>

        {/* Profile card */}
        <View style={{
          marginHorizontal: 24, marginTop: 24, backgroundColor: "#FFF", borderRadius: 20, padding: 24,
          alignItems: "center",
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8,
        }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36, backgroundColor: "#000",
            alignItems: "center", justifyContent: "center", marginBottom: 14,
          }}>
            <Text style={{ fontFamily: F.heading, fontSize: 28, color: "#FFF" }}>{profile?.display_name?.[0]?.toUpperCase() || "?"}</Text>
          </View>
          <Text style={{ fontFamily: F.semibold, fontSize: 18, color: "#000" }}>{profile?.display_name || t("profile.user")}</Text>
          <View style={{
            backgroundColor: "#F5F5F5", paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20, marginTop: 8,
          }}>
            <Text style={{ fontFamily: F.regular, fontSize: 11, color: "#888" }}>
              {t(`skinType.${profile?.skin_type || "unknown"}`)} {lang === "tr" ? "cilt" : "skin"}
            </Text>
          </View>
        </View>

        {/* Menu sections */}
        {menuSections.map((section, si) => (
          <View key={si} style={{ marginTop: 24, paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, marginLeft: 4 }}>{section.title}</Text>
            <View style={{
              backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden",
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6,
            }}>
              {section.items.map((item, i) => (
                <TouchableOpacity key={i} onPress={item.onPress} activeOpacity={0.6}
                  style={{
                    flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 16,
                    borderBottomWidth: i < section.items.length - 1 ? 1 : 0, borderColor: "#F5F5F5",
                  }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 10, backgroundColor: "#F8F8F8",
                    alignItems: "center", justifyContent: "center", marginRight: 12,
                  }}>
                    <Ionicons name={item.icon} size={17} color="#555" />
                  </View>
                  <Text style={{ fontFamily: F.regular, flex: 1, color: "#000", fontSize: 14 }}>{item.label}</Text>
                  {item.value && <Text style={{ fontFamily: F.light, fontSize: 12, color: "#BBB", marginRight: 6 }}>{item.value}</Text>}
                  <Ionicons name="chevron-forward" size={14} color="#DDD" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={{ paddingHorizontal: 24, marginTop: 36, marginBottom: 100 }}>
          <TouchableOpacity
            onPress={() => Alert.alert(t("auth.logout"), t("auth.logoutConfirm"), [
              { text: t("common.cancel"), style: "cancel" },
              { text: t("auth.logout"), style: "destructive", onPress: async () => { await signOut(); router.replace("/(auth)/login"); } },
            ])}
            style={{
              backgroundColor: "#FFF", borderRadius: 16, paddingVertical: 15, alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6,
            }}>
            <Text style={{ fontFamily: F.regular, color: "#E55", fontSize: 14 }}>{t("auth.logout")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}>
            {/* Handle */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E5E5", alignSelf: "center", marginBottom: 20 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <Text style={{ fontFamily: F.heading, fontSize: 20, color: "#000" }}>{t("profile.editProfile")}</Text>
              <TouchableOpacity onPress={() => setEditModal(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{t("profile.editName")}</Text>
            <TextInput
              style={{
                backgroundColor: "#F8F8F8", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
                fontFamily: F.regular, fontSize: 15, color: "#000", marginBottom: 24,
              }}
              value={editName} onChangeText={setEditName} placeholderTextColor="#CCC"
            />

            <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>{t("profile.editSkinType")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {SKIN_TYPES.map((type) => (
                <TouchableOpacity key={type} onPress={() => setEditSkinType(type)}
                  style={{
                    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
                    backgroundColor: editSkinType === type ? "#000" : "#F5F5F5",
                  }}>
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: editSkinType === type ? "#FFF" : "#666" }}>{t(`skinType.${type}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={{ backgroundColor: "#000", borderRadius: 14, paddingVertical: 16, alignItems: "center" }} onPress={save} disabled={saving}>
              <Text style={{ fontFamily: F.semibold, color: "#FFF", fontSize: 14 }}>{saving ? "..." : t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
