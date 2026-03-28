import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore";
import { addToRoutine, fetchRoutines } from "../lib/api";
import type { RoutineType } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onAdded: () => void;
}

export default function AddToRoutineModal({
  visible,
  onClose,
  productId,
  productName,
  onAdded,
}: Props) {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [selectedType, setSelectedType] = useState<RoutineType | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!selectedType || !session?.user) return;
    setSaving(true);
    try {
      // Get current routine count for step order
      const existing = await fetchRoutines(session.user.id, selectedType);
      const nextOrder = existing.length + 1;
      await addToRoutine(session.user.id, productId, selectedType, nextOrder);
      onAdded();
      onClose();
      setSelectedType(null);
    } catch (err: any) {
      Alert.alert(t("common.error"), err.message);
    }
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-charcoal">
              {t("routineAction.addToRoutine")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B6B6B" />
            </TouchableOpacity>
          </View>

          <Text className="text-smoke text-sm mb-6">{productName}</Text>

          {/* AM/PM Selection */}
          <Text className="text-sm text-smoke mb-3 ml-1">
            {t("routineAction.whichRoutine")}
          </Text>

          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setSelectedType("am")}
              className={`flex-row items-center p-5 rounded-card border-2 ${
                selectedType === "am"
                  ? "border-charcoal bg-cream"
                  : "border-transparent bg-cloud"
              }`}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 28 }} className="mr-4">☀️</Text>
              <View>
                <Text className="text-charcoal font-semibold text-base">
                  {t("routine.morning")}
                </Text>
                <Text className="text-smoke text-xs">
                  {t("routineAction.amDesc")}
                </Text>
              </View>
              {selectedType === "am" && (
                <View className="ml-auto w-6 h-6 rounded-full bg-charcoal items-center justify-center">
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedType("pm")}
              className={`flex-row items-center p-5 rounded-card border-2 ${
                selectedType === "pm"
                  ? "border-charcoal bg-cream"
                  : "border-transparent bg-cloud"
              }`}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 28 }} className="mr-4">🌙</Text>
              <View>
                <Text className="text-charcoal font-semibold text-base">
                  {t("routine.evening")}
                </Text>
                <Text className="text-smoke text-xs">
                  {t("routineAction.pmDesc")}
                </Text>
              </View>
              {selectedType === "pm" && (
                <View className="ml-auto w-6 h-6 rounded-full bg-charcoal items-center justify-center">
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${
              selectedType ? "bg-charcoal" : "bg-gray-200"
            }`}
            onPress={handleAdd}
            disabled={!selectedType || saving}
            activeOpacity={0.8}
          >
            <Text
              className={`text-base font-semibold ${
                selectedType ? "text-white" : "text-smoke"
              }`}
            >
              {saving ? t("common.loading") : t("routineAction.addToRoutine")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
